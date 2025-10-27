import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Loader2, 
  CheckCircle,
  Shield,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const matieres = [
  "Français", "Mathématiques", "Histoire-Géographie", "Sciences",
  "Physique-Chimie", "SVT", "Anglais", "Espagnol", "Allemand",
  "Philosophie", "Économie", "Arts"
];

const TutorSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Étape 1: Informations personnelles
    email: "",
    password: "",
    confirmPassword: "",
    prenom: "",
    nom: "",
    pays: "France",
    telephone: "",
    
    // Étape 2: Qualifications
    diplomes: [] as string[],
    nouveauDiplome: "",
    matieres_enseignees: [] as string[],
    certifications: [] as string[],
    nouvelleCertification: "",
    annees_experience: 0,
    
    // Étape 3: Profil professionnel
    bio: "",
    tarif_horaire: 35,
    verification_casier: false,
  });

  const handleAddDiplome = () => {
    if (formData.nouveauDiplome.trim()) {
      setFormData({
        ...formData,
        diplomes: [...formData.diplomes, formData.nouveauDiplome.trim()],
        nouveauDiplome: "",
      });
    }
  };

  const handleRemoveDiplome = (index: number) => {
    setFormData({
      ...formData,
      diplomes: formData.diplomes.filter((_, i) => i !== index),
    });
  };

  const handleAddCertification = () => {
    if (formData.nouvelleCertification.trim()) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, formData.nouvelleCertification.trim()],
        nouvelleCertification: "",
      });
    }
  };

  const handleRemoveCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
  };

  const toggleMatiere = (matiere: string) => {
    const newMatieres = formData.matieres_enseignees.includes(matiere)
      ? formData.matieres_enseignees.filter((m) => m !== matiere)
      : [...formData.matieres_enseignees, matiere];
    
    setFormData({ ...formData, matieres_enseignees: newMatieres });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (formData.diplomes.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un diplôme",
        variant: "destructive",
      });
      return;
    }

    if (formData.matieres_enseignees.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une matière",
        variant: "destructive",
      });
      return;
    }

    if (!formData.verification_casier) {
      toast({
        title: "Erreur",
        description: "Vous devez certifier avoir un casier judiciaire vierge",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.prenom,
            last_name: formData.nom,
            role: "tutor",
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Créer le profil tuteur
        const { error: tutorError } = await supabase
          .from("tutors")
          .insert([{
            user_id: authData.user.id,
            diplomes: formData.diplomes,
            matieres_enseignees: formData.matieres_enseignees,
            tarif_horaire_eur: formData.tarif_horaire,
            annees_experience: formData.annees_experience,
            bio: formData.bio,
            certifications: formData.certifications.length > 0 ? formData.certifications : null,
            verification_casier: formData.verification_casier,
            statut_approbation: "en_attente",
          }]);

        if (tutorError) throw tutorError;

        toast({
          title: "Candidature envoyée !",
          description: "Votre profil sera examiné sous 48-72h. Vous recevrez un email de confirmation.",
        });

        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone *</Label>
        <Input
          id="telephone"
          type="tel"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pays">Pays *</Label>
        <Input
          id="pays"
          value={formData.pays}
          onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </div>

      <Button
        type="button"
        className="w-full bg-gradient-primary"
        onClick={() => setCurrentStep(2)}
        disabled={!formData.prenom || !formData.nom || !formData.email || !formData.password}
      >
        Suivant
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Diplômes * (minimum 1)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Master MEEF, CAPES..."
            value={formData.nouveauDiplome}
            onChange={(e) => setFormData({ ...formData, nouveauDiplome: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDiplome())}
          />
          <Button type="button" onClick={handleAddDiplome}>
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.diplomes.map((diplome, index) => (
            <Badge key={index} variant="secondary" className="gap-2">
              {diplome}
              <button
                type="button"
                onClick={() => handleRemoveDiplome(index)}
                className="text-xs hover:text-destructive"
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Certifications (optionnel)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: CRPE, Formation Montessori..."
            value={formData.nouvelleCertification}
            onChange={(e) => setFormData({ ...formData, nouvelleCertification: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCertification())}
          />
          <Button type="button" onClick={handleAddCertification}>
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.certifications.map((cert, index) => (
            <Badge key={index} variant="secondary" className="gap-2">
              {cert}
              <button
                type="button"
                onClick={() => handleRemoveCertification(index)}
                className="text-xs hover:text-destructive"
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Matières enseignées * (minimum 1)</Label>
        <div className="grid grid-cols-2 gap-2">
          {matieres.map((matiere) => (
            <div key={matiere} className="flex items-center space-x-2">
              <Checkbox
                id={matiere}
                checked={formData.matieres_enseignees.includes(matiere)}
                onCheckedChange={() => toggleMatiere(matiere)}
              />
              <label htmlFor={matiere} className="text-sm cursor-pointer">
                {matiere}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Années d'expérience *</Label>
        <Input
          id="experience"
          type="number"
          min="0"
          value={formData.annees_experience}
          onChange={(e) => setFormData({ ...formData, annees_experience: Number(e.target.value) })}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
          className="flex-1"
        >
          Précédent
        </Button>
        <Button
          type="button"
          className="flex-1 bg-gradient-primary"
          onClick={() => setCurrentStep(3)}
          disabled={formData.diplomes.length === 0 || formData.matieres_enseignees.length === 0}
        >
          Suivant
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bio">Présentation professionnelle *</Label>
        <Textarea
          id="bio"
          placeholder="Décrivez votre expérience, votre approche pédagogique, vos spécialités..."
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={6}
          required
        />
        <p className="text-xs text-muted-foreground">
          Cette présentation sera visible par les parents
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tarif">Tarif horaire souhaité (€) *</Label>
        <Input
          id="tarif"
          type="number"
          min="20"
          max="100"
          step="5"
          value={formData.tarif_horaire}
          onChange={(e) => setFormData({ ...formData, tarif_horaire: Number(e.target.value) })}
          required
        />
        <p className="text-xs text-muted-foreground">
          Tarif recommandé: 30-50€/h selon l'expérience
        </p>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="casier"
          checked={formData.verification_casier}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, verification_casier: checked as boolean })
          }
        />
        <label htmlFor="casier" className="text-sm cursor-pointer leading-tight">
          Je certifie sur l'honneur avoir un casier judiciaire vierge (bulletin n°3) et accepte 
          qu'une vérification soit effectuée dans le cadre du processus d'approbation *
        </label>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <h4 className="font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          Prochaines étapes
        </h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Examen de votre candidature sous 48-72h</li>
          <li>• Vérification des diplômes et références</li>
          <li>• Email de confirmation une fois approuvé</li>
          <li>• Accès à votre dashboard tuteur</li>
        </ul>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
          className="flex-1"
        >
          Précédent
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-primary"
          disabled={loading || !formData.bio || !formData.verification_casier}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Envoyer ma candidature
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Benefits */}
        <div className="bg-gradient-hero text-white p-8 lg:p-12 flex flex-col justify-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <GraduationCap className="h-8 w-8" />
            <span className="text-2xl font-bold">Oumi'School</span>
          </Link>
          
          <div className="space-y-8 max-w-lg">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Rejoignez notre équipe de tuteurs d'excellence
              </h1>
              <p className="text-xl text-white/90">
                Partagez votre passion de l'enseignement et accompagnez des milliers d'élèves vers la réussite
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Rémunération attractive</h3>
                  <p className="text-white/80">Fixez vos propres tarifs (30-50€/h en moyenne) et soyez payé rapidement</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Horaires flexibles</h3>
                  <p className="text-white/80">Choisissez vos disponibilités et travaillez quand ça vous arrange</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Plateforme moderne</h3>
                  <p className="text-white/80">Outils de visioconférence intégrés, gestion simplifiée des sessions</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Développement professionnel</h3>
                  <p className="text-white/80">Formations continues et communauté active d'enseignants</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sélection rigoureuse</h3>
                  <p className="text-white/80">Faites partie d'une équipe d'élite, tous nos tuteurs sont certifiés</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">300+</div>
                  <div className="text-sm text-white/80">Tuteurs actifs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-white/80">Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">45€</div>
                  <div className="text-sm text-white/80">Tarif moyen</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-lg mx-auto w-full">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-2xl">Candidature tuteur</CardTitle>
                <CardDescription className="text-base">
                  Étape {currentStep} sur 3 - Complétez votre profil
                </CardDescription>
                <div className="flex gap-2 mt-4">
                  <div className={`h-2 flex-1 rounded-full transition-all ${currentStep >= 1 ? "bg-primary" : "bg-muted"}`} />
                  <div className={`h-2 flex-1 rounded-full transition-all ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
                  <div className={`h-2 flex-1 rounded-full transition-all ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`} />
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <form onSubmit={handleSubmit}>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                </form>
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSignup;
