import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  Star, 
  Award, 
  BookOpen, 
  TrendingUp,
  MessageSquare,
  Calendar,
  Trophy
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Activity {
  id: string;
  type: "achievement" | "session" | "quiz" | "message" | "progress" | "booking";
  title: string;
  description: string;
  timestamp: Date;
  studentName?: string;
  icon?: string;
  points?: number;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export const ActivityFeed = ({ activities, maxItems = 10 }: ActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-4 w-4" />;
      case "session":
        return <Calendar className="h-4 w-4" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "progress":
        return <TrendingUp className="h-4 w-4" />;
      case "booking":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "bg-secondary/10 text-secondary";
      case "session":
        return "bg-primary/10 text-primary";
      case "quiz":
        return "bg-success/10 text-success";
      case "message":
        return "bg-blue-500/10 text-blue-500";
      case "progress":
        return "bg-green-500/10 text-green-500";
      case "booking":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Activité récente</CardTitle>
          </div>
          <Badge variant="secondary">{activities.length} activités</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.length > 0 ? (
            displayedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex gap-4 animate-fade-in hover:bg-muted/50 p-3 rounded-lg transition-colors -mx-3"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{activity.title}</p>
                      {activity.studentName && (
                        <p className="text-xs text-muted-foreground">{activity.studentName}</p>
                      )}
                    </div>
                    {activity.points && (
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20 flex-shrink-0">
                        +{activity.points} XP
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(activity.timestamp, { locale: fr, addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune activité récente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
