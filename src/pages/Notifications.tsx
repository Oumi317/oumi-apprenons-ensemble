import { NavigationHeader } from "@/components/NavigationHeader";
import { NotificationCenter } from "@/components/NotificationCenter";

export default function Notifications() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Centre de notifications</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos notifications en un seul endroit
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
}
