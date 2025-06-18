
import React from 'react';

interface PlayerInfoProps {
  players: number;
  entries: number;
  reentries: number;
  currentPrizePool: number;
}

export function PlayerInfo({ players, entries, reentries, currentPrizePool }: PlayerInfoProps) {
  return (
    <div className="space-y-8">
      {/* Players Info */}
      <div className="space-y-4">
        <div>
          <div className="text-blue-400 text-lg font-semibold">Players</div>
          <div className="text-4xl font-bold">{players}</div>
        </div>
        <div>
          <div className="text-blue-400 text-lg font-semibold">Entries</div>
          <div className="text-4xl font-bold">{entries}</div>
        </div>
        <div>
          <div className="text-blue-400 text-lg font-semibold">Incl. Re-Entries</div>
          <div className="text-4xl font-bold">{reentries}</div>
        </div>
      </div>

      {/* Prize Pool */}
      <div className="pt-8">
        <div className="text-blue-400 text-lg font-semibold">Total Prize Pool</div>
        <div className="text-blue-400 text-3xl font-bold">${currentPrizePool}.00</div>
      </div>

      {/* Logo/Club Section */}
      <div className="pt-8 text-center">
        <div className="w-24 h-24 mx-auto mb-2 border-2 border-white rounded-full flex items-center justify-center">
          <div className="text-2xl">♠</div>
        </div>
        <div className="text-sm font-semibold">ACE-HIGH-CLUB</div>
        <div className="text-xs text-gray-400">POKER CLUB</div>
      </div>

      {/* Chip Info */}
      <div className="pt-8">
        <div>
          <span className="text-blue-400 text-lg font-semibold">Total</span>
          <span className="ml-8 text-blue-400 text-lg font-semibold">Average</span>
        </div>
        <div className="text-2xl font-bold">120,000  15,000 / 150BBs</div>
      </div>
    </div>
  );
}
