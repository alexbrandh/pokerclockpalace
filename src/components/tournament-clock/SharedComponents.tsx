
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, WifiOff, RefreshCw, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionStatus?: string;
  error?: string;
  onReconnect?: () => void;
  onSettingsClick: () => void;
}

export function ConnectionStatus({ 
  isConnected, 
  connectionStatus = 'disconnected',
  error,
  onReconnect,
  onSettingsClick 
}: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'active': return 'Sincronizado';
      case 'paused': return 'Sincronizando';
      case 'error': return 'Error';
      default: return 'Estado desconocido';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'active': return <Wifi className="w-4 h-4" />;
      case 'paused': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 hidden">
      <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="hidden sm:inline max-w-48 truncate" title={getStatusText()}>
          {getStatusText()}
        </span>
      </div>
      
      {connectionStatus === 'active' && (
        <div className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded border border-green-600/30">
          <span className="hidden sm:inline">1s</span>
          <span className="sm:hidden">1s</span>
        </div>
      )}
      
      {onReconnect && connectionStatus === 'error' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onReconnect}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1 shadow-lg"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">Actualizar</span>
        </motion.button>
      )}
      
      <button
        onClick={onSettingsClick}
        className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors"
        title="Configuración"
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
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="text-2xl font-bold">Configurando torneo...</div>
        
        {error ? (
          <div className="text-yellow-400 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div className="text-sm font-medium">Modo de actualización</div>
            </div>
            <div className="text-xs bg-blue-600/10 p-3 rounded-lg border border-blue-600/20">
              Sistema funcionando con actualizaciones cada 5 segundos
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando datos del servidor...</span>
          </div>
        )}
        
        <div className="space-y-2 text-xs text-gray-500">
          <div>• Conectando con la base de datos</div>
          <div>• Configurando actualizaciones automáticas</div>
          <div>• Sincronizando datos del torneo</div>
        </div>
      </div>
    </div>
  );
}
