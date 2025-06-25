
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUserId, generateAccessCode, isSupabaseConfigured } from '@/lib/supabase'
import { TournamentState, TournamentStructure } from '@/types/tournament'
import { Database } from '@/types/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type TournamentStateDB = Database['public']['Tables']['tournament_states']['Row']

interface SupabaseTournamentContextType {
  tournaments: Tournament[]
  currentTournament: TournamentState | null
  isLoading: boolean
  error: string | null
  isSupabaseConfigured: boolean
  createTournament: (structure: TournamentStructure, city: string) => Promise<string>
  joinTournament: (tournamentId: string) => Promise<void>
  updateTournamentState: (updates: Partial<TournamentState>) => Promise<void>
  leaveTournament: () => void
  loadTournaments: () => Promise<void>
}

const SupabaseTournamentContext = createContext<SupabaseTournamentContextType | null>(null)

export function SupabaseTournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [currentTournament, setCurrentTournament] = useState<TournamentState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  console.log('SupabaseTournamentProvider initialized');
  console.log('Supabase configured:', isSupabaseConfigured());

  // Mock data for when Supabase is not configured
  const mockTournaments: Tournament[] = [
    {
      id: 'demo-1',
      name: 'Torneo Demo - Sit & Go',
      buy_in: 100,
      reentry_fee: 100,
      guaranteed_prize_pool: 1000,
      initial_stack: 10000,
      levels: [
        { id: '1', smallBlind: 25, bigBlind: 50, ante: 0, duration: 20, isBreak: false },
        { id: '2', smallBlind: 50, bigBlind: 100, ante: 0, duration: 20, isBreak: false },
        { id: 'break1', smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true, breakDuration: 15 },
        { id: '3', smallBlind: 75, bigBlind: 150, ante: 25, duration: 20, isBreak: false },
      ],
      break_after_levels: 2,
      payout_structure: [50, 30, 20],
      status: 'created',
      created_by: 'demo-user',
      created_at: new Date().toISOString(),
      city: 'Ciudad de México',
      access_code: 'DEMO01'
    }
  ];

  const createTournament = async (structure: TournamentStructure, city: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)

      if (!isSupabaseConfigured()) {
        // Demo mode - create mock tournament
        const demoTournament: Tournament = {
          id: 'demo-' + Date.now(),
          name: structure.name,
          buy_in: structure.buyIn,
          reentry_fee: structure.reentryFee,
          guaranteed_prize_pool: structure.guaranteedPrizePool,
          initial_stack: structure.initialStack,
          levels: structure.levels,
          break_after_levels: structure.breakAfterLevels,
          payout_structure: structure.payoutStructure,
          status: 'created',
          created_by: 'demo-user',
          created_at: new Date().toISOString(),
          city: city,
          access_code: generateAccessCode()
        };
        
        setTournaments(prev => [demoTournament, ...prev]);
        return demoTournament.id;
      }

      const userId = await getCurrentUserId()
      const accessCode = generateAccessCode()

      // Create tournament
      const { data: tournament, error: tournamentError } = await supabase!
        .from('tournaments')
        .insert({
          name: structure.name,
          buy_in: structure.buyIn,
          reentry_fee: structure.reentryFee,
          guaranteed_prize_pool: structure.guaranteedPrizePool,
          initial_stack: structure.initialStack,
          levels: structure.levels,
          break_after_levels: structure.breakAfterLevels,
          payout_structure: structure.payoutStructure,
          status: 'created',
          created_by: userId,
          city: city,
          access_code: accessCode
        })
        .select()
        .single()

      if (tournamentError) throw tournamentError

      // Create initial tournament state
      const { error: stateError } = await supabase!
        .from('tournament_states')
        .insert({
          tournament_id: tournament.id,
          current_level_index: 0,
          time_remaining: structure.levels[0]?.duration * 60 || 0,
          is_running: false,
          is_paused: false,
          is_on_break: false,
          players: 0,
          entries: 0,
          reentries: 0,
          current_prize_pool: structure.guaranteedPrizePool,
          updated_by: userId
        })

      if (stateError) throw stateError

      // Log creation
      await supabase!
        .from('tournament_logs')
        .insert({
          tournament_id: tournament.id,
          action: 'tournament_created',
          details: { structure, city },
          created_by: userId
        })

      await loadTournaments()
      return tournament.id
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

      console.log('Joining tournament:', tournamentId);

      if (!isSupabaseConfigured()) {
        // Demo mode - find tournament in mock data
        const tournament = mockTournaments.find(t => t.id === tournamentId);
        if (!tournament) {
          throw new Error('Tournament not found');
        }

        const tournamentState: TournamentState = {
          id: tournament.id,
          structure: {
            id: tournament.id,
            name: tournament.name,
            buyIn: tournament.buy_in,
            reentryFee: tournament.reentry_fee,
            guaranteedPrizePool: tournament.guaranteed_prize_pool,
            initialStack: tournament.initial_stack,
            levels: tournament.levels,
            breakAfterLevels: tournament.break_after_levels,
            payoutStructure: tournament.payout_structure
          },
          currentLevelIndex: 0,
          timeRemaining: tournament.levels[0]?.duration * 60 || 1200,
          isRunning: false,
          isPaused: false,
          isOnBreak: false,
          players: 0,
          entries: 0,
          reentries: 0,
          currentPrizePool: tournament.guaranteed_prize_pool,
          startTime: undefined
        };

        setCurrentTournament(tournamentState);
        return;
      }

      // Get tournament and its current state
      const { data: tournament, error: tournamentError } = await supabase!
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single()

      if (tournamentError) throw tournamentError

      const { data: state, error: stateError } = await supabase!
        .from('tournament_states')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single()

      if (stateError) throw stateError

      // Convert to TournamentState format
      const tournamentState: TournamentState = {
        id: tournament.id,
        structure: {
          id: tournament.id,
          name: tournament.name,
          buyIn: tournament.buy_in,
          reentryFee: tournament.reentry_fee,
          guaranteedPrizePool: tournament.guaranteed_prize_pool,
          initialStack: tournament.initial_stack,
          levels: tournament.levels,
          breakAfterLevels: tournament.break_after_levels,
          payoutStructure: tournament.payout_structure
        },
        currentLevelIndex: state.current_level_index,
        timeRemaining: state.time_remaining,
        isRunning: state.is_running,
        isPaused: state.is_paused,
        isOnBreak: state.is_on_break,
        players: state.players,
        entries: state.entries,
        reentries: state.reentries,
        currentPrizePool: state.current_prize_pool,
        startTime: state.start_time ? Date.parse(state.start_time) : undefined
      }

      setCurrentTournament(tournamentState)

      // Set up real-time subscription
      if (realtimeChannel) {
        realtimeChannel.unsubscribe()
      }

      const channel = supabase!
        .channel(`tournament_${tournamentId}`)
        .on('postgres_changes', 
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
        .subscribe()

      setRealtimeChannel(channel)

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
      console.log('Updating tournament state:', updates);

      if (!isSupabaseConfigured()) {
        // Demo mode - update local state only
        setCurrentTournament(prev => prev ? { ...prev, ...updates } : null);
        return;
      }

      const userId = await getCurrentUserId()
      
      const { error } = await supabase!
        .from('tournament_states')
        .update({
          current_level_index: updates.currentLevelIndex,
          time_remaining: updates.timeRemaining,
          is_running: updates.isRunning,
          is_paused: updates.isPaused,
          is_on_break: updates.isOnBreak,
          players: updates.players,
          entries: updates.entries,
          reentries: updates.reentries,
          current_prize_pool: updates.currentPrizePool,
          start_time: updates.startTime ? new Date(updates.startTime).toISOString() : undefined,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('tournament_id', currentTournament.id)

      if (error) throw error

      // Log the action
      await supabase!
        .from('tournament_logs')
        .insert({
          tournament_id: currentTournament.id,
          action: 'state_updated',
          details: updates,
          created_by: userId
        })

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

      console.log('Loading tournaments...');

      if (!isSupabaseConfigured()) {
        // Demo mode - use mock data
        setTournaments(mockTournaments);
        return;
      }

      const { data, error } = await supabase!
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTournaments(data || [])
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
