
import { useState, useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';

export function useTournamentHistory() {
  const { currentTournament, updateTournamentState } = useSupabaseTournament();
  const [actionHistory, setActionHistory] = useState<Array<Partial<any>>>([]);

  // Helper function to save state for undo
  const saveStateForUndo = useCallback(() => {
    if (currentTournament) {
      setActionHistory(prev => [...prev.slice(-9), { ...currentTournament }]);
    }
  }, [currentTournament]);

  const undoLastAction = useCallback(() => {
    if (actionHistory.length === 0) return;
    
    const lastState = actionHistory[actionHistory.length - 1];
    setActionHistory(prev => prev.slice(0, -1));
    
    if (lastState && currentTournament) {
      updateTournamentState(lastState);
    }
  }, [actionHistory, updateTournamentState, currentTournament]);

  return {
    actionHistory,
    saveStateForUndo,
    undoLastAction
  };
}
