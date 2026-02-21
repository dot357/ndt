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
      guess_options: {
        Row: {
          id: string
          is_correct: boolean
          option_text: string
          proverb_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_correct?: boolean
          option_text: string
          proverb_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_correct?: boolean
          option_text?: string
          proverb_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "guess_options_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_alltime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guess_options_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_daily"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guess_options_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_weekly"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guess_options_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "proverbs"
            referencedColumns: ["id"]
          },
        ]
      }
      guesses: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          proverb_id: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          proverb_id: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          proverb_id?: string
          selected_option?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guesses_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_alltime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guesses_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_daily"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guesses_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_weekly"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guesses_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "proverbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guesses_selected_option_fkey"
            columns: ["selected_option"]
            isOneToOne: false
            referencedRelation: "guess_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_actions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          mod_id: string
          note: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          mod_id: string
          note?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          mod_id?: string
          note?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_actions_mod_id_fkey"
            columns: ["mod_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned_at: string | null
          created_at: string
          display_name: string | null
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          banned_at?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          banned_at?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      proverbs: {
        Row: {
          country_code: string
          created_at: string
          id: string
          language_name: string
          literal_text: string
          meaning_text: string
          original_text: string
          region: string | null
          status: string
          user_id: string
          vote_count: number
        }
        Insert: {
          country_code: string
          created_at?: string
          id?: string
          language_name: string
          literal_text: string
          meaning_text: string
          original_text: string
          region?: string | null
          status?: string
          user_id: string
          vote_count?: number
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          language_name?: string
          literal_text?: string
          meaning_text?: string
          original_text?: string
          region?: string | null
          status?: string
          user_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "proverbs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          proverb_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          proverb_id: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          proverb_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_alltime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_daily"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_weekly"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "proverbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          proverb_id: string
          reason: string
          reporter_id: string
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          proverb_id: string
          reason: string
          reporter_id: string
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          proverb_id?: string
          reason?: string
          reporter_id?: string
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_alltime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_daily"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_weekly"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_proverb_id_fkey"
            columns: ["proverb_id"]
            isOneToOne: false
            referencedRelation: "proverbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_alltime: {
        Row: {
          author_name: string | null
          country_code: string | null
          created_at: string | null
          id: string | null
          language_name: string | null
          literal_text: string | null
          original_text: string | null
          vote_count: number | null
        }
        Relationships: []
      }
      leaderboard_daily: {
        Row: {
          author_name: string | null
          country_code: string | null
          created_at: string | null
          id: string | null
          language_name: string | null
          literal_text: string | null
          original_text: string | null
          vote_count: number | null
        }
        Relationships: []
      }
      leaderboard_weekly: {
        Row: {
          author_name: string | null
          country_code: string | null
          created_at: string | null
          id: string | null
          language_name: string | null
          literal_text: string | null
          original_text: string | null
          vote_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin_or_mod: { Args: never; Returns: boolean }
      is_banned: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
