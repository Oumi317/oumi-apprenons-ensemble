import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Delete, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  error?: string;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export function PinInput({
  onComplete,
  onCancel,
  error,
  loading = false,
  title = "Entre ton code secret",
  subtitle = "4 chiffres pour accéder à ton espace",
}: PinInputProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin(['', '', '', '']);
      }, 500);
    }
  }, [error]);

  const handleNumberClick = (num: string) => {
    const newPin = [...pin];
    const emptyIndex = newPin.findIndex((digit) => digit === '');
    
    if (emptyIndex !== -1) {
      newPin[emptyIndex] = num;
      setPin(newPin);

      // Si le PIN est complet, soumettre
      if (emptyIndex === 3) {
        onComplete(newPin.join(''));
      }
    }
  };

  const handleDelete = () => {
    const newPin = [...pin];
    const lastFilledIndex = newPin.reduce((last, digit, i) => (digit !== '' ? i : last), -1);
    
    if (lastFilledIndex !== -1) {
      newPin[lastFilledIndex] = '';
      setPin(newPin);
    }
  };

  const handleClear = () => {
    setPin(['', '', '', '']);
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Titre */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* Affichage du PIN */}
      <div
        className={cn(
          "flex gap-4 transition-transform",
          shake && "animate-shake"
        )}
      >
        {pin.map((digit, index) => (
          <div
            key={index}
            className={cn(
              "w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-all",
              digit ? "border-primary bg-primary/10 text-primary" : "border-muted-foreground/30 bg-muted/50",
              error && "border-destructive bg-destructive/10"
            )}
          >
            {digit ? "●" : ""}
          </div>
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-destructive text-sm font-medium animate-fade-in">
          {error}
        </p>
      )}

      {/* Clavier numérique */}
      <div className="grid grid-cols-3 gap-3 max-w-xs">
        {numbers.map((num, index) => {
          if (num === '') {
            return <div key={index} className="w-20 h-16" />;
          }

          if (num === 'del') {
            return (
              <Button
                key={index}
                variant="outline"
                className="w-20 h-16 text-xl rounded-xl"
                onClick={handleDelete}
                disabled={loading}
              >
                <Delete className="h-6 w-6" />
              </Button>
            );
          }

          return (
            <Button
              key={index}
              variant="outline"
              className="w-20 h-16 text-2xl font-semibold rounded-xl hover:bg-primary/10 hover:border-primary transition-colors"
              onClick={() => handleNumberClick(num)}
              disabled={loading}
            >
              {num}
            </Button>
          );
        })}
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-4 pt-4">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
        )}
        <Button variant="outline" onClick={handleClear} disabled={loading}>
          Effacer
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Vérification...</span>
        </div>
      )}
    </div>
  );
}
