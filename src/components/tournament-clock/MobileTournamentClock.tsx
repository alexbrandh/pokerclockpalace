
import React from 'react';
import { AdvancedTimer } from '@/components/timer/AdvancedTimer';
import { MobileControls } from '@/components/mobile/MobileControls';
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
  skipBreak
}: MobileTournamentClockProps) {
  const mobileOpt = useMobileOptimization();

  return (
    <div 
      className="h-full flex flex-col px-4" 
      style={{
        paddingTop: mobileOpt.isFullscreen ? 
          `${mobileOpt.safeAreaInsets.top}px` : undefined,
        paddingBottom: '180px'
      }}
    >
      
      {/* Tournament Title */}
      <div className="text-center py-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">
          {tournament.structure.name}
        </h1>
      </div>

      {/* Mobile Stats Bar */}
      <div className="flex-shrink-0 mb-4">
        <div className="bg-gray-900/50 backdrop-blur rounded-lg p-3">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div className="text-yellow-400 font-semibold">Players</div>
              <div className="text-white font-bold">{tournament.players}</div>
            </div>
            <div>
              <div className="text-yellow-400 font-semibold">Prize Pool</div>
              <div className="text-yellow-400 font-bold">${tournament.currentPrizePool}</div>
            </div>
            <div>
              <div className="text-yellow-400 font-semibold">Entries</div>
              <div className="text-white font-bold">{tournament.entries + tournament.reentries}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Timer - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="scale-75">
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

      {/* Mobile Level Info */}
      <div className="flex-shrink-0 pb-4">
        <div className="bg-gray-900/50 backdrop-blur rounded-lg p-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            
            {/* Current Level */}
            <div className="space-y-1">
              <div className={`text-xs font-semibold ${
                currentLevel?.isBreak ? 'text-cyan-400' : 'text-yellow-400'
              }`}>
                {currentLevel?.isBreak ? 'BREAK' : `LEVEL ${tournament.currentLevelIndex + 1}`}
              </div>
              <div className="text-lg font-bold text-white">
                {currentLevel?.isBreak ? 
                  `${currentLevel.duration}min` :
                  `${currentLevel?.smallBlind}/${currentLevel?.bigBlind}`
                }
                {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
                  <div className="text-xs text-gray-300">({currentLevel.ante})</div>
                )}
              </div>
            </div>

            {/* Next Level or Break Action */}
            {currentLevel?.isBreak ? (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-cyan-400">ACTION</div>
                <button
                  onClick={skipBreak}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-sm"
                >
                  Skip Break
                </button>
              </div>
            ) : nextLevelData && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-yellow-400">NEXT LEVEL</div>
                <div className="text-lg font-bold text-white">
                  {nextLevelData.isBreak ? 
                    `Break ${nextLevelData.duration}min` :
                    `${nextLevelData.smallBlind}/${nextLevelData.bigBlind}`
                  }
                  {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                    <div className="text-xs text-gray-300">({nextLevelData.ante})</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <MobileControls
        isRunning={tournament.isRunning}
        isPaused={tournament.isPaused}
        isFullscreen={mobileOpt.isFullscreen}
        onToggleTimer={toggleTimer}
        onNextLevel={nextLevel}
        onResetLevel={resetLevel}
        onAddPlayer={addPlayer}
        onEliminatePlayer={eliminatePlayer}
        onToggleFullscreen={mobileOpt.toggleFullscreen}
        playersCount={tournament.players}
        isVisible={true}
      />
    </div>
  );
}
