
import { useState, useEffect, useCallback } from 'react';
import { detectSafariMobile, addIOSMetaTags, createPseudoFullscreen, exitPseudoFullscreen } from '@/utils/safariMobileUtils';

export function useSafariFullscreenManager(
  onDebugInfo?: (info: string) => void,
  lockToLandscape?: () => Promise<boolean>
) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [safariInfo, setSafariInfo] = useState(detectSafariMobile());

  useEffect(() => {
    // Add iOS meta tags on mount
    if (safariInfo.isIOSSafari) {
      addIOSMetaTags();
    }
    
    // Update Safari info
    setSafariInfo(detectSafariMobile());
    
    const updateFullscreenState = () => {
      const fullscreen = !!(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).mozFullScreenElement
      );
      setIsFullscreen(fullscreen);
    };

    updateFullscreenState();
    
    // Add event listeners
    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    document.addEventListener('mozfullscreenchange', updateFullscreenState);
    
    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenState);
      document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
      document.removeEventListener('mozfullscreenchange', updateFullscreenState);
    };
  }, [safariInfo.isIOSSafari]);

  const enterFullscreen = useCallback(async () => {
    console.log('🍎 Safari fullscreen process starting...', safariInfo);
    
    try {
      const element = document.documentElement;
      
      // For iOS Safari, try native fullscreen first
      if (safariInfo.isIOSSafari) {
        onDebugInfo?.('Intentando pantalla completa en Safari iOS...');
        
        // Try webkit fullscreen first
        if ((element as any).webkitRequestFullscreen) {
          console.log('🍎 Using webkitRequestFullscreen for Safari');
          await (element as any).webkitRequestFullscreen();
          
          // Lock orientation after a delay
          setTimeout(async () => {
            await lockToLandscape?.();
            onDebugInfo?.('Pantalla completa activada en Safari');
            setTimeout(() => onDebugInfo?.(''), 2000);
          }, 500);
          
          return true;
        } 
        // If native fullscreen fails, use pseudo-fullscreen
        else {
          console.log('🍎 Native fullscreen not available, using pseudo-fullscreen');
          onDebugInfo?.('Usando modo pantalla completa alternativo...');
          
          const success = createPseudoFullscreen();
          setIsPseudoFullscreen(true);
          
          await lockToLandscape?.();
          onDebugInfo?.('Modo pantalla completa activado. Gira el dispositivo para mejor experiencia.');
          setTimeout(() => onDebugInfo?.(''), 3000);
          
          return success;
        }
      } else {
        // For other browsers, use standard approach
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        }
        
        setTimeout(async () => {
          await lockToLandscape?.();
          onDebugInfo?.('Pantalla completa activada');
          setTimeout(() => onDebugInfo?.(''), 2000);
        }, 500);
        
        return true;
      }
    } catch (error) {
      console.error('🍎 Safari fullscreen error:', error);
      
      // Fallback to pseudo-fullscreen on any error
      if (safariInfo.isIOSSafari) {
        console.log('🍎 Falling back to pseudo-fullscreen');
        onDebugInfo?.('Activando modo pantalla completa alternativo...');
        
        const success = createPseudoFullscreen();
        setIsPseudoFullscreen(true);
        
        await lockToLandscape?.();
        onDebugInfo?.('Modo alternativo activado. Para mejor experiencia, añade esta página a tu pantalla de inicio.');
        setTimeout(() => onDebugInfo?.(''), 4000);
        
        return success;
      } else {
        onDebugInfo?.(`Error en pantalla completa: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        setTimeout(() => onDebugInfo?.(''), 3000);
        return false;
      }
    }
  }, [safariInfo, onDebugInfo, lockToLandscape]);

  const exitFullscreen = useCallback(async () => {
    console.log('🍎 Safari exit fullscreen process...');
    
    try {
      // Exit pseudo-fullscreen if active
      if (isPseudoFullscreen) {
        exitPseudoFullscreen();
        setIsPseudoFullscreen(false);
        onDebugInfo?.('Saliendo del modo pantalla completa');
        setTimeout(() => onDebugInfo?.(''), 1000);
        return true;
      }
      
      // Try native fullscreen exit
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      }
      
      // Unlock orientation
      try {
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch (e) {
        console.log('⚠️ Could not unlock orientation:', e);
      }
      
      onDebugInfo?.('Saliendo de pantalla completa');
      setTimeout(() => onDebugInfo?.(''), 1000);
      
      return true;
    } catch (error) {
      console.error('🍎 Safari exit fullscreen error:', error);
      onDebugInfo?.(`Error al salir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setTimeout(() => onDebugInfo?.(''), 3000);
      return false;
    }
  }, [isPseudoFullscreen, onDebugInfo]);

  const toggleFullscreen = useCallback(async () => {
    const currentlyFullscreen = isFullscreen || isPseudoFullscreen;
    console.log('🍎 Safari toggle fullscreen. Current state:', currentlyFullscreen);
    
    if (currentlyFullscreen) {
      return await exitFullscreen();
    } else {
      return await enterFullscreen();
    }
  }, [isFullscreen, isPseudoFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen: isFullscreen || isPseudoFullscreen,
    fullscreenSupported: safariInfo.supportsFullscreen || safariInfo.isIOSSafari,
    safariInfo,
    isPseudoFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
