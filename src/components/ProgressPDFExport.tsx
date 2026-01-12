import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2, FileText, Calendar, TrendingUp, Award, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Student {
  id: string;
  prenom: string;
  niveau_scolaire: string;
}

interface ProgressPDFExportProps {
  students: Student[];
}

interface ProgressReport {
  student: Student;
  progress: any[];
  sessions: any[];
  quizzes: any[];
  achievements: any[];
}

export function ProgressPDFExport({ students }: ProgressPDFExportProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("0");
  const [reportData, setReportData] = useState<ProgressReport[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: i.toString(),
      label: format(date, "MMMM yyyy", { locale: fr }),
      start: startOfMonth(date).toISOString(),
      end: endOfMonth(date).toISOString(),
    };
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const monthData = months[parseInt(selectedMonth)];
      const studentIds = selectedStudent === "all" 
        ? students.map(s => s.id) 
        : [selectedStudent];

      // Fetch all data
      const [progressData, sessionsData, quizData, achievementsData] = await Promise.all([
        supabase
          .from("student_progress")
          .select("*, lessons (titre, matiere)")
          .in("etudiant_id", studentIds)
          .gte("date_debut", monthData.start)
          .lte("date_debut", monthData.end),
        supabase
          .from("sessions_tutorat")
          .select("*, tutors (profiles (prenom, nom))")
          .in("etudiant_id", studentIds)
          .gte("date_heure_debut", monthData.start)
          .lte("date_heure_debut", monthData.end)
          .eq("statut", "completee"),
        supabase
          .from("quiz_attempts")
          .select("*, lessons (titre, matiere)")
          .in("student_id", studentIds)
          .gte("created_at", monthData.start)
          .lte("created_at", monthData.end),
        supabase
          .from("achievements")
          .select("*")
          .in("student_id", studentIds)
          .gte("unlocked_at", monthData.start)
          .lte("unlocked_at", monthData.end),
      ]);

      // Build report data
      const targetStudents = selectedStudent === "all" 
        ? students 
        : students.filter(s => s.id === selectedStudent);

      const reports: ProgressReport[] = targetStudents.map(student => ({
        student,
        progress: progressData.data?.filter(p => p.etudiant_id === student.id) || [],
        sessions: sessionsData.data?.filter(s => s.etudiant_id === student.id) || [],
        quizzes: quizData.data?.filter(q => q.student_id === student.id) || [],
        achievements: achievementsData.data?.filter(a => a.student_id === student.id) || [],
      }));

      setReportData(reports);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir la fenêtre d'impression. Vérifiez les paramètres de votre navigateur.",
        variant: "destructive",
      });
      return;
    }

    const monthData = months[parseInt(selectedMonth)];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport de progression - ${monthData.label}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #333; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; margin: -20px -20px 20px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header p { font-size: 14px; opacity: 0.9; }
            .student-section { page-break-inside: avoid; margin-bottom: 30px; }
            .student-name { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #1f2937; border-bottom: 2px solid #6366f1; padding-bottom: 5px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .stat-box { background: #f0f0ff; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #6366f1; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px; color: #374151; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #6366f1; color: white; padding: 10px; text-align: left; font-size: 12px; }
            td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
            tr:nth-child(even) { background: #f9fafb; }
            .achievement { display: flex; align-items: center; gap: 10px; padding: 8px; background: #fef3c7; border-radius: 8px; margin-bottom: 8px; }
            .achievement-icon { font-size: 20px; }
            .achievement-title { font-weight: bold; font-size: 13px; }
            .achievement-desc { font-size: 11px; color: #666; }
            .footer { text-align: center; color: #9ca3af; font-size: 10px; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
            @media print {
              .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .stat-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .achievement { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .student-section { page-break-before: auto; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="footer">
            Généré le ${format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr })} - Oumi'School
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast({
      title: "Impression lancée",
      description: "Utilisez 'Enregistrer en PDF' dans les options d'impression pour sauvegarder le rapport.",
    });
  };

  const monthData = months[parseInt(selectedMonth)];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Export PDF des progrès
          </CardTitle>
          <CardDescription>
            Générez un rapport mensuel détaillé de progression
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Rapport mensuel</p>
                <p className="text-sm text-muted-foreground">Sessions et leçons</p>
              </div>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-secondary" />
              <div>
                <p className="font-medium">Statistiques</p>
                <p className="text-sm text-muted-foreground">Scores et temps d'étude</p>
              </div>
            </div>
            <div className="p-4 bg-success/10 rounded-lg flex items-center gap-3">
              <Award className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium">Achievements</p>
                <p className="text-sm text-muted-foreground">Badges débloqués</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un enfant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les enfants</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.prenom} ({student.niveau_scolaire})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un mois" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={generateReport} 
              disabled={loading || students.length === 0}
              className="bg-gradient-warm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Générer le rapport
            </Button>
          </div>

          {students.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Ajoutez des enfants pour pouvoir générer des rapports
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Aperçu du rapport - {monthData.label}</span>
              <Button onClick={handlePrint} className="bg-gradient-warm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer / Sauvegarder PDF
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div ref={printRef} className="space-y-8 p-4">
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 rounded-lg -mx-4">
              <h1 className="text-2xl font-bold">Oumi'School</h1>
              <p className="opacity-90">Rapport de progression - {monthData.label}</p>
            </div>

            {reportData?.map((report, index) => {
              const completedLessons = report.progress.filter(p => p.statut_completion === 100).length;
              const avgQuizScore = report.quizzes.length > 0 
                ? report.quizzes.reduce((acc, q) => acc + q.percentage, 0) / report.quizzes.length 
                : 0;
              const totalHours = report.sessions.reduce((acc, s) => acc + s.duree_minutes, 0) / 60;

              return (
                <div key={report.student.id} className="student-section space-y-4">
                  <h2 className="student-name text-xl font-bold border-b-2 border-primary pb-2">
                    {report.student.prenom} - {report.student.niveau_scolaire}
                  </h2>

                  <div className="stats-grid grid grid-cols-4 gap-3">
                    <div className="stat-box bg-primary/10 p-4 rounded-lg text-center">
                      <div className="stat-value text-2xl font-bold text-primary">{completedLessons}</div>
                      <div className="stat-label text-xs text-muted-foreground mt-1">Leçons</div>
                    </div>
                    <div className="stat-box bg-primary/10 p-4 rounded-lg text-center">
                      <div className="stat-value text-2xl font-bold text-primary">{report.sessions.length}</div>
                      <div className="stat-label text-xs text-muted-foreground mt-1">Sessions</div>
                    </div>
                    <div className="stat-box bg-primary/10 p-4 rounded-lg text-center">
                      <div className="stat-value text-2xl font-bold text-primary">{avgQuizScore.toFixed(0)}%</div>
                      <div className="stat-label text-xs text-muted-foreground mt-1">Quiz moyen</div>
                    </div>
                    <div className="stat-box bg-primary/10 p-4 rounded-lg text-center">
                      <div className="stat-value text-2xl font-bold text-primary">{totalHours.toFixed(1)}h</div>
                      <div className="stat-label text-xs text-muted-foreground mt-1">Heures</div>
                    </div>
                  </div>

                  {report.progress.length > 0 && (
                    <>
                      <h3 className="section-title font-semibold mt-6">Progression par leçon</h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-primary text-white">
                            <th className="p-2 text-left">Leçon</th>
                            <th className="p-2 text-left">Matière</th>
                            <th className="p-2 text-center">Complétion</th>
                            <th className="p-2 text-center">Quiz</th>
                            <th className="p-2 text-center">Temps</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.progress.map((p, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                              <td className="p-2">{p.lessons?.titre || "N/A"}</td>
                              <td className="p-2">{p.lessons?.matiere || "N/A"}</td>
                              <td className="p-2 text-center">{p.statut_completion || 0}%</td>
                              <td className="p-2 text-center">{p.score_quiz ? `${p.score_quiz}%` : "-"}</td>
                              <td className="p-2 text-center">{p.temps_passe_minutes || 0} min</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {report.sessions.length > 0 && (
                    <>
                      <h3 className="section-title font-semibold mt-6">Sessions de tutorat</h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-primary text-white">
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Matière</th>
                            <th className="p-2 text-left">Tuteur</th>
                            <th className="p-2 text-center">Durée</th>
                            <th className="p-2 text-center">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.sessions.map((s, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                              <td className="p-2">{format(new Date(s.date_heure_debut), "dd/MM/yyyy", { locale: fr })}</td>
                              <td className="p-2">{s.matiere}</td>
                              <td className="p-2">{s.tutors?.profiles?.prenom} {s.tutors?.profiles?.nom}</td>
                              <td className="p-2 text-center">{s.duree_minutes} min</td>
                              <td className="p-2 text-center">{s.evaluation_etudiant ? `${s.evaluation_etudiant}/5` : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {report.achievements.length > 0 && (
                    <>
                      <h3 className="section-title font-semibold mt-6">Badges débloqués</h3>
                      <div className="space-y-2">
                        {report.achievements.map((a, i) => (
                          <div key={i} className="achievement flex items-center gap-3 p-3 bg-amber-100 rounded-lg">
                            <span className="achievement-icon text-xl">{a.icon || "🏆"}</span>
                            <div>
                              <div className="achievement-title font-semibold">{a.title}</div>
                              <div className="achievement-desc text-sm text-muted-foreground">
                                {a.description} (+{a.points} XP)
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
