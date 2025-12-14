import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, Loader2, Sparkles, BookOpen, HelpCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuickAIChatProps {
  studentId: string;
  studentName: string;
}

const quickActions = [
  { 
    icon: HelpCircle, 
    label: "Explique-moi", 
    prompt: "Explique-moi comme si j'avais 6 ans : " 
  },
  { 
    icon: Sparkles, 
    label: "Donne un exemple", 
    prompt: "Donne-moi un exemple simple de : " 
  },
  { 
    icon: FileText, 
    label: "Fais un résumé", 
    prompt: "Fais-moi un résumé court et simple de : " 
  },
  { 
    icon: BookOpen, 
    label: "Quiz rapide", 
    prompt: "Pose-moi 3 questions faciles sur : " 
  },
];

export function QuickAIChat({ studentId, studentName }: QuickAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageContent: string, mode?: string) => {
    if (!messageContent.trim() || loading) return;

    const userMessage: Message = { role: "user", content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSelectedAction(null);
    setLoading(true);

    // Determine mode from quick action prefix
    let aiMode = mode;
    if (!aiMode) {
      if (messageContent.startsWith("Explique-moi comme si j'avais 6 ans")) {
        aiMode = "explain_simple";
      } else if (messageContent.startsWith("Donne-moi un exemple")) {
        aiMode = "give_example";
      } else if (messageContent.startsWith("Fais-moi un résumé")) {
        aiMode = "make_summary";
      } else if (messageContent.startsWith("Pose-moi 3 questions")) {
        aiMode = "quick_quiz";
      }
    }

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          messages: [...messages, userMessage],
          studentId,
          studentName,
          mode: aiMode
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Oups ! Je n'ai pas pu répondre. Réessaie dans quelques instants. 😊"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setSelectedAction(prompt);
    setInput(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Card className="border-primary/20 h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Assistant IA - Oumi
          <span className="text-sm font-normal text-muted-foreground ml-2">
            Ton compagnon d'apprentissage
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="p-4 border-b bg-muted/30">
            <p className="text-sm text-muted-foreground mb-3">Actions rapides :</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  className={`gap-2 ${selectedAction === action.prompt ? 'border-primary bg-primary/5' : ''}`}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Salut {studentName} ! 👋
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Je suis Oumi, ton assistant d'apprentissage. 
                  Pose-moi n'importe quelle question sur tes leçons !
                </p>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`flex gap-3 mb-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-accent/20 text-accent">
                      {studentName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 mb-4"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question ici..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || loading} size="icon">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
