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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      applicants: {
        Row: {
          "apply date": string | null
          created_at: string
          id: number
          nama: string | null
          vacancy_uuid: string | null
        }
        Insert: {
          "apply date"?: string | null
          created_at?: string
          id?: number
          nama?: string | null
          vacancy_uuid?: string | null
        }
        Update: {
          "apply date"?: string | null
          created_at?: string
          id?: number
          nama?: string | null
          vacancy_uuid?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          candidates_name: string
          connection_status: string | null
          created_at: string | null
          id: number
          match_percentage: number | null
          note_sent: string | null
          profile_url: string | null
          search_template: string | null
          search_url: string | null
        }
        Insert: {
          candidates_name: string
          connection_status?: string | null
          created_at?: string | null
          id?: number
          match_percentage?: number | null
          note_sent?: string | null
          profile_url?: string | null
          search_template?: string | null
          search_url?: string | null
        }
        Update: {
          candidates_name?: string
          connection_status?: string | null
          created_at?: string | null
          id?: number
          match_percentage?: number | null
          note_sent?: string | null
          profile_url?: string | null
          search_template?: string | null
          search_url?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_base_url: string | null
          company_description: string | null
          company_logo_url: string | null
          company_uuid: string
          company_value: string | null
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          company_base_url?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_uuid?: string
          company_value?: string | null
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          company_base_url?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_uuid?: string
          company_value?: string | null
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      interview_schedules: {
        Row: {
          candidate_name: string
          company_uuid: string
          created_at: string | null
          interview_date: string
          interview_location: string | null
          interview_time: string
          interview_type: string | null
          interviewer_name: string | null
          meeting_link: string | null
          schedules_uuid: string
          status: string | null
          updated_at: string | null
          vacancy_uuid: string
        }
        Insert: {
          candidate_name: string
          company_uuid: string
          created_at?: string | null
          interview_date: string
          interview_location?: string | null
          interview_time: string
          interview_type?: string | null
          interviewer_name?: string | null
          meeting_link?: string | null
          schedules_uuid?: string
          status?: string | null
          updated_at?: string | null
          vacancy_uuid: string
        }
        Update: {
          candidate_name?: string
          company_uuid?: string
          created_at?: string | null
          interview_date?: string
          interview_location?: string | null
          interview_time?: string
          interview_type?: string | null
          interviewer_name?: string | null
          meeting_link?: string | null
          schedules_uuid?: string
          status?: string | null
          updated_at?: string | null
          vacancy_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vacancy"
            columns: ["vacancy_uuid"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["vacancy_uuid"]
          },
          {
            foreignKeyName: "interview_schedules_company_uuid_fkey"
            columns: ["company_uuid"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_uuid"]
          },
        ]
      }
      leads: {
        Row: {
          category: string | null
          connection_status: string | null
          id: string
          name: string | null
          note_sent: string | null
          profile_url: string | null
          search_url: string | null
          timestamp: string | null
        }
        Insert: {
          category?: string | null
          connection_status?: string | null
          id?: string
          name?: string | null
          note_sent?: string | null
          profile_url?: string | null
          search_url?: string | null
          timestamp?: string | null
        }
        Update: {
          category?: string | null
          connection_status?: string | null
          id?: string
          name?: string | null
          note_sent?: string | null
          profile_url?: string | null
          search_url?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          company_uuid: string | null
          created_at: string | null
          description: string | null
          id: number
          note_sent: boolean | null
          salary_max: number | null
          salary_min: number | null
          search_url: string | null
          title: string | null
          updated_at: string | null
          vacancy_description: string | null
          vacancy_location: string | null
          vacancy_requirement: string | null
          vacancy_title: string | null
          vacancy_type: string | null
          vacancy_uuid: string
        }
        Insert: {
          company_uuid?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          note_sent?: boolean | null
          salary_max?: number | null
          salary_min?: number | null
          search_url?: string | null
          title?: string | null
          updated_at?: string | null
          vacancy_description?: string | null
          vacancy_location?: string | null
          vacancy_requirement?: string | null
          vacancy_title?: string | null
          vacancy_type?: string | null
          vacancy_uuid?: string
        }
        Update: {
          company_uuid?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          note_sent?: boolean | null
          salary_max?: number | null
          salary_min?: number | null
          search_url?: string | null
          title?: string | null
          updated_at?: string | null
          vacancy_description?: string | null
          vacancy_location?: string | null
          vacancy_requirement?: string | null
          vacancy_title?: string | null
          vacancy_type?: string | null
          vacancy_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacancies_company_uuid_fkey"
            columns: ["company_uuid"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_uuid"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "recruiter" | "viewer"
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
      app_role: ["admin", "recruiter", "viewer"],
    },
  },
} as const
