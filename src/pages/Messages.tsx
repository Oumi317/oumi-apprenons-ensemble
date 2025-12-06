import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MessagingPanel } from "@/components/MessagingPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Conversation {
  id: string;
  parent_id: string;
  tutor_id: string;
  last_message_at: string;
  tutor_name?: string;
  parent_name?: string;
  unread_count?: number;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      
      // Set up realtime for new conversations
      const channel = supabase
        .channel('conversations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    } else {
      setCurrentUser(user);
    }
  };

  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          tutor:tutor_id (
            id,
            profiles:user_id (
              prenom,
              nom
            )
          ),
          parent:parent_id (
            prenom,
            nom
          )
        `)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Get unread counts
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv: any) => {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("read", false)
            .neq("sender_id", currentUser.id);

          return {
            ...conv,
            tutor_name: conv.tutor?.profiles
              ? `${conv.tutor.profiles.prenom} ${conv.tutor.profiles.nom}`
              : "Tuteur",
            parent_name: conv.parent
              ? `${conv.parent.prenom} ${conv.parent.nom}`
              : "Parent",
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithUnread);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout showFooter={false}>
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]"
        >
          {/* Conversations List */}
          <Card className="md:col-span-1 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Aucune conversation</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedConversation === conversation.id
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {conversation.tutor_name?.[0] || conversation.parent_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-sm truncate">
                                {conversation.tutor_name || conversation.parent_name}
                              </p>
                              {conversation.unread_count! > 0 && (
                                <Badge
                                  variant="default"
                                  className="bg-primary text-xs h-5 w-5 p-0 flex items-center justify-center"
                                >
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.last_message_at), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Messages Panel */}
          <div className="md:col-span-2">
            <MessagingPanel conversationId={selectedConversation} />
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}
