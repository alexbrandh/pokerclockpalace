
import React, { createContext, useContext, useEffect, useState } from 'react'
import { TournamentState } from '@/types/tournament'
import { Tournament, SupabaseTournamentContextType, TournamentStateDB } from '@/types/tournament-context'
import { TournamentService } from '@/services/tournament-service'
import { isSupabaseConfigured } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'

const SupabaseTournamentContext = createContext<SupabaseTournamentContextType | null>(null)

export function SupabaseTournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [currentTournament, setCurrentTournament] = useState<TournamentState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)
  const { toast } = useToast()

  console.log('SupabaseTournamentProvider initialized');
  console.log('Supabase configured:', isSupabaseConfigured());

  const createTournament = async (structure: any, city: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)

      const tournamentId = await TournamentService.createTournament(structure, city)
      await loadTournaments()
      
      toast({
        title: "Torneo creado",
        description: "El torneo se ha creado exitosamente",
      })
      
      return tournamentId
    } catch (err) {
      console.error('Error creating tournament:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error creating tournament';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err;
    } finally {
      setIsLoading(false)
    }
  }

  const joinTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 Joining tournament with enhanced error handling:', tournamentId);

      const { tournament, channel } = await TournamentService.joinTournament(tournamentId)
      setCurrentTournament(tournament)

      if (channel) {
        // Clean up previous channel
        if (realtimeChannel) {
          console.log('🧹 Cleaning up previous channel');
          try {
            await realtimeChannel.unsubscribe()
          } catch (cleanupError) {
            console.warn('Warning during channel cleanup:', cleanupError);
          }
        }

        // Set up real-time updates with enhanced error handling
        const channelSetup = channel
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'tournament_states',
              filter: `tournament_id=eq.${tournamentId}`
            },
            (payload) => {
              console.log('📡 Real-time tournament_states update received:', {
                event: payload.eventType,
                timestamp: new Date().toISOString(),
                hasNewData: !!payload.new
              });
              
              if (payload.new && payload.eventType !== 'DELETE') {
                const newState = payload.new as TournamentStateDB
                console.log('📊 Processing state update:', {
                  level: newState.current_level_index,
                  time: newState.time_remaining,
                  running: newState.is_running,
                  players: newState.players
                });
                
                setCurrentTournament(prev => {
                  if (!prev) {
                    console.log('⚠️ No previous tournament state, ignoring update');
                    return null;
                  }
                  
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
                  
                  console.log('✅ Tournament state updated from real-time');
                  return updated;
                });
              }
            }
          )
          .subscribe((status, err) => {
            console.log(`📡 Real-time subscription status: ${status}`);
            
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to real-time updates');
              setError(null); // Clear any previous connection errors
              
              toast({
                title: "Conectado",
                description: "Conexión en tiempo real establecida",
              })
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Real-time channel error:', err);
              const errorMsg = err?.message || 'Error de canal desconocido';
              setError(`Error de conexión: ${errorMsg}`);
              
              toast({
                title: "Error de conexión",
                description: "No se pudo conectar a las actualizaciones en tiempo real",
                variant: "destructive"
              })
            } else if (status === 'TIMED_OUT') {
              console.error('❌ Real-time subscription timed out:', err);
              setError('Conexión en tiempo real expiró');
              
              toast({
                title: "Conexión expiró",
                description: "Reintentando conexión automáticamente...",
                variant: "destructive"
              })
            } else if (status === 'CLOSED') {
              console.log('📪 Real-time channel closed');
              setError('Conexión cerrada');
            }
          });

        setRealtimeChannel(channelSetup);
      }

    } catch (err) {
      console.error('❌ Error joining tournament:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error joining tournament';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
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
      console.log('🔄 Updating tournament state:', updates);
      
      // Optimistically update the local state first for immediate UI feedback
      setCurrentTournament(prev => {
        if (!prev) return null;
        const optimisticUpdate = { ...prev, ...updates };
        console.log('⚡ Optimistic update applied');
        return optimisticUpdate;
      });

      // Then persist to database (this will trigger real-time updates for other clients)
      await TournamentService.updateTournamentState(currentTournament.id, updates);
      console.log('✅ Tournament state updated successfully in database');
      
    } catch (err) {
      console.error('❌ Error updating tournament state:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error updating tournament';
      setError(errorMessage);
      
      toast({
        title: "Error de actualización",
        description: errorMessage,
        variant: "destructive"
      })
      
      // Revert optimistic update on error by refetching current state
      try {
        const { tournament } = await TournamentService.joinTournament(currentTournament.id);
        setCurrentTournament(tournament);
        console.log('🔄 Reverted to server state after error');
      } catch (refetchErr) {
        console.error('Error refetching tournament state:', refetchErr);
      }
      
      throw err;
    }
  }

  const leaveTournament = async () => {
    if (realtimeChannel) {
      console.log('👋 Leaving tournament - cleaning up real-time channel');
      try {
        await realtimeChannel.unsubscribe()
      } catch (error) {
        console.warn('Warning during channel cleanup on leave:', error);
      }
      setRealtimeChannel(null)
    }
    setCurrentTournament(null)
    setError(null) // Clear any connection errors when leaving
  }

  const loadTournaments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('📋 Loading tournaments from Supabase...');
      const data = await TournamentService.loadTournaments()
      setTournaments(data)
      console.log(`✅ Loaded ${data.length} tournaments`);
    } catch (err) {
      console.error('❌ Error loading tournaments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error loading tournaments';
      setError(errorMessage);
      
      toast({
        title: "Error de carga",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('🚀 SupabaseTournamentProvider mounted, loading tournaments...');
    loadTournaments()
  }, [])

  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        console.log('🧹 Component unmounting - cleaning up real-time channel');
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
