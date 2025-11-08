export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string
          icon: string | null
          id: string
          points: number
          student_id: string
          title: string
          type: string
          unlocked_at: string
        }
        Insert: {
          description: string
          icon?: string | null
          id?: string
          points?: number
          student_id: string
          title: string
          type: string
          unlocked_at?: string
        }
        Update: {
          description?: string
          icon?: string | null
          id?: string
          points?: number
          student_id?: string
          title?: string
          type?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          student_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          student_id: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          student_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_alerts: {
        Row: {
          alert_threshold: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          monthly_limit: number
          parent_id: string
          updated_at: string | null
        }
        Insert: {
          alert_threshold?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_limit: number
          parent_id: string
          updated_at?: string | null
        }
        Update: {
          alert_threshold?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_limit?: number
          parent_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          parent_id: string
          student_id: string | null
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          parent_id: string
          student_id?: string | null
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          parent_id?: string
          student_id?: string | null
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_tutors: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string
          tutor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id: string
          tutor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_tutors_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      interactive_resources: {
        Row: {
          created_at: string | null
          description: string | null
          file_url: string
          id: string
          lesson_id: string
          ordre_affichage: number | null
          slug: string
          titre: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_url: string
          id?: string
          lesson_id: string
          ordre_affichage?: number | null
          slug: string
          titre: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          ordre_affichage?: number | null
          slug?: string
          titre?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactive_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lesson_id: string
          student_id: string
          timestamp: number | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lesson_id: string
          student_id: string
          timestamp?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lesson_id?: string
          student_id?: string
          timestamp?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plan_templates: {
        Row: {
          created_at: string | null
          deroulement: Json
          duree_minutes: number
          id: string
          is_public: boolean | null
          materiel_necessaire: string[] | null
          matiere: string
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          objectifs: string[]
          titre: string
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deroulement?: Json
          duree_minutes: number
          id?: string
          is_public?: boolean | null
          materiel_necessaire?: string[] | null
          matiere: string
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          objectifs?: string[]
          titre: string
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deroulement?: Json
          duree_minutes?: number
          id?: string
          is_public?: boolean | null
          materiel_necessaire?: string[] | null
          matiere?: string
          niveau_scolaire?: Database["public"]["Enums"]["niveau_scolaire"]
          objectifs?: string[]
          titre?: string
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plan_templates_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          alignement_socle_commun: string | null
          contenu_url: string | null
          created_at: string | null
          description: string | null
          difficulte: Database["public"]["Enums"]["difficulte"] | null
          duree_estimee_minutes: number | null
          gratuit: boolean | null
          id: string
          matiere: string
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          ordre_affichage: number | null
          thumbnail_url: string | null
          titre: string
          type_contenu: Database["public"]["Enums"]["type_contenu"]
          updated_at: string | null
        }
        Insert: {
          alignement_socle_commun?: string | null
          contenu_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulte?: Database["public"]["Enums"]["difficulte"] | null
          duree_estimee_minutes?: number | null
          gratuit?: boolean | null
          id?: string
          matiere: string
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          ordre_affichage?: number | null
          thumbnail_url?: string | null
          titre: string
          type_contenu: Database["public"]["Enums"]["type_contenu"]
          updated_at?: string | null
        }
        Update: {
          alignement_socle_commun?: string | null
          contenu_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulte?: Database["public"]["Enums"]["difficulte"] | null
          duree_estimee_minutes?: number | null
          gratuit?: boolean | null
          id?: string
          matiere?: string
          niveau_scolaire?: Database["public"]["Enums"]["niveau_scolaire"]
          ordre_affichage?: number | null
          thumbnail_url?: string | null
          titre?: string
          type_contenu?: Database["public"]["Enums"]["type_contenu"]
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parents: {
        Row: {
          abonnement_actif: boolean | null
          created_at: string | null
          id: string
          type_abonnement: Database["public"]["Enums"]["type_abonnement"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          abonnement_actif?: boolean | null
          created_at?: string | null
          id?: string
          type_abonnement?:
            | Database["public"]["Enums"]["type_abonnement"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          abonnement_actif?: boolean | null
          created_at?: string | null
          id?: string
          type_abonnement?:
            | Database["public"]["Enums"]["type_abonnement"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string | null
          date_transaction: string | null
          devise: string | null
          id: string
          metadata: Json | null
          methode_paiement: string
          montant: number
          pour_quoi: string
          statut: Database["public"]["Enums"]["statut_paiement"] | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_transaction?: string | null
          devise?: string | null
          id?: string
          metadata?: Json | null
          methode_paiement: string
          montant: number
          pour_quoi: string
          statut?: Database["public"]["Enums"]["statut_paiement"] | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_transaction?: string | null
          devise?: string | null
          id?: string
          metadata?: Json | null
          methode_paiement?: string
          montant?: number
          pour_quoi?: string
          statut?: Database["public"]["Enums"]["statut_paiement"] | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          date_naissance: string | null
          derniere_connexion: string | null
          email: string
          fuseau_horaire: string | null
          id: string
          langue_preferee: string | null
          nom: string
          pays: string | null
          prenom: string
          role: Database["public"]["Enums"]["app_role"]
          telephone: string | null
        }
        Insert: {
          created_at?: string | null
          date_naissance?: string | null
          derniere_connexion?: string | null
          email: string
          fuseau_horaire?: string | null
          id: string
          langue_preferee?: string | null
          nom: string
          pays?: string | null
          prenom: string
          role?: Database["public"]["Enums"]["app_role"]
          telephone?: string | null
        }
        Update: {
          created_at?: string | null
          date_naissance?: string | null
          derniere_connexion?: string | null
          email?: string
          fuseau_horaire?: string | null
          id?: string
          langue_preferee?: string | null
          nom?: string
          pays?: string | null
          prenom?: string
          role?: Database["public"]["Enums"]["app_role"]
          telephone?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          max_score: number
          percentage: number
          score: number
          student_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          max_score: number
          percentage: number
          score: number
          student_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          max_score?: number
          percentage?: number
          score?: number
          student_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          explanation: string | null
          id: string
          lesson_id: string
          options: Json | null
          ordre: number
          points: number
          question: string
          type: string
          updated_at: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          lesson_id: string
          options?: Json | null
          ordre?: number
          points?: number
          question: string
          type: string
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json | null
          ordre?: number
          points?: number
          question?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      session_feedback: {
        Row: {
          areas_for_improvement: string | null
          comprehension_score: number | null
          created_at: string | null
          homework_assigned: string | null
          homework_completion_score: number | null
          id: string
          next_session_focus: string | null
          participation_score: number | null
          session_id: string
          strengths: string | null
          student_id: string
          tutor_id: string
          tutor_notes: string | null
          updated_at: string | null
        }
        Insert: {
          areas_for_improvement?: string | null
          comprehension_score?: number | null
          created_at?: string | null
          homework_assigned?: string | null
          homework_completion_score?: number | null
          id?: string
          next_session_focus?: string | null
          participation_score?: number | null
          session_id: string
          strengths?: string | null
          student_id: string
          tutor_id: string
          tutor_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          areas_for_improvement?: string | null
          comprehension_score?: number | null
          created_at?: string | null
          homework_assigned?: string | null
          homework_completion_score?: number | null
          id?: string
          next_session_focus?: string | null
          participation_score?: number | null
          session_id?: string
          strengths?: string | null
          student_id?: string
          tutor_id?: string
          tutor_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions_tutorat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions_tutorat: {
        Row: {
          commentaire_evaluation: string | null
          created_at: string | null
          date_heure_debut: string
          duree_minutes: number
          enregistrement_url: string | null
          etudiant_id: string
          evaluation_etudiant: number | null
          id: string
          lien_zoom: string | null
          matiere: string
          montant_paye: number | null
          notes_tuteur: string | null
          statut: Database["public"]["Enums"]["statut_session"] | null
          tuteur_id: string
          updated_at: string | null
        }
        Insert: {
          commentaire_evaluation?: string | null
          created_at?: string | null
          date_heure_debut: string
          duree_minutes?: number
          enregistrement_url?: string | null
          etudiant_id: string
          evaluation_etudiant?: number | null
          id?: string
          lien_zoom?: string | null
          matiere: string
          montant_paye?: number | null
          notes_tuteur?: string | null
          statut?: Database["public"]["Enums"]["statut_session"] | null
          tuteur_id: string
          updated_at?: string | null
        }
        Update: {
          commentaire_evaluation?: string | null
          created_at?: string | null
          date_heure_debut?: string
          duree_minutes?: number
          enregistrement_url?: string | null
          etudiant_id?: string
          evaluation_etudiant?: number | null
          id?: string
          lien_zoom?: string | null
          matiere?: string
          montant_paye?: number | null
          notes_tuteur?: string | null
          statut?: Database["public"]["Enums"]["statut_session"] | null
          tuteur_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_tutorat_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_tutorat_tuteur_id_fkey"
            columns: ["tuteur_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      student_challenges: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          progression: number | null
          student_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progression?: number | null
          student_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progression?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_challenges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          created_at: string | null
          date_completion: string | null
          date_debut: string | null
          etudiant_id: string
          id: string
          lesson_id: string
          score_quiz: number | null
          statut_completion: number | null
          temps_passe_minutes: number | null
          tentatives: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_completion?: string | null
          date_debut?: string | null
          etudiant_id: string
          id?: string
          lesson_id: string
          score_quiz?: number | null
          statut_completion?: number | null
          temps_passe_minutes?: number | null
          tentatives?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_completion?: string | null
          date_debut?: string | null
          etudiant_id?: string
          id?: string
          lesson_id?: string
          score_quiz?: number | null
          statut_completion?: number | null
          temps_passe_minutes?: number | null
          tentatives?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tracking_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          note_type: string
          session_id: string | null
          student_id: string
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          note_type: string
          session_id?: string | null
          student_id: string
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          note_type?: string
          session_id?: string | null
          student_id?: string
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_tracking_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_tutorat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tracking_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tracking_notes_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          besoins_specifiques: string | null
          created_at: string | null
          current_streak: number | null
          date_naissance: string
          experience_points: number | null
          id: string
          longest_streak: number | null
          niveau: number | null
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          objectifs_apprentissage: string | null
          parent_id: string
          prenom: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          besoins_specifiques?: string | null
          created_at?: string | null
          current_streak?: number | null
          date_naissance: string
          experience_points?: number | null
          id?: string
          longest_streak?: number | null
          niveau?: number | null
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          objectifs_apprentissage?: string | null
          parent_id: string
          prenom: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          besoins_specifiques?: string | null
          created_at?: string | null
          current_streak?: number | null
          date_naissance?: string
          experience_points?: number | null
          id?: string
          longest_streak?: number | null
          niveau?: number | null
          niveau_scolaire?: Database["public"]["Enums"]["niveau_scolaire"]
          objectifs_apprentissage?: string | null
          parent_id?: string
          prenom?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration_minutes: number
          id: string
          lesson_id: string | null
          matiere: string
          notes: string | null
          score: number | null
          session_type: string
          student_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_minutes: number
          id?: string
          lesson_id?: string | null
          matiere: string
          notes?: string | null
          score?: number | null
          session_type: string
          student_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number
          id?: string
          lesson_id?: string | null
          matiere?: string
          notes?: string | null
          score?: number | null
          session_type?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          id: string
          montant_mensuel: number
          parent_id: string
          statut: Database["public"]["Enums"]["statut_abonnement"] | null
          stripe_subscription_id: string | null
          type: Database["public"]["Enums"]["type_abonnement"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          montant_mensuel: number
          parent_id: string
          statut?: Database["public"]["Enums"]["statut_abonnement"] | null
          stripe_subscription_id?: string | null
          type: Database["public"]["Enums"]["type_abonnement"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          montant_mensuel?: number
          parent_id?: string
          statut?: Database["public"]["Enums"]["statut_abonnement"] | null
          stripe_subscription_id?: string | null
          type?: Database["public"]["Enums"]["type_abonnement"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_recurring: boolean | null
          start_time: string
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_recurring?: boolean | null
          start_time: string
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          start_time?: string
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_availability_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_packages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          nom: string
          nombre_sessions: number
          reduction_pourcentage: number
          tutor_id: string
          updated_at: string | null
          validite_jours: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          nom: string
          nombre_sessions: number
          reduction_pourcentage: number
          tutor_id: string
          updated_at?: string | null
          validite_jours?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          nom?: string
          nombre_sessions?: number
          reduction_pourcentage?: number
          tutor_id?: string
          updated_at?: string | null
          validite_jours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_packages_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_pricing: {
        Row: {
          created_at: string | null
          id: string
          matiere: string
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          tarif_horaire_eur: number
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          matiere: string
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          tarif_horaire_eur: number
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          matiere?: string
          niveau_scolaire?: Database["public"]["Enums"]["niveau_scolaire"]
          tarif_horaire_eur?: number
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_pricing_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_resources: {
        Row: {
          created_at: string | null
          description: string | null
          file_type: string
          file_url: string
          id: string
          is_public: boolean | null
          matiere: string
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          shared_with_students: string[] | null
          titre: string
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          is_public?: boolean | null
          matiere: string
          niveau_scolaire: Database["public"]["Enums"]["niveau_scolaire"]
          shared_with_students?: string[] | null
          titre: string
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean | null
          matiere?: string
          niveau_scolaire?: Database["public"]["Enums"]["niveau_scolaire"]
          shared_with_students?: string[] | null
          titre?: string
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_resources_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_unavailability: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          tutor_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          tutor_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_unavailability_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutors: {
        Row: {
          annees_experience: number
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          diplomes: string[]
          disponibilites: Json | null
          id: string
          matieres_enseignees: string[]
          nombre_sessions: number | null
          note_moyenne: number | null
          notes_admin: string | null
          statut_approbation:
            | Database["public"]["Enums"]["statut_tuteur"]
            | null
          tarif_horaire_eur: number
          updated_at: string | null
          user_id: string
          verification_casier: boolean | null
        }
        Insert: {
          annees_experience: number
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          diplomes: string[]
          disponibilites?: Json | null
          id?: string
          matieres_enseignees: string[]
          nombre_sessions?: number | null
          note_moyenne?: number | null
          notes_admin?: string | null
          statut_approbation?:
            | Database["public"]["Enums"]["statut_tuteur"]
            | null
          tarif_horaire_eur: number
          updated_at?: string | null
          user_id: string
          verification_casier?: boolean | null
        }
        Update: {
          annees_experience?: number
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          diplomes?: string[]
          disponibilites?: Json | null
          id?: string
          matieres_enseignees?: string[]
          nombre_sessions?: number | null
          note_moyenne?: number | null
          notes_admin?: string | null
          statut_approbation?:
            | Database["public"]["Enums"]["statut_tuteur"]
            | null
          tarif_horaire_eur?: number
          updated_at?: string | null
          user_id?: string
          verification_casier?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tutors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          created_at: string | null
          date_debut: string
          date_fin: string
          description: string
          icone: string | null
          id: string
          objectif: number
          points_recompense: number
          titre: string
          type: string
        }
        Insert: {
          created_at?: string | null
          date_debut?: string
          date_fin?: string
          description: string
          icone?: string | null
          id?: string
          objectif: number
          points_recompense?: number
          titre: string
          type: string
        }
        Update: {
          created_at?: string | null
          date_debut?: string
          date_fin?: string
          description?: string
          icone?: string | null
          id?: string
          objectif?: number
          points_recompense?: number
          titre?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_experience: {
        Args: { student_uuid: string; xp_amount: number }
        Returns: undefined
      }
      calculate_level: { Args: { xp: number }; Returns: number }
      generate_slug: { Args: { text_input: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "parent" | "student" | "tutor" | "admin"
      difficulte: "facile" | "moyen" | "difficile"
      niveau_scolaire:
        | "CP"
        | "CE1"
        | "CE2"
        | "CM1"
        | "CM2"
        | "6eme"
        | "5eme"
        | "4eme"
        | "3eme"
        | "Seconde"
        | "Premiere"
        | "Terminale"
      statut_abonnement: "actif" | "annule" | "expire"
      statut_paiement: "reussi" | "echec" | "en_attente"
      statut_session: "programmee" | "completee" | "annulee" | "en_cours"
      statut_tuteur: "en_attente" | "approuve" | "refuse" | "suspendu"
      type_abonnement: "gratuit" | "premium_individuel" | "premium_famille"
      type_contenu: "video" | "exercice" | "quiz" | "document"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["parent", "student", "tutor", "admin"],
      difficulte: ["facile", "moyen", "difficile"],
      niveau_scolaire: [
        "CP",
        "CE1",
        "CE2",
        "CM1",
        "CM2",
        "6eme",
        "5eme",
        "4eme",
        "3eme",
        "Seconde",
        "Premiere",
        "Terminale",
      ],
      statut_abonnement: ["actif", "annule", "expire"],
      statut_paiement: ["reussi", "echec", "en_attente"],
      statut_session: ["programmee", "completee", "annulee", "en_cours"],
      statut_tuteur: ["en_attente", "approuve", "refuse", "suspendu"],
      type_abonnement: ["gratuit", "premium_individuel", "premium_famille"],
      type_contenu: ["video", "exercice", "quiz", "document"],
    },
  },
} as const
