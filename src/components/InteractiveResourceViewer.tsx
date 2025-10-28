import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface InteractiveResourceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resourceUrl: string;
  titre: string;
}

export function InteractiveResourceViewer({
  isOpen,
  onClose,
  resourceUrl,
  titre,
}: InteractiveResourceViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHtmlContent = async () => {
      if (!resourceUrl || !isOpen) return;
      
      setLoading(true);
      try {
        const response = await fetch(resourceUrl);
        const html = await response.text();
        setHtmlContent(html);
      } catch (error) {
        console.error("Erreur lors du chargement du contenu HTML:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHtmlContent();
  }, [resourceUrl, isOpen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? "w-screen h-screen max-w-none m-0 p-0 rounded-none" 
            : "max-w-6xl h-[90vh]"
        } transition-all duration-300`}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{titre}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              title={titre}
              style={{ 
                height: isFullscreen ? "calc(100vh - 80px)" : "calc(90vh - 80px)" 
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
