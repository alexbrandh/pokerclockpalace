
import React from 'react';
import { AdvancedTimer } from '@/components/timer/AdvancedTimer';
import { MobileFloatingControls } from '@/components/mobile/MobileFloatingControls';
import { MobileExpandedStats } from '@/components/mobile/MobileExpandedStats';
import { MobilePrizeInfo } from '@/components/mobile/MobilePrizeInfo';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { TournamentState } from '@/types/tournament';

interface MobileTournamentClockProps {
  tournament: TournamentState;
  currentLevel: any;
  nextLevelData: any;
  progress: number;
  lastMinuteAlert: boolean;
  nextBreakTime: string;
  actionHistory: any[];
  toggleTimer: () => void;
  nextLevel: () => void;
  resetLevel: () => void;
  addPlayer: () => void;
  eliminatePlayer: () => void;
  addReentry: () => void;
  skipBreak: () => void;
  undoLastAction: () => void;
  setShowSettings: (show: boolean) => void;
}

export function MobileTournamentClock({
  tournament,
  currentLevel,
  nextLevelData,
  progress,
  lastMinuteAlert,
  nextBreakTime,
  actionHistory,
  toggleTimer,
  nextLevel,
  resetLevel,
  addPlayer,
  eliminatePlayer,
  addReentry,
  skipBreak,
  undoLastAction,
  setShowSettings
}: MobileTournamentClockProps) {
  const mobileOpt = useMobileOptimization();

  return (
    <div 
      className="h-full flex flex-col px-4" 
      style={{
        paddingTop: mobileOpt.isFullscreen ? 
          `${mobileOpt.safeAreaInsets.top + 12}px` : '12px',
        paddingBottom: '100px'
      }}
    >
      
      {/* Tournament Title */}
      <div className="text-center py-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">
          {tournament.structure.name}
        </h1>
      </div>

      {/* Expanded Stats */}
      <div className="flex-shrink-0 mb-4">
        <MobileExpandedStats 
          tournament={tournament} 
          currentLevel={currentLevel}
        />
      </div>

      {/* Timer - Centered and Large */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="scale-85 md:scale-95">
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

      {/* Current Level Info */}
      <div className="flex-shrink-0 pb-4">
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4">
          <div className="text-center space-y-3">
            
            {/* Current Level */}
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                currentLevel?.isBreak ? 'text-cyan-400' : 'text-yellow-400'
              }`}>
                {currentLevel?.isBreak ? 'DESCANSO' : `NIVEL ${tournament.currentLevelIndex + 1}`}
              </div>
              <div className="text-2xl font-bold text-white">
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
              <div className="pt-3 border-t border-gray-700/50">
                <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1">
                  Siguiente Nivel
                </div>
                <div className="text-sm font-bold text-gray-300">
                  {nextLevelData.isBreak ? 
                    `Descanso ${nextLevelData.duration}min` :
                    `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                  }
                  {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                    <span className="text-xs text-gray-400 ml-2">({nextLevelData.ante})</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prize Info - Compact */}
      <div className="flex-shrink-0 pb-4">
        <MobilePrizeInfo />
      </div>

      {/* Floating Controls */}
      <MobileFloatingControls
        isRunning={tournament.isRunning}
        isPaused={tournament.isPaused}
        isOnBreak={tournament.isOnBreak}
        isFullscreen={mobileOpt.isFullscreen}
        playersCount={tournament.players}
        canUndo={actionHistory.length > 0}
        onToggleTimer={toggleTimer}
        onNextLevel={nextLevel}
        onResetLevel={resetLevel}
        onAddPlayer={addPlayer}
        onEliminatePlayer={eliminatePlayer}
        onAddReentry={addReentry}
        onSkipBreak={skipBreak}
        onUndoLastAction={undoLastAction}
        onToggleFullscreen={mobileOpt.toggleFullscreen}
        onOpenSettings={() => setShowSettings(true)}
      />
    </div>
  );
}
