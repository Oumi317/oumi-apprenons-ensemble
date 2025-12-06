import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface InteractiveResource {
  id: string;
  titre: string;
  description: string;
  file_url: string;
  lesson_id: string;
  lessons?: {
    titre: string;
    matiere: string;
    niveau_scolaire: string;
  };
}

export default function InteractiveResource() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<InteractiveResource | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResource();
  }, [id]);

  const loadResource = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("interactive_resources")
        .select(`
          *,
          lessons (
            titre,
            matiere,
            niveau_scolaire
          )
        `)
        .eq("slug", id)
        .maybeSingle();

      if (error) throw error;
      setResource(data);

      // Fetch the HTML content to bypass content-type issues
      if (data?.file_url) {
        const response = await fetch(data.file_url);
        const html = await response.text();
        setHtmlContent(html);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la ressource:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Ressource non trouvée</h1>
        <Link to="/lessons">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux cours
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/lessons" className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-lg hidden sm:inline">Oumi'School</span>
              </Link>
              <Link to="/lessons">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <h1 className="text-lg font-bold font-display">{resource.titre}</h1>
                {resource.lessons && (
                  <p className="text-xs text-muted-foreground">
                    {resource.lessons.matiere} - {resource.lessons.niveau_scolaire}
                  </p>
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>
          {resource.description && (
            <p className="mt-2 text-muted-foreground text-sm">{resource.description}</p>
          )}
        </div>
      </header>

      <main className="h-[calc(100vh-180px)]">
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title={resource.titre}
        />
      </main>
    </div>
  );
}
