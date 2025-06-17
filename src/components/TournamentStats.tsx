
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TournamentState } from '@/types/tournament';

interface TournamentStatsProps {
  tournament: TournamentState;
}

export function TournamentStats({ tournament }: TournamentStatsProps) {
  const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
  const totalChips = tournament.players * 10000; // Assuming 10k starting stack
  const averageStack = tournament.players > 0 ? totalChips / tournament.players : 0;
  const averageStackInBBs = currentLevel && !currentLevel.isBreak ? 
    averageStack / currentLevel.bigBlind : 0;

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Estadísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Jugadores:</span>
            <span className="text-white font-medium">{tournament.players}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Entradas:</span>
            <span className="text-white font-medium">{tournament.entries}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Re-entradas:</span>
            <span className="text-white font-medium">{tournament.reentries}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Prize Pool:</span>
            <span className="text-white font-medium">${tournament.currentPrizePool}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Total Fichas:</span>
            <span className="text-white font-medium">{totalChips.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Stack Promedio:</span>
            <span className="text-white font-medium">{Math.round(averageStack).toLocaleString()}</span>
          </div>
          {!currentLevel?.isBreak && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Promedio en BBs:</span>
              <span className="text-white font-medium">{Math.round(averageStackInBBs)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
