import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: any;
  correct_answer: string;
  explanation?: string;
  points: number;
}

interface QuizQuestionProps {
  question: Question;
  selectedAnswer?: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export function QuizQuestion({ question, selectedAnswer, onAnswer }: QuizQuestionProps) {
  const [tempAnswer, setTempAnswer] = useState(selectedAnswer || "");
  const [showFeedback, setShowFeedback] = useState(!!selectedAnswer);

  // Synchroniser les états quand la question change
  useEffect(() => {
    setTempAnswer(selectedAnswer || "");
    setShowFeedback(!!selectedAnswer);
  }, [question.id, selectedAnswer]);

  const handleSubmit = () => {
    if (!tempAnswer) return;
    
    const isCorrect = tempAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
    onAnswer(tempAnswer, isCorrect);
    setShowFeedback(true);
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <RadioGroup value={tempAnswer} onValueChange={setTempAnswer}>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
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

  const isCorrect = tempAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-lg font-medium">{question.question}</p>
        <span className="text-sm text-muted-foreground">{question.points} points</span>
      </div>

      <div className="space-y-4">
        {renderQuestionInput()}

        {!showFeedback && tempAnswer && (
          <Button onClick={handleSubmit}>Valider la réponse</Button>
        )}

        {showFeedback && (
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
                    La bonne réponse était : <strong>{question.correct_answer}</strong>
                  </p>
                )}
                {question.explanation && (
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}