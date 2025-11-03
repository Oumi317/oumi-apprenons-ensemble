import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, ArrowUpDown, CheckCircle, XCircle, Trash2, Eye, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTutor, setNewTutor] = useState({
    email: '',
    password: '',
    prenom: '',
    nom: '',
    bio: '',
    matieres_enseignees: '',
    diplomes: '',
    tarif_horaire_eur: '',
    annees_experience: '',
  });

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

  const handleAddTutor = async () => {
    if (!newTutor.email || !newTutor.password || !newTutor.prenom || !newTutor.nom) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-tutor', {
        body: {
          email: newTutor.email,
          password: newTutor.password,
          prenom: newTutor.prenom,
          nom: newTutor.nom,
          bio: newTutor.bio || null,
          matieres_enseignees: newTutor.matieres_enseignees.split(',').map(m => m.trim()).filter(m => m),
          diplomes: newTutor.diplomes.split(',').map(d => d.trim()).filter(d => d),
          tarif_horaire_eur: parseFloat(newTutor.tarif_horaire_eur) || 0,
          annees_experience: parseInt(newTutor.annees_experience) || 0,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Tuteur créé",
        description: "Le tuteur a été créé avec succès"
      });

      setAddDialogOpen(false);
      setNewTutor({
        email: '',
        password: '',
        prenom: '',
        nom: '',
        bio: '',
        matieres_enseignees: '',
        diplomes: '',
        tarif_horaire_eur: '',
        annees_experience: '',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un tuteur
          </Button>
          
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

      {/* Add Tutor Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Ajouter un tuteur</DialogTitle>
            <DialogDescription>
              Créer un nouveau compte tuteur
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={newTutor.prenom}
                    onChange={(e) => setNewTutor({ ...newTutor, prenom: e.target.value })}
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={newTutor.nom}
                    onChange={(e) => setNewTutor({ ...newTutor, nom: e.target.value })}
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTutor.email}
                  onChange={(e) => setNewTutor({ ...newTutor, email: e.target.value })}
                  placeholder="jean.dupont@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newTutor.password}
                  onChange={(e) => setNewTutor({ ...newTutor, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={newTutor.bio}
                  onChange={(e) => setNewTutor({ ...newTutor, bio: e.target.value })}
                  placeholder="Présentation du tuteur..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matieres">Matières enseignées (séparées par des virgules)</Label>
                <Input
                  id="matieres"
                  value={newTutor.matieres_enseignees}
                  onChange={(e) => setNewTutor({ ...newTutor, matieres_enseignees: e.target.value })}
                  placeholder="Mathématiques, Français, Sciences"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diplomes">Diplômes (séparés par des virgules)</Label>
                <Input
                  id="diplomes"
                  value={newTutor.diplomes}
                  onChange={(e) => setNewTutor({ ...newTutor, diplomes: e.target.value })}
                  placeholder="Master Mathématiques, CAPES"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tarif">Tarif horaire (€)</Label>
                  <Input
                    id="tarif"
                    type="number"
                    value={newTutor.tarif_horaire_eur}
                    onChange={(e) => setNewTutor({ ...newTutor, tarif_horaire_eur: e.target.value })}
                    placeholder="30"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Années d'expérience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={newTutor.annees_experience}
                    onChange={(e) => setNewTutor({ ...newTutor, annees_experience: e.target.value })}
                    placeholder="5"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleAddTutor} disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer le tuteur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
