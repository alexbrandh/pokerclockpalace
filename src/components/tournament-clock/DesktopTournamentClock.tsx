
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { AdvancedTimer } from '@/components/timer/AdvancedTimer';
import { LevelInfo } from '@/components/LevelInfo';
import { PrizeInfo } from '@/components/PrizeInfo';
import { StickyStatsBar } from '@/components/StickyStatsBar';
import { FloatingControls } from '@/components/FloatingControls';
import { TournamentState } from '@/types/tournament';

interface DesktopTournamentClockProps {
  tournament: TournamentState;
  currentLevel: any;
  nextLevelData: any;
  progress: number;
  lastMinuteAlert: boolean;
  nextBreakTime: string;
  actionHistory: Array<Partial<any>>;
  showFloatingControls: boolean;
  setShowFloatingControls: (show: boolean) => void;
  toggleTimer: () => void;
  nextLevel: () => void;
  skipBreak: () => void;
  resetLevel: () => void;
  addPlayer: () => void;
  eliminatePlayer: () => void;
  addReentry: () => void; // Added missing prop
  undoLastAction: () => void;
  setShowSettings: (show: boolean) => void;
}

export function DesktopTournamentClock({
  tournament,
  currentLevel,
  nextLevelData,
  progress,
  lastMinuteAlert,
  nextBreakTime,
  actionHistory,
  showFloatingControls,
  setShowFloatingControls,
  toggleTimer,
  nextLevel,
  skipBreak,
  resetLevel,
  addPlayer,
  eliminatePlayer,
  addReentry, // Added missing prop
  undoLastAction,
  setShowSettings
}: DesktopTournamentClockProps) {
  
  // Desktop hotkeys (including the missing reentry shortcut)
  useHotkeys('space', () => toggleTimer(), { preventDefault: true });
  useHotkeys('n', () => nextLevel(), { preventDefault: true });
  useHotkeys('r', () => resetLevel(), { preventDefault: true });
  useHotkeys('s', () => setShowSettings(true), { preventDefault: true });
  useHotkeys('ctrl+b', () => addPlayer(), { preventDefault: true });
  useHotkeys('x', () => eliminatePlayer(), { preventDefault: true });
  useHotkeys('ctrl+r', () => addReentry(), { preventDefault: true }); // Added missing reentry shortcut
  useHotkeys('ctrl+z', () => undoLastAction(), { preventDefault: true });
  useHotkeys('m', () => setShowFloatingControls(!showFloatingControls), { preventDefault: true });

  return (
    <>
      <StickyStatsBar tournament={tournament} />
      
      <div className="h-full flex flex-col pt-16 md:pt-20">
        {/* Professional Layout Structure */}
        <div className="h-full flex flex-col">
          
          {/* Top Section - Current Level */}
          <div className="flex-shrink-0 text-center py-8">
            <div className="space-y-4">
              {/* Level Title */}
              <div className={`text-2xl font-bold ${
                currentLevel?.isBreak ? 'text-cyan-400' : 'text-green-400'
              }`}>
                {currentLevel?.isBreak ? 'BREAK' : `LEVEL ${tournament.currentLevelIndex + 1}`}
              </div>
              
              {/* Current Blinds/Break Info */}
              <div className="text-white">
                {currentLevel?.isBreak ? (
                  <div className="text-4xl font-bold">
                    {currentLevel.duration} MINUTES
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-6xl font-bold">
                      {currentLevel?.smallBlind} / {currentLevel?.bigBlind}
                    </div>
                    {currentLevel?.ante > 0 && (
                      <div className="text-2xl text-gray-300">
                        Ante: {currentLevel.ante}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Section - Timer */}
          <div className="flex-1 flex items-center justify-center">
            <AdvancedTimer
              timeRemaining={tournament.timeRemaining}
              currentLevel={currentLevel}
              progress={progress}
              lastMinuteAlert={lastMinuteAlert}
              currentLevelIndex={tournament.currentLevelIndex}
              isRunning={tournament.isRunning}
              isPaused={tournament.isPaused}
            />
          </div>

          {/* Bottom Section - Next Level & Info */}
          <div className="flex-shrink-0 py-8">
            <div className="grid grid-cols-3 gap-8 items-center">
              
              {/* Left - Player Stats */}
              <div className="text-center">
                <div className="text-gray-400 text-sm uppercase tracking-wide mb-2">Players</div>
                <div className="text-3xl font-bold text-white">{tournament.players}</div>
              </div>

              {/* Center - Next Level */}
              {nextLevelData && !currentLevel?.isBreak && (
                <div className="text-center">
                  <div className="text-yellow-400 text-sm uppercase tracking-wide mb-2">Next Level</div>
                  <div className="text-xl font-bold text-white">
                    {nextLevelData.isBreak ? 
                      `Break ${nextLevelData.duration}min` :
                      `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                    }
                    {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                      <div className="text-sm text-gray-300 mt-1">Ante: {nextLevelData.ante}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Right - Prize Pool */}
              <div className="text-center">
                <div className="text-gray-400 text-sm uppercase tracking-wide mb-2">Prize Pool</div>
                <div className="text-3xl font-bold text-green-400">$25,000</div>
              </div>
            </div>

            {/* Break Actions */}
            {currentLevel?.isBreak && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={skipBreak}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Skip Break
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Tournament Info */}
        <div className="flex-shrink-0 text-center py-1 md:py-2 px-4">
          <div className="text-xs text-gray-400">
            Entry until the end of LVL 8 -- Day 1 will end at completion of LVL 8 (approx 21:50)
          </div>
        </div>

        {/* Desktop Hotkeys Info - Updated with reentry shortcut */}
        <div className="fixed bottom-2 left-2 text-xs text-gray-500 hidden xl:block">
          <div className="space-x-4">
            <span>ESPACIO: Play/Pause</span>
            <span>N: Siguiente</span>
            <span>R: Reset</span>
            <span>S: Configuración</span>
            <span>CTRL+B: +Jugador</span>
            <span>X: -Jugador</span>
            <span>CTRL+R: Re-entry</span>
            <span>CTRL+Z: Deshacer</span>
            <span>M: Controles</span>
          </div>
        </div>
      </div>

      {/* Desktop Floating Controls */}
      <FloatingControls
        isRunning={tournament.isRunning}
        isPaused={tournament.isPaused}
        isOnBreak={tournament.isOnBreak}
        onToggleTimer={toggleTimer}
        onNextLevel={nextLevel}
        onSkipBreak={skipBreak}
        onResetLevel={resetLevel}
        onAddPlayer={addPlayer}
        onEliminatePlayer={eliminatePlayer}
        onUndo={undoLastAction}
        canUndo={actionHistory.length > 0}
        playersCount={tournament.players}
        isVisible={showFloatingControls}
      />
    </>
  );
}
