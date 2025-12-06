import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Users, GraduationCap, BookOpen, Calendar, ArrowLeft, Sparkles } from "lucide-react";
import AdminResourceUpload from "@/components/AdminResourceUpload";
import AdminLessonManager from "@/components/AdminLessonManager";
import AdminTutorManager from "@/components/AdminTutorManager";
import AdminUserManager from "@/components/AdminUserManager";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    totalLessons: 0,
    totalSessions: 0
  });
  const [tutors, setTutors] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);

  useEffect(() => {
    if (!roleLoading) {
      if (!isAdmin) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions pour accéder à cette page",
          variant: "destructive"
        });
        navigate("/");
        return;
      }
      fetchAdminData();
    }
  }, [roleLoading, isAdmin, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const [profilesCount, tutorsCount, lessonsCount, sessionsCount] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("tutors").select("*", { count: "exact", head: true }),
        supabase.from("lessons").select("*", { count: "exact", head: true }),
        supabase.from("sessions_tutorat").select("*", { count: "exact", head: true })
      ]);

      setStats({
        totalUsers: profilesCount.count || 0,
        totalTutors: tutorsCount.count || 0,
        totalLessons: lessonsCount.count || 0,
        totalSessions: sessionsCount.count || 0
      });

      // Fetch tutors
      const { data: tutorsData } = await supabase
        .from("tutors")
        .select(`
          *,
          profiles (prenom, nom, email)
        `)
        .order("created_at", { ascending: false });

      setTutors(tutorsData || []);

      // Fetch parents with their students
      const { data: parentsData } = await supabase
        .from("parents")
        .select(`
          *,
          profiles (prenom, nom, email, telephone),
          students (id, prenom, niveau_scolaire)
        `)
        .order("created_at", { ascending: false });

      setParents(parentsData || []);

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setLessons(lessonsData || []);

      // Fetch recent sessions
      const { data: sessionsData } = await supabase
        .from("sessions_tutorat")
        .select(`
          *,
          students (prenom),
          tutors (profiles (prenom, nom))
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      setSessions(sessionsData || []);

    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTutor = async (tutorId: string) => {
    try {
      const { error } = await supabase
        .from("tutors")
        .update({ statut_approbation: "approuve" })
        .eq("id", tutorId);

      if (error) throw error;

      toast({
        title: "Tuteur approuvé",
        description: "Le tuteur a été approuvé avec succès"
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRejectTutor = async (tutorId: string) => {
    try {
      const { error } = await supabase
        .from("tutors")
        .update({ statut_approbation: "refuse" })
        .eq("id", tutorId);

      if (error) throw error;

      toast({
        title: "Tuteur refusé",
        description: "Le tuteur a été refusé"
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (roleLoading || loading) {
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
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Total inscrits</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tuteurs</CardTitle>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <GraduationCap className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.totalTutors}</div>
              <p className="text-xs text-muted-foreground mt-1">Enseignants actifs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leçons</CardTitle>
              <div className="p-2 bg-success/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.totalLessons}</div>
              <p className="text-xs text-muted-foreground mt-1">Ressources disponibles</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Sessions complétées</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="tutors">Tuteurs</TabsTrigger>
            <TabsTrigger value="lessons">
              <BookOpen className="h-4 w-4 mr-2" />
              Gestion des leçons
            </TabsTrigger>
            <TabsTrigger value="lessons-list">Liste des leçons</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="resources">
              <Sparkles className="h-4 w-4 mr-2" />
              Ressources interactives
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUserManager parents={parents} onUpdate={fetchAdminData} />
          </TabsContent>

          <TabsContent value="tutors">
            <AdminTutorManager tutors={tutors} onUpdate={fetchAdminData} />
          </TabsContent>

          <TabsContent value="lessons">
            <AdminLessonManager onUpdate={fetchAdminData} />
          </TabsContent>

          <TabsContent value="lessons-list">
            <Card>
              <CardHeader>
                <CardTitle>Liste des leçons</CardTitle>
                <CardDescription>Vue d'ensemble des leçons disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Gratuit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson) => (
                      <TableRow key={lesson.id}>
                        <TableCell className="font-medium">{lesson.titre}</TableCell>
                        <TableCell>{lesson.matiere}</TableCell>
                        <TableCell>{lesson.niveau_scolaire}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lesson.type_contenu}</Badge>
                        </TableCell>
                        <TableCell>{lesson.duree_estimee_minutes} min</TableCell>
                        <TableCell>
                          {lesson.gratuit ? (
                            <Badge variant="default">Gratuit</Badge>
                          ) : (
                            <Badge variant="secondary">Premium</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Sessions de tutorat</CardTitle>
                <CardDescription>Historique des sessions récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève</TableHead>
                      <TableHead>Tuteur</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.students?.prenom}</TableCell>
                        <TableCell>
                          {session.tutors?.profiles?.prenom} {session.tutors?.profiles?.nom}
                        </TableCell>
                        <TableCell>{session.matiere}</TableCell>
                        <TableCell>
                          {new Date(session.date_heure_debut).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>{session.duree_minutes} min</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              session.statut === "terminee"
                                ? "outline"
                                : session.statut === "annulee"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {session.statut}
                          </Badge>
                        </TableCell>
                        <TableCell>{session.montant_paye}€</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <AdminResourceUpload 
              lessons={lessons}
              onUploadSuccess={fetchAdminData}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
