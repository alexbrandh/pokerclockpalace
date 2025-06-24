import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, WifiOff, Play, Pause, SkipForward, RotateCcw, UserPlus, UserMinus, RotateCcw as ReEntry } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTournament } from '@/contexts/TournamentContext';
import { TournamentSettings } from '@/components/TournamentSettings';
import { AdvancedTimer } from '@/components/timer/AdvancedTimer';
import { PlayerInfo } from '@/components/PlayerInfo';
import { PrizeInfo } from '@/components/PrizeInfo';
import { LevelInfo } from '@/components/LevelInfo';
import { StickyStatsBar } from '@/components/StickyStatsBar';
import { FloatingControls } from '@/components/FloatingControls';
import { useSoundSystem } from '@/hooks/useSoundSystem';

export function TournamentClock() {
  const { tournament, updateTournament, isConnected, error } = useTournament();
  const { playSound } = useSoundSystem();
  const [showSettings, setShowSettings] = useState(false);
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);
  const [showControlsPopup, setShowControlsPopup] = useState(false);
  const [actionHistory, setActionHistory] = useState<Array<Partial<any>>>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFloatingControls, setShowFloatingControls] = useState(false);

  // Timer logic with enhanced break handling and sound integration
  useEffect(() => {
    if (!tournament || !tournament.isRunning || tournament.isPaused) return;

    const interval = setInterval(() => {
      const newTime = tournament.timeRemaining - 1;
      
      if (newTime <= 0) {
        // Level completed, advance to next
        const nextLevelIndex = tournament.currentLevelIndex + 1;
        const nextLevelData = tournament.structure.levels[nextLevelIndex];
        
        if (nextLevelData) {
          // Auto-pause if entering a break
          const shouldAutoPause = nextLevelData.isBreak;
          
          updateTournament({
            currentLevelIndex: nextLevelIndex,
            timeRemaining: nextLevelData.duration * 60,
            isOnBreak: nextLevelData.isBreak,
            isPaused: shouldAutoPause // Auto-pause on breaks
          });
          
          // Play appropriate sound
          if (nextLevelData.isBreak) {
            playSound('breakStart');
            console.log('🎵 Break time! Taking a pause...');
          } else {
            playSound('levelChange');
          }
        } else {
          // Tournament ended
          updateTournament({
            isRunning: false,
            isPaused: true
          });
        }
        setLastMinuteAlert(false);
      } else {
        updateTournament({ timeRemaining: newTime });
        
        // Last minute alert (only for non-break levels)
        if (newTime === 60 && !lastMinuteAlert && !tournament.isOnBreak) {
          setLastMinuteAlert(true);
          playSound('lastMinute');
        } else if (newTime > 60) {
          setLastMinuteAlert(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament, updateTournament, lastMinuteAlert, playSound]);

  // Show/hide controls popup based on pause state or break
  useEffect(() => {
    if (tournament?.isPaused || tournament?.isOnBreak) {
      setShowControlsPopup(true);
    } else {
      setShowControlsPopup(false);
    }
  }, [tournament?.isPaused, tournament?.isOnBreak]);

  // Helper function to save state for undo
  const saveStateForUndo = () => {
    if (tournament) {
      setActionHistory(prev => [...prev.slice(-9), { ...tournament }]); // Keep last 10 actions
    }
  };

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Hotkeys
  useHotkeys('space', () => toggleTimer(), { preventDefault: true });
  useHotkeys('n', () => nextLevel(), { preventDefault: true });
  useHotkeys('r', () => resetLevel(), { preventDefault: true });
  useHotkeys('s', () => setShowSettings(!showSettings), { preventDefault: true });
  useHotkeys('ctrl+b', () => addPlayer(), { preventDefault: true });
  useHotkeys('x', () => eliminatePlayer(), { preventDefault: true });
  useHotkeys('ctrl+z', () => undoLastAction(), { preventDefault: true });
  useHotkeys('ctrl+r', () => addReentry(), { preventDefault: true });
  useHotkeys('m', () => setShowFloatingControls(!showFloatingControls), { preventDefault: true });

  // Enhanced handler functions with sound integration
  const toggleTimer = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    if (tournament.isPaused) {
      // Start the timer
      updateTournament({
        isRunning: true,
        isPaused: false
      });
    } else {
      // Pause the timer
      updateTournament({
        isPaused: true
      });
    }
  };

  const nextLevel = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    const nextLevelIndex = tournament.currentLevelIndex + 1;
    const nextLevelData = tournament.structure.levels[nextLevelIndex];
    
    if (nextLevelData) {
      updateTournament({
        currentLevelIndex: nextLevelIndex,
        timeRemaining: nextLevelData.duration * 60,
        isOnBreak: nextLevelData.isBreak,
        isPaused: nextLevelData.isBreak // Auto-pause if it's a break
      });

      // Play appropriate sound
      if (nextLevelData.isBreak) {
        playSound('breakStart');
      } else {
        playSound('levelChange');
      }
    }
  };

  const skipBreak = () => {
    if (!tournament || !tournament.isOnBreak) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    // Skip to the next non-break level
    const nextLevelIndex = tournament.currentLevelIndex + 1;
    const nextLevelData = tournament.structure.levels[nextLevelIndex];
    
    if (nextLevelData && !nextLevelData.isBreak) {
      updateTournament({
        currentLevelIndex: nextLevelIndex,
        timeRemaining: nextLevelData.duration * 60,
        isOnBreak: false,
        isPaused: false
      });
      playSound('levelChange');
    }
  };

  const resetLevel = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
    updateTournament({
      timeRemaining: currentLevel.duration * 60
    });
  };

  const addPlayer = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournament({
      players: tournament.players + 1,
      entries: tournament.entries + 1,
      currentPrizePool: tournament.currentPrizePool + tournament.structure.buyIn
    });
  };

  const eliminatePlayer = () => {
    if (!tournament || tournament.players <= 0) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournament({
      players: tournament.players - 1
    });
  };

  const addReentry = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournament({
      players: tournament.players + 1,
      reentries: tournament.reentries + 1,
      currentPrizePool: tournament.currentPrizePool + tournament.structure.reentryFee
    });
  };

  const undoLastAction = () => {
    if (actionHistory.length === 0) return;
    
    const lastState = actionHistory[actionHistory.length - 1];
    setActionHistory(prev => prev.slice(0, -1));
    
    if (lastState) {
      updateTournament(lastState);
    }
  };

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold">Configurando torneo...</div>
          {error && (
            <div className="text-yellow-400 flex items-center justify-center gap-2">
              <WifiOff className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
  const nextLevelData = tournament.structure.levels[tournament.currentLevelIndex + 1];
  
  const progress = currentLevel ? 
    ((currentLevel.duration * 60 - tournament.timeRemaining) / (currentLevel.duration * 60)) * 100 : 0;

  // Calculate next break time (simplified for demo)
  const nextBreakTime = "35:09";

  return (
    <div className="min-h-screen h-screen bg-black text-white overflow-hidden">
      {/* Sticky Stats Bar - Hide in fullscreen on mobile */}
      {!(isFullscreen && window.innerWidth < 768) && (
        <StickyStatsBar tournament={tournament} />
      )}

      {/* Main Content - Responsive padding */}
      <div className={`${!(isFullscreen && window.innerWidth < 768) ? 'pt-16' : 'pt-0'} h-full flex flex-col`}>
        
        {/* Title - Responsive and hide on mobile fullscreen */}
        {!(isFullscreen && window.innerWidth < 768) && (
          <div className="text-center py-2 md:py-4">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white px-4">
              {tournament.structure.name}
            </h1>
          </div>
        )}

        {/* Main Layout - Optimized responsive grid */}
        <div className="flex-1 px-2 md:px-4 lg:px-8">
          
          {/* Desktop Layout (md and up) */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 lg:gap-8 h-full items-center">
            
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
                
                {/* Next Level Info - hide during breaks */}
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

                {/* Break Actions - show only during breaks */}
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

            {/* Center Timer - Larger on desktop */}
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

          {/* Mobile Layout - Stack optimized for mobile */}
          <div className="md:hidden h-full flex flex-col">
            
            {/* Mobile Timer - Takes majority of screen */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="scale-110 sm:scale-125">
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

            {/* Mobile Info - Compact horizontal layout */}
            {!isFullscreen && (
              <div className="flex-shrink-0 px-2 pb-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  
                  {/* Current Level */}
                  <div className="space-y-1">
                    <div className={`text-sm font-semibold ${
                      currentLevel?.isBreak ? 'text-cyan-400' : 'text-yellow-400'
                    }`}>
                      {currentLevel?.isBreak ? 'Break' : `Level ${tournament.currentLevelIndex + 1}`}
                    </div>
                    <div className="text-lg font-bold">
                      {currentLevel?.isBreak ? 
                        `${currentLevel.duration}min` :
                        `${currentLevel?.smallBlind}/${currentLevel?.bigBlind}`
                      }
                    </div>
                  </div>

                  {/* Next Level or Break Action */}
                  {currentLevel?.isBreak ? (
                    <div className="space-y-1">
                      <button
                        onClick={skipBreak}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Skip Break
                      </button>
                    </div>
                  ) : nextLevelData && (
                    <div className="space-y-1">
                      <div className="text-yellow-400 text-sm font-semibold">Next</div>
                      <div className="text-lg font-bold">
                        {nextLevelData.isBreak ? 
                          `Break ${nextLevelData.duration}min` :
                          `${nextLevelData.smallBlind}/${nextLevelData.bigBlind}`
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Tournament Info - Hide on mobile fullscreen */}
        {!(isFullscreen && window.innerWidth < 768) && (
          <div className="flex-shrink-0 text-center py-2 px-4">
            <div className="text-xs md:text-sm text-gray-400">
              Entry until the end of LVL 8 -- Day 1 will end at completion of LVL 8 (approx 21:50)
            </div>
          </div>
        )}

        {/* Connection status and settings - Responsive positioning */}
        <div className={`fixed ${!(isFullscreen && window.innerWidth < 768) ? 'top-16' : 'top-2'} right-2 flex gap-2 z-40`}>
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden sm:inline">{isConnected ? 'Online' : 'Offline'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Hotkeys info - Better responsive behavior */}
        {!isFullscreen && (
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
              <span>M: Mostrar/Ocultar Controles</span>
            </div>
          </div>
        )}

        {/* Controls visibility indicator */}
        {!showFloatingControls && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-black/80 text-gray-400 px-3 py-1 rounded-full text-sm border border-gray-600/50">
              Presiona <span className="text-white font-semibold">M</span> para mostrar controles
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Floating Controls - Now toggleable */}
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

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <TournamentSettings 
            tournament={tournament}
            onClose={() => setShowSettings(false)}
            onUpdate={updateTournament}
          />
        )}
      </AnimatePresence>

      {/* Last Minute Alert - Responsive positioning */}
      <AnimatePresence>
        {lastMinuteAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-600 text-white p-3 md:p-4 rounded-lg shadow-lg z-40 max-w-xs"
          >
            <div className="font-bold text-sm md:text-base">¡ÚLTIMO MINUTO!</div>
            <div className="text-xs md:text-sm">El nivel termina en menos de 1 minuto</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
