import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { LessonCard } from "@/components/LessonCard";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveLearning } from "@/components/InteractiveLearning";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Grid3x3,
  List,
  TrendingUp,
  Sparkles,
  Target,
  Video,
  FileQuestion,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


const Lessons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inProgressLessons, setInProgressLessons] = useState<any[]>([]);
  const [recommendedLessons, setRecommendedLessons] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [interactiveResources, setInteractiveResources] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lessonsPerPage] = useState(12);
  const [filters, setFilters] = useState({
    niveau: "",
    matiere: "",
    difficulte: "",
    type: ""
  });

  useEffect(() => {
    checkUser();
    loadLessons();
    loadInteractiveResources();
  }, []);

  useEffect(() => {
    if (user) {
      loadPersonalizedData();
    }
  }, [user, lessons]);

  useEffect(() => {
    filterLessons();
  }, [lessons, filters]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await loadChildren(user.id);
    }
  };

  const loadChildren = async (userId: string) => {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", userId);
    
    if (data) {
      setChildren(data);
    }
  };

  const loadPersonalizedData = async () => {
    if (!children.length || !lessons.length) return;

    // Load in-progress lessons
    const { data: progressData } = await supabase
      .from("student_progress")
      .select("*, lessons(*)")
      .in("etudiant_id", children.map(c => c.id))
      .gt("statut_completion", 0)
      .lt("statut_completion", 100)
      .order("updated_at", { ascending: false })
      .limit(3);

    if (progressData) {
      const uniqueLessons = Array.from(
        new Map(progressData.map(p => [p.lessons.id, { ...p.lessons, progress: p.statut_completion }])).values()
      );
      setInProgressLessons(uniqueLessons);
    }

    // Get recommended lessons based on children's levels
    const childLevels = [...new Set(children.map(c => c.niveau_scolaire))];
    const recommended = lessons
      .filter(l => childLevels.includes(l.niveau_scolaire) && l.gratuit)
      .slice(0, 6);
    setRecommendedLessons(recommended);
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

  const loadInteractiveResources = async () => {
    const { data, error } = await supabase
      .from("interactive_resources")
      .select("*, lessons(titre, matiere)")
      .order("ordre_affichage", { ascending: true });

    if (error) {
      console.error("Error loading interactive resources:", error);
    } else {
      setInteractiveResources(data || []);
    }
  };

  const filterLessons = () => {
    let filtered = [...lessons];

    if (filters.niveau) {
      filtered = filtered.filter((lesson) => lesson.niveau_scolaire === filters.niveau);
    }

    if (filters.matiere) {
      filtered = filtered.filter((lesson) => lesson.matiere === filters.matiere);
    }

    if (filters.difficulte) {
      filtered = filtered.filter((lesson) => lesson.difficulte === filters.difficulte);
    }

    if (filters.type) {
      filtered = filtered.filter((lesson) => lesson.type_contenu === filters.type);
    }

    setFilteredLessons(filtered);
    setCurrentPage(1);
  };

  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * lessonsPerPage;
    return filteredLessons.slice(startIndex, startIndex + lessonsPerPage);
  }, [filteredLessons, currentPage, lessonsPerPage]);

  const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);

  const handleSearch = (query: string) => {
    let filtered = [...lessons];

    if (query) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.titre.toLowerCase().includes(query.toLowerCase()) ||
          lesson.description?.toLowerCase().includes(query.toLowerCase()) ||
          lesson.matiere.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply existing filters
    if (filters.niveau) {
      filtered = filtered.filter((lesson) => lesson.niveau_scolaire === filters.niveau);
    }

    if (filters.matiere) {
      filtered = filtered.filter((lesson) => lesson.matiere === filters.matiere);
    }

    if (filters.difficulte) {
      filtered = filtered.filter((lesson) => lesson.difficulte === filters.difficulte);
    }

    if (filters.type) {
      filtered = filtered.filter((lesson) => lesson.type_contenu === filters.type);
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
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="text-center space-y-6 py-8">
              <Skeleton className="h-12 w-96 mx-auto" />
              <Skeleton className="h-6 w-[600px] mx-auto" />
              <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto pt-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-8 w-8 mx-auto mb-2" />
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
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
          <div className="text-center space-y-6 py-8">
            <h1 className="text-5xl font-bold">Bibliothèque de ressources</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Des milliers de leçons, exercices et quiz alignés avec le programme français
            </p>
            
            {/* Statistics */}
            <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto pt-4">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold text-primary">{lessons.length}</div>
                  <div className="text-sm text-muted-foreground">Leçons totales</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-success" />
                  <div className="text-3xl font-bold text-success">
                    {lessons.filter((l) => l.gratuit).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Ressources gratuites</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                <CardContent className="p-6 text-center">
                  <Video className="h-8 w-8 mx-auto mb-2 text-secondary" />
                  <div className="text-3xl font-bold text-secondary">
                    {lessons.filter((l) => l.type_contenu === "video").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Vidéos</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <CardContent className="p-6 text-center">
                  <FileQuestion className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <div className="text-3xl font-bold text-accent">
                    {lessons.filter((l) => l.type_contenu === "quiz").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Quiz</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold text-primary">
                    {interactiveResources.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Ressources interactives</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Continue Learning Section */}
          {user && inProgressLessons.length > 0 && (
            <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Continuer l'apprentissage
                    </CardTitle>
                    <CardDescription>Reprenez là où vous vous êtes arrêté</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {inProgressLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      user={user}
                      progress={{
                        completion: lesson.progress || 0,
                        lastAccessed: new Date().toISOString(),
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended Section */}
          {user && recommendedLessons.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-secondary" />
                      Recommandé pour vous
                    </CardTitle>
                    <CardDescription>
                      Basé sur le niveau de {children.length > 1 ? 'vos enfants' : 'votre enfant'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recommendedLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      user={user}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Lessons and Interactive Resources */}
          <Tabs defaultValue="lessons" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="lessons" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Toutes les leçons
              </TabsTrigger>
              <TabsTrigger value="interactive" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Ressources interactives
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-4">
                <SearchBar onSearch={handleSearch} />
                
                {/* Results and View Mode */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm">
                    {filteredLessons.length} résultat{filteredLessons.length > 1 ? "s" : ""}
                  </Badge>

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
              </div>

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
                <>
                  <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {paginatedLessons.map((lesson, index) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        user={user}
                        featured={index < 3}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-10"
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page}>...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="interactive" className="space-y-6">
              {interactiveResources.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">Aucune ressource interactive disponible</h3>
                    <p className="text-muted-foreground">
                      Les ressources interactives seront bientôt disponibles
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Group by lesson */}
                  {Object.entries(
                    interactiveResources.reduce((acc: any, resource: any) => {
                      const lessonTitle = resource.lessons?.titre || "Autres ressources";
                      if (!acc[lessonTitle]) {
                        acc[lessonTitle] = [];
                      }
                      acc[lessonTitle].push(resource);
                      return acc;
                    }, {})
                  ).map(([lessonTitle, resources]: [string, any]) => (
                    <div key={lessonTitle}>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {lessonTitle}
                      </h3>
                      <InteractiveLearning resources={resources} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

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

      <Footer />
    </div>
  );
};

export default Lessons;
