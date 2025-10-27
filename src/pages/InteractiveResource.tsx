import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResource();
  }, [id]);

  const loadResource = async () => {
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
        .eq("id", id)
        .single();

      if (error) throw error;
      setResource(data);
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/lessons">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{resource.titre}</h1>
              {resource.lessons && (
                <p className="text-sm text-muted-foreground">
                  {resource.lessons.matiere} - {resource.lessons.niveau_scolaire}
                </p>
              )}
            </div>
          </div>
          {resource.description && (
            <p className="mt-2 text-muted-foreground">{resource.description}</p>
          )}
        </div>
      </header>

      <main className="h-[calc(100vh-180px)]">
        <iframe
          src={resource.file_url}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={resource.titre}
        />
      </main>
    </div>
  );
}
