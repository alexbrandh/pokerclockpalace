
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, WifiOff, Play, Pause, SkipForward, RotateCcw, UserPlus, UserMinus, RotateCcw as ReEntry } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTournament } from '@/contexts/TournamentContext';
import { TournamentSettings } from '@/components/TournamentSettings';
import { CircularTimer } from '@/components/CircularTimer';
import { PlayerInfo } from '@/components/PlayerInfo';
import { PrizeInfo } from '@/components/PrizeInfo';
import { LevelInfo } from '@/components/LevelInfo';

export function TournamentClock() {
  const { tournament, updateTournament, isConnected, error } = useTournament();
  const [showSettings, setShowSettings] = useState(false);
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);
  const [showControlsPopup, setShowControlsPopup] = useState(false);
  const [actionHistory, setActionHistory] = useState<Array<Partial<any>>>([]);

  // Timer logic
  useEffect(() => {
    if (!tournament || !tournament.isRunning || tournament.isPaused) return;

    const interval = setInterval(() => {
      const newTime = tournament.timeRemaining - 1;
      
      if (newTime <= 0) {
        // Level completed, advance to next
        const nextLevelIndex = tournament.currentLevelIndex + 1;
        const nextLevelData = tournament.structure.levels[nextLevelIndex];
        
        if (nextLevelData) {
          updateTournament({
            currentLevelIndex: nextLevelIndex,
            timeRemaining: nextLevelData.duration * 60,
            isOnBreak: nextLevelData.isBreak,
            isPaused: nextLevelData.isBreak // Auto-pause on breaks
          });
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
        
        // Last minute alert
        if (newTime === 60 && !lastMinuteAlert) {
          setLastMinuteAlert(true);
          // Play alert sound
          const audio = new Audio('/alert.mp3');
          audio.play().catch(() => {}); // Fail silently if no audio file
        } else if (newTime > 60) {
          setLastMinuteAlert(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament, updateTournament, lastMinuteAlert]);

  // Show/hide controls popup based on pause state
  useEffect(() => {
    if (tournament?.isPaused) {
      setShowControlsPopup(true);
    } else {
      setShowControlsPopup(false);
    }
  }, [tournament?.isPaused]);

  // Helper function to save state for undo
  const saveStateForUndo = () => {
    if (tournament) {
      setActionHistory(prev => [...prev.slice(-9), { ...tournament }]); // Keep last 10 actions
    }
  };

  // Hotkeys
  useHotkeys('space', () => toggleTimer(), { preventDefault: true });
  useHotkeys('n', () => nextLevel(), { preventDefault: true });
  useHotkeys('r', () => resetLevel(), { preventDefault: true });
  useHotkeys('s', () => setShowSettings(!showSettings), { preventDefault: true });
  useHotkeys('ctrl+b', () => addPlayer(), { preventDefault: true });
  useHotkeys('x', () => eliminatePlayer(), { preventDefault: true });
  useHotkeys('ctrl+z', () => undoLastAction(), { preventDefault: true });
  useHotkeys('ctrl+r', () => addReentry(), { preventDefault: true });

  const toggleTimer = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    
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
    
    const nextLevelIndex = tournament.currentLevelIndex + 1;
    const nextLevelData = tournament.structure.levels[nextLevelIndex];
    
    if (nextLevelData) {
      updateTournament({
        currentLevelIndex: nextLevelIndex,
        timeRemaining: nextLevelData.duration * 60,
        isOnBreak: nextLevelData.isBreak
      });
    }
  };

  const resetLevel = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    
    const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
    updateTournament({
      timeRemaining: currentLevel.duration * 60
    });
  };

  const addPlayer = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    
    updateTournament({
      players: tournament.players + 1,
      entries: tournament.entries + 1,
      currentPrizePool: tournament.currentPrizePool + tournament.structure.buyIn
    });
  };

  const eliminatePlayer = () => {
    if (!tournament || tournament.players <= 0) return;
    
    saveStateForUndo();
    
    updateTournament({
      players: tournament.players - 1
    });
  };

  const addReentry = () => {
    if (!tournament) return;
    
    saveStateForUndo();
    
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">{tournament.structure.name}</h1>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left Side Info - Players */}
          <div className="col-span-3">
            <PlayerInfo 
              players={tournament.players}
              entries={tournament.entries}
              reentries={tournament.reentries}
              currentPrizePool={tournament.currentPrizePool}
            />
          </div>

          {/* Center - Clock */}
          <div className="col-span-6 flex flex-col items-center">
            <CircularTimer
              timeRemaining={tournament.timeRemaining}
              currentLevel={currentLevel}
              progress={progress}
              lastMinuteAlert={lastMinuteAlert}
              nextBreakTime={nextBreakTime}
              currentLevelIndex={tournament.currentLevelIndex}
            />
          </div>

          {/* Right Side Info - Level, Prizes, Next Level */}
          <div className="col-span-3 space-y-6">
            {/* Current Level */}
            <LevelInfo
              currentLevel={currentLevel}
              nextLevelData={null}
              currentLevelIndex={tournament.currentLevelIndex}
              showNextLevel={false}
            />
            
            {/* Enhanced Golden separator line */}
            <div className="relative flex items-center justify-center py-3">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
              <div className="relative bg-black px-4">
                <div className="h-1 w-16 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg shadow-yellow-400/30"></div>
              </div>
            </div>
            
            {/* Prizes */}
            <PrizeInfo />
            
            {/* Enhanced Golden separator line */}
            <div className="relative flex items-center justify-center py-3">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
              <div className="relative bg-black px-4">
                <div className="h-1 w-16 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg shadow-yellow-400/30"></div>
              </div>
            </div>
            
            {/* Next Level */}
            {nextLevelData && (
              <div>
                <div className="text-yellow-400 text-lg font-semibold mb-2">Next Level</div>
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
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="text-sm text-gray-400">
            Entry until the end of LVL 8 -- Day 1 will end at completion of LVL 8 (approx 21:50)
          </div>
        </div>

        {/* Connection status and settings */}
        <div className="fixed top-4 right-4 flex gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? 'Online' : 'Offline'}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Hotkeys info */}
        <div className="fixed bottom-4 left-4 text-xs text-gray-500 space-x-4">
          <span>ESPACIO: Play/Pause</span>
          <span>N: Siguiente</span>
          <span>R: Reset</span>
          <span>S: Configuración</span>
          <span>CTRL+B: +Jugador</span>
          <span>X: -Jugador</span>
          <span>CTRL+R: Re-entry</span>
          <span>CTRL+Z: Deshacer</span>
        </div>
      </div>

      {/* Controls Popup - Only shown when paused */}
      <AnimatePresence>
        {showControlsPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowControlsPopup(false)}
          >
            <motion.div
              className="bg-gray-900 border border-yellow-400/30 rounded-lg p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-yellow-400 text-center mb-4">Controles del Torneo</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar
                </Button>
                <Button onClick={nextLevel} variant="secondary" size="lg">
                  <SkipForward className="w-5 h-5 mr-2" />
                  Siguiente
                </Button>
                <Button onClick={resetLevel} variant="secondary" size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
                <Button onClick={addPlayer} variant="secondary" size="lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  +Jugador
                </Button>
                <Button onClick={eliminatePlayer} variant="secondary" size="lg">
                  <UserMinus className="w-5 h-5 mr-2" />
                  -Jugador
                </Button>
                <Button onClick={addReentry} variant="secondary" size="lg">
                  <ReEntry className="w-5 h-5 mr-2" />
                  Re-entry
                </Button>
              </div>
              <div className="text-xs text-gray-400 text-center mt-4">
                <div>ESPACIO: Play/Pause • N: Siguiente • R: Reset</div>
                <div>CTRL+B: +Jugador • X: -Jugador • CTRL+R: Re-entry • CTRL+Z: Deshacer</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Last Minute Alert */}
      <AnimatePresence>
        {lastMinuteAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="font-bold">¡ÚLTIMO MINUTO!</div>
            <div className="text-sm">El nivel termina en menos de 1 minuto</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
