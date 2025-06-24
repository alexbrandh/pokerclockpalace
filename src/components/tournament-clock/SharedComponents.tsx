
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface ConnectionStatusProps {
  isConnected: boolean;
  onSettingsClick: () => void;
}

export function ConnectionStatus({ isConnected, onSettingsClick }: ConnectionStatusProps) {
  const mobileOpt = useMobileOptimization();
  
  return (
    <div 
      className={`fixed right-2 flex gap-2 z-50 ${
        !mobileOpt.isMobile ? 'top-16 md:top-20' : 'top-2'
      }`} 
      style={{
        top: mobileOpt.isMobile && mobileOpt.isFullscreen ? 
          `${mobileOpt.safeAreaInsets.top + 8}px` : 
          (mobileOpt.isMobile ? '8px' : undefined)
      }}
    >
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
        isConnected ? 'bg-green-600' : 'bg-yellow-600'
      }`}>
        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="hidden sm:inline">{isConnected ? 'Online' : 'Offline'}</span>
      </div>
      <Button variant="outline" size="sm" onClick={onSettingsClick}>
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface LastMinuteAlertProps {
  isVisible: boolean;
}

export function LastMinuteAlert({ isVisible }: LastMinuteAlertProps) {
  const mobileOpt = useMobileOptimization();
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed right-4 bg-red-600 text-white p-3 md:p-4 rounded-lg shadow-lg z-40 max-w-xs ${
            mobileOpt.isMobile ? 'bottom-48' : 'bottom-4'
          }`}
        >
          <div className="font-bold text-sm md:text-base">¡ÚLTIMO MINUTO!</div>
          <div className="text-xs md:text-sm">El nivel termina en menos de 1 minuto</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LoadingScreenProps {
  error?: string;
}

export function LoadingScreen({ error }: LoadingScreenProps) {
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
