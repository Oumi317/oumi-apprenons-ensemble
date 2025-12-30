import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallPrompt() {
  const { isInstallable, isOnline, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineToast(true);
      const timer = setTimeout(() => setShowOfflineToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  return (
    <>
      {/* Install Prompt */}
      <AnimatePresence>
        {isInstallable && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
          >
            <Card className="border-primary/20 shadow-lg bg-background/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Installer EduKids</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accédez rapidement à l'application et profitez du mode hors-ligne
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={handleInstall}>
                        Installer
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleDismiss}>
                        Plus tard
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Toast */}
      <AnimatePresence>
        {showOfflineToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="border-amber-500/20 bg-amber-500/10 backdrop-blur">
              <CardContent className="p-3 flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Mode hors-ligne activé
                </span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online indicator (when coming back online) */}
      <AnimatePresence>
        {isOnline && showOfflineToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="border-green-500/20 bg-green-500/10 backdrop-blur">
              <CardContent className="p-3 flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Connexion rétablie
                </span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
