import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Star, Award, Calendar, MapPin, Clock, CheckCircle, 
  Video, MessageSquare, ArrowLeft, GraduationCap, BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BookingDialog from "@/components/BookingDialog";

const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    loadTutor();
  }, [id]);

  const loadTutor = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("tutors")
      .select(`
        *,
        profiles:user_id (
          prenom,
          nom,
          pays,
          telephone,
          email
        )
      `)
      .eq("id", id)
      .eq("statut_approbation", "approuve")
      .single();

    if (error) {
      console.error("Error loading tutor:", error);
      toast({
        title: "Erreur",
        description: "Tuteur introuvable",
        variant: "destructive",
      });
      navigate("/tutors");
    } else {
      setTutor(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tutor) {
    return null;
  }

  const tutorName = `${tutor.profiles?.prenom} ${tutor.profiles?.nom}`;
  const initials = `${tutor.profiles?.prenom?.[0]}${tutor.profiles?.nom?.[0]}`;

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/tutors")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux tuteurs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tutor Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarFallback className="text-3xl bg-gradient-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{tutorName}</CardTitle>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{tutor.profiles?.pays}</span>
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-5 w-5 fill-secondary text-secondary" />
                  <span className="text-lg font-bold">{tutor.note_moyenne?.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({tutor.nombre_sessions} sessions)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span>{tutor.annees_experience} ans d'expérience</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Disponible 7j/7</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Video className="h-5 w-5 text-primary" />
                    <span>Cours en visio</span>
                  </div>
                  {tutor.verification_casier && (
                    <div className="flex items-center gap-3 text-sm text-success">
                      <CheckCircle className="h-5 w-5" />
                      <span>Casier judiciaire vérifié</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-primary">
                      {tutor.tarif_horaire_eur}€
                    </p>
                    <p className="text-sm text-muted-foreground">par heure</p>
                  </div>
                  <Button
                    className="w-full bg-gradient-primary"
                    size="lg"
                    onClick={() => setBookingOpen(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Réserver un cours
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Essai gratuit • Annulation gratuite 24h avant
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {tutor.bio || "Aucune description disponible."}
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="subjects" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="subjects">Matières</TabsTrigger>
                <TabsTrigger value="education">Formation</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
              </TabsList>

              <TabsContent value="subjects">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Matières enseignées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {tutor.matieres_enseignees?.map((matiere: string) => (
                        <div
                          key={matiere}
                          className="p-4 rounded-lg border hover:border-primary transition-colors text-center"
                        >
                          <p className="font-semibold">{matiere}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="education">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Formation et diplômes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {tutor.diplomes?.map((diplome: string, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="mt-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{diplome}</h4>
                          <p className="text-sm text-muted-foreground">Diplôme certifié</p>
                        </div>
                      </div>
                    ))}

                    {tutor.certifications && tutor.certifications.length > 0 && (
                      <div className="pt-6 border-t">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Award className="h-5 w-5 text-success" />
                          Certifications
                        </h4>
                        <div className="space-y-3">
                          {tutor.certifications.map((cert: string, index: number) => (
                            <div key={index} className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-success" />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Avis des parents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Mock reviews - À remplacer par de vraies données */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3 pb-6 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>P{i}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">Parent {i}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, j) => (
                                  <Star
                                    key={j}
                                    className="h-4 w-4 fill-secondary text-secondary"
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Il y a {i} mois
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            Excellent tuteur ! Mon enfant a fait d'énormes progrès en quelques semaines. 
                            Très pédagogue et patient.
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        tutorId={tutor.id}
        tutorName={tutorName}
        subject={tutor.matieres_enseignees?.[0] || "Matière"}
        hourlyRate={Number(tutor.tarif_horaire_eur)}
      />
    </div>
  );
};

export default TutorProfile;
