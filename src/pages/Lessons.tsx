import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, BookOpen, Clock, Search, Filter, Lock, Play, FileText, HelpCircle } from "lucide-react";
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
  const [showOnlyFree, setShowOnlyFree] = useState(false);

  useEffect(() => {
    checkUser();
    loadLessons();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, searchQuery, selectedNiveau, selectedMatiere, showOnlyFree]);

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
          lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
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

    // Filtre gratuit uniquement
    if (showOnlyFree) {
      filtered = filtered.filter((lesson) => lesson.gratuit);
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
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={user ? "/dashboard/parent" : "/"} className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Oumi'School
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link to="/dashboard/parent">
                  <Button variant="outline" size="sm">
                    Mon tableau de bord
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            )}
            {!user && (
              <Link to="/auth">
                <Button className="bg-gradient-primary">Se connecter</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

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
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une leçon..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedNiveau} onValueChange={setSelectedNiveau}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau scolaire" />
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
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant={showOnlyFree ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyFree(!showOnlyFree)}
                  className={showOnlyFree ? "bg-gradient-primary" : ""}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Gratuit uniquement
                </Button>
                <span className="text-sm text-muted-foreground">
                  {filteredLessons.length} résultat{filteredLessons.length > 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Lessons Grid */}
          {filteredLessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune leçon trouvée</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos filtres de recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => {
                const TypeIcon = typeIcons[lesson.type_contenu as keyof typeof typeIcons];
                return (
                  <Card
                    key={lesson.id}
                    className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer animate-fade-in"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {lesson.niveau_scolaire}
                        </Badge>
                        {!lesson.gratuit && (
                          <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{lesson.titre}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {lesson.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TypeIcon className="h-4 w-4" />
                          <span className="capitalize">{lesson.type_contenu}</span>
                        </div>
                        {lesson.duree_estimee_minutes && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{lesson.duree_estimee_minutes} min</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {lesson.matiere}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${difficulteColors[lesson.difficulte as keyof typeof difficulteColors]}`}
                        >
                          {lesson.difficulte}
                        </Badge>
                      </div>
                      <Button
                        className={`w-full ${lesson.gratuit ? "bg-gradient-primary" : ""}`}
                        variant={lesson.gratuit ? "default" : "outline"}
                        disabled={!lesson.gratuit && !user}
                      >
                        {lesson.gratuit ? "Commencer" : user ? "Accéder" : "Connexion requise"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
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
