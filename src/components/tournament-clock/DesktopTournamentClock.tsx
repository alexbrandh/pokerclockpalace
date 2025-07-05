
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { AdvancedTimer } from '@/components/timer/AdvancedTimer';
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

  const totalChips = (tournament.entries + tournament.reentries) * tournament.structure.initialStack;
  const averageStack = tournament.players > 0 ? totalChips / tournament.players : 0;
  const averageStackInBBs = currentLevel && !currentLevel.isBreak ? 
    Math.round(averageStack / currentLevel.bigBlind) : 0;

  return (
    <>
      <div className="h-screen flex items-center justify-center px-8">
        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-16 w-full max-w-7xl items-center">
          
          {/* Left Column - Tournament Stats */}
          <div className="space-y-12">
            <div className="text-center">
              <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide mb-2">Players</div>
              <div className="text-white text-4xl font-bold">{tournament.players}</div>
            </div>
            
            <div className="text-center">
              <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide mb-2">Entries</div>
              <div className="text-white text-3xl font-bold">
                {tournament.entries + tournament.reentries}
                {tournament.reentries > 0 && (
                  <div className="text-lg text-gray-300 mt-1">
                    (+{tournament.reentries} re-entries)
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide mb-2">Prize Pool</div>
              <div className="text-yellow-400 text-3xl font-bold">${tournament.currentPrizePool}</div>
            </div>
            
            <div className="text-center">
              <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide mb-2">Average Stack</div>
              <div className="text-white text-2xl font-bold">
                {Math.round(averageStack / 1000)}k
                {!currentLevel?.isBreak && averageStackInBBs > 0 && (
                  <div className="text-sm text-gray-300 mt-1">
                    ({averageStackInBBs} BBs)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Timer */}
          <div className="flex items-center justify-center">
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

          {/* Right Column - Level Info */}
          <div className="space-y-12">
            <div className="text-center">
              <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide mb-2">
                Level {tournament.currentLevelIndex + 1}
              </div>
              <div className="text-white text-3xl font-bold">
                {currentLevel?.isBreak ? 
                  `Break ${currentLevel.duration}min` :
                  `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`
                }
                {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
                  <div className="text-xl text-gray-300 mt-1">({currentLevel.ante})</div>
                )}
              </div>
            </div>
            
            {nextLevelData && (
              <div className="text-center">
                <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide mb-2">Next Level</div>
                <div className="text-white text-2xl font-bold">
                  {nextLevelData.isBreak ? 
                    `Break ${nextLevelData.duration}min` :
                    `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                  }
                  {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                    <div className="text-lg text-gray-300 mt-1">({nextLevelData.ante})</div>
                  )}
                </div>
              </div>
            )}

            {/* Break Actions */}
            {currentLevel?.isBreak && (
              <div className="text-center">
                <button
                  onClick={skipBreak}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg"
                >
                  Skip Break
                </button>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-cyan-400 text-sm font-semibold uppercase tracking-wide mb-2">Total Chips</div>
              <div className="text-white text-xl font-bold">
                {totalChips.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Hotkeys Info */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 hidden xl:block">
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
