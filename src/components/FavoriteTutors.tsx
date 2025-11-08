import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, Mail, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FavoriteTutor {
  id: string;
  tutor_id: string;
  tutors: {
    id: string;
    tarif_horaire_eur: number;
    matieres_enseignees: string[];
    note_moyenne: number;
    user_id: string;
    profiles: {
      prenom: string;
      nom: string;
    } | null;
  };
}

export default function FavoriteTutors() {
  const [favorites, setFavorites] = useState<FavoriteTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("favorite_tutors")
        .select(`
          id,
          tutor_id,
          tutors (
            id,
            tarif_horaire_eur,
            matieres_enseignees,
            note_moyenne,
            user_id,
            profiles:user_id (
              prenom,
              nom
            )
          )
        `)
        .eq("parent_id", user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorite_tutors")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      toast({
        title: "Tuteur retiré des favoris",
        description: "Le tuteur a été retiré de vos favoris"
      });

      fetchFavorites();
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer ce tuteur des favoris",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          Mes Tuteurs Favoris
        </CardTitle>
        <CardDescription>
          Vos tuteurs préférés pour une réservation rapide
        </CardDescription>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Aucun tuteur favori pour le moment</p>
            <Button 
              variant="link" 
              onClick={() => navigate("/tutors")}
              className="mt-2"
            >
              Découvrir les tuteurs
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {fav.tutors.profiles?.prenom} {fav.tutors.profiles?.nom}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {fav.tutors.matieres_enseignees.join(", ")}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-medium">
                      {fav.tutors.tarif_horaire_eur} €/h
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {fav.tutors.note_moyenne.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/tutor/${fav.tutor_id}`)}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Réserver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(fav.id)}
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}