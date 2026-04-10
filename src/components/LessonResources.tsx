import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ExternalLink, BookOpen, FileSpreadsheet, Image, Play, Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import { InteractiveResourceViewer } from "./InteractiveResourceViewer";
import { useState } from "react";

interface Resource {
  id: string;
  titre: string;
  type: "pdf" | "document" | "image" | "spreadsheet" | "link" | "interactive";
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
  interactive: Play,
};

const resourceColors = {
  pdf: "text-red-500",
  document: "text-blue-500",
  image: "text-green-500",
  spreadsheet: "text-emerald-500",
  link: "text-purple-500",
  interactive: "text-orange-500",
};

function InlinePDFViewer({ url, titre, onClose }: { url: string; titre: string; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`mt-3 border rounded-lg overflow-hidden bg-muted/30 transition-all ${expanded ? "fixed inset-4 z-50 bg-background shadow-2xl" : ""}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <span className="text-sm font-medium truncate">{titre}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Réduire" : "Agrandir"}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            title="Fermer la prévisualisation"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <iframe
        src={`${url}#toolbar=1&navpanes=0`}
        className={`w-full border-0 ${expanded ? "h-[calc(100%-40px)]" : "h-[500px]"}`}
        title={titre}
      />
      {expanded && (
        <div
          className="fixed inset-0 -z-10 bg-black/50"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  );
}

function InlineImageViewer({ url, titre, onClose }: { url: string; titre: string; onClose: () => void }) {
  return (
    <div className="mt-3 border rounded-lg overflow-hidden bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <span className="text-sm font-medium truncate">{titre}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
          title="Fermer la prévisualisation"
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 flex justify-center">
        <img src={url} alt={titre} className="max-w-full max-h-[500px] object-contain rounded" />
      </div>
    </div>
  );
}

export function LessonResources({ resources }: LessonResourcesProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [previewingIds, setPreviewingIds] = useState<Set<string>>(new Set());

  if (resources.length === 0) {
    return null;
  }

  const togglePreview = (id: string) => {
    setPreviewingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const canPreviewInline = (type: string) => {
    return type === "pdf" || type === "image";
  };

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
            const isPreviewing = previewingIds.has(resource.id);

            return (
              <div key={resource.id}>
                <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
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
                    {resource.type === "interactive" ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedResource(resource);
                          setViewerOpen(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Lancer l'exercice
                      </Button>
                    ) : resource.type === "link" ? (
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
                        {canPreviewInline(resource.type) && (
                          <Button
                            variant={isPreviewing ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => togglePreview(resource.id)}
                          >
                            {isPreviewing ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Masquer
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Prévisualiser
                              </>
                            )}
                          </Button>
                        )}
                        {!canPreviewInline(resource.type) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            Voir
                          </Button>
                        )}
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

                {/* Inline Preview */}
                {isPreviewing && resource.type === "pdf" && (
                  <InlinePDFViewer
                    url={resource.url}
                    titre={resource.titre}
                    onClose={() => togglePreview(resource.id)}
                  />
                )}
                {isPreviewing && resource.type === "image" && (
                  <InlineImageViewer
                    url={resource.url}
                    titre={resource.titre}
                    onClose={() => togglePreview(resource.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {selectedResource && (
        <InteractiveResourceViewer
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedResource(null);
          }}
          resourceUrl={selectedResource.url}
          titre={selectedResource.titre}
        />
      )}
    </Card>
  );
}
