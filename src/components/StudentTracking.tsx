import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Target, TrendingUp, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Student {
  id: string;
  prenom: string;
}

interface Note {
  id: string;
  note_type: string;
  content: string;
  created_at: string;
  session_id: string | null;
}

const NOTE_TYPES = [
  { value: "observation", label: "Observation", icon: FileText, color: "text-blue-500" },
  { value: "objectif", label: "Objectif", icon: Target, color: "text-green-500" },
  { value: "progression", label: "Progression", icon: TrendingUp, color: "text-purple-500" },
  { value: "recommandation", label: "Recommandation", icon: Lightbulb, color: "text-orange-500" }
];

export default function StudentTracking() {
  const [tutorId, setTutorId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteType, setNewNoteType] = useState<string>("observation");
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTutorData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchNotes();
    }
  }, [selectedStudent]);

  const fetchTutorData = async () => {
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

      // Fetch students who had sessions with this tutor
      const { data: sessions } = await supabase
        .from("sessions_tutorat")
        .select(`
          students:etudiant_id (
            id,
            prenom
          )
        `)
        .eq("tuteur_id", tutor.id);

      if (sessions) {
        const uniqueStudents = Array.from(
          new Map(sessions.map((s: any) => [s.students.id, s.students])).values()
        ) as Student[];
        setStudents(uniqueStudents);
      }
    } catch (error) {
      console.error("Error fetching tutor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("student_tracking_notes")
        .select("*")
        .eq("tutor_id", tutorId)
        .eq("student_id", selectedStudent)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const addNote = async () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une note",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("student_tracking_notes")
        .insert({
          tutor_id: tutorId,
          student_id: selectedStudent,
          note_type: newNoteType,
          content: newNoteContent
        });

      if (error) throw error;

      toast({
        title: "Note ajoutée",
        description: "La note a été enregistrée avec succès"
      });

      setNewNoteContent("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la note",
        variant: "destructive"
      });
    }
  };

  const getNotesByType = (type: string) => {
    return notes.filter(n => n.note_type === type);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fiches de Suivi des Élèves</CardTitle>
        <CardDescription>
          Suivez la progression et notez vos observations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Sélectionner un élève</Label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un élève" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.prenom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStudent && (
          <>
            <div className="space-y-2">
              <Label>Type de note</Label>
              <Select value={newNoteType} onValueChange={setNewNoteType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contenu de la note</Label>
              <Textarea
                placeholder="Saisissez votre note..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={addNote}>Ajouter la note</Button>

            <Tabs defaultValue="observation" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                {NOTE_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <TabsTrigger key={type.value} value={type.value}>
                      <Icon className={`h-4 w-4 mr-2 ${type.color}`} />
                      {type.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {NOTE_TYPES.map(type => (
                <TabsContent key={type.value} value={type.value} className="space-y-2">
                  {getNotesByType(type.value).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune {type.label.toLowerCase()} pour le moment
                    </p>
                  ) : (
                    getNotesByType(type.value).map(note => (
                      <div key={note.id} className="p-3 border rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(note.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}