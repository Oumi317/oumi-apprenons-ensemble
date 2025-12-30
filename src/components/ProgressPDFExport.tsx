import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2, FileText, Calendar, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
  id: string;
  prenom: string;
  niveau_scolaire: string;
}

interface ProgressPDFExportProps {
  students: Student[];
}

export function ProgressPDFExport({ students }: ProgressPDFExportProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("0");

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: i.toString(),
      label: format(date, "MMMM yyyy", { locale: fr }),
      start: startOfMonth(date).toISOString(),
      end: endOfMonth(date).toISOString(),
    };
  });

  const generatePDF = async () => {
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

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Oumi'School", 20, 25);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Rapport de progression - ${monthData.label}`, 20, 35);

      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      let yPosition = 55;

      // Student info
      const targetStudents = selectedStudent === "all" 
        ? students 
        : students.filter(s => s.id === selectedStudent);

      targetStudents.forEach((student, studentIndex) => {
        if (studentIndex > 0) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(`${student.prenom} - ${student.niveau_scolaire}`, 20, yPosition);
        yPosition += 15;

        // Summary stats
        const studentProgress = progressData.data?.filter(p => p.etudiant_id === student.id) || [];
        const studentSessions = sessionsData.data?.filter(s => s.etudiant_id === student.id) || [];
        const studentQuizzes = quizData.data?.filter(q => q.student_id === student.id) || [];
        const studentAchievements = achievementsData.data?.filter(a => a.student_id === student.id) || [];

        const totalLessons = studentProgress.length;
        const completedLessons = studentProgress.filter(p => p.statut_completion === 100).length;
        const avgQuizScore = studentQuizzes.length > 0 
          ? studentQuizzes.reduce((acc, q) => acc + q.percentage, 0) / studentQuizzes.length 
          : 0;
        const totalHours = studentSessions.reduce((acc, s) => acc + s.duree_minutes, 0) / 60;

        // Stats boxes
        doc.setFillColor(240, 240, 255);
        doc.roundedRect(20, yPosition, 40, 25, 3, 3, "F");
        doc.roundedRect(65, yPosition, 40, 25, 3, 3, "F");
        doc.roundedRect(110, yPosition, 40, 25, 3, 3, "F");
        doc.roundedRect(155, yPosition, 40, 25, 3, 3, "F");

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(99, 102, 241);
        doc.text(completedLessons.toString(), 40, yPosition + 12, { align: "center" });
        doc.text(studentSessions.length.toString(), 85, yPosition + 12, { align: "center" });
        doc.text(`${avgQuizScore.toFixed(0)}%`, 130, yPosition + 12, { align: "center" });
        doc.text(totalHours.toFixed(1) + "h", 175, yPosition + 12, { align: "center" });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Leçons", 40, yPosition + 20, { align: "center" });
        doc.text("Sessions", 85, yPosition + 20, { align: "center" });
        doc.text("Quiz moyen", 130, yPosition + 20, { align: "center" });
        doc.text("Heures", 175, yPosition + 20, { align: "center" });

        doc.setTextColor(0, 0, 0);
        yPosition += 35;

        // Progress by subject
        if (studentProgress.length > 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Progression par leçon", 20, yPosition);
          yPosition += 5;

          const progressTableData = studentProgress.map(p => [
            p.lessons?.titre || "N/A",
            p.lessons?.matiere || "N/A",
            `${p.statut_completion || 0}%`,
            p.score_quiz ? `${p.score_quiz}%` : "-",
            `${p.temps_passe_minutes || 0} min`,
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [["Leçon", "Matière", "Complétion", "Quiz", "Temps"]],
            body: progressTableData,
            theme: "striped",
            headStyles: { fillColor: [99, 102, 241] },
            margin: { left: 20, right: 20 },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        }

        // Sessions
        if (studentSessions.length > 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Sessions de tutorat", 20, yPosition);
          yPosition += 5;

          const sessionsTableData = studentSessions.map(s => [
            format(new Date(s.date_heure_debut), "dd/MM/yyyy", { locale: fr }),
            s.matiere,
            `${s.tutors?.profiles?.prenom} ${s.tutors?.profiles?.nom}`,
            `${s.duree_minutes} min`,
            s.evaluation_etudiant ? `${s.evaluation_etudiant}/5` : "-",
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [["Date", "Matière", "Tuteur", "Durée", "Note"]],
            body: sessionsTableData,
            theme: "striped",
            headStyles: { fillColor: [99, 102, 241] },
            margin: { left: 20, right: 20 },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        }

        // Achievements
        if (studentAchievements.length > 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Badges débloqués", 20, yPosition);
          yPosition += 10;

          studentAchievements.forEach(achievement => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`${achievement.icon || "🏆"} ${achievement.title}`, 25, yPosition);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(`${achievement.description} (+${achievement.points} XP)`, 25, yPosition + 5);
            yPosition += 12;
          });
        }
      });

      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Généré le ${format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr })} - Page ${i}/${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save
      const fileName = `rapport-progression-${monthData.label.replace(" ", "-")}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF généré !",
        description: `Le rapport a été téléchargé sous le nom "${fileName}"`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
            onClick={generatePDF} 
            disabled={loading || students.length === 0}
            className="bg-gradient-warm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Télécharger PDF
          </Button>
        </div>

        {students.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Ajoutez des enfants pour pouvoir générer des rapports
          </p>
        )}
      </CardContent>
    </Card>
  );
}
