
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ref, onValue, set, push } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { database, auth } from '@/lib/firebase';
import { TournamentState, TournamentStructure } from '@/types/tournament';

interface TournamentContextType {
  tournament: TournamentState | null;
  isConnected: boolean;
  updateTournament: (updates: Partial<TournamentState>) => void;
  createTournament: (structure: TournamentStructure) => void;
  joinTournament: (tournamentId: string) => void;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

type TournamentAction = 
  | { type: 'SET_TOURNAMENT'; payload: TournamentState }
  | { type: 'UPDATE_TOURNAMENT'; payload: Partial<TournamentState> }
  | { type: 'SET_CONNECTION'; payload: boolean };

function tournamentReducer(state: TournamentState | null, action: TournamentAction): TournamentState | null {
  switch (action.type) {
    case 'SET_TOURNAMENT':
      return action.payload;
    case 'UPDATE_TOURNAMENT':
      return state ? { ...state, ...action.payload } : null;
    case 'SET_CONNECTION':
      return state;
    default:
      return state;
  }
}

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournament, dispatch] = useReducer(tournamentReducer, null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [currentTournamentId, setCurrentTournamentId] = React.useState<string | null>(null);

  useEffect(() => {
    signInAnonymously(auth).then(() => {
      setIsConnected(true);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!currentTournamentId || !isConnected) return;

    const tournamentRef = ref(database, `tournaments/${currentTournamentId}`);
    const unsubscribe = onValue(tournamentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        dispatch({ type: 'SET_TOURNAMENT', payload: data });
      }
    });

    return unsubscribe;
  }, [currentTournamentId, isConnected]);

  const updateTournament = (updates: Partial<TournamentState>) => {
    if (!currentTournamentId || !tournament) return;
    
    const updatedTournament = { ...tournament, ...updates };
    set(ref(database, `tournaments/${currentTournamentId}`), updatedTournament);
  };

  const createTournament = (structure: TournamentStructure) => {
    if (!isConnected) return;

    const newTournament: TournamentState = {
      id: '',
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

    const tournamentRef = push(ref(database, 'tournaments'));
    newTournament.id = tournamentRef.key!;
    set(tournamentRef, newTournament);
    setCurrentTournamentId(newTournament.id);
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
      joinTournament
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
