import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookmarkPlus, Save, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Note {
  id: string;
  content: string;
  timestamp: number;
  created_at: string;
}

interface LessonNotesProps {
  lessonId: string;
  studentId: string;
  currentVideoTime?: number;
}

export function LessonNotes({ lessonId, studentId, currentVideoTime }: LessonNotesProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [lessonId, studentId]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("lesson_notes")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const saveNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("lesson_notes").insert({
        lesson_id: lessonId,
        student_id: studentId,
        content: newNote,
        timestamp: Math.floor(currentVideoTime || 0),
      });

      if (error) throw error;

      toast({
        title: "Note enregistrée",
        description: "Votre note a été ajoutée avec succès",
      });

      setNewNote("");
      loadNotes();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("lesson_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      toast({
        title: "Note supprimée",
        description: "La note a été supprimée avec succès",
      });

      loadNotes();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookmarkPlus className="h-5 w-5" />
          Mes notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Note Form */}
        <div className="space-y-3">
          <Textarea
            placeholder="Écrivez vos notes ici..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-24"
          />
          <div className="flex items-center justify-between">
            {currentVideoTime !== undefined && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(Math.floor(currentVideoTime))}
              </Badge>
            )}
            <Button onClick={saveNote} disabled={loading || !newNote.trim()} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {note.timestamp > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(note.timestamp)}
                        </Badge>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(note.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNote(note.id)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BookmarkPlus className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune note pour cette leçon</p>
            <p className="text-xs mt-1">Commencez à prendre des notes pendant la vidéo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}