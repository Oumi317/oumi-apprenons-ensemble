import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  Search, 
  Star, 
  Award, 
  Calendar, 
  Users,
  CheckCircle,
  Target,
  Shield,
  Sparkles,
  Clock,
  Video,
  BarChart3,
  TrendingUp,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BookingDialog from "@/components/BookingDialog";

const matieres = [
  "Toutes", "Français", "Mathématiques", "Histoire-Géographie", 
  "Sciences", "Physique-Chimie", "Anglais", "Philosophie"
];

const Tutors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [tutors, setTutors] = useState<any[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<any[]>([]);
  const [featuredTutors, setFeaturedTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");
  const [maxTarif, setMaxTarif] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 12;
  const [bookingDialog, setBookingDialog] = useState<{
    open: boolean;
    tutorId: string;
    tutorName: string;
    subject: string;
    hourlyRate: number;
  }>({
    open: false,
    tutorId: "",
    tutorName: "",
    subject: "",
    hourlyRate: 0
  });

  useEffect(() => {
    checkUser();
    loadTutors();
    
    // Check if there's a subject parameter in the URL
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      setSelectedMatiere(subjectParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchQuery, selectedMatiere, maxTarif, minRating, availableOnly]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadTutors = async () => {
    // Select only public-safe fields - exclude notes_admin and other sensitive data
    const { data, error } = await supabase
      .from("tutors")
      .select(`
        id,
        matieres_enseignees,
        tarif_horaire_eur,
        annees_experience,
        note_moyenne,
        nombre_sessions,
        bio,
        diplomes,
        certifications,
        disponibilites,
        verification_casier,
        profiles:user_id (
          prenom,
          nom,
          pays
        )
      `)
      .eq("statut_approbation", "approuve")
      .order("note_moyenne", { ascending: false });

    if (error) {
      console.error("Error loading tutors:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tuteurs",
        variant: "destructive",
      });
    } else {
      setTutors(data || []);
      // Set featured tutors (top rated with most sessions)
      const featured = [...(data || [])]
        .sort((a, b) => {
          const scoreA = (a.note_moyenne || 0) * 0.6 + (a.nombre_sessions || 0) * 0.4;
          const scoreB = (b.note_moyenne || 0) * 0.6 + (b.nombre_sessions || 0) * 0.4;
          return scoreB - scoreA;
        })
        .slice(0, 3);
      setFeaturedTutors(featured);
    }
    setLoading(false);
  };

  const filterTutors = useCallback(() => {
    let filtered = [...tutors];

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.profiles?.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.profiles?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par matière
    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter((tutor) =>
        tutor.matieres_enseignees?.includes(selectedMatiere)
      );
    }

    // Filtre par tarif
    filtered = filtered.filter((tutor) => tutor.tarif_horaire_eur <= maxTarif);

    // Filtre par note minimum
    if (minRating > 0) {
      filtered = filtered.filter((tutor) => (tutor.note_moyenne || 0) >= minRating);
    }

    // Filtre par disponibilité
    if (availableOnly) {
      filtered = filtered.filter(
        (tutor) => tutor.disponibilites && Object.keys(tutor.disponibilites).length > 0
      );
    }

    setFilteredTutors(filtered);
    setCurrentPage(1);
  }, [tutors, searchQuery, selectedMatiere, maxTarif, minRating, availableOnly]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur Oumi'School !",
    });
    navigate("/");
  };

  const paginatedTutors = useMemo(() => {
    const startIndex = (currentPage - 1) * tutorsPerPage;
    const endIndex = startIndex + tutorsPerPage;
    return filteredTutors.slice(startIndex, endIndex);
  }, [filteredTutors, currentPage, tutorsPerPage]);

  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="h-20 w-20 rounded-2xl" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm inline-flex items-center gap-2 px-4 py-2 animate-fade-in">
              <Shield className="h-4 w-4" />
              +{tutors.length} tuteurs certifiés disponibles
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight animate-fade-in">
              Trouvez le tuteur parfait pour votre enfant
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Des enseignants passionnés, rigoureusement sélectionnés pour leur excellence pédagogique et leur expérience
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {[
                { icon: Users, value: `${tutors.length}+`, label: "Tuteurs" },
                { icon: Star, value: tutors.length > 0 ? (tutors.reduce((sum, t) => sum + (t.note_moyenne || 0), 0) / tutors.length).toFixed(1) : "4.8", label: "Note moyenne" },
                { icon: CheckCircle, value: "100%", label: "Vérifiés" },
                { icon: Clock, value: "24/7", label: "Disponibilité" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover-scale animate-fade-in"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Vérification rigoureuse", desc: "Diplômes et casiers judiciaires vérifiés" },
              { icon: Video, title: "Cours interactifs", desc: "Tableau blanc et outils pédagogiques avancés" },
              { icon: BarChart3, title: "Suivi en temps réel", desc: "Rapports détaillés après chaque session" },
              { icon: TrendingUp, title: "Résultats garantis", desc: "92% de progression constatée" },
            ].map((item, index) => (
              <div key={index} className="text-center space-y-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="h-14 w-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">

          {/* Featured Tutors */}
          {featuredTutors.length > 0 && (
            <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Tuteurs recommandés
                    </CardTitle>
                    <CardDescription>Nos meilleurs tuteurs selon les notes et l'expérience</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {featuredTutors.map((tutor) => (
                    <Card
                      key={tutor.id}
                      className="hover:shadow-xl transition-all hover:border-primary cursor-pointer relative overflow-hidden"
                      onClick={() => navigate(`/tutors/${tutor.id}`)}
                    >
                      <div className="absolute top-0 right-0 bg-gradient-primary text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
                        <Star className="h-3 w-3 inline mr-1" />
                        Top tuteur
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                            {tutor.profiles?.prenom?.[0]}{tutor.profiles?.nom?.[0]}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-secondary font-bold">
                              <Star className="h-4 w-4 fill-secondary" />
                              <span>{tutor.note_moyenne?.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {tutor.nombre_sessions} sessions
                            </p>
                          </div>
                        </div>
                        <CardTitle className="text-xl">
                          {tutor.profiles?.prenom} {tutor.profiles?.nom}
                        </CardTitle>
                        <CardDescription>
                          {tutor.annees_experience} ans d'expérience
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-1">
                          {tutor.matieres_enseignees?.slice(0, 2).map((matiere: string) => (
                            <Badge key={matiere} variant="secondary" className="text-xs">
                              {matiere}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {tutor.tarif_horaire_eur}€
                            </p>
                            <p className="text-xs text-muted-foreground">par heure</p>
                          </div>
                          <Button 
                            size="sm"
                            className="bg-gradient-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookingDialog({
                                open: true,
                                tutorId: tutor.id,
                                tutorName: `${tutor.profiles?.prenom} ${tutor.profiles?.nom}`,
                                subject: tutor.matieres_enseignees?.[0] || "Matière",
                                hourlyRate: Number(tutor.tarif_horaire_eur)
                              });
                            }}
                          >
                            Réserver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle>Trouvez votre tuteur idéal</CardTitle>
              </div>
              <CardDescription>
                Filtrez par matière, budget et compétences pour trouver le match parfait
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Nom, spécialité, certification..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Matière</label>
                    <Select value={selectedMatiere} onValueChange={setSelectedMatiere}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Toutes les matières" />
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Budget maximum par heure
                      </label>
                      <Badge className="text-base font-bold px-3 py-1">
                        {maxTarif}€
                      </Badge>
                    </div>
                    <Slider
                      value={[maxTarif]}
                      onValueChange={(value) => setMaxTarif(value[0])}
                      min={20}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>20€/h</span>
                      <span>100€/h</span>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Note minimum
                    </Label>
                    <Select value={minRating.toString()} onValueChange={(val) => setMinRating(Number(val))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Toutes les notes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Toutes les notes</SelectItem>
                        <SelectItem value="3">3★ et plus</SelectItem>
                        <SelectItem value="4">4★ et plus</SelectItem>
                        <SelectItem value="4.5">4.5★ et plus</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="available"
                        checked={availableOnly}
                        onCheckedChange={(checked) => setAvailableOnly(!!checked)}
                      />
                      <Label
                        htmlFor="available"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Afficher uniquement les tuteurs disponibles
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    <Users className="h-4 w-4 mr-2" />
                    {filteredTutors.length} tuteur{filteredTutors.length > 1 ? "s" : ""} disponible{filteredTutors.length > 1 ? "s" : ""}
                  </Badge>
                  {(searchQuery || selectedMatiere !== "Toutes" || maxTarif !== 100 || minRating > 0 || availableOnly) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedMatiere("Toutes");
                        setMaxTarif(100);
                        setMinRating(0);
                        setAvailableOnly(false);
                      }}
                    >
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutors Grid */}
          {filteredTutors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun tuteur trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos critères de recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedTutors.map((tutor) => (
                <Card
                  key={tutor.id}
                  className="group hover:shadow-2xl transition-all hover:border-primary/50 cursor-pointer animate-fade-in hover:-translate-y-1 border-2"
                  onClick={() => navigate(`/tutors/${tutor.id}`)}
                >
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                          {tutor.profiles?.prenom?.[0]}{tutor.profiles?.nom?.[0]}
                        </div>
                        {tutor.verification_casier && (
                          <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-success rounded-full border-2 border-background flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1.5 rounded-full">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          <span className="font-bold text-secondary">{tutor.note_moyenne?.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tutor.nombre_sessions} sessions données
                        </p>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {tutor.profiles?.prenom} {tutor.profiles?.nom}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Award className="h-3 w-3" />
                      {tutor.annees_experience} ans d'expérience • {tutor.profiles?.pays}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="min-h-[60px]">
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {tutor.bio}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Matières enseignées</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tutor.matieres_enseignees?.slice(0, 3).map((matiere: string) => (
                          <Badge key={matiere} variant="secondary" className="text-xs font-medium">
                            {matiere}
                          </Badge>
                        ))}
                        {tutor.matieres_enseignees?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tutor.matieres_enseignees.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    </div>

                    {tutor.certifications && tutor.certifications.length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-success/5 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-4 w-4 text-success" />
                        </div>
                        <span className="text-sm text-success font-semibold">
                          {tutor.certifications[0]}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t-2">
                      <div>
                        <p className="text-3xl font-bold text-primary">
                          {tutor.tarif_horaire_eur}€
                        </p>
                        <p className="text-xs text-muted-foreground">par heure</p>
                      </div>
                      <Button 
                        size="lg"
                        className="bg-gradient-primary hover:scale-105 transition-transform shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingDialog({
                            open: true,
                            tutorId: tutor.id,
                            tutorName: `${tutor.profiles?.prenom} ${tutor.profiles?.nom}`,
                            subject: tutor.matieres_enseignees?.[0] || "Matière",
                            hourlyRate: Number(tutor.tarif_horaire_eur)
                          });
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Réserver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
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
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}

          {/* CTA Devenir Tuteur */}
          <Card className="bg-gradient-hero text-white border-0">
            <CardContent className="py-12 text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="h-8 w-8" />
                  <GraduationCap className="h-10 w-10" />
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-4xl font-bold">
                  Vous êtes enseignant ?
                </h3>
                <p className="text-xl text-white/90">
                  Rejoignez notre équipe de tuteurs d'excellence et partagez votre passion de l'enseignement avec des milliers d'élèves
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Horaires flexibles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Rémunération attractive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Formation continue</span>
                  </div>
                </div>
                <Link to="/tutor-signup">
                  <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform text-lg px-8">
                    Devenir tuteur
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      <BookingDialog
        open={bookingDialog.open}
        onOpenChange={(open) => setBookingDialog({ ...bookingDialog, open })}
        tutorId={bookingDialog.tutorId}
        tutorName={bookingDialog.tutorName}
        subject={bookingDialog.subject}
        hourlyRate={bookingDialog.hourlyRate}
      />
    </div>
  );
};

export default Tutors;
