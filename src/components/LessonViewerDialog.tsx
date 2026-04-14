import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, ExternalLink, FileText, Video, Globe } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

interface LessonResource {
  id: string;
  titre: string;
  type: string;
  file_url: string;
}

interface LessonData {
  id: string;
  titre: string;
  matiere: string;
  description: string | null;
  contenu_url: string | null;
  type_contenu: string;
}

interface LessonViewerDialogProps {
  lessonId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonViewerDialog({ lessonId, open, onOpenChange }: LessonViewerDialogProps) {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "iframe" | "pdf" | "video">("list");
  const [viewUrl, setViewUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [iframeLoading, setIframeLoading] = useState(false);

  useEffect(() => {
    if (lessonId && open) {
      loadLesson(lessonId);
    } else {
      setViewMode("list");
      setLesson(null);
      setResources([]);
    }
  }, [lessonId, open]);

  const loadLesson = async (id: string) => {
    setLoading(true);
    try {
      const [lessonRes, resourcesRes] = await Promise.all([
        supabase.from("lessons").select("id, titre, matiere, description, contenu_url, type_contenu").eq("id", id).single(),
        supabase.from("lesson_resources").select("id, titre, type, file_url").eq("lesson_id", id).order("ordre_affichage"),
      ]);
      if (lessonRes.data) setLesson(lessonRes.data);
      if (resourcesRes.data) setResources(resourcesRes.data);

      // Auto-open if there's a contenu_url
      if (lessonRes.data?.contenu_url) {
        autoOpen(lessonRes.data.contenu_url, lessonRes.data.type_contenu);
      }
    } catch (e) {
      console.error("Error loading lesson:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndShowHtml = async (url: string) => {
    setIframeLoading(true);
    setViewMode("iframe");
    try {
      const response = await fetch(url);
      const text = await response.text();
      setHtmlContent(text);
    } catch (e) {
      console.error("Error fetching HTML:", e);
    } finally {
      setIframeLoading(false);
    }
  };

  const autoOpen = (url: string, type: string) => {
    if (type === "video" || url.match(/\.(mp4|webm|ogg)$/i)) {
      setViewUrl(url);
      setViewMode("video");
    } else if (url.match(/\.(pdf)$/i)) {
      setViewUrl(url);
      setViewMode("pdf");
    } else if (url.match(/\.(html?)$/i) || type === "interactif") {
      fetchAndShowHtml(url);
    }
  };

  const openResource = (res: LessonResource) => {
    const url = res.file_url;
    if (res.type === "video" || url.match(/\.(mp4|webm|ogg)$/i)) {
      setViewUrl(url);
      setViewMode("video");
    } else if (res.type === "pdf" || url.match(/\.pdf$/i)) {
      setViewUrl(url);
      setViewMode("pdf");
    } else if (url.match(/\.(html?)$/i)) {
      fetchAndShowHtml(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "pdf") return <FileText className="h-4 w-4" />;
    if (type === "video") return <Video className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${viewMode !== "list" ? "max-w-4xl h-[85vh]" : "max-w-lg"}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lesson ? lesson.titre : "Chargement..."}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : viewMode === "video" ? (
          <div className="flex-1 space-y-3">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")}>← Retour</Button>
            <VideoPlayer videoUrl={viewUrl} />
          </div>
        ) : viewMode === "pdf" ? (
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setViewMode("list")}>← Retour</Button>
              <a href={viewUrl} download className="ml-auto">
                <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Télécharger</Button>
              </a>
              <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1"><ExternalLink className="h-4 w-4" /> Nouvel onglet</Button>
              </a>
            </div>
            <iframe src={viewUrl} className="flex-1 w-full rounded-lg border border-border min-h-[60vh]" title="PDF Viewer" />
          </div>
        ) : viewMode === "iframe" ? (
          <div className="flex-1 flex flex-col gap-3">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="self-start">← Retour</Button>
            <iframe src={viewUrl} className="flex-1 w-full rounded-lg border border-border min-h-[60vh]"
              sandbox="allow-scripts allow-forms allow-popups" title="Contenu interactif" />
          </div>
        ) : (
          <div className="space-y-4">
            {lesson?.description && <p className="text-sm text-muted-foreground">{lesson.description}</p>}

            {lesson?.contenu_url && (
              <Button className="w-full gap-2" onClick={() => autoOpen(lesson.contenu_url!, lesson.type_contenu)}>
                <Globe className="h-4 w-4" /> Ouvrir le contenu principal
              </Button>
            )}

            {resources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Ressources</h4>
                {resources.map(r => (
                  <div key={r.id} onClick={() => openResource(r)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                    {getTypeIcon(r.type)}
                    <span className="flex-1 text-sm font-medium text-foreground">{r.titre}</span>
                    <Badge variant="outline" className="text-[10px]">{r.type.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            )}

            {!lesson?.contenu_url && resources.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun contenu disponible pour cette leçon.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
