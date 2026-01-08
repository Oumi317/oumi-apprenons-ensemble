import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ResourceProgress {
  id: string;
  student_id: string;
  resource_id: string;
  completed_lessons: number[];
  lesson_scores: Record<string, number>;
  total_lessons: number;
  completed_count: number;
  average_score: number;
  certificate_earned: boolean;
  certificate_date: string | null;
  last_accessed_at: string;
  resource?: {
    titre: string;
    description: string;
    file_url: string;
    slug: string;
  };
}

export function useResourceProgress(studentId: string | null) {
  const [progress, setProgress] = useState<ResourceProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    
    loadProgress();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`resource-progress-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interactive_resource_progress',
          filter: `student_id=eq.${studentId}`
        },
        () => {
          loadProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  const loadProgress = async () => {
    if (!studentId) return;
    
    try {
      const { data, error } = await supabase
        .from("interactive_resource_progress")
        .select(`
          *,
          resource:interactive_resources (
            titre,
            description,
            file_url,
            slug
          )
        `)
        .eq("student_id", studentId);

      if (error) throw error;
      
      const formattedData = (data || []).map(item => ({
        ...item,
        completed_lessons: item.completed_lessons as number[],
        lesson_scores: item.lesson_scores as Record<string, number>,
      }));
      
      setProgress(formattedData);
    } catch (error) {
      console.error("Erreur lors du chargement de la progression:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (
    resourceId: string,
    progressData: {
      completedLessons: number[];
      lessonScores: Record<string, number>;
      totalLessons: number;
      completedCount: number;
      averageScore: number;
      certificateEarned: boolean;
    }
  ) => {
    if (!studentId) return;
    
    try {
      const { error } = await supabase
        .from("interactive_resource_progress")
        .upsert({
          student_id: studentId,
          resource_id: resourceId,
          completed_lessons: progressData.completedLessons,
          lesson_scores: progressData.lessonScores,
          total_lessons: progressData.totalLessons,
          completed_count: progressData.completedCount,
          average_score: progressData.averageScore,
          certificate_earned: progressData.certificateEarned,
          certificate_date: progressData.certificateEarned ? new Date().toISOString() : null,
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,resource_id'
        });

      if (error) throw error;
      
      // Reload progress after save
      await loadProgress();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la progression:", error);
    }
  };

  const getProgressStats = () => {
    const totalResources = progress.length;
    const completedResources = progress.filter(p => p.certificate_earned).length;
    const totalLessonsCompleted = progress.reduce((sum, p) => sum + p.completed_count, 0);
    const averageScore = progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.average_score, 0) / progress.length)
      : 0;
    
    return {
      totalResources,
      completedResources,
      totalLessonsCompleted,
      averageScore,
    };
  };

  return {
    progress,
    loading,
    saveProgress,
    getProgressStats,
    refresh: loadProgress,
  };
}

// Hook for getting progress for all children of a parent
export function useChildrenResourceProgress(childrenIds: string[]) {
  const [progress, setProgress] = useState<Record<string, ResourceProgress[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childrenIds.length === 0) {
      setLoading(false);
      return;
    }
    
    loadAllProgress();
  }, [childrenIds.join(',')]);

  const loadAllProgress = async () => {
    if (childrenIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from("interactive_resource_progress")
        .select(`
          *,
          resource:interactive_resources (
            titre,
            description,
            file_url,
            slug
          )
        `)
        .in("student_id", childrenIds);

      if (error) throw error;
      
      // Group by student_id
      const grouped: Record<string, ResourceProgress[]> = {};
      (data || []).forEach(item => {
        const formattedItem = {
          ...item,
          completed_lessons: item.completed_lessons as number[],
          lesson_scores: item.lesson_scores as Record<string, number>,
        };
        
        if (!grouped[item.student_id]) {
          grouped[item.student_id] = [];
        }
        grouped[item.student_id].push(formattedItem);
      });
      
      setProgress(grouped);
    } catch (error) {
      console.error("Erreur lors du chargement de la progression:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    progress,
    loading,
    refresh: loadAllProgress,
  };
}
