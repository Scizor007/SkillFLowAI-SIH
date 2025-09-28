export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Courses_Table: {
        Row: {
          c_name: string | null
          content_prompt: string | null
          course_modules: Json | null
          cover_image: string | null
          created_at: string
          creator_id: string | null
          creator_name: string | null
          description: string | null
          enrolled_count: number | null
          id: number
          skill_offered: Json | null
          uuid_id: string | null
        }
        Insert: {
          c_name?: string | null
          content_prompt?: string | null
          course_modules?: Json | null
          cover_image?: string | null
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          enrolled_count?: number | null
          id?: number
          skill_offered?: Json | null
          uuid_id?: string | null
        }
        Update: {
          c_name?: string | null
          content_prompt?: string | null
          course_modules?: Json | null
          cover_image?: string | null
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          enrolled_count?: number | null
          id?: number
          skill_offered?: Json | null
          uuid_id?: string | null
        }
        Relationships: []
      }
      Learner_Profile: {
        Row: {
          avatar: string | null
          Courses: Json | null
          Courses_Enrolled: Json | null
          created_at: string
          Email: string | null
          id: number
          last_course_visited_id: string | null
          n_textual_solve: number | null
          n_visual_solve: number | null
          Name: string | null
          Skills: Json | null
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          Courses?: Json | null
          Courses_Enrolled?: Json | null
          created_at?: string
          Email?: string | null
          id?: number
          last_course_visited_id?: string | null
          n_textual_solve?: number | null
          n_visual_solve?: number | null
          Name?: string | null
          Skills?: Json | null
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          Courses?: Json | null
          Courses_Enrolled?: Json | null
          created_at?: string
          Email?: string | null
          id?: number
          last_course_visited_id?: string | null
          n_textual_solve?: number | null
          n_visual_solve?: number | null
          Name?: string | null
          Skills?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      module_content: {
        Row: {
          content: string | null
          created_at: string
          id: string
          module_id: string
          textual_content: string | null
          updated_at: string
          user_id: string | null
          visual_content: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          module_id: string
          textual_content?: string | null
          updated_at?: string
          user_id?: string | null
          visual_content?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          module_id?: string
          textual_content?: string | null
          updated_at?: string
          user_id?: string | null
          visual_content?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_module_content_module"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id: string
          order: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          courses_enrolled: Json | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_banned: boolean | null
          last_course_visited_id: string | null
          skills: Json | null
          textual_points: number | null
          updated_at: string
          visual_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          courses_enrolled?: Json | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          last_course_visited_id?: string | null
          skills?: Json | null
          textual_points?: number | null
          updated_at?: string
          visual_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          courses_enrolled?: Json | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          last_course_visited_id?: string | null
          skills?: Json | null
          textual_points?: number | null
          updated_at?: string
          visual_points?: number | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          questions: Json | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          questions?: Json | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          questions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed_module_ids: string[] | null
          completed_modules: Json | null
          course_id: number | null
          created_at: string
          id: string
          last_accessed: string
          personalized_content: Json | null
          quiz_scores: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_module_ids?: string[] | null
          completed_modules?: Json | null
          course_id?: number | null
          created_at?: string
          id?: string
          last_accessed?: string
          personalized_content?: Json | null
          quiz_scores?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_module_ids?: string[] | null
          completed_modules?: Json | null
          course_id?: number | null
          created_at?: string
          id?: string
          last_accessed?: string
          personalized_content?: Json | null
          quiz_scores?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_profile_admin_status: {
        Args: { user_id: string; admin_status: boolean }
        Returns: undefined
      }
      update_profile_ban_status: {
        Args: { user_id: string; ban_status: boolean }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
