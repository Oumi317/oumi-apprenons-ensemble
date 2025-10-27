import { Link } from "react-router-dom";
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Oumi'School
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Plateforme de tutorat en ligne pour les familles francophones. 
              Cours personnalisés, tuteurs certifiés, et ressources pédagogiques de qualité.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Produit</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/tutors" className="text-muted-foreground hover:text-foreground transition-colors">
                  Nos tuteurs
                </Link>
              </li>
              <li>
                <Link to="/lessons" className="text-muted-foreground hover:text-foreground transition-colors">
                  Ressources
                </Link>
              </li>
              <li>
                <Link to="/payment" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  Essai gratuit
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <Link to="/tutor-signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  Devenir tuteur
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  CGV
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t">
          <div className="max-w-md">
            <h3 className="font-semibold mb-2">Restez informé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Recevez nos actualités et conseils pédagogiques
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Votre email" 
                className="flex-1"
              />
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                S'inscrire
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Oumi'School. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
