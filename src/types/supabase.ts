
export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          name: string
          buy_in: number
          reentry_fee: number
          guaranteed_prize_pool: number
          initial_stack: number
          levels: TournamentLevel[]
          break_after_levels: number
          payout_structure: number[]
          status: 'created' | 'active' | 'paused' | 'finished'
          created_by: string
          created_at: string
          city: string
          access_code: string
        }
        Insert: {
          id?: string
          name: string
          buy_in: number
          reentry_fee: number
          guaranteed_prize_pool: number
          initial_stack: number
          levels: TournamentLevel[]
          break_after_levels: number
          payout_structure: number[]
          status?: 'created' | 'active' | 'paused' | 'finished'
          created_by: string
          created_at?: string
          city: string
          access_code: string
        }
        Update: {
          id?: string
          name?: string
          buy_in?: number
          reentry_fee?: number
          guaranteed_prize_pool?: number
          initial_stack?: number
          levels?: TournamentLevel[]
          break_after_levels?: number
          payout_structure?: number[]
          status?: 'created' | 'active' | 'paused' | 'finished'
          created_by?: string
          created_at?: string
          city?: string
          access_code?: string
        }
      }
      tournament_states: {
        Row: {
          id: string
          tournament_id: string
          current_level_index: number
          time_remaining: number
          is_running: boolean
          is_paused: boolean
          is_on_break: boolean
          players: number
          entries: number
          reentries: number
          current_prize_pool: number
          start_time: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          id?: string
          tournament_id: string
          current_level_index?: number
          time_remaining: number
          is_running?: boolean
          is_paused?: boolean
          is_on_break?: boolean
          players?: number
          entries?: number
          reentries?: number
          current_prize_pool: number
          start_time?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          id?: string
          tournament_id?: string
          current_level_index?: number
          time_remaining?: number
          is_running?: boolean
          is_paused?: boolean
          is_on_break?: boolean
          players?: number
          entries?: number
          reentries?: number
          current_prize_pool?: number
          start_time?: string | null
          updated_at?: string
          updated_by?: string
        }
      }
      tournament_logs: {
        Row: {
          id: string
          tournament_id: string
          action: string
          details: Record<string, any>
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          action: string
          details: Record<string, any>
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          action?: string
          details?: Record<string, any>
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface TournamentLevel {
  id: string
  smallBlind: number
  bigBlind: number
  ante: number
  duration: number
  isBreak: boolean
  breakDuration?: number
}
