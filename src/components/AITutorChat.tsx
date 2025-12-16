import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Send, Bot, User, Loader2, Sparkles, BookOpen, Lightbulb, FileText, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type AIMode = "explain_simple" | "give_example" | "make_summary" | "quick_quiz" | null;

interface AITutorChatProps {
  studentId: string;
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

const quickActions = [
  { mode: "explain_simple" as AIMode, icon: BookOpen, label: "Explique simplement", color: "text-blue-500" },
  { mode: "give_example" as AIMode, icon: Lightbulb, label: "Donne un exemple", color: "text-yellow-500" },
  { mode: "make_summary" as AIMode, icon: FileText, label: "Résumé", color: "text-green-500" },
  { mode: "quick_quiz" as AIMode, icon: HelpCircle, label: "Quiz rapide", color: "text-purple-500" },
];

export function AITutorChat({ studentId, conversationId, onConversationCreated }: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [selectedMode, setSelectedMode] = useState<AIMode>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentConversationId) {
      loadConversation();
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadConversation = async () => {
    if (!currentConversationId) return;

    const { data, error } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading conversation:", error);
      return;
    }

    setMessages(data as Message[]);
  };

  const createConversation = async () => {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ student_id: studentId })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
      return null;
    }

    setCurrentConversationId(data.id);
    onConversationCreated?.(data.id);
    return data.id;
  };

  const sendMessage = async (customMessage?: string, mode?: AIMode) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let convId = currentConversationId;
      if (!convId) {
        convId = await createConversation();
        if (!convId) return;
      }

      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          messages: [...messages, userMessage],
          conversationId: convId,
          studentId,
          mode: mode || selectedMode,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedMode(null);
    }
  };

  const handleQuickAction = (mode: AIMode, label: string) => {
    setSelectedMode(mode);
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAssistantMessage) {
      sendMessage(`${label} : ${lastAssistantMessage.content.slice(0, 100)}...`, mode);
    } else {
      setInput(`${label} : `);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Assistant IA - Aide aux devoirs
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Bot className="h-16 w-16 text-muted-foreground mb-4" />
              </motion.div>
              <h3 className="text-lg font-medium mb-2">Bonjour ! 👋</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Je suis ton assistant pédagogique. Pose-moi tes questions sur tes devoirs,
                je suis là pour t'aider à comprendre et progresser !
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-sm">
                {quickActions.map((action) => (
                  <Button
                    key={action.mode}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setInput(`${action.label} : `)}
                  >
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions Bar */}
        {messages.length > 0 && (
          <div className="border-t px-4 py-2 flex gap-2 overflow-x-auto">
            {quickActions.map((action) => (
              <Button
                key={action.mode}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 text-xs"
                onClick={() => handleQuickAction(action.mode, action.label)}
                disabled={isLoading}
              >
                <action.icon className={`h-3 w-3 mr-1 ${action.color}`} />
                {action.label}
              </Button>
            ))}
          </div>
        )}

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pose ta question ici..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}