import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Riddle {
  question: string;
  answer: string;
  hint: string;
  category: "maths" | "culture";
  xp: number;
}

const riddles: Riddle[] = [
  { question: "Je suis un nombre. Si tu m'ajoutes 15, tu obtiens 42. Qui suis-je ?", answer: "27", hint: "42 - 15 = ?", category: "maths", xp: 10 },
  { question: "Combien de côtés a un hexagone ?", answer: "6", hint: "Hexa = six en grec", category: "maths", xp: 10 },
  { question: "Quel est le plus grand océan du monde ?", answer: "pacifique", hint: "Il sépare l'Asie de l'Amérique", category: "culture", xp: 15 },
  { question: "Combien font 7 × 8 ?", answer: "56", hint: "7 × 8 = 7 × (10 - 2)", category: "maths", xp: 10 },
  { question: "Quelle est la capitale de l'Italie ?", answer: "rome", hint: "Le Colisée s'y trouve", category: "culture", xp: 15 },
  { question: "Si un triangle a des angles de 90° et 45°, quel est le troisième angle ?", answer: "45", hint: "La somme des angles d'un triangle = 180°", category: "maths", xp: 15 },
  { question: "Quel gaz les plantes absorbent-elles pour la photosynthèse ?", answer: "co2", hint: "Dioxyde de ...", category: "culture", xp: 15 },
  { question: "Combien de minutes y a-t-il dans 2 heures et demie ?", answer: "150", hint: "2h = 120 min, + 30 min", category: "maths", xp: 10 },
  { question: "Quel est le plus long fleuve de France ?", answer: "loire", hint: "Il traverse Tours et Nantes", category: "culture", xp: 15 },
  { question: "Quel est le résultat de 144 ÷ 12 ?", answer: "12", hint: "12 × 12 = ?", category: "maths", xp: 10 },
  { question: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?", answer: "1969", hint: "Neil Armstrong, mission Apollo 11", category: "culture", xp: 20 },
  { question: "Combien de faces a un cube ?", answer: "6", hint: "Comme un dé", category: "maths", xp: 10 },
  { question: "Quel animal est le symbole de la France ?", answer: "coq", hint: "Il chante le matin", category: "culture", xp: 10 },
  { question: "Si j'ai 3 douzaines d'œufs, combien d'œufs ai-je ?", answer: "36", hint: "1 douzaine = 12", category: "maths", xp: 10 },
  { question: "Quel est le plus petit continent ?", answer: "oceanie", hint: "L'Australie en fait partie", category: "culture", xp: 15 },
  { question: "Quel est le périmètre d'un carré de côté 9 cm ?", answer: "36", hint: "Périmètre = 4 × côté", category: "maths", xp: 10 },
  { question: "Qui a peint la Joconde ?", answer: "leonard de vinci", hint: "Un artiste italien de la Renaissance", category: "culture", xp: 15 },
  { question: "Combien vaut la racine carrée de 81 ?", answer: "9", hint: "9 × 9 = ?", category: "maths", xp: 15 },
];

interface ChildRiddleProps {
  onXPGain?: (amount: number) => void;
}

export function ChildRiddle({ onXPGain }: ChildRiddleProps) {
  const todayIndex = useMemo(() => {
    const d = new Date();
    return (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % riddles.length;
  }, []);

  const riddle = riddles[todayIndex];
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const normalize = (s: string) => s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    const isCorrect = normalize(userAnswer) === normalize(riddle.answer);
    setResult(isCorrect ? "correct" : "wrong");
    if (isCorrect && !xpAwarded) {
      setXpAwarded(true);
      onXPGain?.(riddle.xp);
    }
  };

  return (
    <Card className="border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/30 to-background dark:from-amber-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Énigme du jour
          <Badge variant="outline" className="ml-auto text-xs">
            {riddle.category === "maths" ? "🔢 Maths" : "🌍 Culture"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium text-foreground leading-relaxed">{riddle.question}</p>

        {!showHint && !result && (
          <Button variant="ghost" size="sm" onClick={() => setShowHint(true)} className="text-amber-600 gap-1">
            <Sparkles className="h-3 w-3" /> Indice
          </Button>
        )}

        <AnimatePresence>
          {showHint && !result && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
              className="text-sm text-amber-600 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg p-2">
              💡 {riddle.hint}
            </motion.div>
          )}
        </AnimatePresence>

        {!result ? (
          <div className="flex gap-2">
            <Input placeholder="Ta réponse..." value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && checkAnswer()} className="flex-1" />
            <Button onClick={checkAnswer} disabled={!userAnswer.trim()}>Vérifier</Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
            {result === "correct" ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-100/50 dark:bg-green-900/20 rounded-lg p-3">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Bravo ! C'est la bonne réponse ! +{riddle.xp} XP 🎉</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600 bg-red-100/50 dark:bg-red-900/20 rounded-lg p-3">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Pas tout à fait...</span>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  La réponse était : <span className="font-bold text-foreground">{riddle.answer}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
