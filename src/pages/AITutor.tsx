import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AITutorChat } from "@/components/AITutorChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

interface Student {
  id: string;
  prenom: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export default function AITutor() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    if (!studentId) return;

    try {
      // Load student
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, prenom")
        .eq("id", studentId)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      // Load conversations
      const { data: convData, error: convError } = await supabase
        .from("ai_conversations")
        .select("id, title, updated_at")
        .eq("student_id", studentId)
        .order("updated_at", { ascending: false });

      if (convError) throw convError;
      setConversations(convData);

      // Select first conversation if available
      if (convData && convData.length > 0) {
        setSelectedConversation(convData[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    if (!studentId) return;

    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ student_id: studentId })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer une nouvelle conversation",
        variant: "destructive",
      });
      return;
    }

    setConversations((prev) => [data, ...prev]);
    setSelectedConversation(data.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Élève non trouvé</p>
      </div>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold font-display">Assistant IA pour {student.prenom}</h1>
          <p className="text-muted-foreground mt-2">
            Un assistant intelligent pour l'aider dans ses devoirs
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conversations</span>
                <Button size="icon" variant="ghost" onClick={createNewConversation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune conversation</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conv) => (
                      <Button
                        key={conv.id}
                        variant={selectedConversation === conv.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedConversation(conv.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{conv.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.updated_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 hover:shadow-lg transition-shadow duration-300 rounded-lg">
            <AITutorChat
              studentId={studentId}
              conversationId={selectedConversation}
              onConversationCreated={(id) => {
                setSelectedConversation(id);
                loadData();
              }}
            />
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}