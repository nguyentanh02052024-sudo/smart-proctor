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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          attempt_id: string
          created_at: string
          essay_answer: string | null
          id: string
          is_graded: boolean
          points_awarded: number | null
          question_id: string
          selected_options: string[] | null
          updated_at: string
        }
        Insert: {
          attempt_id: string
          created_at?: string
          essay_answer?: string | null
          id?: string
          is_graded?: boolean
          points_awarded?: number | null
          question_id: string
          selected_options?: string[] | null
          updated_at?: string
        }
        Update: {
          attempt_id?: string
          created_at?: string
          essay_answer?: string | null
          id?: string
          is_graded?: boolean
          points_awarded?: number | null
          question_id?: string
          selected_options?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          cancel_reason: string | null
          exam_id: string
          flag_reason: string | null
          id: string
          is_cancelled: boolean
          is_flagged: boolean
          score: number | null
          started_at: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          cancel_reason?: string | null
          exam_id: string
          flag_reason?: string | null
          id?: string
          is_cancelled?: boolean
          is_flagged?: boolean
          score?: number | null
          started_at?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          cancel_reason?: string | null
          exam_id?: string
          flag_reason?: string | null
          id?: string
          is_cancelled?: boolean
          is_flagged?: boolean
          score?: number | null
          started_at?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          auto_submit_on_violation: boolean
          created_at: string
          description: string | null
          duration_minutes: number
          end_time: string | null
          id: string
          is_published: boolean
          max_violations: number
          require_camera: boolean
          start_time: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          auto_submit_on_violation?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          end_time?: string | null
          id?: string
          is_published?: boolean
          max_violations?: number
          require_camera?: boolean
          start_time?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          auto_submit_on_violation?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          end_time?: string | null
          id?: string
          is_published?: boolean
          max_violations?: number
          require_camera?: boolean
          start_time?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          content: string
          correct_answers: string[] | null
          created_at: string
          exam_id: string
          id: string
          image_url: string | null
          options: Json | null
          order_index: number
          points: number
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          content: string
          correct_answers?: string[] | null
          created_at?: string
          exam_id: string
          id?: string
          image_url?: string | null
          options?: Json | null
          order_index?: number
          points?: number
          type?: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          content?: string
          correct_answers?: string[] | null
          created_at?: string
          exam_id?: string
          id?: string
          image_url?: string | null
          options?: Json | null
          order_index?: number
          points?: number
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      violation_logs: {
        Row: {
          attempt_id: string
          details: string | null
          id: string
          timestamp: string
          type: Database["public"]["Enums"]["violation_type"]
        }
        Insert: {
          attempt_id: string
          details?: string | null
          id?: string
          timestamp?: string
          type: Database["public"]["Enums"]["violation_type"]
        }
        Update: {
          attempt_id?: string
          details?: string | null
          id?: string
          timestamp?: string
          type?: Database["public"]["Enums"]["violation_type"]
        }
        Relationships: [
          {
            foreignKeyName: "violation_logs_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      question_type:
        | "multiple_choice_single"
        | "multiple_choice_multiple"
        | "essay"
      user_role: "teacher" | "student"
      violation_type:
        | "tab_switch"
        | "window_blur"
        | "camera_off"
        | "camera_denied"
        | "browser_minimize"
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
      question_type: [
        "multiple_choice_single",
        "multiple_choice_multiple",
        "essay",
      ],
      user_role: ["teacher", "student"],
      violation_type: [
        "tab_switch",
        "window_blur",
        "camera_off",
        "camera_denied",
        "browser_minimize",
      ],
    },
  },
} as const
