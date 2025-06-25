
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
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4">
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
        <div className="grid grid-cols-3 gap-3 text-center text-xs mt-4">
          <div>
            <div className="text-gray-400 font-semibold uppercase tracking-wide">Entries</div>
            <div className="text-white font-bold text-lg">{tournament.entries}</div>
          </div>
          <div>
            <div className="text-gray-400 font-semibold uppercase tracking-wide">Re-entries</div>
            <div className="text-white font-bold text-lg">{tournament.reentries}</div>
          </div>
          <div>
            <div className="text-gray-400 font-semibold uppercase tracking-wide">Total</div>
            <div className="text-white font-bold text-lg">{tournament.entries + tournament.reentries}</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-3 text-center text-xs mt-4 pt-3 border-t border-gray-700/50">
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
      </div>

      {/* Tournament Details */}
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4">
        <div className="text-yellow-400 text-sm font-semibold mb-3 text-center">
          Detalles del Torneo
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-300">Buy-in</span>
            <span className="font-bold text-white">${tournament.structure.buyIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Re-entry Fee</span>
            <span className="font-bold text-white">${tournament.structure.reentryFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Initial Stack</span>
            <span className="font-bold text-white">{tournament.structure.initialStack.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Guaranteed</span>
            <span className="font-bold text-white">${tournament.structure.guaranteedPrizePool}</span>
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
