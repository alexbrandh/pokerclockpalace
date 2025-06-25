
import { useState, useEffect, useCallback } from 'react';

interface MobileOptimizationState {
  isMobile: boolean;
  isFullscreen: boolean;
  orientation: 'portrait' | 'landscape';
  viewportHeight: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
  };
  fullscreenSupported: boolean;
  debugInfo: string;
}

export function useMobileOptimization() {
  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isFullscreen: false,
    orientation: 'portrait',
    viewportHeight: window.innerHeight,
    safeAreaInsets: { top: 0, bottom: 0 },
    fullscreenSupported: false,
    debugInfo: ''
  });

  const updateState = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const isFullscreen = !!document.fullscreenElement;
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    const fullscreenSupported = !!(document.documentElement.requestFullscreen);
    
    // Calculate safe area insets for mobile devices
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaTop = parseInt(computedStyle.getPropertyValue('--sat') || '0');
    const safeAreaBottom = parseInt(computedStyle.getPropertyValue('--sab') || '0');

    setState(prev => ({
      ...prev,
      isMobile,
      isFullscreen,
      orientation,
      viewportHeight: window.innerHeight,
      safeAreaInsets: {
        top: safeAreaTop,
        bottom: safeAreaBottom
      },
      fullscreenSupported
    }));
  }, []);

  useEffect(() => {
    updateState();
    
    const handleResize = () => updateState();
    const handleFullscreenChange = () => {
      console.log('Fullscreen change detected:', !!document.fullscreenElement);
      updateState();
    };
    const handleOrientationChange = () => {
      // Delay to allow viewport to adjust
      setTimeout(updateState, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [updateState]);

  const enterFullscreen = useCallback(async () => {
    console.log('🚀 Attempting to enter fullscreen...');
    
    try {
      // Check if fullscreen is supported
      if (!document.documentElement.requestFullscreen) {
        console.warn('❌ Fullscreen API not supported');
        setState(prev => ({ ...prev, debugInfo: 'Fullscreen no soportado en este navegador' }));
        return false;
      }

      // Check if already in fullscreen
      if (document.fullscreenElement) {
        console.log('ℹ️ Already in fullscreen mode');
        return true;
      }

      console.log('📱 Requesting fullscreen...');
      await document.documentElement.requestFullscreen();
      
      console.log('✅ Successfully entered fullscreen');
      setState(prev => ({ ...prev, debugInfo: 'Pantalla completa activada' }));
      
      // Clear debug message after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, debugInfo: '' }));
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('❌ Fullscreen error:', error);
      setState(prev => ({ 
        ...prev, 
        debugInfo: `Error: ${error instanceof Error ? error.message : 'No se pudo activar pantalla completa'}` 
      }));
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, debugInfo: '' }));
      }, 3000);
      
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    console.log('🔙 Attempting to exit fullscreen...');
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        console.log('✅ Successfully exited fullscreen');
        setState(prev => ({ ...prev, debugInfo: 'Saliendo de pantalla completa' }));
      } else {
        console.log('ℹ️ Not in fullscreen mode');
      }
      
      // Clear debug message after 1 second
      setTimeout(() => {
        setState(prev => ({ ...prev, debugInfo: '' }));
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('❌ Exit fullscreen error:', error);
      setState(prev => ({ 
        ...prev, 
        debugInfo: `Error al salir: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      }));
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, debugInfo: '' }));
      }, 3000);
      
      return false;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    console.log('🔄 Toggling fullscreen. Current state:', !!document.fullscreenElement);
    
    if (document.fullscreenElement) {
      return await exitFullscreen();
    } else {
      return await enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  return {
    ...state,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
