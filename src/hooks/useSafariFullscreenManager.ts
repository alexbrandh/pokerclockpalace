
import { useState, useEffect, useCallback } from 'react';
import { 
  detectSafariMobile, 
  addIOSMetaTags, 
  createVideoFullscreen, 
  exitVideoFullscreen,
  createPseudoFullscreen, 
  exitPseudoFullscreen 
} from '@/utils/safariMobileUtils';

export function useSafariFullscreenManager(
  onDebugInfo?: (info: string) => void,
  lockToLandscape?: () => Promise<boolean>
) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
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
      
      // Check for video fullscreen
      const videoFullscreen = (document as any).webkitFullscreenElement?.tagName === 'VIDEO';
      setIsVideoFullscreen(videoFullscreen);
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
      // For iOS Safari, try video-based fullscreen first
      if (safariInfo.isIOSSafari) {
        onDebugInfo?.('Activando pantalla completa Safari...');
        
        const videoSuccess = await createVideoFullscreen();
        
        if (videoSuccess) {
          setIsVideoFullscreen(true);
          await lockToLandscape?.();
          onDebugInfo?.('Pantalla completa verdadera activada');
          setTimeout(() => onDebugInfo?.(''), 2000);
          return true;
        } else {
          // Fallback to pseudo-fullscreen
          console.log('🍎 Video fullscreen failed, using pseudo-fullscreen');
          onDebugInfo?.('Usando modo pantalla completa alternativo...');
          
          const success = createPseudoFullscreen();
          setIsPseudoFullscreen(true);
          
          await lockToLandscape?.();
          onDebugInfo?.('Modo alternativo activado. Para mejor experiencia, añade esta página a tu pantalla de inicio.');
          setTimeout(() => onDebugInfo?.(''), 4000);
          
          return success;
        }
      } else {
        // For other browsers, use standard approach
        const element = document.documentElement;
        
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
      
      // Final fallback to pseudo-fullscreen
      if (safariInfo.isIOSSafari) {
        console.log('🍎 All methods failed, falling back to pseudo-fullscreen');
        onDebugInfo?.('Activando modo pantalla completa básico...');
        
        const success = createPseudoFullscreen();
        setIsPseudoFullscreen(true);
        
        await lockToLandscape?.();
        onDebugInfo?.('Modo básico activado. Añade la página a tu pantalla de inicio para mejor experiencia.');
        setTimeout(() => onDebugInfo?.(''), 5000);
        
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
      // Exit video fullscreen if active
      if (isVideoFullscreen) {
        const success = exitVideoFullscreen();
        setIsVideoFullscreen(false);
        onDebugInfo?.('Saliendo de pantalla completa');
        setTimeout(() => onDebugInfo?.(''), 1000);
        return success;
      }
      
      // Exit pseudo-fullscreen if active
      if (isPseudoFullscreen) {
        exitPseudoFullscreen();
        setIsPseudoFullscreen(false);
        onDebugInfo?.('Saliendo del modo alternativo');
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
  }, [isVideoFullscreen, isPseudoFullscreen, onDebugInfo]);

  const toggleFullscreen = useCallback(async () => {
    const currentlyFullscreen = isFullscreen || isPseudoFullscreen || isVideoFullscreen;
    console.log('🍎 Safari toggle fullscreen. Current state:', currentlyFullscreen);
    
    if (currentlyFullscreen) {
      return await exitFullscreen();
    } else {
      return await enterFullscreen();
    }
  }, [isFullscreen, isPseudoFullscreen, isVideoFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen: isFullscreen || isPseudoFullscreen || isVideoFullscreen,
    fullscreenSupported: safariInfo.supportsFullscreen || safariInfo.isIOSSafari,
    safariInfo,
    isPseudoFullscreen,
    isVideoFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
