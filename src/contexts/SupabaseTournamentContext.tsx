
import React, { createContext, useContext, useEffect, useState } from 'react'
import { TournamentState } from '@/types/tournament'
import { Tournament, SupabaseTournamentContextType, TournamentStateDB } from '@/types/tournament-context'
import { TournamentService } from '@/services/tournament-service'
import { isSupabaseConfigured } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

const SupabaseTournamentContext = createContext<SupabaseTournamentContextType | null>(null)

export function SupabaseTournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [currentTournament, setCurrentTournament] = useState<TournamentState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  console.log('SupabaseTournamentProvider initialized');
  console.log('Supabase configured:', isSupabaseConfigured());

  const createTournament = async (structure: any, city: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)

      const tournamentId = await TournamentService.createTournament(structure, city)
      await loadTournaments()
      
      return tournamentId
    } catch (err) {
      console.error('Error creating tournament:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error creating tournament';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false)
    }
  }

  const joinTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { tournament, channel } = await TournamentService.joinTournament(tournamentId)
      setCurrentTournament(tournament)

      if (channel) {
        // Clean up previous channel
        if (realtimeChannel) {
          realtimeChannel.unsubscribe()
        }

        // Set up real-time updates
        channel.on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tournament_states', filter: `tournament_id=eq.${tournamentId}` },
          (payload) => {
            console.log('Real-time update:', payload)
            if (payload.new) {
              const newState = payload.new as TournamentStateDB
              setCurrentTournament(prev => prev ? {
                ...prev,
                currentLevelIndex: newState.current_level_index,
                timeRemaining: newState.time_remaining,
                isRunning: newState.is_running,
                isPaused: newState.is_paused,
                isOnBreak: newState.is_on_break,
                players: newState.players,
                entries: newState.entries,
                reentries: newState.reentries,
                currentPrizePool: newState.current_prize_pool,
                startTime: newState.start_time ? Date.parse(newState.start_time) : undefined
              } : null)
            }
          }
        )

        setRealtimeChannel(channel)
      }

    } catch (err) {
      console.error('Error joining tournament:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error joining tournament';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false)
    }
  }

  const updateTournamentState = async (updates: Partial<TournamentState>) => {
    if (!currentTournament) return

    try {
      await TournamentService.updateTournamentState(currentTournament.id, updates)
    } catch (err) {
      console.error('Error updating tournament:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error updating tournament';
      setError(errorMessage);
      throw err;
    }
  }

  const leaveTournament = () => {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe()
      setRealtimeChannel(null)
    }
    setCurrentTournament(null)
  }

  const loadTournaments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Loading tournaments from Supabase...');
      const data = await TournamentService.loadTournaments()
      setTournaments(data)
    } catch (err) {
      console.error('Error loading tournaments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error loading tournaments';
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('SupabaseTournamentProvider mounted, loading tournaments...');
    loadTournaments()
  }, [])

  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        realtimeChannel.unsubscribe()
      }
    }
  }, [realtimeChannel])

  return (
    <SupabaseTournamentContext.Provider value={{
      tournaments,
      currentTournament,
      isLoading,
      error,
      isSupabaseConfigured: isSupabaseConfigured(),
      createTournament,
      joinTournament,
      updateTournamentState,
      leaveTournament,
      loadTournaments
    }}>
      {children}
    </SupabaseTournamentContext.Provider>
  )
}

export function useSupabaseTournament() {
  const context = useContext(SupabaseTournamentContext)
  if (!context) {
    throw new Error('useSupabaseTournament must be used within SupabaseTournamentProvider')
  }
  return context
}
