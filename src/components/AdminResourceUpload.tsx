import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, FileText, Trash2, Edit, Search, Eye, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminResourceUploadProps {
  lessons: any[];
  onUploadSuccess: () => void;
}

export default function AdminResourceUpload({ lessons, onUploadSuccess }: AdminResourceUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [ordreAffichage, setOrdreAffichage] = useState("0");
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<{ id: string; fileUrl: string } | null>(null);
  const [errors, setErrors] = useState<{ titre?: string; lessonId?: string; file?: string }>({});
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [sortField, setSortField] = useState<'titre' | 'created_at' | 'ordre_affichage'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from("interactive_resources")
        .select(`
          *,
          lessons (titre)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      console.error("Error loading resources:", error);
    } finally {
      setLoadingResources(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    if (!selectedFile.name.endsWith('.html')) {
      setErrors(prev => ({ ...prev, file: "Seuls les fichiers HTML sont acceptés" }));
      return false;
    }
    setErrors(prev => ({ ...prev, file: undefined }));
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const firstFile = selectedFiles[0];
      if (validateFile(firstFile)) {
        setFile(firstFile);
        // Read file content for preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewContent(event.target?.result as string);
        };
        reader.readAsText(firstFile);
        
        // If multiple files, handle multiple upload
        if (selectedFiles.length > 1 && selectedLessonId) {
          await handleMultipleUpload(selectedFiles);
        }
      }
    }
  };

  const handleMultipleUpload = async (files: FileList) => {
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validateFile(file)) {
        errorCount++;
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${selectedLessonId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("interactive-resources")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: "text/html"
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("interactive-resources")
          .getPublicUrl(filePath);

        const slug = slugify(file.name.replace('.html', ''));

        const { error: dbError } = await supabase
          .from("interactive_resources")
          .insert({
            lesson_id: selectedLessonId,
            titre: file.name.replace('.html', ''),
            description: description || null,
            type: "interactive_html",
            file_url: publicUrl,
            slug,
            ordre_affichage: parseInt(ordreAffichage) + i
          });

        if (dbError) throw dbError;
        successCount++;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errorCount++;
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast({
        title: "Ressources importées",
        description: `${successCount} ressource(s) importée(s) avec succès${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}`
      });
      await loadResources();
      onUploadSuccess();
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        title: "Erreur d'importation",
        description: "Échec de l'importation de toutes les ressources",
        variant: "destructive"
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      // Read file content for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewContent(event.target?.result as string);
      };
      reader.readAsText(droppedFile);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { titre?: string; lessonId?: string; file?: string } = {};
    
    if (!titre.trim()) {
      newErrors.titre = "Le titre est requis";
    }
    
    if (!selectedLessonId) {
      newErrors.lessonId = "Veuillez sélectionner une leçon";
    }
    
    if (!file) {
      newErrors.file = "Veuillez sélectionner un fichier HTML";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${selectedLessonId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("interactive-resources")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: "text/html"
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("interactive-resources")
        .getPublicUrl(filePath);

      // Generate slug from title
      const slug = slugify(titre);

      // Insert metadata into database
      const { error: dbError } = await supabase
        .from("interactive_resources")
        .insert({
          lesson_id: selectedLessonId,
          titre,
          description,
          type: "interactive_html",
          file_url: publicUrl,
          slug,
          ordre_affichage: parseInt(ordreAffichage)
        });

      if (dbError) throw dbError;

      toast({
        title: "Ressource importée",
        description: "La ressource interactive a été importée avec succès"
      });

      // Reset form
      setFile(null);
      setTitre("");
      setDescription("");
      setSelectedLessonId("");
      setOrdreAffichage("0");
      
      // Reload resources
      await loadResources();
      onUploadSuccess();

    } catch (error: any) {
      console.error("Error uploading resource:", error);
      toast({
        title: "Erreur d'importation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (resource: any) => {
    setEditingResource(resource);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingResource || !editingResource.titre || !editingResource.lesson_id) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);

    try {
      const slug = slugify(editingResource.titre);

      const { error } = await supabase
        .from("interactive_resources")
        .update({
          titre: editingResource.titre,
          description: editingResource.description,
          lesson_id: editingResource.lesson_id,
          ordre_affichage: parseInt(editingResource.ordre_affichage),
          slug
        })
        .eq("id", editingResource.id);

      if (error) throw error;

      toast({
        title: "Ressource modifiée",
        description: "La ressource a été modifiée avec succès"
      });

      setEditDialogOpen(false);
      setEditingResource(null);
      await loadResources();
      onUploadSuccess();

    } catch (error: any) {
      console.error("Error updating resource:", error);
      toast({
        title: "Erreur de modification",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = (resourceId: string, fileUrl: string) => {
    setResourceToDelete({ id: resourceId, fileUrl });
    setDeleteDialogOpen(true);
  };

  const toggleResourceSelection = (id: string) => {
    setSelectedResources(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedResources.length === filteredAndSortedResources.length && filteredAndSortedResources.length > 0) {
      setSelectedResources([]);
    } else {
      setSelectedResources(filteredAndSortedResources.map(r => r.id));
    }
  };

  const handleBatchDelete = async () => {
    try {
      // Delete files from storage first
      for (const resourceId of selectedResources) {
        const resource = resources.find(r => r.id === resourceId);
        if (resource?.file_url) {
          const url = new URL(resource.file_url);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(pathParts.indexOf('interactive-resources') + 1).join('/');
          
          await supabase.storage
            .from("interactive-resources")
            .remove([filePath]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('interactive_resources')
        .delete()
        .in('id', selectedResources);

      if (error) throw error;

      toast({
        title: "Ressources supprimées",
        description: `${selectedResources.length} ressource(s) supprimée(s) avec succès`
      });
      
      setSelectedResources([]);
      setBatchDeleteDialogOpen(false);
      await loadResources();
      onUploadSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur de suppression",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;

    try {
      const { id: resourceId, fileUrl } = resourceToDelete;
      
      // Extract file path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('interactive-resources') + 1).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("interactive-resources")
        .remove([filePath]);

      if (storageError) console.error("Storage deletion error:", storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from("interactive_resources")
        .delete()
        .eq("id", resourceId);

      if (dbError) throw dbError;

      toast({
        title: "Ressource supprimée",
        description: "La ressource a été supprimée avec succès"
      });

      setDeleteDialogOpen(false);
      setResourceToDelete(null);
      await loadResources();
      onUploadSuccess();

    } catch (error: any) {
      toast({
        title: "Erreur de suppression",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSort = (field: 'titre' | 'created_at' | 'ordre_affichage') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedResources = resources
    .filter(resource => {
      const matchesSearch = 
        resource.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.lessons?.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortField === 'titre') {
        compareValue = a.titre.localeCompare(b.titre);
      } else if (sortField === 'created_at') {
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'ordre_affichage') {
        compareValue = a.ordre_affichage - b.ordre_affichage;
      }
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Importer une ressource interactive</CardTitle>
          <CardDescription>
            Uploadez un fichier HTML interactif et associez-le à une leçon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={titre}
                onChange={(e) => {
                  setTitre(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, titre: undefined }));
                  }
                }}
                placeholder="Ex: Manuel interactif d'orthographe"
                className={errors.titre ? "border-destructive" : ""}
              />
              {errors.titre && (
                <p className="text-sm text-destructive">{errors.titre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson">Leçon associée *</Label>
              <Select 
                value={selectedLessonId} 
                onValueChange={(value) => {
                  setSelectedLessonId(value);
                  setErrors(prev => ({ ...prev, lessonId: undefined }));
                }}
              >
                <SelectTrigger className={errors.lessonId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner une leçon" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lessonId && (
                <p className="text-sm text-destructive">{errors.lessonId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la ressource interactive"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ordre">Ordre d'affichage</Label>
            <Input
              id="ordre"
              type="number"
              value={ordreAffichage}
              onChange={(e) => setOrdreAffichage(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Fichier HTML *</Label>
            <div 
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : errors.file 
                  ? "border-destructive" 
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Input
                id="file"
                type="file"
                accept=".html"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  {file ? (
                    <Badge variant="secondary" className="flex items-center gap-1 mx-auto w-fit">
                      <FileText className="h-3 w-3" />
                      {file.name}
                    </Badge>
                  ) : (
                    <>
                      Glissez-déposez un fichier HTML ici ou{" "}
                      <span className="text-primary underline">cliquez pour parcourir</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            {errors.file && (
              <p className="text-sm text-destructive">{errors.file}</p>
            )}
          </div>

          {file && previewContent && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewDialogOpen(true)}
              className="w-full"
            >
              <Eye className="mr-2 h-4 w-4" />
              Prévisualiser le fichier HTML
            </Button>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !titre || !selectedLessonId}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importation en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importer la ressource
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resources List */}
      <Card>
        <CardHeader>
          <CardTitle>Ressources interactives existantes</CardTitle>
          <CardDescription>
            Gérez les ressources interactives importées ({filteredAndSortedResources.length} / {resources.length} ressource{resources.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar and Batch Actions */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, leçon ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {selectedResources.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBatchDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer ({selectedResources.length})
              </Button>
            )}
          </div>

          {loadingResources ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : filteredAndSortedResources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Aucune ressource ne correspond à votre recherche" : "Aucune ressource interactive importée"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedResources.length === filteredAndSortedResources.length && filteredAndSortedResources.length > 0}
                      onChange={toggleSelectAll}
                      className="cursor-pointer h-4 w-4"
                      title="Tout sélectionner"
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('titre')} className="font-semibold">
                      Titre
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Leçon</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('ordre_affichage')} className="font-semibold">
                      Ordre
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="font-semibold">
                      Date
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredAndSortedResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedResources.includes(resource.id)}
                      onChange={() => toggleResourceSelection(resource.id)}
                      className="cursor-pointer h-4 w-4"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{resource.titre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{resource.lessons?.titre || "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {resource.description || "—"}
                    </TableCell>
                    <TableCell>{resource.ordre_affichage}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(resource.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={resource.file_url ? "default" : "secondary"}>
                        {resource.file_url ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(resource)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(resource.id, resource.file_url)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier la ressource</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la ressource interactive
            </DialogDescription>
          </DialogHeader>
          {editingResource && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-titre">Titre *</Label>
                <Input
                  id="edit-titre"
                  value={editingResource.titre}
                  onChange={(e) => setEditingResource({ ...editingResource, titre: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-lesson">Leçon associée *</Label>
                <Select 
                  value={editingResource.lesson_id} 
                  onValueChange={(value) => setEditingResource({ ...editingResource, lesson_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une leçon" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingResource.description || ""}
                  onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ordre">Ordre d'affichage</Label>
                <Input
                  id="edit-ordre"
                  type="number"
                  value={editingResource.ordre_affichage}
                  onChange={(e) => setEditingResource({ ...editingResource, ordre_affichage: e.target.value })}
                  min="0"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Prévisualisation du fichier HTML</DialogTitle>
            <DialogDescription>
              Aperçu du contenu du fichier {file?.name}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full rounded border p-4">
            <pre className="text-xs whitespace-pre-wrap break-words">
              <code>{previewContent}</code>
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setPreviewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est irréversible et supprimera définitivement le fichier HTML associé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Delete Dialog */}
      <AlertDialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les ressources sélectionnées</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedResources.length} ressource(s) ? 
              Cette action est irréversible et supprimera définitivement les fichiers HTML associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
