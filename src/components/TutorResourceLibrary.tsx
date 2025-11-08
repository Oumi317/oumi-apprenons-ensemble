import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, Upload, FileText, Trash2, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const MATIERES = ["Mathématiques", "Français", "Anglais", "Sciences", "Histoire"];
const NIVEAUX = ["cm1", "cm2", "sixieme", "cinquieme", "quatrieme", "troisieme", "seconde", "premiere", "terminale"];

interface Resource {
  id: string;
  titre: string;
  description: string;
  file_url: string;
  file_type: string;
  matiere: string;
  niveau_scolaire: string;
  is_public: boolean;
}

export default function TutorResourceLibrary() {
  const [tutorId, setTutorId] = useState<string>("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tutor } = await supabase
        .from("tutors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!tutor) return;
      setTutorId(tutor.id);

      const { data: resourceData } = await supabase
        .from("tutor_resources")
        .select("*")
        .eq("tutor_id", tutor.id)
        .order("created_at", { ascending: false });

      setResources(resourceData || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!titre || !matiere || !niveau || !file) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs et sélectionner un fichier",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${tutorId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("lesson-content")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("lesson-content")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from("tutor_resources")
        .insert([{
          tutor_id: tutorId,
          titre,
          description: description || null,
          file_url: publicUrl,
          file_type: file.type,
          matiere,
          niveau_scolaire: niveau as any,
          is_public: isPublic
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Ressource ajoutée",
        description: "Votre fichier a été uploadé avec succès"
      });

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error uploading resource:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitre("");
    setDescription("");
    setMatiere("");
    setNiveau("");
    setIsPublic(false);
    setFile(null);
  };

  const deleteResource = async (id: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split("/");
      const filePath = urlParts.slice(-2).join("/");

      // Delete from storage
      await supabase.storage
        .from("lesson-content")
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from("tutor_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Ressource supprimée"
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la ressource",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Bibliothèque de Ressources
            </CardTitle>
            <CardDescription>
              Gérez vos documents et exercices
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter une ressource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter une ressource</DialogTitle>
                <DialogDescription>
                  Uploadez un document ou un exercice
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    placeholder="Exercices sur les fractions"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Description du contenu..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Matière *</Label>
                    <Select value={matiere} onValueChange={setMatiere}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATIERES.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau *</Label>
                    <Select value={niveau} onValueChange={setNiveau}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEAUX.map(n => (
                          <SelectItem key={n} value={n}>{n.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fichier *</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={handleFileChange}
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Fichier sélectionné : {file.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Ressource publique</Label>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={uploading}
                >
                  {uploading ? "Upload en cours..." : "Ajouter la ressource"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Aucune ressource pour le moment</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{resource.titre}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {resource.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {resource.matiere} • {resource.niveau_scolaire.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {resource.is_public && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        <Share2 className="h-3 w-3 inline mr-1" />
                        Public
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                        Ouvrir
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteResource(resource.id, resource.file_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}