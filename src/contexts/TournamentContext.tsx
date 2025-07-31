import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TournamentState, TournamentStructure } from '@/types/tournament';
import { secureLog, secureError } from '@/utils/securityUtils';

interface TournamentContextType {
  tournament: TournamentState | null;
  isConnected: boolean;
  updateTournament: (updates: Partial<TournamentState>) => void;
  createTournament: (structure: TournamentStructure) => void;
  joinTournament: (tournamentId: string) => void;
  error: string | null;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

type TournamentAction = 
  | { type: 'SET_TOURNAMENT'; payload: TournamentState }
  | { type: 'UPDATE_TOURNAMENT'; payload: Partial<TournamentState> }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function tournamentReducer(state: TournamentState | null, action: TournamentAction): TournamentState | null {
  switch (action.type) {
    case 'SET_TOURNAMENT':
      return action.payload;
    case 'UPDATE_TOURNAMENT':
      return state ? { ...state, ...action.payload } : null;
    case 'SET_CONNECTION':
      return state;
    case 'SET_ERROR':
      return state;
    default:
      return state;
  }
}

// Default tournament structure
const createDefaultTournament = (): TournamentState => ({
  id: 'default-tournament',
  structure: {
    id: 'default-structure',
    name: 'Garage Poker League',
    buyIn: 50,
    reentryFee: 25,
    guaranteedPrizePool: 300,
    initialStack: 10000, // Default initial stack
    levels: [
      { id: '1', smallBlind: 50, bigBlind: 100, ante: 0, duration: 20, isBreak: false },
      { id: '2', smallBlind: 75, bigBlind: 150, ante: 0, duration: 20, isBreak: false },
      { id: '3', smallBlind: 100, bigBlind: 200, ante: 0, duration: 20, isBreak: false },
      { id: 'break1', smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true, breakDuration: 15 }
    ],
    breakAfterLevels: 3,
    payoutStructure: [50, 30, 20]
  },
  currentLevelIndex: 0,
  timeRemaining: 20 * 60, // 20 minutes in seconds
  isRunning: false,
  isPaused: false,
  isOnBreak: false,
  players: 8,
  entries: 8,
  reentries: 0,
  currentPrizePool: 300,
  startTime: Date.now()
});

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournament, dispatch] = useReducer(tournamentReducer, null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [currentTournamentId, setCurrentTournamentId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    // Initialize with default tournament
    const defaultTournament = createDefaultTournament();
    dispatch({ type: 'SET_TOURNAMENT', payload: defaultTournament });
    
    // This context is now local-only for fallback purposes
    // Main app should use SupabaseTournamentContext
    setIsConnected(false);
    setError('Modo local - Use SupabaseTournamentContext para funcionalidad completa');
    
    secureLog('TournamentContext initialized in local mode');
  }, []);

  // This context is now local-only, no external sync needed

  const updateTournament = (updates: Partial<TournamentState>) => {
    if (!tournament) return;
    
    // Update local state only - this is now a fallback context
    dispatch({ type: 'UPDATE_TOURNAMENT', payload: updates });
    
    secureLog('Local tournament updated', { tournamentId: tournament.id });
  };

  const createTournament = (structure: TournamentStructure) => {
    const newTournament: TournamentState = {
      id: `local-${Date.now()}`, // Local-only ID
      structure,
      currentLevelIndex: 0,
      timeRemaining: structure.levels[0]?.duration * 60 || 0,
      isRunning: false,
      isPaused: false,
      isOnBreak: false,
      players: 0,
      entries: 0,
      reentries: 0,
      currentPrizePool: structure.guaranteedPrizePool,
      startTime: Date.now()
    };

    // Local-only creation
    setCurrentTournamentId(newTournament.id);
    dispatch({ type: 'SET_TOURNAMENT', payload: newTournament });
    
    secureLog('Local tournament created', { tournamentId: newTournament.id });
  };

  const joinTournament = (tournamentId: string) => {
    setCurrentTournamentId(tournamentId);
  };

  return (
    <TournamentContext.Provider value={{
      tournament,
      isConnected,
      updateTournament,
      createTournament,
      joinTournament,
      error
    }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within TournamentProvider');
  }
  return context;
}
