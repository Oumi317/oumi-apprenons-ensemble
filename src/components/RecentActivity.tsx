import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Clock, TrendingUp } from "lucide-react";

interface Activity {
  id: string;
  type: "lesson_completed" | "lesson_started" | "progress_milestone";
  title: string;
  description: string;
  timestamp: string;
  studentName: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

const activityIcons = {
  lesson_completed: CheckCircle,
  lesson_started: BookOpen,
  progress_milestone: TrendingUp,
};

const activityColors = {
  lesson_completed: "text-success",
  lesson_started: "text-primary",
  progress_milestone: "text-secondary",
};

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Aucune activité pour le moment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              L'activité de vos enfants apparaîtra ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>Dernières actions de vos enfants</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.studentName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
