
import React from 'react';
import { TournamentLevel } from '@/types/tournament';

interface LevelInfoProps {
  currentLevel: TournamentLevel;
  nextLevelData?: TournamentLevel;
  currentLevelIndex: number;
}

export function LevelInfo({ currentLevel, nextLevelData, currentLevelIndex }: LevelInfoProps) {
  return (
    <div className="space-y-8">
      {/* Current Level */}
      <div>
        <div className="text-blue-400 text-lg font-semibold">Level {currentLevelIndex + 1}</div>
        <div className="text-2xl font-bold">
          {currentLevel?.isBreak ? 
            `${currentLevel.duration} minutos` :
            `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`
          }
          {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
            <div className="text-xl text-gray-300">({currentLevel.ante})</div>
          )}
        </div>
      </div>

      {/* Next Level */}
      {nextLevelData && (
        <div>
          <div className="text-blue-400 text-lg font-semibold">Next Level</div>
          <div className="text-2xl font-bold">
            {nextLevelData.isBreak ? 
              `Descanso ${nextLevelData.duration}min` :
              `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
            }
            {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
              <div className="text-xl text-gray-300">({nextLevelData.ante})</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
