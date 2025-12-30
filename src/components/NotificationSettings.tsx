import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, BellRing, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface NotificationPreferences {
  sessions: boolean;
  messages: boolean;
  achievements: boolean;
  promotions: boolean;
}

export function NotificationSettings() {
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    showNotification 
  } = usePushNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    sessions: true,
    messages: true,
    achievements: true,
    promotions: false
  });

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications activées !");
      // Show test notification
      await showNotification("Notifications activées", {
        body: "Vous recevrez désormais des notifications pour vos sessions et messages",
        tag: "welcome"
      });
    } else {
      toast.error("Les notifications ont été refusées");
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      // Save to localStorage or database
      localStorage.setItem("notification-preferences", JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  const testNotification = async () => {
    const success = await showNotification("Test de notification", {
      body: "Ceci est un test de notification EduKids",
      tag: "test"
    });
    
    if (success) {
      toast.success("Notification de test envoyée");
    } else {
      toast.error("Impossible d'envoyer la notification");
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <p>Les notifications push ne sont pas supportées par votre navigateur</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications Push
          </CardTitle>
          <CardDescription>
            Recevez des alertes en temps réel pour vos sessions et messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {permission === "granted" ? (
                <div className="p-2 rounded-full bg-green-500/20">
                  <BellRing className="h-5 w-5 text-green-500" />
                </div>
              ) : permission === "denied" ? (
                <div className="p-2 rounded-full bg-red-500/20">
                  <BellOff className="h-5 w-5 text-red-500" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-amber-500/20">
                  <Bell className="h-5 w-5 text-amber-500" />
                </div>
              )}
              <div>
                <p className="font-medium">État des notifications</p>
                <p className="text-sm text-muted-foreground">
                  {permission === "granted" 
                    ? "Les notifications sont activées"
                    : permission === "denied"
                    ? "Les notifications sont bloquées"
                    : "Les notifications ne sont pas encore activées"}
                </p>
              </div>
            </div>
            <Badge 
              variant={permission === "granted" ? "default" : "secondary"}
              className={permission === "granted" ? "bg-green-500" : ""}
            >
              {permission === "granted" ? "Activé" : permission === "denied" ? "Bloqué" : "Inactif"}
            </Badge>
          </div>

          {permission !== "granted" && permission !== "denied" && (
            <Button onClick={handleEnableNotifications} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Activer les notifications
            </Button>
          )}

          {permission === "denied" && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                Notifications bloquées
              </p>
              <p className="text-muted-foreground mt-1">
                Pour réactiver les notifications, allez dans les paramètres de votre navigateur
              </p>
            </div>
          )}

          {permission === "granted" && (
            <Button onClick={testNotification} variant="outline" className="w-full">
              Tester les notifications
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {permission === "granted" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>
                Choisissez les types de notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sessions">Sessions de tutorat</Label>
                  <p className="text-sm text-muted-foreground">
                    Rappels avant les sessions et confirmations
                  </p>
                </div>
                <Switch
                  id="sessions"
                  checked={preferences.sessions}
                  onCheckedChange={() => handlePreferenceChange("sessions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="messages">Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Nouveaux messages des tuteurs
                  </p>
                </div>
                <Switch
                  id="messages"
                  checked={preferences.messages}
                  onCheckedChange={() => handlePreferenceChange("messages")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="achievements">Récompenses et badges</Label>
                  <p className="text-sm text-muted-foreground">
                    Nouveaux achievements et montées de niveau
                  </p>
                </div>
                <Switch
                  id="achievements"
                  checked={preferences.achievements}
                  onCheckedChange={() => handlePreferenceChange("achievements")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="promotions">Promotions et actualités</Label>
                  <p className="text-sm text-muted-foreground">
                    Offres spéciales et nouveautés
                  </p>
                </div>
                <Switch
                  id="promotions"
                  checked={preferences.promotions}
                  onCheckedChange={() => handlePreferenceChange("promotions")}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
