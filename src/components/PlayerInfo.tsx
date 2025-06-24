
import React from 'react';

interface PlayerInfoProps {
  players: number;
  entries: number;
  reentries: number;
  currentPrizePool: number;
  initialStack: number;
  currentLevel?: {
    smallBlind: number;
    bigBlind: number;
    isBreak: boolean;
  };
}

export function PlayerInfo({
  players,
  entries,
  reentries,
  currentPrizePool,
  initialStack,
  currentLevel
}: PlayerInfoProps) {
  // Dynamic calculation: (entries + reentries) × initialStack ÷ activePlayers
  const totalChips = (entries + reentries) * initialStack;
  const averageStack = players > 0 ? totalChips / players : 0;
  const averageStackInBBs = currentLevel && !currentLevel.isBreak ? 
    Math.round(averageStack / currentLevel.bigBlind) : 0;

  return (
    <div className="h-full flex flex-col justify-between space-y-6">
      {/* Players Info - En la misma fila */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Players</div>
          <div className="text-3xl font-bold">{players}</div>
        </div>
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Entries</div>
          <div className="text-3xl font-bold">{entries}</div>
        </div>
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Re-Entries</div>
          <div className="text-3xl font-bold">{reentries}</div>
        </div>
      </div>

      {/* Enhanced Golden separator line */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
        <div className="relative bg-black px-4">
          <div className="h-1 w-16 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg shadow-yellow-400/30"></div>
        </div>
      </div>

      {/* Prize Pool */}
      <div className="text-center">
        <div className="text-yellow-400 text-lg font-semibold mb-2">Total Prize Pool</div>
        <div className="text-yellow-400 text-4xl font-bold">${currentPrizePool}.00</div>
      </div>

      {/* Enhanced Golden separator line */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
        <div className="relative bg-black px-4">
          <div className="h-1 w-16 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg shadow-yellow-400/30"></div>
        </div>
      </div>

      {/* Chip Info - Total y Average en filas separadas con cálculo dinámico */}
      <div className="text-center space-y-4">
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Total</div>
          <div className="text-2xl font-bold">{totalChips.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Average</div>
          <div className="text-xl font-bold">
            {Math.round(averageStack).toLocaleString()}
            {!currentLevel?.isBreak && averageStackInBBs > 0 && (
              <div className="text-lg text-gray-300">({averageStackInBBs} BBs)</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
