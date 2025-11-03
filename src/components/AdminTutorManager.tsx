import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, ArrowUpDown, CheckCircle, XCircle, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Tutor {
  id: string;
  user_id: string;
  bio: string | null;
  tarif_horaire_eur: number;
  matieres_enseignees: string[];
  diplomes: string[];
  annees_experience: number;
  statut_approbation: string;
  note_moyenne: number;
  nombre_sessions: number;
  created_at: string;
  profiles: {
    prenom: string;
    nom: string;
    email: string;
  };
}

interface AdminTutorManagerProps {
  tutors: Tutor[];
  onUpdate: () => void;
}

export default function AdminTutorManager({ tutors, onUpdate }: AdminTutorManagerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<'nom' | 'tarif_horaire_eur' | 'created_at' | 'note_moyenne'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);
  const [batchActionDialogOpen, setBatchActionDialogOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'approve' | 'reject', tutorId: string } | null>(null);

  const handleSort = (field: 'nom' | 'tarif_horaire_eur' | 'created_at' | 'note_moyenne') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTutors = tutors
    .filter(tutor => {
      const matchesSearch = 
        tutor.profiles?.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.profiles?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.matieres_enseignees?.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortField === 'nom') {
        const nameA = `${a.profiles?.prenom} ${a.profiles?.nom}`;
        const nameB = `${b.profiles?.prenom} ${b.profiles?.nom}`;
        compareValue = nameA.localeCompare(nameB);
      } else if (sortField === 'created_at') {
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'tarif_horaire_eur') {
        compareValue = a.tarif_horaire_eur - b.tarif_horaire_eur;
      } else if (sortField === 'note_moyenne') {
        compareValue = a.note_moyenne - b.note_moyenne;
      }
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

  const toggleTutorSelection = (id: string) => {
    setSelectedTutors(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTutors.length === filteredAndSortedTutors.length && filteredAndSortedTutors.length > 0) {
      setSelectedTutors([]);
    } else {
      setSelectedTutors(filteredAndSortedTutors.map(t => t.id));
    }
  };

  const confirmAction = (type: 'approve' | 'reject', tutorId: string) => {
    setPendingAction({ type, tutorId });
    setActionDialogOpen(true);
  };

  const handleSingleAction = async () => {
    if (!pendingAction) return;

    try {
      const { error } = await supabase
        .from("tutors")
        .update({ statut_approbation: pendingAction.type === 'approve' ? "approuve" : "refuse" })
        .eq("id", pendingAction.tutorId);

      if (error) throw error;

      toast({
        title: pendingAction.type === 'approve' ? "Tuteur approuvé" : "Tuteur refusé",
        description: `Le tuteur a été ${pendingAction.type === 'approve' ? 'approuvé' : 'refusé'} avec succès`
      });

      setActionDialogOpen(false);
      setPendingAction(null);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBatchAction = async () => {
    if (!batchAction) return;

    try {
      if (batchAction === 'delete') {
        const { error } = await supabase
          .from('tutors')
          .delete()
          .in('id', selectedTutors);

        if (error) throw error;

        toast({
          title: "Tuteurs supprimés",
          description: `${selectedTutors.length} tuteur(s) supprimé(s) avec succès`
        });
      } else {
        const status = batchAction === 'approve' ? 'approuve' : 'refuse';
        const { error } = await supabase
          .from('tutors')
          .update({ statut_approbation: status })
          .in('id', selectedTutors);

        if (error) throw error;

        toast({
          title: `Tuteurs ${batchAction === 'approve' ? 'approuvés' : 'refusés'}`,
          description: `${selectedTutors.length} tuteur(s) ${batchAction === 'approve' ? 'approuvé(s)' : 'refusé(s)'} avec succès`
        });
      }

      setSelectedTutors([]);
      setBatchActionDialogOpen(false);
      setBatchAction(null);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openBatchAction = (action: 'approve' | 'reject' | 'delete') => {
    setBatchAction(action);
    setBatchActionDialogOpen(true);
  };

  const viewTutorDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approuve':
        return <Badge variant="default">Approuvé</Badge>;
      case 'refuse':
        return <Badge variant="destructive">Refusé</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des tuteurs</CardTitle>
        <CardDescription>
          Approuver ou rejeter les demandes de tuteurs ({filteredAndSortedTutors.length} / {tutors.length} tuteur{tutors.length !== 1 ? 's' : ''})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Bar and Batch Actions */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou matières..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {selectedTutors.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => openBatchAction('approve')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approuver ({selectedTutors.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openBatchAction('reject')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Refuser ({selectedTutors.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openBatchAction('delete')}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer ({selectedTutors.length})
              </Button>
            </div>
          )}
        </div>

        {filteredAndSortedTutors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "Aucun tuteur ne correspond à votre recherche" : "Aucun tuteur enregistré"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedTutors.length === filteredAndSortedTutors.length && filteredAndSortedTutors.length > 0}
                    onChange={toggleSelectAll}
                    className="cursor-pointer h-4 w-4"
                    title="Tout sélectionner"
                  />
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('nom')} className="font-semibold">
                    Nom
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Matières</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('tarif_horaire_eur')} className="font-semibold">
                    Tarif/h
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('note_moyenne')} className="font-semibold">
                    Note
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="font-semibold">
                    Date
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTutors.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedTutors.includes(tutor.id)}
                      onChange={() => toggleTutorSelection(tutor.id)}
                      className="cursor-pointer h-4 w-4"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {tutor.profiles?.prenom} {tutor.profiles?.nom}
                  </TableCell>
                  <TableCell>{tutor.profiles?.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tutor.matieres_enseignees?.slice(0, 2).map((matiere, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {matiere}
                        </Badge>
                      ))}
                      {tutor.matieres_enseignees?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{tutor.matieres_enseignees.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{tutor.tarif_horaire_eur}€</TableCell>
                  <TableCell>
                    <Badge variant={tutor.note_moyenne >= 4 ? "default" : "secondary"}>
                      ⭐ {tutor.note_moyenne.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(tutor.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(tutor.statut_approbation)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewTutorDetails(tutor)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {tutor.statut_approbation === "en_attente" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => confirmAction('approve', tutor.id)}
                            className="text-success"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => confirmAction('reject', tutor.id)}
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Single Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === 'approve' ? 'Approuver le tuteur' : 'Refuser le tuteur'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {pendingAction?.type === 'approve' ? 'approuver' : 'refuser'} ce tuteur ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSingleAction}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Action Dialog */}
      <AlertDialog open={batchActionDialogOpen} onOpenChange={setBatchActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {batchAction === 'delete' ? 'Supprimer les tuteurs sélectionnés' :
               batchAction === 'approve' ? 'Approuver les tuteurs sélectionnés' :
               'Refuser les tuteurs sélectionnés'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {batchAction === 'delete' ? 'supprimer' :
               batchAction === 'approve' ? 'approuver' : 'refuser'} {selectedTutors.length} tuteur(s) ?
              {batchAction === 'delete' && ' Cette action est irréversible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBatchAction}
              className={batchAction === 'delete' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tutor Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Détails du tuteur</DialogTitle>
            <DialogDescription>
              Informations complètes sur le tuteur
            </DialogDescription>
          </DialogHeader>
          {selectedTutor && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Informations personnelles</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nom :</strong> {selectedTutor.profiles?.prenom} {selectedTutor.profiles?.nom}</p>
                    <p><strong>Email :</strong> {selectedTutor.profiles?.email}</p>
                    <p><strong>Tarif horaire :</strong> {selectedTutor.tarif_horaire_eur}€</p>
                    <p><strong>Expérience :</strong> {selectedTutor.annees_experience} ans</p>
                    <p><strong>Note moyenne :</strong> {selectedTutor.note_moyenne.toFixed(1)}/5</p>
                    <p><strong>Sessions complétées :</strong> {selectedTutor.nombre_sessions}</p>
                  </div>
                </div>

                {selectedTutor.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">Biographie</h3>
                    <p className="text-sm text-muted-foreground">{selectedTutor.bio}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Matières enseignées</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTutor.matieres_enseignees?.map((matiere, idx) => (
                      <Badge key={idx} variant="outline">{matiere}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Diplômes</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedTutor.diplomes?.map((diplome, idx) => (
                      <li key={idx}>{diplome}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Statut</h3>
                  {getStatusBadge(selectedTutor.statut_approbation)}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
