import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Loader2, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssignLessonDialogProps {
  childId: string;
  childName: string;
  niveauScolaire: string;
}

export function AssignLessonDialog({ childId, childName, niveauScolaire }: AssignLessonDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [consignes, setConsignes] = useState("");
  const [dateAssignation, setDateAssignation] = useState("");

  useEffect(() => {
    if (open) loadLessons();
  }, [open, niveauScolaire]);

  const loadLessons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lessons")
      .select("id, titre, matiere, duree_estimee_minutes, type_contenu")
      .eq("niveau_scolaire", niveauScolaire as any)
      .order("matiere", { ascending: true });
    setLessons(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !dateAssignation) return;

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("lesson_assignments").insert({
      parent_id: user.id,
      student_id: childId,
      lesson_id: selectedLesson,
      consignes: consignes || null,
      date_assignation: new Date(dateAssignation).toISOString(),
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Erreur", description: "Impossible d'assigner la leçon.", variant: "destructive" });
    } else {
      toast({ title: "Leçon assignée ✅", description: `La leçon a été assignée à ${childName}.` });
      setOpen(false);
      setSelectedLesson("");
      setConsignes("");
      setDateAssignation("");
    }
  };

  const groupedLessons = lessons.reduce((acc: Record<string, any[]>, l) => {
    (acc[l.matiere] = acc[l.matiere] || []).push(l);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="w-full">
          <ClipboardList className="h-4 w-4 mr-2" />
          Assigner leçons
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Assigner une leçon à {childName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Leçon ({niveauScolaire})</Label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
              </div>
            ) : (
              <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une leçon" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Object.entries(groupedLessons).map(([matiere, items]) => (
                    <div key={matiere}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{matiere}</div>
                      {(items as any[]).map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.titre} ({l.duree_estimee_minutes || 30} min)
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Consignes pour l'enfant (optionnel)</Label>
            <Textarea
              value={consignes}
              onChange={(e) => setConsignes(e.target.value)}
              placeholder="Ex: Bien lire les exercices avant de répondre..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Date et heure de la leçon</Label>
            <Input
              type="datetime-local"
              value={dateAssignation}
              onChange={(e) => setDateAssignation(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!selectedLesson || !dateAssignation || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardList className="h-4 w-4 mr-2" />}
            Assigner la leçon
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
