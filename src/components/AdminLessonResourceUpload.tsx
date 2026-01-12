import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, FileText, Trash2, Edit, Plus, File, Image, FileSpreadsheet, Link, ExternalLink } from "lucide-react";

interface Lesson {
  id: string;
  titre: string;
  matiere: string;
  niveau_scolaire: string;
}

interface LessonResource {
  id: string;
  lesson_id: string;
  titre: string;
  description: string | null;
  type: string;
  file_url: string;
  taille: string | null;
  ordre_affichage: number;
  created_at: string;
  lessons?: {
    titre: string;
    matiere: string;
  };
}

interface AdminLessonResourceUploadProps {
  lessons: Lesson[];
  onUploadSuccess?: () => void;
}

const resourceTypes = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "document", label: "Document", icon: File },
  { value: "image", label: "Image", icon: Image },
  { value: "spreadsheet", label: "Tableur", icon: FileSpreadsheet },
  { value: "link", label: "Lien externe", icon: Link },
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function AdminLessonResourceUpload({ lessons, onUploadSuccess }: AdminLessonResourceUploadProps) {
  const { toast } = useToast();
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<LessonResource | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Form state
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [ordreAffichage, setOrdreAffichage] = useState(0);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lesson_resources")
        .select(`
          *,
          lessons (titre, matiere)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      console.error("Error loading resources:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les ressources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Auto-detect type from extension
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") setType("pdf");
      else if (["doc", "docx", "odt", "txt"].includes(ext || "")) setType("document");
      else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) setType("image");
      else if (["xls", "xlsx", "csv", "ods"].includes(ext || "")) setType("spreadsheet");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-detect type from extension
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") setType("pdf");
      else if (["doc", "docx", "odt", "txt"].includes(ext || "")) setType("document");
      else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) setType("image");
      else if (["xls", "xlsx", "csv", "ods"].includes(ext || "")) setType("spreadsheet");
    }
  };

  const resetForm = () => {
    setSelectedLessonId("");
    setTitre("");
    setDescription("");
    setType("pdf");
    setFile(null);
    setExternalUrl("");
    setOrdreAffichage(0);
    setEditingResource(null);
  };

  const handleSubmit = async () => {
    if (!selectedLessonId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une leçon",
        variant: "destructive",
      });
      return;
    }

    if (!titre) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un titre",
        variant: "destructive",
      });
      return;
    }

    if (type === "link" && !externalUrl) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une URL",
        variant: "destructive",
      });
      return;
    }

    if (type !== "link" && !file && !editingResource) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let fileUrl = editingResource?.file_url || "";
      let fileSize = editingResource?.taille || "";

      // Upload file if selected
      if (file && type !== "link") {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${selectedLessonId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lesson-resources")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("lesson-resources")
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileSize = formatFileSize(file.size);
      } else if (type === "link") {
        fileUrl = externalUrl;
        fileSize = null as any;
      }

      const resourceData = {
        lesson_id: selectedLessonId,
        titre,
        description: description || null,
        type,
        file_url: fileUrl,
        taille: fileSize,
        ordre_affichage: ordreAffichage,
      };

      if (editingResource) {
        const { error } = await supabase
          .from("lesson_resources")
          .update(resourceData)
          .eq("id", editingResource.id);

        if (error) throw error;

        toast({
          title: "Ressource mise à jour",
          description: "La ressource a été modifiée avec succès",
        });
      } else {
        const { error } = await supabase
          .from("lesson_resources")
          .insert(resourceData);

        if (error) throw error;

        toast({
          title: "Ressource ajoutée",
          description: "La ressource a été ajoutée avec succès",
        });
      }

      resetForm();
      setDialogOpen(false);
      loadResources();
      onUploadSuccess?.();
    } catch (error: any) {
      console.error("Error saving resource:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la ressource",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (resource: LessonResource) => {
    setEditingResource(resource);
    setSelectedLessonId(resource.lesson_id);
    setTitre(resource.titre);
    setDescription(resource.description || "");
    setType(resource.type);
    setOrdreAffichage(resource.ordre_affichage);
    if (resource.type === "link") {
      setExternalUrl(resource.file_url);
    }
    setDialogOpen(true);
  };

  const confirmDelete = (resourceId: string) => {
    setResourceToDelete(resourceId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;

    try {
      const resource = resources.find((r) => r.id === resourceToDelete);
      
      // Delete file from storage if not a link
      if (resource && resource.type !== "link" && resource.file_url) {
        const urlParts = resource.file_url.split("/lesson-resources/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("lesson-resources").remove([filePath]);
        }
      }

      const { error } = await supabase
        .from("lesson_resources")
        .delete()
        .eq("id", resourceToDelete);

      if (error) throw error;

      toast({
        title: "Ressource supprimée",
        description: "La ressource a été supprimée avec succès",
      });

      loadResources();
      onUploadSuccess?.();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la ressource",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  const getTypeIcon = (resourceType: string) => {
    const found = resourceTypes.find((t) => t.value === resourceType);
    return found ? found.icon : FileText;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Ressources pédagogiques des leçons
            </CardTitle>
            <CardDescription>
              Gérez les fichiers PDF, documents et autres ressources associées aux leçons
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une ressource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingResource ? "Modifier la ressource" : "Ajouter une ressource"}
                </DialogTitle>
                <DialogDescription>
                  {editingResource 
                    ? "Modifiez les informations de la ressource"
                    : "Uploadez un fichier ou ajoutez un lien externe à associer à une leçon"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Leçon *</Label>
                  <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une leçon" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.titre} ({lesson.matiere} - {lesson.niveau_scolaire})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Titre de la ressource"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description de la ressource"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de ressource</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className="h-4 w-4" />
                            {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {type === "link" ? (
                  <div className="space-y-2">
                    <Label>URL externe *</Label>
                    <Input
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Fichier {!editingResource && "*"}</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.txt,.odt,.ods,.csv"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        {file ? (
                          <div className="text-sm">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            <p>Glissez un fichier ici ou cliquez pour sélectionner</p>
                            <p className="text-xs mt-1">
                              PDF, Documents, Images, Tableurs
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {editingResource && !file && (
                      <p className="text-xs text-muted-foreground">
                        Fichier actuel conservé si aucun nouveau fichier n'est sélectionné
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Ordre d'affichage</Label>
                  <Input
                    type="number"
                    value={ordreAffichage}
                    onChange={(e) => setOrdreAffichage(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={uploading}>
                  {uploading ? "Enregistrement..." : editingResource ? "Modifier" : "Ajouter"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune ressource ajoutée</p>
            <p className="text-sm">Cliquez sur "Ajouter une ressource" pour commencer</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Leçon</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => {
                const TypeIcon = getTypeIcon(resource.type);
                return (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{resource.titre}</p>
                          {resource.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {resource.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{resource.lessons?.titre}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.lessons?.matiere}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{resource.type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{resource.taille || "-"}</TableCell>
                    <TableCell>
                      {new Date(resource.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(resource.file_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(resource)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(resource.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
