
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
          console.log('Cleaning up previous channel');
          realtimeChannel.unsubscribe()
        }

        // Set up real-time updates with improved error handling
        const channelSetup = channel
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'tournament_states', filter: `tournament_id=eq.${tournamentId}` },
            (payload) => {
              console.log('Real-time tournament_states update:', payload);
              if (payload.new && payload.eventType !== 'DELETE') {
                const newState = payload.new as TournamentStateDB
                console.log('Updating tournament state:', {
                  currentLevelIndex: newState.current_level_index,
                  timeRemaining: newState.time_remaining,
                  isRunning: newState.is_running,
                  isPaused: newState.is_paused,
                  players: newState.players
                });
                
                setCurrentTournament(prev => {
                  if (!prev) return null;
                  
                  const updated = {
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
                  };
                  
                  console.log('Tournament state updated from real-time:', updated);
                  return updated;
                });
              }
            }
          )
          .subscribe((status) => {
            console.log('Real-time channel subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to real-time updates');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Real-time channel error');
              setError('Error connecting to real-time updates');
            }
          });

        setRealtimeChannel(channelSetup);
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
    if (!currentTournament) {
      console.warn('No current tournament to update');
      return;
    }

    try {
      console.log('Updating tournament state:', updates);
      
      // Optimistically update the local state first for immediate UI feedback
      setCurrentTournament(prev => {
        if (!prev) return null;
        const optimisticUpdate = { ...prev, ...updates };
        console.log('Optimistic update applied:', optimisticUpdate);
        return optimisticUpdate;
      });

      // Then persist to database
      await TournamentService.updateTournamentState(currentTournament.id, updates);
      console.log('✅ Tournament state updated successfully in database');
      
    } catch (err) {
      console.error('❌ Error updating tournament state:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error updating tournament';
      setError(errorMessage);
      
      // Revert optimistic update on error by refetching current state
      try {
        const { tournament } = await TournamentService.joinTournament(currentTournament.id);
        setCurrentTournament(tournament);
      } catch (refetchErr) {
        console.error('Error refetching tournament state:', refetchErr);
      }
      
      throw err;
    }
  }

  const leaveTournament = () => {
    if (realtimeChannel) {
      console.log('Leaving tournament - cleaning up real-time channel');
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
        console.log('Component unmounting - cleaning up real-time channel');
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
