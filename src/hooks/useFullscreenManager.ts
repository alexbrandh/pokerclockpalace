
import { useState, useEffect, useCallback } from 'react';
import { useSafariFullscreenManager } from './useSafariFullscreenManager';
import { detectSafariMobile } from '@/utils/safariMobileUtils';
import type { FullscreenManager } from '@/types/mobile-optimization';

export function useFullscreenManager(
  onDebugInfo?: (info: string) => void,
  lockToLandscape?: () => Promise<boolean>
): FullscreenManager {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  
  // Detect Safari and Chrome mobile
  const safariInfo = detectSafariMobile();
  const safariManager = useSafariFullscreenManager(onDebugInfo, lockToLandscape);

  // If Safari iOS, use Safari manager
  if (safariInfo.isIOSSafari) {
    return {
      isFullscreen: safariManager.isFullscreen,
      fullscreenSupported: safariManager.fullscreenSupported,
      enterFullscreen: safariManager.enterFullscreen,
      exitFullscreen: safariManager.exitFullscreen,
      toggleFullscreen: safariManager.toggleFullscreen
    };
  }

  // For Chrome mobile and other browsers
  const updateFullscreenState = useCallback(() => {
    const fullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement);
    setIsFullscreen(fullscreen);
  }, []);

  useEffect(() => {
    // Check fullscreen support with vendor prefixes
    const supported = !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen ||
      (document.documentElement as any).msRequestFullscreen
    );
    setFullscreenSupported(supported);
    
    updateFullscreenState();
    
    const handleFullscreenChange = () => {
      console.log('🔄 Fullscreen change detected:', !!(document.fullscreenElement || (document as any).webkitFullscreenElement));
      updateFullscreenState();
    };

    // Add multiple fullscreen event listeners for cross-browser support
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [updateFullscreenState]);

  const enterFullscreen = useCallback(() => {
    console.log('🚀 Starting fullscreen process...', safariInfo.isChromeMobile ? 'Chrome Mobile' : 'Standard Browser');
    
    // For Chrome mobile, make COMPLETELY synchronous call
    if (safariInfo.isChromeMobile) {
      console.log('📱 Chrome Mobile detected - using synchronous approach');
      onDebugInfo?.('Activando pantalla completa Chrome...');
      
      try {
        const element = document.documentElement;
        
        // Synchronous call without await
        if (element.requestFullscreen) {
          element.requestFullscreen().then(() => {
            console.log('✅ Chrome fullscreen success');
            // Lock orientation after fullscreen is active
            setTimeout(async () => {
              const orientationLocked = await lockToLandscape?.();
              if (!orientationLocked) {
                onDebugInfo?.('Pantalla completa activa. Gira tu dispositivo horizontalmente.');
              } else {
                onDebugInfo?.('Pantalla completa horizontal activada');
              }
              setTimeout(() => onDebugInfo?.(''), 3000);
            }, 300);
          }).catch((error) => {
            console.error('❌ Chrome fullscreen error:', error);
            onDebugInfo?.(`Error Chrome: ${error.message}. Intenta de nuevo.`);
            setTimeout(() => onDebugInfo?.(''), 4000);
          });
        } else if ((element as any).webkitRequestFullscreen) {
          (element as any).webkitRequestFullscreen();
          setTimeout(async () => {
            await lockToLandscape?.();
            onDebugInfo?.('Pantalla completa webkit activada');
            setTimeout(() => onDebugInfo?.(''), 2000);
          }, 300);
        }
        
        return Promise.resolve(true);
      } catch (error) {
        console.error('❌ Chrome mobile fullscreen error:', error);
        onDebugInfo?.(`Error Chrome: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        setTimeout(() => onDebugInfo?.(''), 4000);
        return Promise.resolve(false);
      }
    }
    
    // For other browsers, use async approach
    return (async () => {
      try {
        const element = document.documentElement;
        
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
        onDebugInfo?.('Activando pantalla completa...');
        
        // Try to lock to landscape after a short delay
        setTimeout(async () => {
          const orientationLocked = await lockToLandscape?.();
          if (!orientationLocked) {
            onDebugInfo?.('Pantalla completa activa. Gira tu dispositivo horizontalmente para mejor experiencia.');
          } else {
            onDebugInfo?.('Pantalla completa horizontal activada');
          }
          
          // Clear message after 3 seconds
          setTimeout(() => {
            onDebugInfo?.('');
          }, 3000);
        }, 500);
        
        return true;
      } catch (error) {
        console.error('❌ Fullscreen error:', error);
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        onDebugInfo?.(`No se pudo activar pantalla completa: ${errorMsg}. Intenta hacer clic directamente en el botón.`);
        
        // Clear error message after 4 seconds
        setTimeout(() => {
          onDebugInfo?.('');
        }, 4000);
        
        return false;
      }
    })();
  }, [onDebugInfo, lockToLandscape, safariInfo.isChromeMobile]);

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
      onDebugInfo?.('Saliendo de pantalla completa');
      
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
        onDebugInfo?.('');
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('❌ Exit fullscreen error:', error);
      onDebugInfo?.(`Error al salir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      
      setTimeout(() => {
        onDebugInfo?.('');
      }, 3000);
      
      return false;
    }
  }, [onDebugInfo]);

  const toggleFullscreen = useCallback(async () => {
    console.log('🔄 Toggling fullscreen. Current state:', isFullscreen);
    
    if (isFullscreen) {
      return await exitFullscreen();
    } else {
      const result = enterFullscreen();
      return result instanceof Promise ? await result : result;
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    fullscreenSupported,
    enterFullscreen: () => {
      const result = enterFullscreen();
      return result instanceof Promise ? result : Promise.resolve(result);
    },
    exitFullscreen,
    toggleFullscreen
  };
}
