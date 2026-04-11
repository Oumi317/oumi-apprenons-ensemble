import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";
import { Loader2, Award } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: any;
  points: number;
}

interface QuizProps {
  lessonId: string;
  studentId: string;
  onComplete?: () => void;
  onXPGain?: (amount: number) => void;
}

export function Quiz({ lessonId, studentId, onComplete, onXPGain }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; is_correct: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, [lessonId]);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from("quiz_questions_safe" as any)
      .select("*")
      .eq("lesson_id", lessonId)
      .order("ordre", { ascending: true });

    if (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le quiz",
        variant: "destructive",
      });
      return;
    }

    setQuestions((data as any[]) || []);
    setLoading(false);
  };

  const handleAnswer = (questionId: string, answer: string, isCorrect: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { answer, is_correct: isCorrect },
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    // Vérifier l'authentification avant de soumettre
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter pour sauvegarder vos résultats",
        variant: "destructive",
      });
      return;
    }

    const score = Object.values(answers).filter((a) => a.is_correct).length;
    const maxScore = questions.length;
    const percentage = (score / maxScore) * 100;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    console.log("Submitting quiz:", { studentId, lessonId, score, maxScore, userId: user.id });

    const { error } = await supabase.from("quiz_attempts").insert({
      student_id: studentId,
      lesson_id: lessonId,
      score,
      max_score: maxScore,
      percentage,
      time_spent_seconds: timeSpent,
      answers,
    });

    if (error) {
      console.error("Error submitting quiz:", error.message, error.code, error.details, error.hint);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les résultats",
        variant: "destructive",
      });
      return;
    }

    setShowResults(true);
    onComplete?.();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Aucun quiz disponible pour cette leçon</p>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <QuizResults
        answers={answers}
        questions={questions}
        onRetry={() => {
          setAnswers({});
          setCurrentQuestionIndex(0);
          setShowResults(false);
        }}
        onXPGain={onXPGain}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const hasAnswered = !!answers[currentQuestion.id];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Quiz - Question {currentQuestionIndex + 1}/{questions.length}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {Object.keys(answers).length}/{questions.length} réponses
          </span>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <QuizQuestion
          key={currentQuestion.id}
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id]?.answer}
          onAnswer={(answer, isCorrect) => handleAnswer(currentQuestion.id, answer, isCorrect)}
        />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Précédent
          </Button>
          <Button onClick={handleNext} disabled={!hasAnswered}>
            {currentQuestionIndex === questions.length - 1 ? "Terminer" : "Suivant"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}