import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Star, Search, Filter, Video, FileText, MessageSquare, User, BookOpen } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface Session {
  id: string;
  date_heure_debut: string;
  duree_minutes: number;
  matiere: string;
  statut: string;
  evaluation_etudiant: number | null;
  commentaire_evaluation: string | null;
  notes_tuteur: string | null;
  enregistrement_url: string | null;
  montant_paye: number | null;
  students: {
    prenom: string;
  };
  tutors: {
    profiles: {
      prenom: string;
      nom: string;
    };
  };
  session_feedback: Array<{
    comprehension_score: number | null;
    participation_score: number | null;
    strengths: string | null;
    areas_for_improvement: string | null;
    homework_assigned: string | null;
    tutor_notes: string | null;
  }> | null;
}

export function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: students } = await supabase
        .from("students")
        .select("id")
        .eq("parent_id", user.id);

      if (!students || students.length === 0) {
        setLoading(false);
        return;
      }

      const studentIds = students.map(s => s.id);

      const { data, error } = await supabase
        .from("sessions_tutorat")
        .select(`
          id,
          date_heure_debut,
          duree_minutes,
          matiere,
          statut,
          evaluation_etudiant,
          commentaire_evaluation,
          notes_tuteur,
          enregistrement_url,
          montant_paye,
          students (prenom),
          tutors (
            profiles (prenom, nom)
          ),
          session_feedback (
            comprehension_score,
            participation_score,
            strengths,
            areas_for_improvement,
            homework_assigned,
            tutor_notes
          )
        `)
        .in("etudiant_id", studentIds)
        .order("date_heure_debut", { ascending: false });

      if (error) throw error;
      // Transform data to match our Session interface
      const transformedData = (data || []).map(session => ({
        ...session,
        session_feedback: session.session_feedback ? 
          (Array.isArray(session.session_feedback) ? session.session_feedback : [session.session_feedback]) 
          : null
      }));
      setSessions(transformedData as Session[]);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completee: { label: "Terminée", variant: "default" },
      programmee: { label: "À venir", variant: "secondary" },
      annulee: { label: "Annulée", variant: "destructive" },
      en_cours: { label: "En cours", variant: "outline" },
    };
    const config = statusConfig[statut] || { label: statut, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.matiere.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.students?.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.tutors?.profiles?.prenom.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || session.statut === statusFilter;
    const matchesSubject = subjectFilter === "all" || session.matiere === subjectFilter;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const uniqueSubjects = [...new Set(sessions.map(s => s.matiere))];
  const completedSessions = sessions.filter(s => s.statut === "completee");
  const totalHours = completedSessions.reduce((acc, s) => acc + s.duree_minutes, 0) / 60;
  const avgRating = completedSessions.filter(s => s.evaluation_etudiant).reduce((acc, s) => acc + (s.evaluation_etudiant || 0), 0) / (completedSessions.filter(s => s.evaluation_etudiant).length || 1);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Historique des sessions
            </CardTitle>
            <CardDescription>
              {completedSessions.length} sessions terminées • {totalHours.toFixed(1)}h au total • Note moyenne: {avgRating.toFixed(1)}/5
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par matière, enfant ou tuteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="completee">Terminées</SelectItem>
              <SelectItem value="programmee">À venir</SelectItem>
              <SelectItem value="annulee">Annulées</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[180px]">
              <BookOpen className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Matière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {uniqueSubjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune session trouvée</p>
              </motion.div>
            ) : (
              filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{session.matiere}</h4>
                          {getStatusBadge(session.statut)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.students?.prenom} avec {session.tutors?.profiles?.prenom} {session.tutors?.profiles?.nom}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(session.date_heure_debut), "d MMMM yyyy", { locale: fr })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duree_minutes} min
                          </span>
                          {session.evaluation_etudiant && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {session.evaluation_etudiant}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.enregistrement_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={session.enregistrement_url} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-1" />
                            Revoir
                          </a>
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                            <FileText className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {session.matiere} - {format(new Date(session.date_heure_debut), "d MMMM yyyy", { locale: fr })}
                              {getStatusBadge(session.statut)}
                            </DialogTitle>
                            <DialogDescription>
                              Session de {session.duree_minutes} minutes avec {session.tutors?.profiles?.prenom} {session.tutors?.profiles?.nom}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="info" className="mt-4">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="info">Informations</TabsTrigger>
                              <TabsTrigger value="feedback">Feedback</TabsTrigger>
                              <TabsTrigger value="notes">Notes</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="info" className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-accent/50 rounded-lg">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <User className="h-4 w-4" />
                                    Élève
                                  </div>
                                  <p className="font-medium">{session.students?.prenom}</p>
                                </div>
                                <div className="p-4 bg-accent/50 rounded-lg">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Clock className="h-4 w-4" />
                                    Durée
                                  </div>
                                  <p className="font-medium">{session.duree_minutes} minutes</p>
                                </div>
                                {session.evaluation_etudiant && (
                                  <div className="p-4 bg-accent/50 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                      <Star className="h-4 w-4" />
                                      Évaluation
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${i < (session.evaluation_etudiant || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {session.montant_paye && (
                                  <div className="p-4 bg-accent/50 rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-1">Montant</div>
                                    <p className="font-medium">{session.montant_paye} €</p>
                                  </div>
                                )}
                              </div>
                              {session.commentaire_evaluation && (
                                <div className="p-4 bg-accent/50 rounded-lg">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Commentaire d'évaluation
                                  </div>
                                  <p className="text-sm">{session.commentaire_evaluation}</p>
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="feedback" className="space-y-4 mt-4">
                              {session.session_feedback && session.session_feedback.length > 0 ? (
                                <>
                                  <div className="grid grid-cols-3 gap-4">
                                    {session.session_feedback[0].comprehension_score && (
                                      <div className="p-4 bg-primary/10 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-primary">
                                          {session.session_feedback[0].comprehension_score}/5
                                        </p>
                                        <p className="text-xs text-muted-foreground">Compréhension</p>
                                      </div>
                                    )}
                                    {session.session_feedback[0].participation_score && (
                                      <div className="p-4 bg-secondary/10 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-secondary">
                                          {session.session_feedback[0].participation_score}/5
                                        </p>
                                        <p className="text-xs text-muted-foreground">Participation</p>
                                      </div>
                                    )}
                                  </div>
                                  {session.session_feedback[0].strengths && (
                                    <div className="p-4 bg-green-500/10 rounded-lg">
                                      <p className="text-sm font-medium text-green-600 mb-1">Points forts</p>
                                      <p className="text-sm">{session.session_feedback[0].strengths}</p>
                                    </div>
                                  )}
                                  {session.session_feedback[0].areas_for_improvement && (
                                    <div className="p-4 bg-orange-500/10 rounded-lg">
                                      <p className="text-sm font-medium text-orange-600 mb-1">Axes d'amélioration</p>
                                      <p className="text-sm">{session.session_feedback[0].areas_for_improvement}</p>
                                    </div>
                                  )}
                                  {session.session_feedback[0].homework_assigned && (
                                    <div className="p-4 bg-blue-500/10 rounded-lg">
                                      <p className="text-sm font-medium text-blue-600 mb-1">Devoirs assignés</p>
                                      <p className="text-sm">{session.session_feedback[0].homework_assigned}</p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  Aucun feedback disponible pour cette session
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="notes" className="mt-4">
                              {session.notes_tuteur || (session.session_feedback && session.session_feedback[0]?.tutor_notes) ? (
                                <div className="p-4 bg-accent/50 rounded-lg">
                                  <p className="text-sm">
                                    {session.notes_tuteur || session.session_feedback?.[0]?.tutor_notes}
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  Aucune note du tuteur pour cette session
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
