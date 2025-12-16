import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, RefreshCw, Trophy, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

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
  onXPGain?: (amount: number) => void;
}

export function QuizResults({ answers, questions, onRetry, onXPGain }: QuizResultsProps) {
  const correctAnswers = Object.values(answers).filter((a) => a.is_correct).length;
  const totalQuestions = questions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = percentage >= 70;
  const xpEarned = correctAnswers * 10 + (passed ? 20 : 0) + (percentage === 100 ? 50 : 0);

  useEffect(() => {
    // Trigger XP gain callback
    if (onXPGain && xpEarned > 0) {
      onXPGain(xpEarned);
    }
    
    // Confetti for passed quizzes
    if (passed) {
      const duration = percentage === 100 ? 3000 : 1500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: percentage === 100 ? 5 : 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899']
        });
        confetti({
          particleCount: percentage === 100 ? 5 : 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, []);

  const getMessage = () => {
    if (percentage === 100) return "Parfait ! Tu es un champion ! 🏆";
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${
              passed
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
            }`}
          >
            <div>
              <motion.div 
                className="text-4xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {percentage}%
              </motion.div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold mb-2">{getMessage()}</h3>
            <p className="text-muted-foreground">
              {correctAnswers} sur {totalQuestions} réponses correctes
            </p>
          </motion.div>

          {/* XP Earned Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">+{xpEarned} XP gagnés !</span>
          </motion.div>
        </div>

        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
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
        </motion.div>

        {!passed && (
          <motion.div 
            className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-center">
              Score minimum requis : 70%. Continue de t'entraîner ! 💪
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button onClick={onRetry} className="w-full" variant={passed ? "outline" : "default"}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer le quiz
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}