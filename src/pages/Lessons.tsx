import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { LessonCard } from "@/components/LessonCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Search, 
  Filter, 
  Lock, 
  Play, 
  FileText, 
  HelpCircle,
  Grid3x3,
  List,
  TrendingUp,
  Star,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const niveauxScolaires = [
  "Tous", "CP", "CE1", "CE2", "CM1", "CM2",
  "6eme", "5eme", "4eme", "3eme",
  "Seconde", "Premiere", "Terminale"
];

const matieres = [
  "Toutes", "Français", "Mathématiques", "Histoire-Géographie", 
  "Sciences", "Anglais", "Philosophie"
];

const types = [
  "Tous", "video", "exercice", "quiz", "document"
];

const typeIcons = {
  video: Play,
  exercice: FileText,
  quiz: HelpCircle,
  document: BookOpen,
};

const difficulteColors = {
  facile: "bg-success/10 text-success",
  moyen: "bg-secondary/10 text-secondary",
  difficile: "bg-destructive/10 text-destructive",
};

const Lessons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiveau, setSelectedNiveau] = useState("Tous");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");
  const [selectedDifficulte, setSelectedDifficulte] = useState("Toutes");
  const [selectedType, setSelectedType] = useState("Tous");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOnlyFree, setShowOnlyFree] = useState(false);

  useEffect(() => {
    checkUser();
    loadLessons();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, searchQuery, selectedNiveau, selectedMatiere, selectedDifficulte, selectedType, sortBy, showOnlyFree]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("ordre_affichage", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading lessons:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les leçons",
        variant: "destructive",
      });
    } else {
      setLessons(data || []);
    }
    setLoading(false);
  };

  const filterLessons = () => {
    let filtered = [...lessons];

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.matiere.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par niveau
    if (selectedNiveau !== "Tous") {
      filtered = filtered.filter((lesson) => lesson.niveau_scolaire === selectedNiveau);
    }

    // Filtre par matière
    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter((lesson) => lesson.matiere === selectedMatiere);
    }

    // Filtre par difficulté
    if (selectedDifficulte !== "Toutes") {
      filtered = filtered.filter((lesson) => lesson.difficulte === selectedDifficulte.toLowerCase());
    }

    // Filtre par type
    if (selectedType !== "Tous") {
      filtered = filtered.filter((lesson) => lesson.type_contenu === selectedType.toLowerCase());
    }

    // Filtre gratuit uniquement
    if (showOnlyFree) {
      filtered = filtered.filter((lesson) => lesson.gratuit);
    }

    // Tri
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "title":
        filtered.sort((a, b) => a.titre.localeCompare(b.titre));
        break;
      case "duration":
        filtered.sort((a, b) => (a.duree_estimee_minutes || 0) - (b.duree_estimee_minutes || 0));
        break;
      case "difficulty":
        const diffOrder = { facile: 1, moyen: 2, difficile: 3 };
        filtered.sort((a, b) => (diffOrder[a.difficulte as keyof typeof diffOrder] || 0) - (diffOrder[b.difficulte as keyof typeof diffOrder] || 0));
        break;
    }

    setFilteredLessons(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur Oumi'School !",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Bibliothèque de ressources</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des milliers de leçons, exercices et quiz alignés avec le programme français
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-success/10 text-success">
                {lessons.filter((l) => l.gratuit).length} leçons gratuites
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {lessons.length} leçons au total
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre, description ou matière..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 text-base"
                />
              </div>

              {/* Filter Grid */}
              <div className="grid md:grid-cols-5 gap-3">
                <Select value={selectedNiveau} onValueChange={setSelectedNiveau}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveauxScolaires.map((niveau) => (
                      <SelectItem key={niveau} value={niveau}>
                        {niveau}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMatiere} onValueChange={setSelectedMatiere}>
                  <SelectTrigger>
                    <SelectValue placeholder="Matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {matieres.map((matiere) => (
                      <SelectItem key={matiere} value={matiere}>
                        {matiere}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulte} onValueChange={setSelectedDifficulte}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toutes">Toutes</SelectItem>
                    <SelectItem value="Facile">Facile</SelectItem>
                    <SelectItem value="Moyen">Moyen</SelectItem>
                    <SelectItem value="Difficile">Difficile</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Tous</SelectItem>
                    <SelectItem value="Video">Vidéo</SelectItem>
                    <SelectItem value="Exercice">Exercice</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Document">Document</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="title">Titre A-Z</SelectItem>
                    <SelectItem value="duration">Durée</SelectItem>
                    <SelectItem value="difficulty">Difficulté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={showOnlyFree ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyFree(!showOnlyFree)}
                    className={showOnlyFree ? "bg-gradient-primary" : ""}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Gratuit uniquement
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    {filteredLessons.length} résultat{filteredLessons.length > 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lessons Grid */}
          {filteredLessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-semibold mb-2">Aucune leçon trouvée</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos filtres de recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  user={user}
                  featured={index < 3 && sortBy === "recent"}
                />
              ))}
            </div>
          )}

          {/* CTA Premium */}
          {!user && (
            <Card className="bg-gradient-hero text-white border-0">
              <CardContent className="py-12 text-center">
                <h3 className="text-3xl font-bold mb-4">
                  Accédez à toutes les ressources Premium
                </h3>
                <p className="text-xl mb-6 text-white/90">
                  Débloquez des milliers de leçons, exercices et quiz pour seulement 9,99€/mois
                </p>
                <Link to="/auth?mode=signup">
                  <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
                    Créer mon compte gratuitement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Lessons;
