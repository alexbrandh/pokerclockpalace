
import React from 'react';
import { TournamentState } from '@/types/tournament';

interface MobileExpandedStatsProps {
  tournament: TournamentState;
  currentLevel: any;
}

export function MobileExpandedStats({ tournament, currentLevel }: MobileExpandedStatsProps) {
  const totalChips = (tournament.entries + tournament.reentries) * tournament.structure.initialStack;
  const averageStack = tournament.players > 0 ? totalChips / tournament.players : 0;
  const averageStackInBBs = currentLevel && !currentLevel.isBreak ? 
    Math.round(averageStack / currentLevel.bigBlind) : 0;

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-center text-sm">
        <div>
          <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wide">Players</div>
          <div className="text-white font-bold text-xl">{tournament.players}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wide">Prize Pool</div>
          <div className="text-yellow-400 font-bold text-xl">${tournament.currentPrizePool}</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div>
          <div className="text-gray-400 font-semibold uppercase tracking-wide">Entries</div>
          <div className="text-white font-bold text-lg">
            {tournament.entries + tournament.reentries}
            {tournament.reentries > 0 && (
              <span className="text-xs text-gray-300 ml-1">
                (+{tournament.reentries})
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-gray-400 font-semibold uppercase tracking-wide">Avg Stack</div>
          <div className="text-white font-bold text-lg">
            {Math.round(averageStack / 1000)}k
            {!currentLevel?.isBreak && averageStackInBBs > 0 && (
              <div className="text-xs text-gray-300">
                ({averageStackInBBs} BBs)
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="text-gray-400 font-semibold uppercase tracking-wide">Total Chips</div>
          <div className="text-white font-bold text-lg">
            {Math.round(totalChips / 1000)}k
          </div>
        </div>
      </div>

      {/* Break Info if applicable */}
      {tournament.isOnBreak && (
        <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-xl p-3 text-center">
          <div className="text-cyan-400 font-semibold text-sm">DESCANSO ACTIVO</div>
          <div className="text-white text-xs mt-1">El torneo está en pausa</div>
        </div>
      )}
    </div>
  );
}
