
import React from 'react';
import { AdvancedTimer } from '@/components/timer/AdvancedTimer';
import { MobileFloatingControls } from '@/components/mobile/MobileFloatingControls';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { TournamentState } from '@/types/tournament';

interface MobileTournamentClockProps {
  tournament: TournamentState;
  currentLevel: any;
  nextLevelData: any;
  progress: number;
  lastMinuteAlert: boolean;
  nextBreakTime: string;
  toggleTimer: () => void;
  nextLevel: () => void;
  resetLevel: () => void;
  addPlayer: () => void;
  eliminatePlayer: () => void;
  skipBreak: () => void;
  setShowSettings: (show: boolean) => void;
}

export function MobileTournamentClock({
  tournament,
  currentLevel,
  nextLevelData,
  progress,
  lastMinuteAlert,
  nextBreakTime,
  toggleTimer,
  nextLevel,
  resetLevel,
  addPlayer,
  eliminatePlayer,
  skipBreak,
  setShowSettings
}: MobileTournamentClockProps) {
  const mobileOpt = useMobileOptimization();

  // Calculate stats
  const totalChips = (tournament.entries + tournament.reentries) * tournament.structure.initialStack;
  const averageStack = tournament.players > 0 ? totalChips / tournament.players : 0;

  return (
    <div 
      className="h-full flex flex-col px-4" 
      style={{
        paddingTop: mobileOpt.isFullscreen ? 
          `${mobileOpt.safeAreaInsets.top + 16}px` : '16px',
        paddingBottom: '120px'
      }}
    >
      
      {/* Tournament Title */}
      <div className="text-center py-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">
          {tournament.structure.name}
        </h1>
      </div>

      {/* Compact Stats Row */}
      <div className="flex-shrink-0 mb-6">
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wide">Players</div>
              <div className="text-white font-bold text-xl">{tournament.players}</div>
            </div>
            <div>
              <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wide">Prize Pool</div>
              <div className="text-yellow-400 font-bold text-xl">${tournament.currentPrizePool}</div>
            </div>
            <div>
              <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wide">Avg Stack</div>
              <div className="text-white font-bold text-xl">{Math.round(averageStack / 1000)}k</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timer - Much Larger and Centered */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="scale-90 md:scale-100">
          <AdvancedTimer
            timeRemaining={tournament.timeRemaining}
            currentLevel={currentLevel}
            progress={progress}
            lastMinuteAlert={lastMinuteAlert}
            nextBreakTime={nextBreakTime}
            currentLevelIndex={tournament.currentLevelIndex}
            isRunning={tournament.isRunning}
            isPaused={tournament.isPaused}
          />
        </div>
      </div>

      {/* Current Level Info - Prominent */}
      <div className="flex-shrink-0 pb-8">
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6">
          <div className="text-center space-y-4">
            
            {/* Current Level */}
            <div>
              <div className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                currentLevel?.isBreak ? 'text-cyan-400' : 'text-yellow-400'
              }`}>
                {currentLevel?.isBreak ? 'DESCANSO' : `NIVEL ${tournament.currentLevelIndex + 1}`}
              </div>
              <div className="text-3xl font-bold text-white">
                {currentLevel?.isBreak ? 
                  `${currentLevel.duration} minutos` :
                  `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`
                }
                {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
                  <div className="text-lg text-gray-300 mt-1">Ante: {currentLevel.ante}</div>
                )}
              </div>
            </div>

            {/* Next Level Preview */}
            {nextLevelData && !currentLevel?.isBreak && (
              <div className="pt-4 border-t border-gray-700/50">
                <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2">
                  Siguiente Nivel
                </div>
                <div className="text-lg font-bold text-gray-300">
                  {nextLevelData.isBreak ? 
                    `Descanso ${nextLevelData.duration}min` :
                    `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                  }
                  {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                    <span className="text-sm text-gray-400 ml-2">({nextLevelData.ante})</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Controls */}
      <MobileFloatingControls
        isRunning={tournament.isRunning}
        isPaused={tournament.isPaused}
        isOnBreak={tournament.isOnBreak}
        isFullscreen={mobileOpt.isFullscreen}
        playersCount={tournament.players}
        onToggleTimer={toggleTimer}
        onNextLevel={nextLevel}
        onResetLevel={resetLevel}
        onAddPlayer={addPlayer}
        onEliminatePlayer={eliminatePlayer}
        onSkipBreak={skipBreak}
        onToggleFullscreen={mobileOpt.toggleFullscreen}
        onOpenSettings={() => setShowSettings(true)}
      />
    </div>
  );
}
