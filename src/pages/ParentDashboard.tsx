import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Calendar, LogOut, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddChildDialog } from "@/components/AddChildDialog";
import { ChildCard } from "@/components/ChildCard";
import { UpcomingSessions } from "@/components/UpcomingSessions";
import { RecentActivity } from "@/components/RecentActivity";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    } else {
      setUser(user);
      await loadChildren(user.id);
    }
    setLoading(false);
  };

  const loadChildren = async (userId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading children:", error);
    } else {
      setChildren(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur Oumi'School !",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Oumi'School
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Bienvenue, {user?.user_metadata?.first_name} !
            </h2>
            <p className="text-muted-foreground">
              Gérez l'éducation de vos enfants depuis votre tableau de bord
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Enfants inscrits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{children.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {children.length === 0 ? "Aucun enfant ajouté" : `${children.length} enfant${children.length > 1 ? 's' : ''}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sessions ce mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Réservez votre première session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Gratuit</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Passez à Premium
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Children List */}
          {children.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Mes enfants</h3>
                  <p className="text-muted-foreground">
                    Gérez l'éducation de chaque enfant individuellement
                  </p>
                </div>
                <AddChildDialog onChildAdded={() => checkUser()} />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                  <ChildCard key={child.id} child={child} />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {children.length === 0 && (
              <Card className="border-2 border-primary/20 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Mes enfants
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Ajoutez et gérez les profils de vos enfants
                      </CardDescription>
                    </div>
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <AddChildDialog onChildAdded={() => checkUser()} />
                </CardContent>
              </Card>
            )}

            <Card className="border-2 hover:border-secondary transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-secondary" />
                      Réserver une session
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Trouvez un tuteur et réservez un cours en visio
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/tutors">
                  <Button variant="outline" className="w-full">
                    Parcourir les tuteurs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-success transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-success" />
                      Bibliothèque de ressources
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Accédez à des milliers de leçons et exercices
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/lessons">
                  <Button variant="outline" className="w-full">
                    Explorer les ressources
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Passer à Premium
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Accès illimité et fonctionnalités avancées
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-warm">
                  Découvrir Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Pour bien démarrer</CardTitle>
              <CardDescription>
                Suivez ces étapes pour tirer le meilleur parti d'Oumi'School
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Ajoutez vos enfants</h4>
                    <p className="text-sm text-muted-foreground">
                      Créez un profil pour chacun de vos enfants avec leur niveau scolaire
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Explorez les ressources</h4>
                    <p className="text-sm text-muted-foreground">
                      Parcourez notre bibliothèque de leçons adaptées au programme français
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Réservez votre première session</h4>
                    <p className="text-sm text-muted-foreground">
                      Profitez de votre première session gratuite de 30 minutes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions & Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <UpcomingSessions />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
