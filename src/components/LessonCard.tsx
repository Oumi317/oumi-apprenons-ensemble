import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Lock, 
  Play, 
  FileText, 
  HelpCircle, 
  BookOpen, 
  Clock, 
  Star,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const typeIcons = {
  video: Play,
  exercice: FileText,
  quiz: HelpCircle,
  document: BookOpen,
};

const typeColors = {
  video: "text-purple-500",
  exercice: "text-blue-500",
  quiz: "text-green-500",
  document: "text-orange-500",
};

const difficultyColors = {
  facile: "bg-green-500/10 text-green-500 border-green-500/20",
  moyen: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  difficile: "bg-red-500/10 text-red-500 border-red-500/20",
};

interface LessonCardProps {
  lesson: any;
  user: any;
  progress?: {
    completion: number;
    lastAccessed: string;
  };
  featured?: boolean;
}

export function LessonCard({ lesson, user, progress, featured }: LessonCardProps) {
  const navigate = useNavigate();
  const TypeIcon = typeIcons[lesson.type_contenu as keyof typeof typeIcons] || BookOpen;
  const typeColor = typeColors[lesson.type_contenu as keyof typeof typeColors] || "text-gray-500";

  const handleClick = () => {
    navigate(`/lessons/${lesson.id}`);
  };

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden ${
        featured ? "border-2 border-primary" : ""
      }`}
      onClick={handleClick}
    >
      {/* Thumbnail or Type Badge */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center overflow-hidden">
        {lesson.thumbnail_url ? (
          <img
            src={lesson.thumbnail_url}
            alt={lesson.titre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <TypeIcon className={`h-16 w-16 ${typeColor} opacity-30 group-hover:opacity-50 transition-opacity`} />
        )}
        
        {/* Premium Badge */}
        {!lesson.gratuit && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 text-white shadow-lg">
              <Lock className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-primary border-0 text-white shadow-lg">
              <Star className="h-3 w-3 mr-1 fill-white" />
              Populaire
            </Badge>
          </div>
        )}

        {/* Progress Overlay */}
        {progress && progress.completion > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center gap-2 text-white text-xs">
              <Progress value={progress.completion} className="flex-1 h-1.5" />
              <span className="font-medium">{progress.completion}%</span>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="space-y-3">
        {/* Level and Subject */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            {lesson.niveau_scolaire}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {lesson.matiere}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${difficultyColors[lesson.difficulte as keyof typeof difficultyColors]}`}
          >
            {lesson.difficulte}
          </Badge>
        </div>

        {/* Title */}
        <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {lesson.titre}
        </CardTitle>

        {/* Description */}
        {lesson.description && (
          <CardDescription className="line-clamp-2 text-sm">
            {lesson.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <TypeIcon className="h-4 w-4" />
            <span className="capitalize">{lesson.type_contenu}</span>
          </div>
          {lesson.duree_estimee_minutes && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{lesson.duree_estimee_minutes} min</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          className={`w-full group-hover:shadow-lg transition-all ${
            lesson.gratuit ? "bg-gradient-primary" : ""
          }`}
          variant={lesson.gratuit ? "default" : "outline"}
          disabled={!lesson.gratuit && !user}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {progress && progress.completion > 0 ? (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Continuer
            </>
          ) : progress && progress.completion === 100 ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Revoir
            </>
          ) : lesson.gratuit ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Commencer
            </>
          ) : user ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Accéder
            </>
          ) : (
            "Connexion requise"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
