import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, BookOpen, TrendingUp } from "lucide-react";

interface ChildCardProps {
  child: {
    id: string;
    prenom: string;
    date_naissance: string;
    niveau_scolaire: string;
    besoins_specifiques?: string;
  };
}

export function ChildCard({ child }: ChildCardProps) {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card className="hover:shadow-lg transition-all hover:border-primary/50 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{child.prenom}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {calculateAge(child.date_naissance)} ans
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {child.niveau_scolaire}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {child.besoins_specifiques && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Besoins spécifiques</p>
            <p className="text-sm">{child.besoins_specifiques}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Leçons</p>
              <p className="text-sm font-semibold">0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-secondary" />
            <div>
              <p className="text-xs text-muted-foreground">Progrès</p>
              <p className="text-sm font-semibold">0%</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Réserver session
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Voir profil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
