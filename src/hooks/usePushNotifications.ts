import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported("Notification" in window && "serviceWorker" in navigator);
    
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      // Try to use service worker for notification if available
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          ...options
        });
      } else {
        // Fallback to basic notification
        new Notification(title, {
          icon: "/icons/icon-192x192.png",
          ...options
        });
      }
      return true;
    } catch (error) {
      console.error("Error showing notification:", error);
      return false;
    }
  }, [permission, requestPermission]);

  const subscribeToNotifications = useCallback(async (userId: string) => {
    if (!isSupported || permission !== "granted") return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let pushSubscription = await registration.pushManager.getSubscription();
      
      if (!pushSubscription) {
        // Create new subscription
        // Note: In production, you'd use your own VAPID keys
        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // applicationServerKey would be your VAPID public key
        });
      }

      const subscriptionData = pushSubscription.toJSON();
      
      // Store subscription in database (you'd need a table for this)
      console.log("Push subscription:", subscriptionData);
      
      setSubscription(subscriptionData as unknown as PushSubscription);
      return subscriptionData;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
        setSubscription(null);
      }
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  }, []);

  return {
    permission,
    isSupported,
    subscription,
    requestPermission,
    showNotification,
    subscribeToNotifications,
    unsubscribe
  };
}
