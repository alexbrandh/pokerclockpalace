
import React from 'react';

interface PlayerInfoProps {
  players: number;
  entries: number;
  reentries: number;
  currentPrizePool: number;
}

export function PlayerInfo({ players, entries, reentries, currentPrizePool }: PlayerInfoProps) {
  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      {/* Players Info - En la misma fila */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Players</div>
          <div className="text-2xl font-bold">{players}</div>
        </div>
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Entries</div>
          <div className="text-2xl font-bold">{entries}</div>
        </div>
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Re-Entries</div>
          <div className="text-2xl font-bold">{reentries}</div>
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
        <div className="text-yellow-400 text-3xl font-bold">${currentPrizePool}.00</div>
      </div>

      {/* Enhanced Golden separator line */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
        <div className="relative bg-black px-4">
          <div className="h-1 w-16 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg shadow-yellow-400/30"></div>
        </div>
      </div>

      {/* Chip Info - Total y Average en filas separadas */}
      <div className="text-center space-y-3">
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Total</div>
          <div className="text-lg font-bold">120,000</div>
        </div>
        <div>
          <div className="text-yellow-400 text-sm font-semibold mb-1">Average</div>
          <div className="text-lg font-bold">15,000 / 150BBs</div>
        </div>
      </div>
    </div>
  );
}
