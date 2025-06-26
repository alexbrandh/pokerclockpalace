import React, { createContext, useContext, useEffect, useState } from 'react'
import { TournamentState } from '@/types/tournament'
import { Tournament, SupabaseTournamentContextType, TournamentStateDB } from '@/types/tournament-context'
import { TournamentService } from '@/services/tournament-service'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useSimplePolling } from '@/hooks/useSimplePolling'

const SupabaseTournamentContext = createContext<SupabaseTournamentContextType | null>(null)

export function SupabaseTournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [currentTournament, setCurrentTournament] = useState<TournamentState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  console.log('SupabaseTournamentProvider initialized');
  console.log('Supabase configured:', isSupabaseConfigured());

  // Simple polling connection with improved error handling
  const handleStateUpdate = (payload: any) => {
    console.log('📡 Processing tournament update via polling:', {
      event: payload.eventType,
      timestamp: new Date().toISOString()
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
        
        console.log('✅ Tournament state updated via polling');
        return updated;
      });
    }
  };

  const pollingConnection = useSimplePolling({
    tournamentId: currentTournament?.id || '',
    onStateUpdate: handleStateUpdate,
    enabled: !!currentTournament?.id
  });

  // Clear errors when polling is working
  useEffect(() => {
    if (pollingConnection.isPolling && !pollingConnection.error) {
      setError(null);
    } else if (pollingConnection.error) {
      setError(pollingConnection.error);
    }
  }, [pollingConnection.isPolling, pollingConnection.error]);

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

      console.log('🔄 Joining tournament:', tournamentId);

      const { tournament } = await TournamentService.joinTournament(tournamentId)
      setCurrentTournament(tournament)
      console.log('✅ Tournament joined successfully');

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

      // Then persist to database (polling will pick up changes for other clients)
      await TournamentService.updateTournamentState(currentTournament.id, updates);
      console.log('✅ Tournament state updated successfully in database');
      
      // Refresh polling data immediately after update
      pollingConnection.refresh();
      
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
    console.log('👋 Leaving tournament');
    setCurrentTournament(null)
    setError(null)
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

  const deleteTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🗑️ Deleting tournament:', tournamentId);
      await TournamentService.deleteTournament(tournamentId)
      
      // Reload tournaments to reflect the deletion
      await loadTournaments()
      
      toast({
        title: "Torneo eliminado",
        description: "El torneo se ha eliminado exitosamente",
      })
      
      console.log('✅ Tournament deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting tournament:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error deleting tournament';
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

  useEffect(() => {
    console.log('🚀 SupabaseTournamentProvider mounted, loading tournaments...');
    loadTournaments()
  }, [])

  return (
    <SupabaseTournamentContext.Provider value={{
      tournaments,
      currentTournament,
      isLoading,
      error: error || pollingConnection.error,
      isSupabaseConfigured: isSupabaseConfigured(),
      createTournament,
      joinTournament,
      updateTournamentState,
      leaveTournament,
      loadTournaments,
      deleteTournament,
      // Simplified connection state for polling
      realtimeConnection: {
        isConnected: pollingConnection.isPolling,
        status: pollingConnection.isPolling ? 'polling' : 'disconnected',
        error: pollingConnection.error,
        reconnectAttempts: 0,
        lastError: pollingConnection.error,
        reconnect: pollingConnection.refresh
      }
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
