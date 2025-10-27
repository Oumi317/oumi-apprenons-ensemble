import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
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
import { GraduationCap, Search, Star, Award, Calendar, Clock, Users } from "lucide-react";
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
  const [user, setUser] = useState<any>(null);
  const [tutors, setTutors] = useState<any[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");
  const [maxTarif, setMaxTarif] = useState(100);
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
  }, []);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchQuery, selectedMatiere, maxTarif]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadTutors = async () => {
    const { data, error } = await supabase
      .from("tutors")
      .select(`
        *,
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
    }
    setLoading(false);
  };

  const filterTutors = () => {
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

    setFilteredTutors(filtered);
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
            <h2 className="text-4xl font-bold">Nos tuteurs certifiés</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professeurs expérimentés et diplômés, prêts à accompagner vos enfants
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Award className="h-3 w-3 mr-1" />
                100% certifiés
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Users className="h-3 w-3 mr-1" />
                {tutors.length} tuteurs disponibles
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un tuteur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
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
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Tarif maximum: {maxTarif}€/h
                  </label>
                  <Input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={maxTarif}
                    onChange={(e) => setMaxTarif(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">
                  {filteredTutors.length} tuteur{filteredTutors.length > 1 ? "s" : ""} trouvé{filteredTutors.length > 1 ? "s" : ""}
                </span>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutors.map((tutor) => (
                <Card
                  key={tutor.id}
                  className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer animate-fade-in"
                  onClick={() => navigate(`/tutors/${tutor.id}`)}
                >
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
                      {tutor.annees_experience} ans d'expérience • {tutor.profiles?.pays}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {tutor.bio}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Matières</p>
                      <div className="flex flex-wrap gap-1">
                        {tutor.matieres_enseignees?.slice(0, 3).map((matiere: string) => (
                          <Badge key={matiere} variant="secondary" className="text-xs">
                            {matiere}
                          </Badge>
                        ))}
                        {tutor.matieres_enseignees?.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tutor.matieres_enseignees.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {tutor.certifications && tutor.certifications.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-success" />
                        <span className="text-success font-semibold">
                          {tutor.certifications[0]}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {tutor.tarif_horaire_eur}€
                        </p>
                        <p className="text-xs text-muted-foreground">par heure</p>
                      </div>
                      <Button 
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
                        <Calendar className="h-4 w-4 mr-2" />
                        Réserver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Devenir Tuteur */}
          <Card className="bg-gradient-warm text-white border-0">
            <CardContent className="py-12 text-center">
              <h3 className="text-3xl font-bold mb-4">
                Vous êtes enseignant ?
              </h3>
              <p className="text-xl mb-6 text-white/90">
                Rejoignez notre équipe de tuteurs certifiés et partagez votre passion de l'enseignement
              </p>
              <Link to="/auth?mode=signup&role=tutor">
                <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
                  Devenir tuteur
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

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
