
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { TournamentState } from '@/types/tournament'
import { Tournament, SupabaseTournamentContextType, TournamentStateDB } from '@/types/tournament-context'
import { TournamentService } from '@/services/tournament-service'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { usePollingOnly } from '@/hooks/usePollingOnly'
import { secureLog, secureError, sanitizeError, validateTournamentData } from '@/utils/securityUtils'

const SupabaseTournamentContext = createContext<SupabaseTournamentContextType | null>(null)

export function SupabaseTournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [currentTournament, setCurrentTournament] = useState<TournamentState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  secureLog('SupabaseTournamentProvider initialized');
  secureLog('Supabase configured:', isSupabaseConfigured());

  // Simple real-time connection
  const handleStateUpdate = useCallback((payload: any) => {
    secureLog('📡 Processing update:', payload.eventType);
    
    if (payload.new && payload.eventType !== 'DELETE') {
      const newState = payload.new as TournamentStateDB
      
      setCurrentTournament(prev => {
        if (!prev) return null;
        
        return {
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
      });
    }
  }, []);

  const realtimeConnection = usePollingOnly({
    tournamentId: currentTournament?.id || '',
    onStateUpdate: handleStateUpdate,
    enabled: !!currentTournament?.id,
    interval: 1000
  });

  // Clear errors when connected
  useEffect(() => {
    if (realtimeConnection.isConnected) {
      setError(null);
    } else if (realtimeConnection.error) {
      setError(realtimeConnection.error);
    }
  }, [realtimeConnection.isConnected, realtimeConnection.error]);

  const createTournament = async (structure: any, city: string): Promise<string> => {
    // Validate tournament data before creating
    const validation = validateTournamentData(structure);
    if (!validation.isValid) {
      throw new Error(`Invalid tournament data: ${validation.errors.join(', ')}`);
    }

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
      secureError('Error creating tournament:', err);
      const errorMessage = sanitizeError(err);
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

      secureLog('🔄 Joining tournament:', tournamentId);

      const { tournament } = await TournamentService.joinTournament(tournamentId)
      setCurrentTournament(tournament)
      secureLog('✅ Tournament joined successfully');

    } catch (err) {
      secureError('❌ Error joining tournament:', err);
      const errorMessage = sanitizeError(err);
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
      secureLog('No current tournament to update');
      return;
    }

    try {
      secureLog('🔄 Updating tournament state:', updates);
      
      // Optimistically update the local state first for immediate UI feedback
      setCurrentTournament(prev => {
        if (!prev) return null;
        const optimisticUpdate = { ...prev, ...updates };
        secureLog('⚡ Optimistic update applied');
        return optimisticUpdate;
      });

      // Then persist to database (polling will pick up changes for other clients)
      await TournamentService.updateTournamentState(currentTournament.id, updates);
      secureLog('✅ Tournament state updated successfully in database');
      
      // Trigger reconnection if disconnected
      if (!realtimeConnection.isConnected) {
        realtimeConnection.reconnect();
      }
      
    } catch (err) {
      secureError('❌ Error updating tournament state:', err);
      const errorMessage = sanitizeError(err);
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
        secureLog('🔄 Reverted to server state after error');
      } catch (refetchErr) {
        secureError('Error refetching tournament state:', refetchErr);
      }
      
      throw err;
    }
  }

  const leaveTournament = async () => {
    secureLog('👋 Leaving tournament');
    setCurrentTournament(null)
    setError(null)
  }

  const loadTournaments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      secureLog('📋 Loading tournaments from Supabase...');
      const data = await TournamentService.loadTournaments()
      
      // Force update by creating new array reference
      setTournaments([...data])
      secureLog(`✅ Loaded ${data.length} tournaments, state updated`);
      
      // Log tournament IDs for debugging
      secureLog('Tournament IDs:', data.map(t => ({ id: t.id, name: t.name })));
      
    } catch (err) {
      secureError('❌ Error loading tournaments:', err);
      const errorMessage = sanitizeError(err);
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

  const updateTournament = async (tournamentId: string, updates: any) => {
    try {
      setIsLoading(true)
      setError(null)
      
      secureLog('🔄 Updating tournament settings:', updates);
      await TournamentService.updateTournament(tournamentId, updates)
      
      // Update current tournament if it's the one being edited
      if (currentTournament && currentTournament.id === tournamentId) {
        setCurrentTournament(prev => prev ? { ...prev, ...updates } : null)
      }
      
      // Reload tournaments to get fresh data
      await loadTournaments()
      
      toast({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado exitosamente",
      })
      
    } catch (err) {
      secureError('❌ Error updating tournament:', err);
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
      
      toast({
        title: "Error de actualización",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err;
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      secureLog('🗑️ Starting tournament deletion process for:', tournamentId);
      
      // Store the tournament name for the success message
      const tournamentToDelete = tournaments.find(t => t.id === tournamentId);
      const tournamentName = tournamentToDelete?.name || 'Tournament';
      
      secureLog(`🔄 Deleting tournament: ${tournamentName}`);
      
      // Call the deletion service
      await TournamentService.deleteTournament(tournamentId)
      
      secureLog('✅ Tournament deletion service completed');
      
      // Immediately remove from local state for instant UI feedback
      setTournaments(prev => {
        const updated = prev.filter(t => t.id !== tournamentId);
        secureLog(`⚡ Optimistically removed tournament from local state. Remaining: ${updated.length}`);
        return updated;
      });
      
      // Force reload tournaments to ensure consistency with database
      secureLog('🔄 Reloading tournaments to verify deletion...');
      await loadTournaments()
      
      // Verify the tournament was actually deleted
      const remainingTournaments = tournaments.filter(t => t.id !== tournamentId);
      const wasDeleted = !remainingTournaments.find(t => t.id === tournamentId);
      
      if (wasDeleted) {
        secureLog('🎉 Tournament deletion verified successfully');
        toast({
          title: "Torneo eliminado",
          description: `El torneo "${tournamentName}" se ha eliminado exitosamente`,
        })
      } else {
        secureError('❌ Tournament deletion verification failed');
        throw new Error('Tournament still exists after deletion attempt');
      }
      
    } catch (err) {
      secureError('❌ Error deleting tournament:', err);
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
      
      // Reload tournaments to restore correct state if deletion failed
      await loadTournaments();
      
      toast({
        title: "Error de eliminación",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err;
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    secureLog('🚀 SupabaseTournamentProvider mounted, loading tournaments...');
    loadTournaments()
  }, [])

  return (
    <SupabaseTournamentContext.Provider value={{
      tournaments,
      currentTournament,
      isLoading,
      error: error || realtimeConnection.error,
      isSupabaseConfigured: isSupabaseConfigured(),
      createTournament,
      joinTournament,
      updateTournamentState,
      updateTournament,
      leaveTournament,
      loadTournaments,
      deleteTournament,
      // Real-time connection state
      realtimeConnection
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
