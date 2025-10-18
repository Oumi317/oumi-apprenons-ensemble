import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, RefreshCw, Trophy, Target } from "lucide-react";

interface Question {
  id: string;
  question: string;
  correct_answer: string;
  points: number;
}

interface QuizResultsProps {
  answers: Record<string, { answer: string; is_correct: boolean }>;
  questions: Question[];
  onRetry: () => void;
}

export function QuizResults({ answers, questions, onRetry }: QuizResultsProps) {
  const correctAnswers = Object.values(answers).filter((a) => a.is_correct).length;
  const totalQuestions = questions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = percentage >= 70;

  const getMessage = () => {
    if (percentage >= 90) return "Excellent travail ! 🌟";
    if (percentage >= 70) return "Bien joué ! 👏";
    if (percentage >= 50) return "Pas mal, continue ! 💪";
    return "N'abandonne pas, réessaie ! 🎯";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Résultats du Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${
              passed
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
            }`}
          >
            <div>
              <div className="text-4xl font-bold">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">{getMessage()}</h3>
            <p className="text-muted-foreground">
              {correctAnswers} sur {totalQuestions} réponses correctes
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {correctAnswers}
                  </div>
                  <div className="text-xs text-muted-foreground">Correctes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Award className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {totalQuestions - correctAnswers}
                  </div>
                  <div className="text-xs text-muted-foreground">Incorrectes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!passed && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-center">
              Score minimum requis : 70%. Continue de t'entraîner ! 💪
            </p>
          </div>
        )}

        <Button onClick={onRetry} className="w-full" variant={passed ? "outline" : "default"}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer le quiz
        </Button>
      </CardContent>
    </Card>
  );
}