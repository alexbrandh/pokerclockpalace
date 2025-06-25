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
  screenOrientationSupported: boolean;
}

export function useMobileOptimization() {
  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isFullscreen: false,
    orientation: 'portrait',
    viewportHeight: window.innerHeight,
    safeAreaInsets: { top: 0, bottom: 0 },
    fullscreenSupported: false,
    debugInfo: '',
    screenOrientationSupported: false
  });

  const updateState = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement);
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Check fullscreen support with vendor prefixes
    const fullscreenSupported = !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen ||
      (document.documentElement as any).msRequestFullscreen
    );

    // Check screen orientation API support
    const screenOrientationSupported = !!(screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation);
    
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
      fullscreenSupported,
      screenOrientationSupported
    }));
  }, []);

  useEffect(() => {
    updateState();
    
    const handleResize = () => updateState();
    const handleFullscreenChange = () => {
      console.log('🔄 Fullscreen change detected:', !!(document.fullscreenElement || (document as any).webkitFullscreenElement));
      updateState();
    };
    const handleOrientationChange = () => {
      setTimeout(updateState, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Add multiple fullscreen event listeners for cross-browser support
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [updateState]);

  const lockToLandscape = useCallback(async () => {
    console.log('🔄 Attempting to lock orientation to landscape...');
    
    try {
      const orientation = screen.orientation;
      
      if (orientation && (orientation as any).lock) {
        await (orientation as any).lock('landscape');
        console.log('✅ Orientation locked to landscape');
        return true;
      } else if ((screen as any).lockOrientation) {
        (screen as any).lockOrientation('landscape');
        console.log('✅ Orientation locked (legacy API)');
        return true;
      } else {
        console.log('⚠️ Screen orientation lock not supported');
        return false;
      }
    } catch (error) {
      console.log('⚠️ Could not lock orientation:', error);
      return false;
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    console.log('🚀 Starting fullscreen process...');
    
    try {
      const element = document.documentElement;
      
      // Try different fullscreen methods in order of preference
      if (element.requestFullscreen) {
        console.log('📱 Using standard requestFullscreen API');
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        console.log('📱 Using webkit requestFullscreen API');
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        console.log('📱 Using moz requestFullScreen API');
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        console.log('📱 Using ms requestFullscreen API');
        await (element as any).msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }

      console.log('✅ Fullscreen request sent successfully');
      setState(prev => ({ ...prev, debugInfo: 'Activando pantalla completa...' }));
      
      // Try to lock to landscape after a short delay
      setTimeout(async () => {
        const orientationLocked = await lockToLandscape();
        if (!orientationLocked) {
          setState(prev => ({ 
            ...prev, 
            debugInfo: 'Pantalla completa activa. Gira tu dispositivo horizontalmente para mejor experiencia.' 
          }));
        } else {
          setState(prev => ({ ...prev, debugInfo: 'Pantalla completa horizontal activada' }));
        }
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, debugInfo: '' }));
        }, 3000);
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ Fullscreen error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ 
        ...prev, 
        debugInfo: `No se pudo activar pantalla completa: ${errorMsg}. Intenta hacer clic directamente en el botón.` 
      }));
      
      // Clear error message after 4 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, debugInfo: '' }));
      }, 4000);
      
      return false;
    }
  }, [lockToLandscape]);

  const exitFullscreen = useCallback(async () => {
    console.log('🔙 Exiting fullscreen...');
    
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      console.log('✅ Exited fullscreen successfully');
      setState(prev => ({ ...prev, debugInfo: 'Saliendo de pantalla completa' }));
      
      // Unlock orientation
      try {
        const orientation = screen.orientation;
        if (orientation && (orientation as any).unlock) {
          (orientation as any).unlock();
        }
      } catch (e) {
        console.log('⚠️ Could not unlock orientation:', e);
      }
      
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
      
      setTimeout(() => {
        setState(prev => ({ ...prev, debugInfo: '' }));
      }, 3000);
      
      return false;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    console.log('🔄 Toggling fullscreen. Current state:', state.isFullscreen);
    
    if (state.isFullscreen) {
      return await exitFullscreen();
    } else {
      return await enterFullscreen();
    }
  }, [state.isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    ...state,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
