
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionStatus?: string;
  onReconnect?: () => void;
  onSettingsClick: () => void;
}

export function ConnectionStatus({ 
  isConnected, 
  connectionStatus = 'unknown',
  onReconnect,
  onSettingsClick 
}: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Error de conexión';
      case 'disconnected': return 'Desconectado';
      default: return 'Estado desconocido';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'connecting': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error':
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
      <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
      </div>
      
      {!isConnected && onReconnect && (
        <button
          onClick={onReconnect}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">Reconectar</span>
        </button>
      )}
      
      <button
        onClick={onSettingsClick}
        className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>
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
            <AlertTriangle className="w-5 h-5" />
            <div className="text-sm max-w-md">
              {error}
              <div className="mt-2 text-xs text-gray-400">
                Verificando conexión y datos del torneo...
              </div>
            </div>
          </div>
        )}
        {!error && (
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando datos del servidor...</span>
          </div>
        )}
      </div>
    </div>
  );
}
