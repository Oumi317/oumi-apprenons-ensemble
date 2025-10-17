import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorId: string;
  tutorName: string;
  subject: string;
  hourlyRate: number;
}

export default function BookingDialog({
  open,
  onOpenChange,
  tutorId,
  tutorName,
  subject,
  hourlyRate
}: BookingDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [duration, setDuration] = useState<string>("60");
  const [studentId, setStudentId] = useState<string>();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id);

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
    }
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  const handleBooking = async () => {
    if (!date || !timeSlot || !studentId) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = timeSlot.split(":");
      const sessionDate = new Date(date);
      sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const amount = (parseInt(duration) / 60) * hourlyRate;

      const { error } = await supabase
        .from("sessions_tutorat")
        .insert({
          tuteur_id: tutorId,
          etudiant_id: studentId,
          matiere: subject,
          date_heure_debut: sessionDate.toISOString(),
          duree_minutes: parseInt(duration),
          montant_paye: amount,
          statut: "programmee"
        });

      if (error) throw error;

      toast({
        title: "Session réservée !",
        description: "Votre session a été réservée avec succès"
      });

      onOpenChange(false);
      // Reset form
      setDate(undefined);
      setTimeSlot(undefined);
      setDuration("60");
      setStudentId(undefined);

    } catch (error: any) {
      console.error("Error booking session:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalCost = date && timeSlot ? (parseInt(duration) / 60) * hourlyRate : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réserver une session avec {tutorName}</DialogTitle>
          <DialogDescription>
            Matière: {subject} • Tarif: {hourlyRate}€/heure
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Sélectionner un élève</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un élève" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.prenom} - {student.niveau_scolaire}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {students.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Vous devez d'abord ajouter un élève depuis votre tableau de bord
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Sélectionner une date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <Label>Sélectionner un créneau horaire</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une heure" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {slot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <Label>Durée de la session</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {date && timeSlot && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h4 className="font-semibold">Récapitulatif</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{date.toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heure:</span>
                  <span>{timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée:</span>
                  <span>{parseInt(duration) / 60}h</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>{totalCost.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={handleBooking} 
            disabled={!date || !timeSlot || !studentId || loading}
            className="flex-1"
          >
            {loading ? "Réservation..." : "Confirmer la réservation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
