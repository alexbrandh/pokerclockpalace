
import React from 'react';
import { TournamentState } from '@/types/tournament';

interface StickyStatsBarProps {
  tournament: TournamentState;
}

export function StickyStatsBar({ tournament }: StickyStatsBarProps) {
  const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
  
  // Dynamic calculations
  const totalChips = (tournament.entries + tournament.reentries) * tournament.structure.initialStack;
  const averageStack = tournament.players > 0 ? totalChips / tournament.players : 0;
  const averageStackInBBs = currentLevel && !currentLevel.isBreak ? 
    Math.round(averageStack / currentLevel.bigBlind) : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur border-b border-yellow-400/20">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-1 md:py-2">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 text-center">
          {/* Players Remaining */}
          <div className="space-y-0.5 md:space-y-1">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">
              Players
            </div>
            <div className="text-white text-lg md:text-xl font-bold">
              {tournament.players}
            </div>
          </div>

          {/* Total Entries - Hidden on smallest mobile */}
          <div className="space-y-0.5 md:space-y-1 hidden sm:block">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">
              Entries
            </div>
            <div className="text-white text-lg md:text-xl font-bold">
              {tournament.entries + tournament.reentries}
              {tournament.reentries > 0 && (
                <span className="text-sm text-gray-300 ml-1">
                  (+{tournament.reentries})
                </span>
              )}
            </div>
          </div>

          {/* Prize Pool */}
          <div className="space-y-0.5 md:space-y-1">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">
              Prize Pool
            </div>
            <div className="text-yellow-400 text-lg md:text-xl font-bold">
              ${tournament.currentPrizePool}
            </div>
          </div>

          {/* Total Chips - Hidden on mobile, shown on larger screens */}
          <div className="space-y-0.5 md:space-y-1 hidden md:block">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">
              Total Chips
            </div>
            <div className="text-white text-lg md:text-xl font-bold">
              {totalChips.toLocaleString()}
            </div>
          </div>

          {/* Average Stack */}
          <div className="space-y-0.5 md:space-y-1">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">
              Avg Stack
            </div>
            <div className="text-white text-lg md:text-xl font-bold">
              {Math.round(averageStack / 1000)}k
              {!currentLevel?.isBreak && averageStackInBBs > 0 && (
                <div className="text-xs md:text-sm text-gray-300">
                  ({averageStackInBBs} BBs)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
