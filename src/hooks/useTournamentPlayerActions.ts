
import { useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useSoundSystem } from '@/hooks/useSoundSystem';

export function useTournamentPlayerActions() {
  const { currentTournament, updateTournamentState } = useSupabaseTournament();
  const { playSound } = useSoundSystem();

  const calculatePrizePool = useCallback((entries: number, reentries: number, guaranteedPool: number, buyIn: number, reentryFee: number) => {
    const totalCollected = (entries * buyIn) + (reentries * reentryFee);
    return Math.max(totalCollected, guaranteedPool);
  }, []);

  const addPlayer = useCallback(() => {
    if (!currentTournament) return;
    
    playSound('buttonClick');
    
    const newEntries = currentTournament.entries + 1;
    const newPrizePool = calculatePrizePool(
      newEntries,
      currentTournament.reentries,
      currentTournament.structure.guaranteedPrizePool,
      currentTournament.structure.buyIn,
      currentTournament.structure.reentryFee
    );
    
    updateTournamentState({
      players: currentTournament.players + 1,
      entries: newEntries,
      currentPrizePool: newPrizePool
    });
  }, [currentTournament, playSound, updateTournamentState, calculatePrizePool]);

  const eliminatePlayer = useCallback(() => {
    if (!currentTournament || currentTournament.players <= 0) return;
    
    playSound('buttonClick');
    
    updateTournamentState({
      players: currentTournament.players - 1
    });
  }, [currentTournament, playSound, updateTournamentState]);

  const addReentry = useCallback(() => {
    if (!currentTournament) return;
    
    playSound('buttonClick');
    
    const newReentries = currentTournament.reentries + 1;
    const newPrizePool = calculatePrizePool(
      currentTournament.entries,
      newReentries,
      currentTournament.structure.guaranteedPrizePool,
      currentTournament.structure.buyIn,
      currentTournament.structure.reentryFee
    );
    
    updateTournamentState({
      players: currentTournament.players + 1,
      reentries: newReentries,
      currentPrizePool: newPrizePool
    });
  }, [currentTournament, playSound, updateTournamentState, calculatePrizePool]);

  return {
    addPlayer,
    eliminatePlayer,
    addReentry
  };
}
