import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Star } from "lucide-react";

interface Session {
  id: string;
  matiere: string;
  date_heure_debut: string;
  students: {
    id: string;
    prenom: string;
  };
}

export default function SessionFeedback() {
  const [tutorId, setTutorId] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [comprehension, setComprehension] = useState([3]);
  const [participation, setParticipation] = useState([3]);
  const [homework, setHomework] = useState([3]);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [homeworkAssigned, setHomeworkAssigned] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tutor } = await supabase
        .from("tutors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!tutor) return;
      setTutorId(tutor.id);

      // Fetch completed sessions without feedback
      const { data: sessionsData } = await supabase
        .from("sessions_tutorat")
        .select(`
          id,
          matiere,
          date_heure_debut,
          students:etudiant_id (
            id,
            prenom
          )
        `)
        .eq("tuteur_id", tutor.id)
        .eq("statut", "completee")
        .order("date_heure_debut", { ascending: false })
        .limit(10);

      if (sessionsData) {
        // Filter out sessions that already have feedback
        const { data: feedbacks } = await supabase
          .from("session_feedback")
          .select("session_id")
          .eq("tutor_id", tutor.id);

        const feedbackSessionIds = new Set(feedbacks?.map(f => f.session_id));
        const sessionsWithoutFeedback = sessionsData.filter(
          s => !feedbackSessionIds.has(s.id)
        );

        setSessions(sessionsWithoutFeedback as any);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSession) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une session",
        variant: "destructive"
      });
      return;
    }

    try {
      const session = sessions.find(s => s.id === selectedSession);
      if (!session) return;

      const { error } = await supabase
        .from("session_feedback")
        .insert({
          session_id: selectedSession,
          tutor_id: tutorId,
          student_id: session.students.id,
          comprehension_score: comprehension[0],
          participation_score: participation[0],
          homework_completion_score: homework[0],
          strengths: strengths.trim() || null,
          areas_for_improvement: improvements.trim() || null,
          homework_assigned: homeworkAssigned.trim() || null,
          next_session_focus: nextFocus.trim() || null,
          tutor_notes: notes.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Feedback enregistré",
        description: "Le feedback a été envoyé aux parents"
      });

      // Reset form
      setSelectedSession("");
      setComprehension([3]);
      setParticipation([3]);
      setHomework([3]);
      setStrengths("");
      setImprovements("");
      setHomeworkAssigned("");
      setNextFocus("");
      setNotes("");

      fetchData();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le feedback",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Feedback Post-Session
        </CardTitle>
        <CardDescription>
          Évaluez la session et fournissez des recommandations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Sélectionner une session</Label>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(session => (
                <SelectItem key={session.id} value={session.id}>
                  {session.matiere} - {session.students.prenom} - {new Date(session.date_heure_debut).toLocaleDateString("fr-FR")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSession && (
          <>
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span>Compréhension</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    {comprehension[0]} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </span>
                </Label>
                <Slider
                  value={comprehension}
                  onValueChange={setComprehension}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span>Participation</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    {participation[0]} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </span>
                </Label>
                <Slider
                  value={participation}
                  onValueChange={setParticipation}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span>Devoirs complétés</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    {homework[0]} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </span>
                </Label>
                <Slider
                  value={homework}
                  onValueChange={setHomework}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Points forts</Label>
              <Textarea
                placeholder="Ce que l'élève maîtrise bien..."
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Points à améliorer</Label>
              <Textarea
                placeholder="Axes de progression..."
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Devoirs assignés</Label>
              <Textarea
                placeholder="Exercices à faire pour la prochaine session..."
                value={homeworkAssigned}
                onChange={(e) => setHomeworkAssigned(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Focus prochaine session</Label>
              <Textarea
                placeholder="Objectifs pour la prochaine fois..."
                value={nextFocus}
                onChange={(e) => setNextFocus(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes privées</Label>
              <Textarea
                placeholder="Notes personnelles (non visibles par les parents)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Envoyer le feedback
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}