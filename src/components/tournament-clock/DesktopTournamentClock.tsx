
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
  undoLastAction,
  setShowSettings
}: DesktopTournamentClockProps) {
  
  // Desktop hotkeys
  useHotkeys('space', () => toggleTimer(), { preventDefault: true });
  useHotkeys('n', () => nextLevel(), { preventDefault: true });
  useHotkeys('r', () => resetLevel(), { preventDefault: true });
  useHotkeys('s', () => setShowSettings(true), { preventDefault: true });
  useHotkeys('ctrl+b', () => addPlayer(), { preventDefault: true });
  useHotkeys('x', () => eliminatePlayer(), { preventDefault: true });
  useHotkeys('ctrl+z', () => undoLastAction(), { preventDefault: true });
  useHotkeys('m', () => setShowFloatingControls(!showFloatingControls), { preventDefault: true });

  return (
    <>
      <StickyStatsBar tournament={tournament} />
      
      <div className="h-full flex flex-col pt-16 md:pt-20">
        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-12 gap-4 lg:gap-8 h-full items-center">
          
          {/* Left Side Info */}
          <div className="col-span-3 h-full flex flex-col justify-center">
            <div className="space-y-6 lg:space-y-8">
              <LevelInfo
                currentLevel={currentLevel}
                nextLevelData={null}
                currentLevelIndex={tournament.currentLevelIndex}
                showNextLevel={false}
              />
              
              {/* Golden separator */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
                <div className="relative bg-black px-4">
                  <div className="h-1 w-16 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg shadow-yellow-400/30"></div>
                </div>
              </div>
              
              {/* Next Level Info */}
              {nextLevelData && !currentLevel?.isBreak && (
                <div>
                  <div className="text-yellow-400 text-lg font-semibold mb-2">Next Level</div>
                  <div className="text-xl lg:text-2xl font-bold">
                    {nextLevelData.isBreak ? 
                      `Descanso ${nextLevelData.duration}min` :
                      `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                    }
                    {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                      <div className="text-lg text-gray-300">({nextLevelData.ante})</div>
                    )}
                  </div>
                </div>
              )}

              {/* Break Actions */}
              {currentLevel?.isBreak && (
                <div className="space-y-4">
                  <div className="text-cyan-400 text-lg font-semibold">Break Actions</div>
                  <button
                    onClick={skipBreak}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Skip Break
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center Timer */}
          <div className="col-span-6 h-full flex items-center justify-center">
            <div className="scale-125 lg:scale-150 xl:scale-175">
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

          {/* Right Side - Prizes */}
          <div className="col-span-3 h-full flex flex-col justify-center">
            <PrizeInfo />
          </div>
        </div>

        {/* Bottom Tournament Info */}
        <div className="flex-shrink-0 text-center py-1 md:py-2 px-4">
          <div className="text-xs text-gray-400">
            Entry until the end of LVL 8 -- Day 1 will end at completion of LVL 8 (approx 21:50)
          </div>
        </div>

        {/* Desktop Hotkeys Info */}
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
