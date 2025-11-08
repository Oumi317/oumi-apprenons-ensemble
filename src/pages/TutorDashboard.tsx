import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign, Users, Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AvailabilityManager from "@/components/AvailabilityManager";
import StudentTracking from "@/components/StudentTracking";
import TutorStatistics from "@/components/TutorStatistics";
import SessionFeedback from "@/components/SessionFeedback";
import DynamicPricing from "@/components/DynamicPricing";
import LessonPlanTemplates from "@/components/LessonPlanTemplates";
import TutorResourceLibrary from "@/components/TutorResourceLibrary";
import TutorChat from "@/components/TutorChat";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    totalEarnings: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchTutorData();
  }, []);

  const fetchTutorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch tutor profile
      const { data: tutorData, error: tutorError } = await supabase
        .from("tutors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (tutorError) throw tutorError;

      if (!tutorData) {
        toast({
          title: "Profil tuteur introuvable",
          description: "Veuillez créer votre profil tuteur",
          variant: "destructive"
        });
        navigate("/tutor-signup");
        return;
      }

      setTutor(tutorData);

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions_tutorat")
        .select(`
          *,
          students (
            prenom,
            niveau_scolaire
          )
        `)
        .eq("tuteur_id", tutorData.id)
        .order("date_heure_debut", { ascending: false });

      if (sessionsError) throw sessionsError;

      setSessions(sessionsData || []);

      // Calculate stats
      const now = new Date();
      const upcoming = sessionsData?.filter(s => new Date(s.date_heure_debut) > now).length || 0;
      const totalEarnings = sessionsData?.reduce((sum, s) => sum + (Number(s.montant_paye) || 0), 0) || 0;

      setStats({
        totalSessions: tutorData.nombre_sessions || 0,
        upcomingSessions: upcoming,
        totalEarnings,
        averageRating: Number(tutorData.note_moyenne) || 0
      });

    } catch (error: any) {
      console.error("Error fetching tutor data:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      programmee: { variant: "default", label: "Programmée" },
      en_cours: { variant: "secondary", label: "En cours" },
      terminee: { variant: "outline", label: "Terminée" },
      annulee: { variant: "destructive", label: "Annulée" }
    };
    const info = statusMap[status] || statusMap.programmee;
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Tableau de bord tuteur</h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenue, {tutor?.bio?.split(" ")[0] || "Tuteur"}
                </p>
              </div>
            </div>
            <Badge variant={tutor?.statut_approbation === "approuve" ? "default" : "secondary"}>
              {tutor?.statut_approbation === "approuve" ? "Approuvé" : "En attente"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions à venir</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEarnings}€</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="past">Passées</TabsTrigger>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="availability">Disponibilités</TabsTrigger>
            <TabsTrigger value="tracking">Suivi Élèves</TabsTrigger>
            <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            <TabsTrigger value="feedback">Feedbacks</TabsTrigger>
            <TabsTrigger value="pricing">Tarification</TabsTrigger>
            <TabsTrigger value="templates">Plans de Cours</TabsTrigger>
            <TabsTrigger value="resources">Bibliothèque</TabsTrigger>
            <TabsTrigger value="chat">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {sessions.filter(s => new Date(s.date_heure_debut) > new Date()).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucune session à venir
                </CardContent>
              </Card>
            ) : (
              sessions
                .filter(s => new Date(s.date_heure_debut) > new Date())
                .map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{session.matiere}</CardTitle>
                          <CardDescription>
                            Élève: {session.students?.prenom} • {session.students?.niveau_scolaire}
                          </CardDescription>
                        </div>
                        {getStatusBadge(session.statut)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date_heure_debut).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(session.date_heure_debut).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {session.montant_paye}€
                        </div>
                      </div>
                      {session.lien_zoom && (
                        <div className="mt-4">
                          <Button asChild size="sm">
                            <a href={session.lien_zoom} target="_blank" rel="noopener noreferrer">
                              Rejoindre la session
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {sessions.filter(s => new Date(s.date_heure_debut) <= new Date()).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucune session passée
                </CardContent>
              </Card>
            ) : (
              sessions
                .filter(s => new Date(s.date_heure_debut) <= new Date())
                .map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{session.matiere}</CardTitle>
                          <CardDescription>
                            Élève: {session.students?.prenom} • {session.students?.niveau_scolaire}
                          </CardDescription>
                        </div>
                        {getStatusBadge(session.statut)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date_heure_debut).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(session.date_heure_debut).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {session.montant_paye}€
                        </div>
                        {session.evaluation_etudiant && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            {session.evaluation_etudiant}/5
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucune session pour le moment
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{session.matiere}</CardTitle>
                        <CardDescription>
                          Élève: {session.students?.prenom} • {session.students?.niveau_scolaire}
                        </CardDescription>
                      </div>
                      {getStatusBadge(session.statut)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.date_heure_debut).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(session.date_heure_debut).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {session.montant_paye}€
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityManager />
          </TabsContent>

          <TabsContent value="tracking">
            <StudentTracking />
          </TabsContent>

          <TabsContent value="statistics">
            <TutorStatistics />
          </TabsContent>

          <TabsContent value="feedback">
            <SessionFeedback />
          </TabsContent>

          <TabsContent value="pricing">
            <DynamicPricing />
          </TabsContent>

          <TabsContent value="templates">
            <LessonPlanTemplates />
          </TabsContent>

          <TabsContent value="resources">
            <TutorResourceLibrary />
          </TabsContent>

          <TabsContent value="chat">
            <TutorChat />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
