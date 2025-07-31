export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      tournament_logs: {
        Row: {
          action: string
          created_at: string
          created_by: string
          details: Json
          id: string
          tournament_id: string
        }
        Insert: {
          action: string
          created_at?: string
          created_by: string
          details?: Json
          id?: string
          tournament_id: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string
          details?: Json
          id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_logs_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_states: {
        Row: {
          current_level_index: number
          current_prize_pool: number
          double_entries: number | null
          early_entry_players: number | null
          entries: number
          id: string
          is_on_break: boolean
          is_paused: boolean
          is_running: boolean
          players: number
          reentries: number
          start_time: string | null
          time_remaining: number
          tournament_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          current_level_index?: number
          current_prize_pool?: number
          double_entries?: number | null
          early_entry_players?: number | null
          entries?: number
          id?: string
          is_on_break?: boolean
          is_paused?: boolean
          is_running?: boolean
          players?: number
          reentries?: number
          start_time?: string | null
          time_remaining?: number
          tournament_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          current_level_index?: number
          current_prize_pool?: number
          double_entries?: number | null
          early_entry_players?: number | null
          entries?: number
          id?: string
          is_on_break?: boolean
          is_paused?: boolean
          is_running?: boolean
          players?: number
          reentries?: number
          start_time?: string | null
          time_remaining?: number
          tournament_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_states_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: true
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          access_code: string
          addon_allowed: boolean | null
          addon_cost: number | null
          addon_levels: number | null
          addon_stack: number | null
          antes_start_level: number | null
          blind_increase_type: string | null
          blind_structure_type: string | null
          break_after_levels: number
          break_duration: number | null
          break_frequency: number | null
          buy_in: number
          chip_colors: Json | null
          city: string
          created_at: string
          created_by: string
          custom_blind_schedule: Json | null
          custom_level_durations: Json | null
          dealer_tip_percentage: number | null
          description: string | null
          double_stack_allowed: boolean | null
          double_stack_cost: number | null
          double_stack_multiplier: number | null
          early_entry_bonus: boolean | null
          early_entry_levels: number | null
          early_entry_percentage: number | null
          first_break_after: number | null
          guaranteed_prize_pool: number
          id: string
          initial_stack: number
          late_registration_levels: number | null
          late_registration_minutes: number | null
          level_duration_type: string | null
          levels: Json
          max_players: number | null
          min_players: number | null
          name: string
          payout_percentage: number | null
          payout_structure: Json
          prize_pool_visible: boolean | null
          qualifier_seats: number | null
          rebuy_allowed: boolean | null
          rebuy_levels: number | null
          rebuy_stack: number | null
          reentry_fee: number
          registration_fee: number | null
          rules: string | null
          satellite_target: string | null
          staff_fee: number | null
          starting_blinds_bb: number | null
          starting_blinds_sb: number | null
          starting_chips: number | null
          status: string
          tournament_date: string | null
        }
        Insert: {
          access_code: string
          addon_allowed?: boolean | null
          addon_cost?: number | null
          addon_levels?: number | null
          addon_stack?: number | null
          antes_start_level?: number | null
          blind_increase_type?: string | null
          blind_structure_type?: string | null
          break_after_levels?: number
          break_duration?: number | null
          break_frequency?: number | null
          buy_in?: number
          chip_colors?: Json | null
          city: string
          created_at?: string
          created_by: string
          custom_blind_schedule?: Json | null
          custom_level_durations?: Json | null
          dealer_tip_percentage?: number | null
          description?: string | null
          double_stack_allowed?: boolean | null
          double_stack_cost?: number | null
          double_stack_multiplier?: number | null
          early_entry_bonus?: boolean | null
          early_entry_levels?: number | null
          early_entry_percentage?: number | null
          first_break_after?: number | null
          guaranteed_prize_pool?: number
          id?: string
          initial_stack?: number
          late_registration_levels?: number | null
          late_registration_minutes?: number | null
          level_duration_type?: string | null
          levels?: Json
          max_players?: number | null
          min_players?: number | null
          name: string
          payout_percentage?: number | null
          payout_structure?: Json
          prize_pool_visible?: boolean | null
          qualifier_seats?: number | null
          rebuy_allowed?: boolean | null
          rebuy_levels?: number | null
          rebuy_stack?: number | null
          reentry_fee?: number
          registration_fee?: number | null
          rules?: string | null
          satellite_target?: string | null
          staff_fee?: number | null
          starting_blinds_bb?: number | null
          starting_blinds_sb?: number | null
          starting_chips?: number | null
          status?: string
          tournament_date?: string | null
        }
        Update: {
          access_code?: string
          addon_allowed?: boolean | null
          addon_cost?: number | null
          addon_levels?: number | null
          addon_stack?: number | null
          antes_start_level?: number | null
          blind_increase_type?: string | null
          blind_structure_type?: string | null
          break_after_levels?: number
          break_duration?: number | null
          break_frequency?: number | null
          buy_in?: number
          chip_colors?: Json | null
          city?: string
          created_at?: string
          created_by?: string
          custom_blind_schedule?: Json | null
          custom_level_durations?: Json | null
          dealer_tip_percentage?: number | null
          description?: string | null
          double_stack_allowed?: boolean | null
          double_stack_cost?: number | null
          double_stack_multiplier?: number | null
          early_entry_bonus?: boolean | null
          early_entry_levels?: number | null
          early_entry_percentage?: number | null
          first_break_after?: number | null
          guaranteed_prize_pool?: number
          id?: string
          initial_stack?: number
          late_registration_levels?: number | null
          late_registration_minutes?: number | null
          level_duration_type?: string | null
          levels?: Json
          max_players?: number | null
          min_players?: number | null
          name?: string
          payout_percentage?: number | null
          payout_structure?: Json
          prize_pool_visible?: boolean | null
          qualifier_seats?: number | null
          rebuy_allowed?: boolean | null
          rebuy_levels?: number | null
          rebuy_stack?: number | null
          reentry_fee?: number
          registration_fee?: number | null
          rules?: string | null
          satellite_target?: string | null
          staff_fee?: number | null
          starting_blinds_bb?: number | null
          starting_blinds_sb?: number | null
          starting_chips?: number | null
          status?: string
          tournament_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_current_level_index: {
        Args: { p_tournament_id: string }
        Returns: {
          current_level_index: number
          is_on_break: boolean
        }[]
      }
      calculate_time_remaining: {
        Args: { p_tournament_id: string }
        Returns: {
          time_remaining_seconds: number
          is_on_break: boolean
          break_time_remaining: number
        }[]
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
