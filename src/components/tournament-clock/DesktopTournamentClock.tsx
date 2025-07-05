
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
        {/* Reference Layout Structure - Similar to image */}
        <div className="h-full flex flex-col">
          
          {/* Main Content Area */}
          <div className="flex-1 grid grid-cols-4 gap-8 items-center px-8">
            
            {/* Left Stats */}
            <div className="col-span-1 space-y-8">
              <div className="text-center">
                <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide">Total</div>
                <div className="text-white text-3xl font-bold">{tournament.entries + tournament.reentries}</div>
              </div>
              
              <div className="text-center">
                <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide">Average</div>
                <div className="text-white text-xl font-bold">
                  {Math.round(((tournament.entries + tournament.reentries) * tournament.structure.initialStack) / tournament.players / 1000)}k
                  <div className="text-sm text-gray-300">
                    {currentLevel && !currentLevel.isBreak ? 
                      `${Math.round(((tournament.entries + tournament.reentries) * tournament.structure.initialStack) / tournament.players / currentLevel.bigBlind)} BBs` :
                      '0 BBs'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Center Timer */}
            <div className="col-span-2 flex items-center justify-center">
              <div className="scale-110">
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

            {/* Right Stats */}
            <div className="col-span-1 space-y-8">
              <div className="text-center">
                <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide">Level {tournament.currentLevelIndex + 1}</div>
                <div className="text-white text-2xl font-bold">
                  {currentLevel?.isBreak ? 
                    `Descanso ${currentLevel.duration}min` :
                    `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`
                  }
                  {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
                    <div className="text-lg text-gray-300">({currentLevel.ante})</div>
                  )}
                </div>
              </div>
              
              {nextLevelData && (
                <div className="text-center">
                  <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide">Next Level</div>
                  <div className="text-white text-xl font-bold">
                    {nextLevelData.isBreak ? 
                      `Descanso ${nextLevelData.duration}min` :
                      `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                    }
                    {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                      <div className="text-sm text-gray-300">({nextLevelData.ante})</div>
                    )}
                  </div>
                </div>
              )}

              {/* Break Actions */}
              {currentLevel?.isBreak && (
                <div className="text-center">
                  <button
                    onClick={skipBreak}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Skip Break
                  </button>
                </div>
              )}
            </div>
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
