import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Award, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Video, 
  MessageSquare, 
  ArrowLeft, 
  GraduationCap, 
  BookOpen,
  Target,
  TrendingUp,
  Heart,
  Shield,
  Languages,
  Users
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadTutor();
    checkFavorite();
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

  const checkFavorite = async () => {
    if (!id) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setUserId(user.id);
    
    const { data } = await supabase
      .from("favorite_tutors")
      .select("id")
      .eq("parent_id", user.id)
      .eq("tutor_id", id)
      .maybeSingle();
    
    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!userId || !id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter aux favoris",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("favorite_tutors")
          .delete()
          .eq("parent_id", userId)
          .eq("tutor_id", id);
        
        setIsFavorite(false);
        toast({
          title: "Retiré des favoris",
          description: "Ce tuteur a été retiré de vos favoris"
        });
      } else {
        // Add to favorites
        await supabase
          .from("favorite_tutors")
          .insert({
            parent_id: userId,
            tutor_id: id
          });
        
        setIsFavorite(true);
        toast({
          title: "Ajouté aux favoris",
          description: "Ce tuteur a été ajouté à vos favoris"
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris",
        variant: "destructive"
      });
    }
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
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
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
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: Users, value: tutor.nombre_sessions, label: "Sessions données", color: "text-primary" },
                { icon: TrendingUp, value: "98%", label: "Taux de réussite", color: "text-success" },
                { icon: Clock, value: "24h", label: "Temps de réponse", color: "text-secondary" },
                { icon: Heart, value: "96%", label: "Recommandations", color: "text-accent" }
              ].map((stat, index) => (
                <Card key={index} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>À propos de moi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {tutor.bio || "Aucune description disponible."}
                </p>
                
                {/* Teaching Approach */}
                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Ma méthode d'enseignement
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>Approche personnalisée adaptée au rythme de chaque élève</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>Exercices pratiques et mises en situation réelles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>Suivi régulier des progrès et ajustement de la méthode</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>Ressources pédagogiques complémentaires fournies</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="subjects" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="subjects">Matières</TabsTrigger>
                <TabsTrigger value="education">Formation</TabsTrigger>
                <TabsTrigger value="reviews">Avis ({tutor.nombre_sessions || 0})</TabsTrigger>
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
                    <div className="flex items-center justify-between">
                      <CardTitle>Avis des parents</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-secondary text-secondary" />
                        <span className="text-2xl font-bold">{tutor.note_moyenne?.toFixed(1)}</span>
                        <span className="text-muted-foreground">/ 5</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Rating Distribution */}
                    <div className="space-y-3 mb-8 pb-6 border-b">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const percentage = rating === 5 ? 85 : rating === 4 ? 12 : 3;
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-12">
                              <span className="text-sm font-medium">{rating}</span>
                              <Star className="h-3 w-3 fill-secondary text-secondary" />
                            </div>
                            <Progress value={percentage} className="flex-1" />
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-6">
                      {/* Mock reviews with more detail */}
                      {[
                        {
                          name: "Sophie Martin",
                          rating: 5,
                          date: "Il y a 2 semaines",
                          subject: "Mathématiques - Seconde",
                          comment: "Excellent professeur ! Ma fille a gagné 4 points de moyenne en mathématiques en seulement 2 mois. {tutorName} est très pédagogue et sait s'adapter au niveau de l'élève. Les exercices proposés sont variés et pertinents. Je recommande vivement !",
                        },
                        {
                          name: "Thomas Dubois",
                          rating: 5,
                          date: "Il y a 1 mois",
                          subject: "Physique-Chimie - Terminale",
                          comment: "Grâce à {tutorName}, mon fils a décroché une mention Très Bien au Bac ! La préparation était rigoureuse et les explications toujours claires. Un vrai professionnel qui sait motiver ses élèves.",
                        },
                        {
                          name: "Marie Leclerc",
                          rating: 5,
                          date: "Il y a 2 mois",
                          subject: "Français - 3ème",
                          comment: "Ma fille était en difficulté en français, particulièrement à l'écrit. {tutorName} a su identifier ses lacunes et y remédier avec des méthodes adaptées. Les progrès sont spectaculaires ! Merci pour votre patience et votre professionnalisme.",
                        },
                        {
                          name: "Jean Rousseau",
                          rating: 4,
                          date: "Il y a 3 mois",
                          subject: "Histoire-Géographie - 1ère",
                          comment: "Très bon tuteur, mon fils a repris confiance en lui. Les cours sont bien structurés et {tutorName} prend le temps d'expliquer. Seul petit bémol : parfois un peu de retard sur les horaires.",
                        },
                      ].map((review, i) => (
                        <div key={i} className="space-y-3 pb-6 border-b last:border-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {review.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold">{review.name}</p>
                                <p className="text-sm text-muted-foreground">{review.subject}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, j) => (
                                    <Star
                                      key={j}
                                      className={`h-4 w-4 ${
                                        j < review.rating
                                          ? "fill-secondary text-secondary"
                                          : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {review.date}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {review.comment.replace('{tutorName}', tutor.profiles?.prenom || 'Ce tuteur')}
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

      <Footer />

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
