import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Upload, Loader2, Search, ArrowUpDown } from "lucide-react";

interface Lesson {
  id: string;
  titre: string;
  description: string | null;
  matiere: string;
  niveau_scolaire: string;
  type_contenu: string;
  difficulte: string;
  duree_estimee_minutes: number | null;
  gratuit: boolean;
  contenu_url: string | null;
  thumbnail_url: string | null;
  ordre_affichage: number;
  created_at?: string;
}

interface AdminLessonManagerProps {
  onUpdate: () => void;
}

const niveauxScolaires = ["CP", "CE1", "CE2", "CM1", "CM2", "6eme", "5eme", "4eme", "3eme", "seconde", "premiere", "terminale"];
const matieres = ["Français", "Mathématiques", "Sciences", "Histoire-Géo", "Anglais", "Autres"];
const typesContenu = ["video", "exercice", "quiz", "document"];
const difficultes = ["facile", "moyen", "difficile"];

export default function AdminLessonManager({ onUpdate }: AdminLessonManagerProps) {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [uploadingContent, setUploadingContent] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<'titre' | 'created_at' | 'matiere'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<{ titre?: string; matiere?: string }>({});

  const [formData, setFormData] = useState<{
    titre: string;
    description: string;
    matiere: string;
    niveau_scolaire: string;
    type_contenu: string;
    difficulte: "facile" | "moyen" | "difficile";
    duree_estimee_minutes: number;
    gratuit: boolean;
    ordre_affichage: number;
  }>({
    titre: "",
    description: "",
    matiere: "Français",
    niveau_scolaire: "CP",
    type_contenu: "video",
    difficulte: "moyen",
    duree_estimee_minutes: 30,
    gratuit: true,
    ordre_affichage: 0,
  });

  const [contentFile, setContentFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("ordre_affichage", { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des leçons:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les leçons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let contentUrl = editingLesson?.contenu_url;
      let thumbnailUrl = editingLesson?.thumbnail_url;

      // Upload content file if provided
      if (contentFile) {
        setUploadingContent(true);
        const fileExt = contentFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const safeNiveau = formData.niveau_scolaire.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeMatiere = formData.matiere.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, "_");
        const filePath = `${safeNiveau}/${safeMatiere}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lesson-content")
          .upload(filePath, contentFile, {
            contentType: contentFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("lesson-content")
          .getPublicUrl(filePath);

        contentUrl = urlData.publicUrl;
        setUploadingContent(false);
      }

      // Upload thumbnail if provided
      if (thumbnailFile) {
        setUploadingThumbnail(true);
        const fileExt = thumbnailFile.name.split(".").pop();
        const fileName = `thumb_${Date.now()}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lesson-content")
          .upload(filePath, thumbnailFile, {
            contentType: thumbnailFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("lesson-content")
          .getPublicUrl(filePath);

        thumbnailUrl = urlData.publicUrl;
        setUploadingThumbnail(false);
      }

      const lessonData: any = {
        ...formData,
        contenu_url: contentUrl,
        thumbnail_url: thumbnailUrl,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from("lessons")
          .update(lessonData)
          .eq("id", editingLesson.id);

        if (error) throw error;

        toast({
          title: "Leçon mise à jour",
          description: "La leçon a été mise à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from("lessons")
          .insert([lessonData]);

        if (error) throw error;

        toast({
          title: "Leçon créée",
          description: "La nouvelle leçon a été créée avec succès",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadLessons();
      onUpdate();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingContent(false);
      setUploadingThumbnail(false);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      titre: lesson.titre,
      description: lesson.description || "",
      matiere: lesson.matiere,
      niveau_scolaire: lesson.niveau_scolaire,
      type_contenu: lesson.type_contenu,
      difficulte: lesson.difficulte as "facile" | "moyen" | "difficile",
      duree_estimee_minutes: lesson.duree_estimee_minutes || 30,
      gratuit: lesson.gratuit,
      ordre_affichage: lesson.ordre_affichage,
    });
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setLessonToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!lessonToDelete) return;

    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonToDelete);

      if (error) throw error;

      toast({
        title: "Leçon supprimée",
        description: "La leçon a été supprimée avec succès",
      });

      setDeleteDialogOpen(false);
      setLessonToDelete(null);
      loadLessons();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: 'titre' | 'created_at' | 'matiere') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleLessonSelection = (id: string) => {
    setSelectedLessons(prev => 
      prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filtered = filteredAndSortedLessons;
    if (selectedLessons.length === filtered.length && filtered.length > 0) {
      setSelectedLessons([]);
    } else {
      setSelectedLessons(filtered.map(l => l.id));
    }
  };

  const handleBatchDelete = async () => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .in('id', selectedLessons);

      if (error) throw error;

      toast({
        title: "Leçons supprimées",
        description: `${selectedLessons.length} leçon(s) supprimée(s) avec succès`
      });

      setSelectedLessons([]);
      setBatchDeleteDialogOpen(false);
      loadLessons();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
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

  const handleDropContent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setContentFile(droppedFile);
    }
  };

  const filteredAndSortedLessons = lessons
    .filter(lesson => {
      const matchesSearch = 
        lesson.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.matiere.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.niveau_scolaire.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortField === 'titre') {
        compareValue = a.titre.localeCompare(b.titre);
      } else if (sortField === 'created_at') {
        compareValue = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      } else if (sortField === 'matiere') {
        compareValue = a.matiere.localeCompare(b.matiere);
      }
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

  const resetForm = () => {
    setEditingLesson(null);
    setContentFile(null);
    setThumbnailFile(null);
    setFormData({
      titre: "",
      description: "",
      matiere: "Français",
      niveau_scolaire: "cp",
      type_contenu: "video",
      difficulte: "moyen",
      duree_estimee_minutes: 30,
      gratuit: true,
      ordre_affichage: 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des leçons</CardTitle>
            <CardDescription>Créer, modifier et supprimer des leçons</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle leçon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLesson ? "Modifier la leçon" : "Créer une nouvelle leçon"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez tous les champs pour {editingLesson ? "modifier" : "créer"} la leçon
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre *</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="matiere">Matière *</Label>
                    <Select
                      value={formData.matiere}
                      onValueChange={(value) => setFormData({ ...formData, matiere: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {matieres.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="niveau">Niveau scolaire *</Label>
                    <Select
                      value={formData.niveau_scolaire}
                      onValueChange={(value) => setFormData({ ...formData, niveau_scolaire: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {niveauxScolaires.map((n) => (
                          <SelectItem key={n} value={n}>{n.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type de contenu *</Label>
                    <Select
                      value={formData.type_contenu}
                      onValueChange={(value) => setFormData({ ...formData, type_contenu: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typesContenu.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulte">Difficulté *</Label>
                    <Select
                      value={formData.difficulte}
                      onValueChange={(value) => setFormData({ ...formData, difficulte: value as "facile" | "moyen" | "difficile" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultes.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duree">Durée (minutes)</Label>
                    <Input
                      id="duree"
                      type="number"
                      value={formData.duree_estimee_minutes}
                      onChange={(e) => setFormData({ ...formData, duree_estimee_minutes: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ordre">Ordre d'affichage</Label>
                    <Input
                      id="ordre"
                      type="number"
                      value={formData.ordre_affichage}
                      onChange={(e) => setFormData({ ...formData, ordre_affichage: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="gratuit"
                    checked={formData.gratuit}
                    onCheckedChange={(checked) => setFormData({ ...formData, gratuit: checked })}
                  />
                  <Label htmlFor="gratuit">Leçon gratuite</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-file">
                    Fichier de contenu (HTML, PDF, vidéo...)
                    {uploadingContent && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
                  </Label>
                  <Input
                    id="content-file"
                    type="file"
                    accept=".html,.pdf,.mp4,.webm"
                    onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                  />
                  {editingLesson?.contenu_url && (
                    <p className="text-xs text-muted-foreground">
                      Fichier actuel : {editingLesson.contenu_url.split("/").pop()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail-file">
                    Miniature (image)
                    {uploadingThumbnail && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
                  </Label>
                  <Input
                    id="thumbnail-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  />
                  {editingLesson?.thumbnail_url && (
                    <p className="text-xs text-muted-foreground">
                      Image actuelle disponible
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading || uploadingContent || uploadingThumbnail}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingLesson ? "Mettre à jour" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar and Batch Actions */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, matière, niveau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {selectedLessons.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBatchDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer ({selectedLessons.length})
            </Button>
          )}
        </div>

        {loading && lessons.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : filteredAndSortedLessons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "Aucune leçon ne correspond à votre recherche" : "Aucune leçon trouvée"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedLessons.length === filteredAndSortedLessons.length && filteredAndSortedLessons.length > 0}
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
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('matiere')} className="font-semibold">
                    Matière
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulté</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Accès</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedLessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedLessons.includes(lesson.id)}
                      onChange={() => toggleLessonSelection(lesson.id)}
                      className="cursor-pointer h-4 w-4"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{lesson.titre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{lesson.matiere}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lesson.niveau_scolaire.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lesson.type_contenu}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      lesson.difficulte === 'facile' ? 'default' :
                      lesson.difficulte === 'difficile' ? 'destructive' : 'secondary'
                    }>
                      {lesson.difficulte}
                    </Badge>
                  </TableCell>
                  <TableCell>{lesson.duree_estimee_minutes || "-"} min</TableCell>
                  <TableCell>
                    <Badge variant={lesson.gratuit ? "default" : "secondary"}>
                      {lesson.gratuit ? "Gratuit" : "Premium"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(lesson)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => confirmDelete(lesson.id)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette leçon ? Cette action est irréversible.
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
            <AlertDialogTitle>Supprimer les leçons sélectionnées</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedLessons.length} leçon(s) ? 
              Cette action est irréversible.
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
    </Card>
  );
}
