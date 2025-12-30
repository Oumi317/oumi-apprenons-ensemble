import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, Gift, Users, Award, Share2, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReferralCode {
  id: string;
  code: string;
  reward_months: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface ReferralReward {
  id: string;
  reward_type: string;
  reward_value: number;
  applied_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function ReferralSystem() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [myCodes, setMyCodes] = useState<ReferralCode[]>([]);
  const [myReferrals, setMyReferrals] = useState<Referral[]>([]);
  const [myRewards, setMyRewards] = useState<ReferralReward[]>([]);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [codesResult, referralsResult, rewardsResult] = await Promise.all([
        supabase
          .from("referral_codes")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("referrals")
          .select("*")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("referral_rewards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      if (codesResult.data) setMyCodes(codesResult.data);
      if (referralsResult.data) setMyReferrals(referralsResult.data);
      if (rewardsResult.data) setMyRewards(rewardsResult.data);
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      // Generate unique code
      const { data: codeData, error: codeError } = await supabase
        .rpc("generate_referral_code");

      if (codeError) throw codeError;

      // Insert new referral code
      const { error: insertError } = await supabase
        .from("referral_codes")
        .insert({
          owner_id: user.id,
          code: codeData,
          reward_months: 1
        });

      if (insertError) throw insertError;

      toast.success("Code de parrainage généré !");
      fetchData();
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Erreur lors de la génération du code");
    } finally {
      setGenerating(false);
    }
  };

  const applyReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      toast.error("Veuillez entrer un code");
      return;
    }

    setApplying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { data, error } = await supabase
        .rpc("apply_referral", { 
          p_code: referralCodeInput.toUpperCase(),
          p_user_id: user.id 
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; reward_months?: number };

      if (result.success) {
        toast.success(`Code appliqué ! Vous bénéficiez de ${result.reward_months} mois gratuit(s)`);
        setReferralCodeInput("");
        fetchData();
      } else {
        toast.error(result.error || "Code invalide");
      }
    } catch (error) {
      console.error("Error applying code:", error);
      toast.error("Erreur lors de l'application du code");
    } finally {
      setApplying(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success("Code copié !");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  const shareCode = async (code: string) => {
    const shareData = {
      title: "Rejoignez-moi sur EduKids !",
      text: `Utilisez mon code de parrainage ${code} pour obtenir 1 mois gratuit !`,
      url: window.location.origin + "/auth?referral=" + code
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        copyToClipboard(code);
      }
    } else {
      copyToClipboard(code);
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case "free_month": return "Mois gratuit";
      case "discount": return "Réduction";
      case "credits": return "Crédits";
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{myReferrals.length}</p>
                  <p className="text-sm text-muted-foreground">Filleuls</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Gift className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {myRewards.filter(r => !r.applied_at).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Récompenses en attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {myRewards.reduce((acc, r) => acc + Number(r.reward_value), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Mois gagnés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="share" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="share">Partager</TabsTrigger>
          <TabsTrigger value="apply">Utiliser un code</TabsTrigger>
          <TabsTrigger value="rewards">Mes récompenses</TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Partagez et gagnez
              </CardTitle>
              <CardDescription>
                Invitez vos amis et recevez 1 mois gratuit pour chaque inscription réussie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateCode} disabled={generating} className="w-full">
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Gift className="h-4 w-4 mr-2" />
                )}
                Générer un nouveau code
              </Button>

              {myCodes.length > 0 && (
                <div className="space-y-3">
                  <Label>Mes codes de parrainage</Label>
                  {myCodes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center gap-3">
                        <code className="text-lg font-mono font-bold text-primary">
                          {code.code}
                        </code>
                        <Badge variant={code.is_active ? "default" : "secondary"}>
                          {code.current_uses} / {code.max_uses || "∞"} utilisations
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          {copied === code.code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareCode(code.code)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referrals list */}
          {myReferrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mes filleuls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {myReferrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm">
                          Inscrit le {new Date(referral.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <Badge variant={referral.status === "completed" ? "default" : "secondary"}>
                        {referral.status === "completed" ? "Validé" : "En attente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Utiliser un code de parrainage</CardTitle>
              <CardDescription>
                Entrez le code d'un ami pour obtenir 1 mois gratuit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral-code">Code de parrainage</Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-code"
                    placeholder="Ex: ABC123XY"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    className="font-mono uppercase"
                  />
                  <Button onClick={applyReferralCode} disabled={applying}>
                    {applying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Appliquer"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Mes récompenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myRewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune récompense pour le moment</p>
                  <p className="text-sm">Parrainez vos amis pour gagner des récompenses !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-amber-500/20">
                          <Gift className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {reward.reward_value} {getRewardTypeLabel(reward.reward_type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Obtenu le {new Date(reward.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <Badge variant={reward.applied_at ? "secondary" : "default"}>
                        {reward.applied_at ? "Utilisé" : "Disponible"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
