import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Link as LinkIcon, ExternalLink } from "lucide-react";
import { InteractiveResourceViewer } from "./InteractiveResourceViewer";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface InteractiveResource {
  id: string;
  titre: string;
  description?: string;
  file_url: string;
  slug: string;
}

interface InteractiveLearningProps {
  resources: InteractiveResource[];
}

export function InteractiveLearning({ resources }: InteractiveLearningProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<InteractiveResource | null>(null);

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/interactive/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié !", {
      description: "L'URL a été copiée dans votre presse-papier"
    });
  };

  if (resources.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ressources Interactives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-start justify-between p-4 border-2 border-primary/10 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Play className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 text-lg">{resource.titre}</h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Exercice Interactif
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        /interactive/{resource.slug}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(resource.slug)}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copier lien
                  </Button>
                  <Link to={`/interactive/${resource.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedResource(resource);
                      setViewerOpen(true);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Lancer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedResource && (
        <InteractiveResourceViewer
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedResource(null);
          }}
          resourceUrl={selectedResource.file_url}
          titre={selectedResource.titre}
        />
      )}
    </>
  );
}
