import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: any;
  correct_answer?: string;
  explanation?: string;
  points: number;
}

interface VerifiedResult {
  is_correct: boolean;
  correct_answer: string;
  explanation: string | null;
}

interface QuizQuestionProps {
  question: Question;
  selectedAnswer?: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export function QuizQuestion({ question, selectedAnswer, onAnswer }: QuizQuestionProps) {
  const [tempAnswer, setTempAnswer] = useState(selectedAnswer || "");
  const [showFeedback, setShowFeedback] = useState(!!selectedAnswer);
  const [verifiedAnswer, setVerifiedAnswer] = useState<VerifiedResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Synchroniser les états quand la question change
  useEffect(() => {
    setTempAnswer(selectedAnswer || "");
    setShowFeedback(!!selectedAnswer);
    setVerifiedAnswer(null);
  }, [question.id, selectedAnswer]);

  const handleSubmit = async () => {
    if (!tempAnswer) return;
    setVerifying(true);

    try {
      // Verify answer server-side via RPC
      const { data, error } = await supabase.rpc('verify_quiz_answer', {
        p_question_id: question.id,
        p_answer: tempAnswer,
      });

      if (error || !data) {
        console.error("Error verifying answer:", error);
        return;
      }

      const result = data as unknown as { is_correct: boolean; correct_answer: string; explanation: string | null; points: number };
      setVerifiedAnswer({
        correct_answer: result.correct_answer,
        explanation: result.explanation,
        is_correct: result.is_correct,
      });
      onAnswer(tempAnswer, result.is_correct);
      setShowFeedback(true);
    } finally {
      setVerifying(false);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <RadioGroup value={tempAnswer} onValueChange={setTempAnswer}>
            <div className="space-y-3">
              {question.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "true_false":
        return (
          <RadioGroup value={tempAnswer} onValueChange={setTempAnswer}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Vrai" id="true" />
                <Label htmlFor="true" className="cursor-pointer">
                  Vrai
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Faux" id="false" />
                <Label htmlFor="false" className="cursor-pointer">
                  Faux
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      case "fill_blank":
        return (
          <Input
            value={tempAnswer}
            onChange={(e) => setTempAnswer(e.target.value)}
            placeholder="Tapez votre réponse..."
            className="max-w-md"
          />
        );

      default:
        return null;
    }
  };

  const isCorrect = verifiedAnswer?.is_correct ?? false;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-lg font-medium">{question.question}</p>
        <span className="text-sm text-muted-foreground">{question.points} points</span>
      </div>

      <div className="space-y-4">
        {renderQuestionInput()}

        {!showFeedback && tempAnswer && (
          <Button onClick={handleSubmit} disabled={verifying}>
            {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Valider la réponse
          </Button>
        )}

        {showFeedback && verifiedAnswer && (
          <div
            className={`p-4 rounded-lg border-2 ${
              isCorrect
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium mb-1">
                  {isCorrect ? "Bonne réponse !" : "Réponse incorrecte"}
                </p>
                {!isCorrect && (
                  <p className="text-sm mb-2">
                    La bonne réponse était : <strong>{verifiedAnswer.correct_answer}</strong>
                  </p>
                )}
                {verifiedAnswer.explanation && (
                  <p className="text-sm text-muted-foreground">{verifiedAnswer.explanation}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
