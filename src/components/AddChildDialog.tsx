import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const niveauxScolaires = [
  "CP", "CE1", "CE2", "CM1", "CM2",
  "6eme", "5eme", "4eme", "3eme",
  "Seconde", "Premiere", "Terminale"
];

interface AddChildDialogProps {
  onChildAdded: () => void;
}

export function AddChildDialog({ onChildAdded }: AddChildDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    prenom: "",
    date_naissance: "",
    niveau_scolaire: "",
    besoins_specifiques: "",
    objectifs_apprentissage: "",
    pin_code: "",
  });
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const { data: insertedStudent, error } = await supabase
        .from("students")
        .insert([{
          parent_id: user.id,
          prenom: formData.prenom,
          date_naissance: formData.date_naissance,
          niveau_scolaire: formData.niveau_scolaire as any,
          besoins_specifiques: formData.besoins_specifiques || null,
          objectifs_apprentissage: formData.objectifs_apprentissage || null,
        }])
        .select('id')
        .single();

      if (error) throw error;

      // Si un PIN a été défini, le sauvegarder
      if (formData.pin_code && formData.pin_code.length === 4 && insertedStudent) {
        await supabase.rpc('set_student_pin', {
          student_uuid: insertedStudent.id,
          pin: formData.pin_code,
        });
      }

      toast({
        title: "Enfant ajouté avec succès !",
        description: `${formData.prenom} a été ajouté à votre compte.`,
      });

      setFormData({
        prenom: "",
        date_naissance: "",
        niveau_scolaire: "",
        besoins_specifiques: "",
        objectifs_apprentissage: "",
        pin_code: "",
      });
      
      setOpen(false);
      onChildAdded();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'enfant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un enfant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un enfant</DialogTitle>
          <DialogDescription>
            Créez un profil pour votre enfant et commencez son parcours éducatif
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom *</Label>
            <Input
              id="prenom"
              placeholder="Prénom de l'enfant"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_naissance">Date de naissance *</Label>
            <Input
              id="date_naissance"
              type="date"
              value={formData.date_naissance}
              onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="niveau_scolaire">Niveau scolaire *</Label>
            <Select
              value={formData.niveau_scolaire}
              onValueChange={(value) => setFormData({ ...formData, niveau_scolaire: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent>
                {niveauxScolaires.map((niveau) => (
                  <SelectItem key={niveau} value={niveau}>
                    {niveau}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="besoins_specifiques">
              Besoins spécifiques (optionnel)
            </Label>
            <Textarea
              id="besoins_specifiques"
              placeholder="Ex: IEF, autisme, dyslexie, HP..."
              value={formData.besoins_specifiques}
              onChange={(e) => setFormData({ ...formData, besoins_specifiques: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectifs_apprentissage">
              Objectifs d'apprentissage (optionnel)
            </Label>
            <Textarea
              id="objectifs_apprentissage"
              placeholder="Ex: Préparation contrôle rectorat, améliorer en maths..."
              value={formData.objectifs_apprentissage}
              onChange={(e) => setFormData({ ...formData, objectifs_apprentissage: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin_code" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Code PIN (4 chiffres)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Ce code permettra à votre enfant d'accéder à son espace d'apprentissage
            </p>
            <div className="relative">
              <Input
                id="pin_code"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="● ● ● ●"
                value={formData.pin_code}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  pin_code: e.target.value.replace(/\D/g, '').slice(0, 4) 
                })}
                className="text-center text-xl tracking-[0.5em] pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formData.pin_code && formData.pin_code.length !== 4 && (
              <p className="text-xs text-warning">Le code PIN doit contenir 4 chiffres</p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
