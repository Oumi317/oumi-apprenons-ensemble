import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QuickStatsProps {
  stats: {
    label: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }[];
}

export const QuickStats = ({ stats }: QuickStatsProps) => {
  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="h-4 w-4" />;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return "text-muted-foreground";
    if (change > 0) return "text-success";
    return "text-destructive";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(stat.change)}`}>
                  {getTrendIcon(stat.change)}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
