import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, Settings, Users, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTournament } from '@/contexts/TournamentContext';
import { TournamentStats } from '@/components/TournamentStats';
import { TournamentSettings } from '@/components/TournamentSettings';

export function TournamentClock() {
  const { tournament, updateTournament, isConnected, error } = useTournament();
  const [showSettings, setShowSettings] = useState(false);
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);

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

  // Hotkeys
  useHotkeys('space', () => toggleTimer(), { preventDefault: true });
  useHotkeys('n', () => nextLevel(), { preventDefault: true });
  useHotkeys('r', () => resetLevel(), { preventDefault: true });
  useHotkeys('s', () => setShowSettings(!showSettings), { preventDefault: true });

  const toggleTimer = () => {
    if (!tournament) return;
    
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
    const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
    updateTournament({
      timeRemaining: currentLevel.duration * 60
    });
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
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left Side Info */}
          <div className="col-span-3 space-y-8">
            {/* Players Info */}
            <div className="space-y-4">
              <div>
                <div className="text-blue-400 text-lg font-semibold">Players</div>
                <div className="text-4xl font-bold">{tournament.players}</div>
              </div>
              <div>
                <div className="text-blue-400 text-lg font-semibold">Entries</div>
                <div className="text-4xl font-bold">{tournament.entries}</div>
              </div>
              <div>
                <div className="text-blue-400 text-lg font-semibold">Incl. Re-Entries</div>
                <div className="text-4xl font-bold">{tournament.reentries}</div>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="pt-8">
              <div className="text-blue-400 text-lg font-semibold">Total Prize Pool</div>
              <div className="text-blue-400 text-3xl font-bold">${tournament.currentPrizePool}.00</div>
            </div>

            {/* Logo/Club Section */}
            <div className="pt-8 text-center">
              <div className="w-24 h-24 mx-auto mb-2 border-2 border-white rounded-full flex items-center justify-center">
                <div className="text-2xl">♠</div>
              </div>
              <div className="text-sm font-semibold">ACE-HIGH-CLUB</div>
              <div className="text-xs text-gray-400">POKER CLUB</div>
            </div>

            {/* Chip Info */}
            <div className="pt-8">
              <div>
                <span className="text-blue-400 text-lg font-semibold">Total</span>
                <span className="ml-8 text-blue-400 text-lg font-semibold">Average</span>
              </div>
              <div className="text-2xl font-bold">120,000  15,000 / 150BBs</div>
            </div>
          </div>

          {/* Center - Clock */}
          <div className="col-span-6 flex justify-center">
            <div className="relative">
              {/* Circular Timer */}
              <div className="relative w-96 h-96">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    fill="none"
                  />
                  {/* Progress dots around the circle */}
                  {Array.from({ length: 60 }, (_, i) => {
                    const angle = (i * 6) * Math.PI / 180;
                    const isActive = i < (progress / 100) * 60;
                    const x = 50 + 45 * Math.cos(angle - Math.PI / 2);
                    const y = 50 + 45 * Math.sin(angle - Math.PI / 2);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="0.5"
                        fill={isActive ? "#fbbf24" : "rgba(255,255,255,0.3)"}
                      />
                    );
                  })}
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-lg text-gray-300 mb-2">
                    {currentLevel?.isBreak ? 'Descanso' : `Level ${tournament.currentLevelIndex + 1}`}
                  </div>
                  <motion.div
                    key={tournament.timeRemaining}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-7xl font-bold font-mono ${lastMinuteAlert ? 'text-red-500' : 'text-white'}`}
                  >
                    {formatTime(tournament.timeRemaining)}
                  </motion.div>
                  <div className="text-lg text-gray-300 mt-2">
                    Next Break
                  </div>
                  <div className="text-xl text-gray-300">
                    {nextBreakTime}
                  </div>
                </div>
              </div>

              {/* Controls below clock */}
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className={tournament.isRunning && !tournament.isPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  {tournament.isRunning && !tournament.isPaused ? (
                    <><Pause className="w-5 h-5 mr-2" />Pausar</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" />Iniciar</>
                  )}
                </Button>
                <Button onClick={nextLevel} variant="outline" size="lg">
                  <SkipForward className="w-5 h-5 mr-2" />
                  Siguiente
                </Button>
                <Button onClick={resetLevel} variant="outline" size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side Info */}
          <div className="col-span-3 space-y-8">
            {/* Current Level */}
            <div>
              <div className="text-blue-400 text-lg font-semibold">Level {tournament.currentLevelIndex + 1}</div>
              <div className="text-2xl font-bold">
                {currentLevel?.isBreak ? 
                  `${currentLevel.duration} minutos` :
                  `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`
                }
                {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
                  <div className="text-xl text-gray-300">({currentLevel.ante})</div>
                )}
              </div>
            </div>

            {/* Prizes */}
            <div>
              <div className="text-blue-400 text-lg font-semibold mb-4">Prizes</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>1st</span>
                  <span className="font-bold">$90.00</span>
                </div>
                <div className="flex justify-between">
                  <span>2nd</span>
                  <span className="font-bold">$60.00</span>
                </div>
                <div className="flex justify-between">
                  <span>3rd</span>
                  <span className="font-bold">$45.00</span>
                </div>
                <div className="flex justify-between">
                  <span>4th</span>
                  <span className="font-bold">$36.00</span>
                </div>
                <div className="flex justify-between">
                  <span>5th</span>
                  <span className="font-bold">$30.00</span>
                </div>
              </div>
            </div>

            {/* Next Level */}
            {nextLevelData && (
              <div>
                <div className="text-blue-400 text-lg font-semibold">Next Level</div>
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
        </div>
      </div>

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
