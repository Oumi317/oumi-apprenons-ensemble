import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2, Star, CheckCircle, Users, Globe, Award, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <motion.div 
            className="hidden lg:block space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <Link to="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity group">
                <GraduationCap className="h-8 w-8 transition-transform group-hover:scale-110" />
                <span className="text-2xl font-display font-bold">Oumi'School</span>
              </Link>
              <h2 className="text-4xl font-display font-bold text-white">
                Rejoignez +1 000 familles satisfaites
              </h2>
              <p className="text-white/90 text-lg">
                Excellence éducative francophone pour vos enfants, où que vous soyez dans le monde
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "1000+", desc: "Familles" },
                { icon: Award, label: "50+", desc: "Tuteurs" },
                { icon: Globe, label: "25+", desc: "Pays" },
                { icon: Clock, label: "24/7", desc: "Support" },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <stat.icon className="h-8 w-8 text-white mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.label}</div>
                  <div className="text-sm text-white/80">{stat.desc}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: CheckCircle,
                  title: "Session d'essai gratuite",
                  desc: "Première session de 30 minutes offerte"
                },
                {
                  icon: Shield,
                  title: "Tuteurs certifiés",
                  desc: "Sélectionnés pour leur excellence pédagogique"
                },
                {
                  icon: Award,
                  title: "Programme français",
                  desc: "Aligné avec le socle commun de connaissances"
                },
                {
                  icon: CheckCircle,
                  title: "Suivi personnalisé",
                  desc: "Rapports de progression détaillés"
                },
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/15 transition-colors animate-fade-in"
                  style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                >
                  <benefit.icon className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-0.5">{benefit.title}</h4>
                    <p className="text-sm text-white/80">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-white/20">
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
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-white" />
                  ))}
                </div>
                <p className="text-sm text-white/90 font-medium">4.9/5 • 500+ avis vérifiés</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-6 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                <GraduationCap className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
                <span className="text-3xl font-display font-bold text-white">Oumi'School</span>
              </Link>
              <p className="text-white/90">Excellence éducative francophone</p>
            </div>

            <Card className="shadow-2xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl">Bienvenue sur Oumi'School</CardTitle>
                <CardDescription>
                  Connectez-vous ou créez un compte pour commencer votre aventure éducative
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="text-base">Connexion</TabsTrigger>
                    <TabsTrigger value="signup" className="text-base">Inscription</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Adresse email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Mot de passe</Label>
                          <a href="#" className="text-xs text-primary hover:underline">
                            Mot de passe oublié ?
                          </a>
                        </div>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>
                      <Button type="submit" className="w-full h-11 bg-gradient-primary text-base font-semibold" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Se connecter
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                            id="firstName"
                            placeholder="Prénom"
                            value={signupData.firstName}
                            onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                            required
                            className="h-11"
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
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Je suis</Label>
                        <select
                          id="role"
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={signupData.role}
                          onChange={(e) => setSignupData({ ...signupData, role: e.target.value as "parent" | "tutor" })}
                        >
                          <option value="parent">Parent</option>
                          <option value="tutor">Tuteur</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Adresse email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Mot de passe</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Au moins 6 caractères"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                          className="h-11"
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
                          className="h-11"
                        />
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                        En créant un compte, vous acceptez nos{" "}
                        <a href="#" className="text-primary hover:underline font-medium">Conditions d'utilisation</a>
                        {" "}et notre{" "}
                        <a href="#" className="text-primary hover:underline font-medium">Politique de confidentialité</a>
                      </div>

                      <Button type="submit" className="w-full h-11 bg-gradient-primary text-base font-semibold" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Créer mon compte gratuitement
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="text-center mt-6 space-y-2">
              <Link to="/" className="text-sm text-white hover:underline inline-flex items-center gap-1">
                ← Retour à l'accueil
              </Link>
              <p className="text-xs text-white/70">
                Plateforme sécurisée et conforme RGPD
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
