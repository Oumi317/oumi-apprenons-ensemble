import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, FileText, Trash2, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.html')) {
        toast({
          title: "Format invalide",
          description: "Seuls les fichiers HTML sont acceptés",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !titre || !selectedLessonId) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
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

  const handleDelete = async (resourceId: string, fileUrl: string) => {
    try {
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
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: Manuel interactif d'orthographe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson">Leçon associée *</Label>
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
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
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".html"
                onChange={handleFileChange}
                className="flex-1"
              />
              {file && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {file.name}
                </Badge>
              )}
            </div>
          </div>

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
            Gérez les ressources interactives importées ({resources.length} ressource{resources.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingResources ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune ressource interactive importée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Leçon</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.titre}</TableCell>
                    <TableCell>{resource.lessons?.titre || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {resource.description || "—"}
                    </TableCell>
                    <TableCell>{resource.ordre_affichage}</TableCell>
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
                          onClick={() => handleDelete(resource.id, resource.file_url)}
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
    </div>
  );
}
