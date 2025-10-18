import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, BookOpen, Users, HelpCircle } from "lucide-react";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

export function NavigationHeader() {
  const [user, setUser] = useState<any>(null);
  const { isParent, isTutor, isAdmin } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/dashboard/admin";
    if (isTutor) return "/dashboard/tutor";
    if (isParent) return "/dashboard/parent";
    return "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Oumi'School
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link to="/lessons" className="text-sm font-medium transition-colors hover:text-primary">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Cours
              </div>
            </Link>
            <Link to="/tutors" className="text-sm font-medium transition-colors hover:text-primary">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tuteurs
              </div>
            </Link>
            <Link to="/faq" className="text-sm font-medium transition-colors hover:text-primary">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </div>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationsDropdown />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(getDashboardLink())}
                className="hidden md:flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Tableau de bord
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </DropdownMenuItem>
                  {isParent && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/parent")}>
                      <User className="mr-2 h-4 w-4" />
                      Espace Parent
                    </DropdownMenuItem>
                  )}
                  {isTutor && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/tutor")}>
                      <Users className="mr-2 h-4 w-4" />
                      Espace Tuteur
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/admin")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Administration
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              Connexion
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
