import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';

interface SetPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

export function SetPinDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  onSuccess,
}: SetPinDialogProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 4) {
      toast.error('Le code PIN doit contenir 4 chiffres');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast.error('Le code PIN doit contenir uniquement des chiffres');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('Les codes PIN ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('set_student_pin', {
        student_uuid: studentId,
        pin: pin,
      });

      if (error) throw error;

      toast.success(`Code PIN défini pour ${studentName} !`);
      setPin('');
      setConfirmPin('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error setting PIN:', error);
      toast.error('Erreur lors de la définition du code PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Définir le code PIN
          </DialogTitle>
          <DialogDescription>
            Créez un code PIN à 4 chiffres pour que <strong>{studentName}</strong> puisse
            accéder à son espace d'apprentissage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Code PIN (4 chiffres)</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="● ● ● ●"
                  className="text-center text-2xl tracking-[0.5em] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirmer le code PIN</Label>
              <Input
                id="confirmPin"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="● ● ● ●"
                className="text-center text-2xl tracking-[0.5em]"
              />
            </div>

            {pin.length === 4 && confirmPin.length === 4 && pin === confirmPin && (
              <div className="flex items-center gap-2 text-success text-sm">
                <Check className="h-4 w-4" />
                Les codes PIN correspondent
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || pin.length !== 4}>
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer le PIN'
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Conseil :</strong> Choisissez un code facile à retenir pour votre enfant,
          mais évitez les codes trop simples comme 1234 ou 0000.
        </div>
      </DialogContent>
    </Dialog>
  );
}
