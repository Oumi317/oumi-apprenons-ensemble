import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, ArrowUpDown, Eye, Trash2, UserX, UserCheck, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Parent {
  id: string;
  user_id: string;
  type_abonnement: string;
  abonnement_actif: boolean;
  created_at: string;
  profiles: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string | null;
  };
  students?: {
    id: string;
    prenom: string;
    niveau_scolaire: string;
  }[];
}

interface AdminUserManagerProps {
  parents: Parent[];
  onUpdate: () => void;
}

export default function AdminUserManager({ parents, onUpdate }: AdminUserManagerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<'nom' | 'created_at' | 'students_count'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<string | null>(null);
  const [batchActionDialogOpen, setBatchActionDialogOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

  const handleSort = (field: 'nom' | 'created_at' | 'students_count') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedParents = parents
    .filter(parent => {
      const matchesSearch = 
        parent.profiles?.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.profiles?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
      } else if (sortField === 'students_count') {
        compareValue = (a.students?.length || 0) - (b.students?.length || 0);
      }
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

  const toggleParentSelection = (id: string) => {
    setSelectedParents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedParents.length === filteredAndSortedParents.length) {
      setSelectedParents([]);
    } else {
      setSelectedParents(filteredAndSortedParents.map(p => p.id));
    }
  };

  const handleSingleAction = async (action: 'activate' | 'deactivate' | 'delete', parentId: string) => {
    try {
      if (action === 'delete') {
        // Delete parent's students first
        const { error: studentsError } = await supabase
          .from("students")
          .delete()
          .eq("parent_id", parents.find(p => p.id === parentId)?.user_id);

        if (studentsError) throw studentsError;

        // Delete parent
        const { error: parentError } = await supabase
          .from("parents")
          .delete()
          .eq("id", parentId);

        if (parentError) throw parentError;

        toast({
          title: "Utilisateur supprimé",
          description: "L'utilisateur et ses enfants ont été supprimés avec succès"
        });
      } else {
        const { error } = await supabase
          .from("parents")
          .update({ abonnement_actif: action === 'activate' })
          .eq("id", parentId);

        if (error) throw error;

        toast({
          title: action === 'activate' ? "Compte activé" : "Compte désactivé",
          description: `Le compte a été ${action === 'activate' ? 'activé' : 'désactivé'} avec succès`
        });
      }

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
    if (!batchAction || selectedParents.length === 0) return;

    try {
      for (const parentId of selectedParents) {
        await handleSingleAction(batchAction, parentId);
      }

      setSelectedParents([]);
      setBatchActionDialogOpen(false);
      setBatchAction(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (abonnement_actif: boolean) => {
    if (abonnement_actif) {
      return <Badge variant="default">Actif</Badge>;
    }
    return <Badge variant="destructive">Désactivé</Badge>;
  };

  const getSubscriptionBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      premium: "default",
      standard: "secondary",
      gratuit: "outline"
    };
    return <Badge variant={variants[type] || "outline"}>{type}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>Gérer les comptes parents et leurs abonnements</CardDescription>
          </div>
          {selectedParents.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setBatchAction('activate');
                  setBatchActionDialogOpen(true);
                }}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Activer ({selectedParents.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBatchAction('deactivate');
                  setBatchActionDialogOpen(true);
                }}
              >
                <UserX className="h-4 w-4 mr-2" />
                Désactiver ({selectedParents.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setBatchAction('delete');
                  setBatchActionDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer ({selectedParents.length})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedParents.length === filteredAndSortedParents.length && filteredAndSortedParents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-input"
                  />
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('nom')} className="h-8 px-2">
                    Nom
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('students_count')} className="h-8 px-2">
                    Enfants
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Abonnement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('created_at')} className="h-8 px-2">
                    Inscription
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedParents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedParents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedParents.includes(parent.id)}
                        onChange={() => toggleParentSelection(parent.id)}
                        className="rounded border-input"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {parent.profiles?.prenom} {parent.profiles?.nom}
                    </TableCell>
                    <TableCell>{parent.profiles?.email}</TableCell>
                    <TableCell>{parent.profiles?.telephone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {parent.students?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{getSubscriptionBadge(parent.type_abonnement)}</TableCell>
                    <TableCell>{getStatusBadge(parent.abonnement_actif)}</TableCell>
                    <TableCell>
                      {new Date(parent.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedParent(parent);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {parent.abonnement_actif ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSingleAction('deactivate', parent.id)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSingleAction('activate', parent.id)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setParentToDelete(parent.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedParent && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                    <p className="text-base">{selectedParent.profiles?.prenom} {selectedParent.profiles?.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{selectedParent.profiles?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-base">{selectedParent.profiles?.telephone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
                    <p className="text-base">{new Date(selectedParent.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type d'abonnement</p>
                    <div className="mt-1">{getSubscriptionBadge(selectedParent.type_abonnement)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statut du compte</p>
                    <div className="mt-1">{getStatusBadge(selectedParent.abonnement_actif)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Enfants ({selectedParent.students?.length || 0})</p>
                  {selectedParent.students && selectedParent.students.length > 0 ? (
                    <div className="space-y-2">
                      {selectedParent.students.map((student) => (
                        <div key={student.id} className="p-3 border rounded-lg">
                          <p className="font-medium">{student.prenom}</p>
                          <p className="text-sm text-muted-foreground">{student.niveau_scolaire}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun enfant enregistré</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprimera également tous ses enfants et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (parentToDelete) {
                  handleSingleAction('delete', parentToDelete);
                  setDeleteDialogOpen(false);
                  setParentToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Action Dialog */}
      <AlertDialog open={batchActionDialogOpen} onOpenChange={setBatchActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {batchAction === 'activate' && 'Activer les comptes sélectionnés'}
              {batchAction === 'deactivate' && 'Désactiver les comptes sélectionnés'}
              {batchAction === 'delete' && 'Supprimer les utilisateurs sélectionnés'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {batchAction === 'activate' && `Vous allez activer ${selectedParents.length} compte(s).`}
              {batchAction === 'deactivate' && `Vous allez désactiver ${selectedParents.length} compte(s).`}
              {batchAction === 'delete' && `Vous allez supprimer ${selectedParents.length} utilisateur(s) et tous leurs enfants. Cette action est irréversible.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBatchAction(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchAction}
              className={batchAction === 'delete' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
