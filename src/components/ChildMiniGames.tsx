import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, Timer, Trophy, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options: any;
  points: number;
}

interface ChildMiniGamesProps {
  studentId: string;
  niveauScolaire: string;
  onXPGain?: (amount: number) => void;
}

type GameState = "menu" | "playing" | "result";

export function ChildMiniGames({ studentId, niveauScolaire, onXPGain }: ChildMiniGamesProps) {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [totalXP, setTotalXP] = useState(0);

  const QUIZ_SIZE = 5;
  const TIME_PER_QUESTION = 15; // seconds

  // Timer
  useEffect(() => {
    if (gameState !== "playing" || answerResult) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, answerResult]);

  const loadRandomQuestions = async () => {
    setLoading(true);
    try {
      // Get lessons for this level
      const { data: lessonIds } = await supabase
        .from("lessons")
        .select("id")
        .eq("niveau_scolaire", niveauScolaire as any);

      if (!lessonIds || lessonIds.length === 0) {
        setLoading(false);
        return;
      }

      const ids = lessonIds.map(l => l.id);

      // Get random questions from quiz_questions_safe view
      const { data: questionsData } = await supabase
        .from("quiz_questions" as any)
        .select("id, question, type, options, points")
        .in("lesson_id", ids)
        .limit(20);

      if (questionsData && questionsData.length > 0) {
        const shuffled = (questionsData as any[]).sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, QUIZ_SIZE) as QuizQuestion[]);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    await loadRandomQuestions();
    setCurrentIndex(0);
    setScore(0);
    setTotalXP(0);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setTimeLeft(TIME_PER_QUESTION);
    setGameState("playing");
  };

  const handleTimeout = () => {
    // Time's up - count as wrong
    setAnswerResult({ correct: false, correctAnswer: "⏰ Temps écoulé !" });
    setTimeout(() => nextQuestion(), 1500);
  };

  const handleAnswer = async (answer: string) => {
    if (answerResult || selectedAnswer) return;
    setSelectedAnswer(answer);

    try {
      const { data } = await supabase.rpc("verify_quiz_answer", {
        p_question_id: questions[currentIndex].id,
        p_answer: answer,
      });

      const result = data as any;
      const correct = result?.is_correct || false;
      const points = correct ? questions[currentIndex].points : 0;
      const bonusTime = correct && timeLeft > 10 ? 5 : 0; // Bonus XP for fast answers

      setAnswerResult({
        correct,
        correctAnswer: result?.correct_answer || "",
      });

      if (correct) {
        setScore(s => s + 1);
        setTotalXP(x => x + points + bonusTime);
      }

      setTimeout(() => nextQuestion(), 1500);
    } catch (error) {
      console.error("Error verifying answer:", error);
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameState("result");
      if (totalXP > 0) {
        onXPGain?.(totalXP);
      }
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setTimeLeft(TIME_PER_QUESTION);
  };

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion?.options as string[] || [];

  if (gameState === "menu") {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Mini-jeux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Quiz Éclair ⚡</h3>
            <p className="text-muted-foreground mb-6">
              {QUIZ_SIZE} questions, {TIME_PER_QUESTION} secondes chacune.<br />
              Réponds vite pour gagner des bonus XP !
            </p>
            <Button onClick={startGame} disabled={loading} size="lg" className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Lancer le quiz !
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (gameState === "result") {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? "🏆" : percentage >= 50 ? "👏" : "💪";

    return (
      <Card className="border-primary/20">
        <CardContent className="py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="text-6xl">{emoji}</div>
            <h3 className="text-2xl font-bold text-foreground">Résultat</h3>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{score}/{questions.length}</p>
                <p className="text-sm text-muted-foreground">Bonnes réponses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{totalXP}</p>
                <p className="text-sm text-muted-foreground">XP gagnés</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={startGame} className="gap-2">
                <Zap className="h-4 w-4" />
                Rejouer
              </Button>
              <Button variant="outline" onClick={() => setGameState("menu")}>
                Menu
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Playing state
  return (
    <Card className="border-primary/20">
      <CardContent className="py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {currentIndex + 1}/{questions.length}
          </Badge>
          <div className={`flex items-center gap-1 font-mono font-bold text-lg ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>
            <Timer className="h-4 w-4" />
            {timeLeft}s
          </div>
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3 w-3" />
            {score} pts
          </Badge>
        </div>

        {/* Progress */}
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-center py-4 text-foreground">
              {currentQuestion?.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option: string, i: number) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = answerResult?.correctAnswer === option;
                const isWrong = isSelected && answerResult && !answerResult.correct;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full h-auto py-3 px-4 text-left justify-start gap-2 transition-all ${
                        isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700" :
                        isWrong ? "border-destructive bg-destructive/10 text-destructive" :
                        isSelected ? "border-primary bg-primary/10" : ""
                      }`}
                      onClick={() => handleAnswer(option)}
                      disabled={!!answerResult}
                    >
                      {isCorrect && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                      {isWrong && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                      <span>{option}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
