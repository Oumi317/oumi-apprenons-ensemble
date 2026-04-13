import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Calendar, Clock, Video, BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, isToday, isTomorrow, isAfter, isBefore, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

interface TutorSession {
  id: string;
  date_heure_debut: string;
  duree_minutes: number;
  matiere: string;
  statut: string;
}

interface PlanningLesson {
  id: string;
  titre: string;
  matiere: string;
  duree_estimee_minutes: number;
  progress: number;
  contenu_url: string | null;
  type_contenu: string;
}

interface LessonAssignment {
  id: string;
  lesson_id: string;
  consignes: string | null;
  date_assignation: string;
  statut: string;
  lesson_titre: string;
  lesson_matiere: string;
}

interface ChildPlanningProps {
  studentId: string;
  niveauScolaire: string;
  onOpenLesson?: (lessonId: string) => void;
}

const matiereEmoji: Record<string, string> = {
  "Français": "📚", "Mathématiques": "🔢", "Sciences": "🔬",
  "Histoire": "🏛️", "Géographie": "🌍", "Anglais": "🇬🇧", "Histoire-Géographie": "🗺️",
};

const matiereColors: Record<string, string> = {
  "Français": "bg-blue-500/15 text-blue-600 border-blue-200",
  "Mathématiques": "bg-green-500/15 text-green-600 border-green-200",
  "Sciences": "bg-purple-500/15 text-purple-600 border-purple-200",
  "Histoire": "bg-orange-500/15 text-orange-600 border-orange-200",
  "Géographie": "bg-teal-500/15 text-teal-600 border-teal-200",
  "Anglais": "bg-red-500/15 text-red-600 border-red-200",
  "Histoire-Géographie": "bg-amber-500/15 text-amber-600 border-amber-200",
};

export function ChildPlanning({ studentId, niveauScolaire, onOpenLesson }: ChildPlanningProps) {
  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [lessons, setLessons] = useState<PlanningLesson[]>([]);
  const [assignments, setAssignments] = useState<LessonAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<PlanningLesson | null>(null);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadData();
  }, [studentId, niveauScolaire]);

  const loadData = async () => {
    try {
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const { data: sessionsData } = await supabase
        .from("sessions_tutorat")
        .select("id, date_heure_debut, duree_minutes, matiere, statut, tuteur_id")
        .eq("etudiant_id", studentId)
        .gte("date_heure_debut", weekStart.toISOString())
        .lte("date_heure_debut", weekEnd.toISOString())
        .in("statut", ["programmee", "en_cours"])
        .order("date_heure_debut", { ascending: true });

      setSessions(sessionsData?.map(s => ({
        id: s.id, date_heure_debut: s.date_heure_debut,
        duree_minutes: s.duree_minutes, matiere: s.matiere,
        statut: s.statut || "programmee",
      })) || []);

      const { data: progressData } = await supabase
        .from("student_progress")
        .select("lesson_id, statut_completion")
        .eq("etudiant_id", studentId)
        .lt("statut_completion", 100);

      const progressMap = new Map(progressData?.map(p => [p.lesson_id, p.statut_completion ?? 0]) || []);

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id, titre, matiere, duree_estimee_minutes, contenu_url, type_contenu")
        .eq("niveau_scolaire", niveauScolaire as any)
        .order("ordre_affichage", { ascending: true })
        .limit(10);

      const upcoming = lessonsData?.map(l => ({
        ...l,
        duree_estimee_minutes: l.duree_estimee_minutes ?? 30,
        progress: progressMap.get(l.id) || 0,
      })).filter(l => l.progress < 100) || [];

      setLessons(upcoming.slice(0, 5));

      // Load lesson assignments from parent
      const { data: assignmentsData } = await supabase
        .from("lesson_assignments")
        .select("id, lesson_id, consignes, date_assignation, statut")
        .eq("student_id", studentId)
        .eq("statut", "assignee")
        .gte("date_assignation", weekStart.toISOString())
        .order("date_assignation", { ascending: true });

      if (assignmentsData && assignmentsData.length > 0) {
        const lessonIds = assignmentsData.map(a => a.lesson_id);
        const { data: assignedLessons } = await supabase
          .from("lessons")
          .select("id, titre, matiere")
          .in("id", lessonIds);

        const lessonMap = new Map(assignedLessons?.map(l => [l.id, l]) || []);
        setAssignments(assignmentsData.map(a => ({
          ...a,
          lesson_titre: lessonMap.get(a.lesson_id)?.titre || "Leçon",
          lesson_matiere: lessonMap.get(a.lesson_id)?.matiere || "",
        })));
      }
    } catch (error) {
      console.error("Error loading planning:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionsForDay = (day: Date) =>
    sessions.filter(s => new Date(s.date_heure_debut).toDateString() === day.toDateString());

  const getDayLabel = (day: Date) => {
    if (isToday(day)) return "Aujourd'hui";
    if (isTomorrow(day)) return "Demain";
    return format(day, "EEEE", { locale: fr });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Ma semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const daySessions = getSessionsForDay(day);
              const isPast = isBefore(day, now) && !isToday(day);
              const today = isToday(day);
              const hasContent = daySessions.length > 0;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    rounded-xl p-2 text-center border transition-all min-h-[100px] cursor-pointer hover:shadow-md
                    ${today ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/30"}
                    ${isPast ? "opacity-50" : ""}
                    ${hasContent ? "ring-1 ring-accent/30" : ""}
                  `}
                >
                  <p className={`text-xs font-medium mb-1 capitalize ${today ? "text-primary" : "text-muted-foreground"}`}>
                    {format(day, "EEE", { locale: fr })}
                  </p>
                  <p className={`text-lg font-bold mb-2 ${today ? "text-primary" : "text-foreground"}`}>
                    {format(day, "d")}
                  </p>
                  {daySessions.map(session => (
                    <div key={session.id} className={`text-xs rounded-lg p-1 mb-1 ${matiereColors[session.matiere] || "bg-muted text-muted-foreground"}`}>
                      <Video className="h-3 w-3 mx-auto mb-0.5" />
                      <span className="block truncate">{session.matiere}</span>
                      <span className="block text-[10px] opacity-75">
                        {format(new Date(session.date_heure_debut), "HH:mm")}
                      </span>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions Detail */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-primary" />
              Mes prochaines sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.filter(s => isAfter(new Date(s.date_heure_debut), now) || isToday(new Date(s.date_heure_debut))).map((session, i) => (
              <motion.div key={session.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                <div className="p-2 rounded-lg bg-primary/10"><Video className="h-5 w-5 text-primary" /></div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{matiereEmoji[session.matiere] || "📖"} {session.matiere}</p>
                  <p className="text-sm text-muted-foreground">{getDayLabel(new Date(session.date_heure_debut))} à {format(new Date(session.date_heure_debut), "HH:mm")}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{session.duree_minutes} min</div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Lessons to do - clickable */}
      {lessons.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Leçons à faire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lessons.map((lesson, i) => (
              <motion.div key={lesson.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedLesson(lesson)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-xl">{matiereEmoji[lesson.matiere] || "📖"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{lesson.titre}</p>
                  <Badge variant="outline" className={`text-[10px] ${matiereColors[lesson.matiere] || ""}`}>{lesson.matiere}</Badge>
                </div>
                {lesson.progress > 0 && <Badge variant="secondary" className="text-xs">{lesson.progress}%</Badge>}
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Day detail dialog */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              📅 {selectedDay && getDayLabel(selectedDay)} — {selectedDay && format(selectedDay, "d MMMM", { locale: fr })}
            </DialogTitle>
          </DialogHeader>
          {selectedDay && (() => {
            const daySessions = getSessionsForDay(selectedDay);
            return (
              <div className="space-y-4">
                {daySessions.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Sessions tuteur</h4>
                    {daySessions.map(s => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Video className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{matiereEmoji[s.matiere] || "📖"} {s.matiere}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(s.date_heure_debut), "HH:mm")} — {s.duree_minutes} min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Pas de session prévue ce jour.</p>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Lesson detail dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedLesson && `${matiereEmoji[selectedLesson.matiere] || "📖"} ${selectedLesson.titre}`}</DialogTitle>
          </DialogHeader>
          {selectedLesson && (
            <div className="space-y-4">
              <Badge variant="outline" className={matiereColors[selectedLesson.matiere] || ""}>{selectedLesson.matiere}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {selectedLesson.duree_estimee_minutes} min
              </div>
              {selectedLesson.progress > 0 && (
                <p className="text-sm text-muted-foreground">Progression : <span className="font-medium text-primary">{selectedLesson.progress}%</span></p>
              )}
              <Button className="w-full gap-2" onClick={() => {
                setSelectedLesson(null);
                onOpenLesson?.(selectedLesson.id);
              }}>
                <BookOpen className="h-4 w-4" /> Accéder à la leçon
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
