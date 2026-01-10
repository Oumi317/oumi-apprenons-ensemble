import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useChildSession } from '@/contexts/ChildSessionContext';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';
import { PinInput } from '@/components/PinInput';
import { SetPinDialog } from '@/components/SetPinDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Lock, Sparkles, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Child {
  id: string;
  prenom: string;
  niveau_scolaire: string;
  date_naissance: string;
  pin_code: string | null;
}

const avatarColors = [
  'from-primary to-secondary',
  'from-success to-primary',
  'from-secondary to-accent',
  'from-accent to-success',
  'from-primary to-accent',
];

export default function ChildProfiles() {
  const navigate = useNavigate();
  const { startChildSession } = useChildSession();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [pinError, setpinError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [childToSetPin, setChildToSetPin] = useState<Child | null>(null);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('students')
        .select('id, prenom, niveau_scolaire, date_naissance, pin_code')
        .eq('parent_id', user.id);

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child: Child) => {
    if (!child.pin_code) {
      // Pas de PIN défini, demander de le configurer
      setChildToSetPin(child);
      setShowSetPinDialog(true);
    } else {
      setSelectedChild(child);
      setpinError(null);
    }
  };

  const handlePinComplete = async (pin: string) => {
    if (!selectedChild) return;

    setVerifying(true);
    setpinError(null);

    try {
      const { data, error } = await supabase.rpc('verify_student_pin', {
        student_uuid: selectedChild.id,
        pin: pin,
      });

      if (error) throw error;

      if (data) {
        // PIN correct, démarrer la session enfant
        startChildSession(selectedChild.id, selectedChild.prenom);
        toast.success(`Bienvenue ${selectedChild.prenom} ! 🎉`);
        navigate('/student-dashboard');
      } else {
        setpinError('Code PIN incorrect. Réessaie !');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setpinError('Erreur de vérification. Réessaie !');
    } finally {
      setVerifying(false);
    }
  };

  const handleSetPinClick = (child: Child, e: React.MouseEvent) => {
    e.stopPropagation();
    setChildToSetPin(child);
    setShowSetPinDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  // Mode saisie du PIN
  if (selectedChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container max-w-lg mx-auto py-8 px-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedChild(null)}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Changer de profil
          </Button>

          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="pt-6">
              {/* Avatar de l'enfant sélectionné */}
              <div className="flex flex-col items-center mb-6">
                <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${avatarColors[0]} flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="text-4xl text-white font-bold">
                    {selectedChild.prenom.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{selectedChild.prenom}</h2>
                <p className="text-muted-foreground">{selectedChild.niveau_scolaire}</p>
              </div>

              <PinInput
                onComplete={handlePinComplete}
                onCancel={() => setSelectedChild(null)}
                error={pinError || undefined}
                loading={verifying}
                title="Entre ton code secret"
                subtitle="4 chiffres magiques ✨"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mode sélection du profil
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <NavigationHeader />

      <main className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/parent-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Qui apprend aujourd'hui ?
          </h1>
          <p className="text-xl text-muted-foreground">
            Choisis ton profil pour commencer l'aventure ! 🚀
          </p>
        </div>

        {children.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Aucun enfant enregistré</h2>
            <p className="text-muted-foreground mb-6">
              Ajoutez un enfant depuis le tableau de bord parent pour commencer.
            </p>
            <Button onClick={() => navigate('/parent-dashboard')}>
              Aller au tableau de bord
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child, index) => (
              <Card
                key={child.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/50 overflow-hidden"
                onClick={() => handleChildSelect(child)}
              >
                <CardContent className="p-6 flex flex-col items-center relative">
                  {/* Bouton paramètres PIN */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleSetPinClick(child, e)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  {/* Avatar */}
                  <div
                    className={`h-28 w-28 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <span className="text-5xl text-white font-bold drop-shadow-md">
                      {child.prenom.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Nom */}
                  <h3 className="text-2xl font-bold mb-1">{child.prenom}</h3>
                  <p className="text-muted-foreground mb-4">{child.niveau_scolaire}</p>

                  {/* Indicateur PIN */}
                  {child.pin_code ? (
                    <div className="flex items-center gap-2 text-success text-sm">
                      <Lock className="h-4 w-4" />
                      <span>PIN configuré</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-warning text-sm">
                      <Lock className="h-4 w-4" />
                      <span>Configurer le PIN</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Dialog pour définir le PIN */}
      {childToSetPin && (
        <SetPinDialog
          open={showSetPinDialog}
          onOpenChange={setShowSetPinDialog}
          studentId={childToSetPin.id}
          studentName={childToSetPin.prenom}
          onSuccess={() => {
            loadChildren();
            setChildToSetPin(null);
          }}
        />
      )}
    </div>
  );
}
