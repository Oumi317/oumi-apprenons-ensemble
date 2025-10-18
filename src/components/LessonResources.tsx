import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ExternalLink, BookOpen, FileSpreadsheet, Image } from "lucide-react";

interface Resource {
  id: string;
  titre: string;
  type: "pdf" | "document" | "image" | "spreadsheet" | "link";
  url: string;
  taille?: string;
  description?: string;
}

interface LessonResourcesProps {
  resources: Resource[];
}

const resourceIcons = {
  pdf: FileText,
  document: BookOpen,
  image: Image,
  spreadsheet: FileSpreadsheet,
  link: ExternalLink,
};

const resourceColors = {
  pdf: "text-red-500",
  document: "text-blue-500",
  image: "text-green-500",
  spreadsheet: "text-emerald-500",
  link: "text-purple-500",
};

export function LessonResources({ resources }: LessonResourcesProps) {
  if (resources.length === 0) {
    return null;
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      window.open(url, "_blank");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Ressources pédagogiques
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {resources.map((resource) => {
            const Icon = resourceIcons[resource.type];
            const colorClass = resourceColors[resource.type];

            return (
              <div
                key={resource.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{resource.titre}</h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.type.toUpperCase()}
                      </Badge>
                      {resource.taille && (
                        <span className="text-xs text-muted-foreground">
                          {resource.taille}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resource.type === "link" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resource.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.url, "_blank")}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(resource.url, resource.titre)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}