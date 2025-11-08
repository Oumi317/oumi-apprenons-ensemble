import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Trash2, Plus, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const MATIERES = ["Mathématiques", "Français", "Anglais", "Sciences", "Histoire", "Physique"];
const NIVEAUX = ["cm1", "cm2", "sixieme", "cinquieme", "quatrieme", "troisieme", "seconde", "premiere", "terminale"];

interface Pricing {
  id: string;
  matiere: string;
  niveau_scolaire: string;
  tarif_horaire_eur: number;
}

interface Package {
  id: string;
  nom: string;
  description: string;
  nombre_sessions: number;
  reduction_pourcentage: number;
  is_active: boolean;
}

export default function DynamicPricing() {
  const [tutorId, setTutorId] = useState<string>("");
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  
  // New pricing
  const [newMatiere, setNewMatiere] = useState("");
  const [newNiveau, setNewNiveau] = useState("");
  const [newTarif, setNewTarif] = useState("");

  // New package
  const [packageName, setPackageName] = useState("");
  const [packageDesc, setPackageDesc] = useState("");
  const [packageSessions, setPackageSessions] = useState("");
  const [packageDiscount, setPackageDiscount] = useState("");

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

      // Fetch pricings
      const { data: pricingData } = await supabase
        .from("tutor_pricing")
        .select("*")
        .eq("tutor_id", tutor.id)
        .order("matiere", { ascending: true });

      setPricings(pricingData || []);

      // Fetch packages
      const { data: packageData } = await supabase
        .from("tutor_packages")
        .select("*")
        .eq("tutor_id", tutor.id)
        .order("nombre_sessions", { ascending: true });

      setPackages(packageData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPricing = async () => {
    if (!newMatiere || !newNiveau || !newTarif) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tutor_pricing")
        .insert([{
          tutor_id: tutorId,
          matiere: newMatiere,
          niveau_scolaire: newNiveau as any,
          tarif_horaire_eur: parseFloat(newTarif)
        }]);

      if (error) throw error;

      toast({
        title: "Tarif ajouté",
        description: "Le nouveau tarif a été enregistré"
      });

      setNewMatiere("");
      setNewNiveau("");
      setNewTarif("");
      fetchData();
    } catch (error: any) {
      console.error("Error adding pricing:", error);
      toast({
        title: "Erreur",
        description: error.message.includes("duplicate") ? "Ce tarif existe déjà" : "Impossible d'ajouter le tarif",
        variant: "destructive"
      });
    }
  };

  const deletePricing = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tutor_pricing")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Tarif supprimé"
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting pricing:", error);
    }
  };

  const addPackage = async () => {
    if (!packageName || !packageSessions || !packageDiscount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tutor_packages")
        .insert({
          tutor_id: tutorId,
          nom: packageName,
          description: packageDesc || null,
          nombre_sessions: parseInt(packageSessions),
          reduction_pourcentage: parseFloat(packageDiscount)
        });

      if (error) throw error;

      toast({
        title: "Forfait créé",
        description: "Le nouveau forfait a été enregistré"
      });

      setPackageName("");
      setPackageDesc("");
      setPackageSessions("");
      setPackageDiscount("");
      fetchData();
    } catch (error) {
      console.error("Error adding package:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le forfait",
        variant: "destructive"
      });
    }
  };

  const togglePackage = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("tutor_packages")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error toggling package:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Tabs defaultValue="pricing" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pricing">Tarification</TabsTrigger>
        <TabsTrigger value="packages">Forfaits</TabsTrigger>
      </TabsList>

      <TabsContent value="pricing">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tarification Dynamique
            </CardTitle>
            <CardDescription>
              Définissez des tarifs différents par matière et niveau
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Matière</Label>
                <Select value={newMatiere} onValueChange={setNewMatiere}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATIERES.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={newNiveau} onValueChange={setNewNiveau}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEAUX.map(n => (
                      <SelectItem key={n} value={n}>{n.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tarif (€/h)</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={newTarif}
                  onChange={(e) => setNewTarif(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addPricing} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {pricings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucun tarif personnalisé
                </p>
              ) : (
                pricings.map((pricing) => (
                  <div key={pricing.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{pricing.matiere}</span>
                      <span className="text-muted-foreground ml-2">• {pricing.niveau_scolaire.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{pricing.tarif_horaire_eur} €/h</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePricing(pricing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="packages">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Forfaits
            </CardTitle>
            <CardDescription>
              Créez des forfaits avec réduction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="Pack 5 séances"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Optionnel"
                  value={packageDesc}
                  onChange={(e) => setPackageDesc(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nb sessions</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={packageSessions}
                  onChange={(e) => setPackageSessions(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Réduction (%)</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={packageDiscount}
                  onChange={(e) => setPackageDiscount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addPackage} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {packages.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucun forfait créé
                </p>
              ) : (
                packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{pkg.nom}</p>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      )}
                      <p className="text-sm mt-1">
                        {pkg.nombre_sessions} sessions • -{pkg.reduction_pourcentage}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pkg.is_active}
                        onCheckedChange={() => togglePackage(pkg.id, pkg.is_active)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {pkg.is_active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}