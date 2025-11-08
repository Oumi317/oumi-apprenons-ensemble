import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, Trash2, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Unavailability {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

const DAYS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" }
];

export default function AvailabilityManager() {
  const [tutorId, setTutorId] = useState<string>("");
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New availability form
  const [newDay, setNewDay] = useState<string>("");
  const [newStartTime, setNewStartTime] = useState<string>("");
  const [newEndTime, setNewEndTime] = useState<string>("");

  // New unavailability form
  const [newStartDate, setNewStartDate] = useState<string>("");
  const [newEndDate, setNewEndDate] = useState<string>("");
  const [newReason, setNewReason] = useState<string>("");

  useEffect(() => {
    fetchTutorData();
  }, []);

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

      // Fetch availabilities
      const { data: avail } = await supabase
        .from("tutor_availability")
        .select("*")
        .eq("tutor_id", tutor.id)
        .order("day_of_week", { ascending: true });

      setAvailabilities(avail || []);

      // Fetch unavailabilities
      const { data: unavail } = await supabase
        .from("tutor_unavailability")
        .select("*")
        .eq("tutor_id", tutor.id)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      setUnavailabilities(unavail || []);
    } catch (error) {
      console.error("Error fetching tutor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addAvailability = async () => {
    if (!newDay || !newStartTime || !newEndTime) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tutor_availability")
        .insert({
          tutor_id: tutorId,
          day_of_week: parseInt(newDay),
          start_time: newStartTime,
          end_time: newEndTime,
          is_recurring: true
        });

      if (error) throw error;

      toast({
        title: "Disponibilité ajoutée",
        description: "Votre créneau a été ajouté avec succès"
      });

      setNewDay("");
      setNewStartTime("");
      setNewEndTime("");
      fetchTutorData();
    } catch (error) {
      console.error("Error adding availability:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter ce créneau",
        variant: "destructive"
      });
    }
  };

  const deleteAvailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tutor_availability")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Disponibilité supprimée",
        description: "Le créneau a été supprimé"
      });

      fetchTutorData();
    } catch (error) {
      console.error("Error deleting availability:", error);
    }
  };

  const addUnavailability = async () => {
    if (!newStartDate || !newEndDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner les dates",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tutor_unavailability")
        .insert({
          tutor_id: tutorId,
          start_date: newStartDate,
          end_date: newEndDate,
          reason: newReason
        });

      if (error) throw error;

      toast({
        title: "Indisponibilité ajoutée",
        description: "Votre période d'indisponibilité a été enregistrée"
      });

      setNewStartDate("");
      setNewEndDate("");
      setNewReason("");
      fetchTutorData();
    } catch (error) {
      console.error("Error adding unavailability:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter cette indisponibilité",
        variant: "destructive"
      });
    }
  };

  const deleteUnavailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tutor_unavailability")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Indisponibilité supprimée"
      });

      fetchTutorData();
    } catch (error) {
      console.error("Error deleting unavailability:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Créneaux Récurrents
          </CardTitle>
          <CardDescription>
            Définissez vos disponibilités hebdomadaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Jour</Label>
              <Select value={newDay} onValueChange={setNewDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un jour" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Début</Label>
              <Input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <Input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addAvailability} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {availabilities.map((avail) => (
              <div key={avail.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">
                    {DAYS.find(d => d.value === avail.day_of_week)?.label}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {avail.start_time.slice(0, 5)} - {avail.end_time.slice(0, 5)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAvailability(avail.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Indisponibilités
          </CardTitle>
          <CardDescription>
            Bloquez des périodes (vacances, congés...)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Date début</Label>
              <Input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date fin</Label>
              <Input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Raison (optionnel)</Label>
              <Input
                placeholder="Vacances..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addUnavailability} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {unavailabilities.map((unavail) => (
              <div key={unavail.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">
                    {format(new Date(unavail.start_date), "d MMM", { locale: fr })} - {format(new Date(unavail.end_date), "d MMM yyyy", { locale: fr })}
                  </span>
                  {unavail.reason && (
                    <span className="text-muted-foreground ml-2">- {unavail.reason}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteUnavailability(unavail.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}