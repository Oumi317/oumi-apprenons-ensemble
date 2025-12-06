import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/lessons", label: "Ressources" },
    { to: "/tutors", label: "Tuteurs" },
    { to: "/faq", label: "FAQ" },
    { to: "/auth", label: "Connexion" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden rounded-full">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="h-10 w-10 rounded-2xl bg-gradient-hero flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display">
                Oumi<span className="text-primary">'</span>School
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-lg font-medium hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="p-6 border-t">
            <Link to="/auth?mode=signup" onClick={() => setOpen(false)}>
              <Button className="w-full rounded-full bg-gradient-hero h-12 text-lg font-semibold">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
