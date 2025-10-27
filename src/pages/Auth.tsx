import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const defaultTab = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "parent" as "parent" | "tutor"
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Oumi'School !",
      });

      // Redirection basée sur le rôle
      navigate("/dashboard/parent");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            role: signupData.role,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Compte créé avec succès !",
        description: "Vous pouvez maintenant vous connecter",
      });

      // Auto-login après inscription
      if (data.user) {
        navigate("/onboarding");
      }
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Benefits */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Rejoignez +1 000 familles satisfaites
            </h2>
            <p className="text-white/90 text-lg">
              Excellence éducative francophone pour vos enfants, où que vous soyez dans le monde
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: "✓",
                title: "Session d'essai gratuite",
                desc: "Première session de 30 minutes offerte"
              },
              {
                icon: "✓",
                title: "+50 tuteurs certifiés",
                desc: "Sélectionnés pour leur excellence pédagogique"
              },
              {
                icon: "✓",
                title: "Programme français",
                desc: "Aligné avec le socle commun de connaissances"
              },
              {
                icon: "✓",
                title: "Suivi personnalisé",
                desc: "Rapports de progression détaillés"
              },
              {
                icon: "✓",
                title: "Horaires flexibles",
                desc: "7j/7 avec tous les fuseaux horaires"
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/15 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                  <p className="text-sm text-white/80">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="h-10 w-10 rounded-full bg-gradient-primary border-2 border-white flex items-center justify-center text-white font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-white">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-white" />
                ))}
              </div>
              <p className="text-sm text-white/90">4.9/5 • 500+ avis</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div>
          <div className="text-center mb-6 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <GraduationCap className="h-10 w-10 text-white" />
              <span className="text-3xl font-bold text-white">Oumi'School</span>
            </Link>
            <p className="text-white/90">Excellence éducative francophone</p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour accéder à la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                  <div className="text-center">
                    <a href="#" className="text-sm text-primary hover:underline">
                      Mot de passe oublié ?
                    </a>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        placeholder="Prénom"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        placeholder="Nom"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Je suis</Label>
                    <select
                      id="role"
                      className="w-full px-3 py-2 border rounded-md"
                      value={signupData.role}
                      onChange={(e) => setSignupData({ ...signupData, role: e.target.value as "parent" | "tutor" })}
                    >
                      <option value="parent">Parent</option>
                      <option value="tutor">Tuteur</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    En créant un compte, vous acceptez nos{" "}
                    <a href="#" className="text-primary hover:underline">Conditions d'utilisation</a>
                    {" "}et notre{" "}
                    <a href="#" className="text-primary hover:underline">Politique de confidentialité</a>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer mon compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-white hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Auth;
