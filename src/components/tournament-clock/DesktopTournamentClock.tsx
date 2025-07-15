import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { AdvancedTimer } from '@/components/timer/AdvancedTimer';
import { FloatingControls } from '@/components/FloatingControls';
import { PrizeInfo } from '@/components/PrizeInfo';
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
  addReentry,
  // Added missing prop
  undoLastAction,
  setShowSettings
}: DesktopTournamentClockProps) {
  // Desktop hotkeys (including the missing reentry shortcut)
  useHotkeys('space', () => toggleTimer(), {
    preventDefault: true
  });
  useHotkeys('n', () => nextLevel(), {
    preventDefault: true
  });
  useHotkeys('r', () => resetLevel(), {
    preventDefault: true
  });
  useHotkeys('s', () => setShowSettings(true), {
    preventDefault: true
  });
  useHotkeys('d', () => window.location.href = '/', {
    preventDefault: true
  });
  useHotkeys('ctrl+b', () => addPlayer(), {
    preventDefault: true
  });
  useHotkeys('x', () => eliminatePlayer(), {
    preventDefault: true
  });
  useHotkeys('ctrl+r', () => addReentry(), {
    preventDefault: true
  }); // Added missing reentry shortcut
  useHotkeys('ctrl+z', () => undoLastAction(), {
    preventDefault: true
  });
  useHotkeys('m', () => setShowFloatingControls(!showFloatingControls), {
    preventDefault: true
  });
  const totalChips = (tournament.entries + tournament.reentries) * tournament.structure.initialStack;
  const averageStack = tournament.players > 0 ? totalChips / tournament.players : 0;
  const averageStackInBBs = currentLevel && !currentLevel.isBreak ? Math.round(averageStack / currentLevel.bigBlind) : 0;
  return <>
      <div className="h-screen flex items-center justify-center relative px-[5px]">
        {/* Golden Dividers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical dividers */}
          <div className="absolute left-1/3 top-16 bottom-16 w-px bg-gradient-to-b from-transparent via-yellow-400/30 to-transparent"></div>
          <div className="absolute right-1/3 top-16 bottom-16 w-px bg-gradient-to-b from-transparent via-yellow-400/30 to-transparent"></div>
          
          {/* Horizontal dividers in left column */}
          <div className="absolute left-8 top-1/3 w-1/3 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
          <div className="absolute left-8 bottom-1/3 w-1/3 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
          
          {/* Horizontal dividers in right column */}
          <div className="absolute right-8 top-1/3 w-1/3 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-16 w-full max-w-7xl h-full">
          
          {/* Left Column - Tournament Stats */}
          <div className="flex flex-col justify-between py-[50px]">
            {/* Top Section - Players, Entries, Reentries in a row */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-yellow-400 text-lg font-semibold uppercase tracking-wide mb-3">Players</div>
                <div className="text-white text-5xl font-bold">{tournament.players}</div>
              </div>
              <div>
                <div className="text-yellow-400 text-lg font-semibold uppercase tracking-wide mb-3">Entries</div>
                <div className="text-white text-5xl font-bold">{tournament.entries}</div>
              </div>
              <div>
                <div className="text-yellow-400 text-lg font-semibold uppercase tracking-wide mb-3">Re-entries</div>
                <div className="text-white text-5xl font-bold">{tournament.reentries}</div>
              </div>
            </div>
            
            {/* Center Section - Prize Pool (Prominent) */}
            <div className="text-center">
              <div className="text-yellow-400 text-3xl font-semibold uppercase tracking-wide mb-6">Prize Pool</div>
              <div className="text-yellow-400 text-7xl font-bold">${tournament.currentPrizePool?.toLocaleString()}</div>
            </div>
            
            {/* Bottom Section - Total and Average in a row */}
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-yellow-400 text-lg font-semibold uppercase tracking-wide mb-3">Total Chips</div>
                <div className="text-white text-4xl font-bold">{totalChips.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-yellow-400 text-lg font-semibold uppercase tracking-wide mb-3">Average Stack</div>
                <div className="text-white text-4xl font-bold">
                  {Math.round(averageStack / 1000)}k
                  {!currentLevel?.isBreak && averageStackInBBs > 0 && <div className="text-lg text-gray-300 mt-2">({averageStackInBBs} BBs)</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Timer */}
          <div className="flex items-center justify-center h-full">
            <AdvancedTimer timeRemaining={tournament.timeRemaining} currentLevel={currentLevel} progress={progress} lastMinuteAlert={lastMinuteAlert} nextBreakTime={nextBreakTime} currentLevelIndex={tournament.currentLevelIndex} isRunning={tournament.isRunning} isPaused={tournament.isPaused} />
          </div>

          {/* Right Column - Level Info and Prizes */}
          <div className="flex flex-col justify-between space-y-8 py-[26px]">
            {/* Current Level */}
            <div className="text-center">
              <div className="text-yellow-400 text-2xl font-semibold uppercase tracking-wide mb-4">
                Level {tournament.currentLevelIndex + 1}
              </div>
              <div className="text-white text-6xl font-bold">
                {currentLevel?.isBreak ? `Break ${currentLevel.duration}min` : `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`}
                {!currentLevel?.isBreak && currentLevel?.ante > 0 && <div className="text-4xl text-gray-300 mt-2">Ante: {currentLevel.ante}</div>}
                {currentLevel?.isBreak && currentLevel?.colorUpAmount && <div className="text-3xl text-yellow-300 mt-2">Color Up: {currentLevel.colorUpAmount} {currentLevel.colorUpFrom}</div>}
              </div>
            </div>
            
            {/* Prizes */}
            <div className="text-center">
              <PrizeInfo />
            </div>

            {/* Break Actions */}
            {currentLevel?.isBreak && <div className="text-center">
                <button onClick={skipBreak} className="bg-yellow-600 hover:bg-yellow-700 text-black px-8 py-3 rounded-lg font-medium transition-colors text-lg">
                  Skip Break
                </button>
              </div>}

            {/* Next Level */}
            {nextLevelData && <div className="text-center">
                <div className="text-yellow-400 text-xl font-semibold uppercase tracking-wide mb-3">Next Level</div>
                <div className="text-white text-4xl font-bold">
                  {nextLevelData.isBreak ? `Break ${nextLevelData.duration}min` : `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`}
                  {!nextLevelData.isBreak && nextLevelData.ante > 0 && <div className="text-2xl text-gray-300 mt-2">Ante: {nextLevelData.ante}</div>}
                </div>
              </div>}
          </div>
        </div>
      </div>

      {/* Desktop Hotkeys Info */}
      <div className="fixed bottom-4 left-4 text-sm text-gray-400 hidden xl:block">
        <div className="space-x-6">
          <span>ESPACIO: Play/Pause</span>
          <span>N: Siguiente</span>
          <span>R: Reset</span>
          <span>S: Configuración</span>
          <span>CTRL+B: +Jugador</span>
          <span>X: -Jugador</span>
          <span>CTRL+R: Re-entry</span>
          <span>CTRL+Z: Deshacer</span>
          <span>D: Dashboard</span>
          <span>M: Controles</span>
        </div>
      </div>

      {/* Desktop Floating Controls */}
      <FloatingControls isRunning={tournament.isRunning} isPaused={tournament.isPaused} isOnBreak={tournament.isOnBreak} onToggleTimer={toggleTimer} onNextLevel={nextLevel} onSkipBreak={skipBreak} onResetLevel={resetLevel} onAddPlayer={addPlayer} onEliminatePlayer={eliminatePlayer} onUndo={undoLastAction} canUndo={actionHistory.length > 0} playersCount={tournament.players} isVisible={showFloatingControls} />
    </>;
}