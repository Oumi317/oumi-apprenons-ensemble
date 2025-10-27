import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles } from "lucide-react";
import { InteractiveResourceViewer } from "./InteractiveResourceViewer";
import { useState } from "react";

interface InteractiveResource {
  id: string;
  titre: string;
  description?: string;
  file_url: string;
}

interface InteractiveLearningProps {
  resources: InteractiveResource[];
}

export function InteractiveLearning({ resources }: InteractiveLearningProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<InteractiveResource | null>(null);

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
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Exercice Interactif
                    </Badge>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => {
                    setSelectedResource(resource);
                    setViewerOpen(true);
                  }}
                  className="ml-4"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Lancer
                </Button>
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
