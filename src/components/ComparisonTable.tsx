import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X } from "lucide-react";

export const ComparisonTable = () => {
  const features = [
    { name: "Sessions de tutorat 1-à-1", free: true, pack: true, premium: true },
    { name: "Accès ressources pédagogiques", free: "Limité", pack: true, premium: true },
    { name: "Enregistrement des sessions", free: false, pack: true, premium: true },
    { name: "Rapports de progression", free: "Basique", pack: "Détaillé", premium: "Avancé" },
    { name: "AI Tutor", free: false, pack: false, premium: true },
    { name: "Sessions mensuelles", free: "1", pack: "5", premium: "Illimité" },
    { name: "Support prioritaire", free: false, pack: false, premium: true },
    { name: "Annulation gratuite", free: "24h avant", pack: "24h avant", premium: "Flexible" },
    { name: "Tuteurs disponibles", free: "Standard", pack: "Premium", premium: "VIP" },
    { name: "Ateliers en groupe", free: false, pack: false, premium: true },
  ];

  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle className="h-5 w-5 text-success mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm text-center block">{value}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison des formules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-2 font-semibold">Fonctionnalité</th>
                <th className="text-center py-4 px-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-semibold">Essai</span>
                    <Badge variant="secondary" className="bg-muted">Gratuit</Badge>
                  </div>
                </th>
                <th className="text-center py-4 px-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-semibold">Pack 5</span>
                    <Badge className="bg-primary/10 text-primary">99€</Badge>
                  </div>
                </th>
                <th className="text-center py-4 px-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-semibold">Premium</span>
                    <Badge className="bg-secondary/10 text-secondary">249€/mois</Badge>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-2 text-sm">{feature.name}</td>
                  <td className="py-4 px-2">{renderCell(feature.free)}</td>
                  <td className="py-4 px-2">{renderCell(feature.pack)}</td>
                  <td className="py-4 px-2">{renderCell(feature.premium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
