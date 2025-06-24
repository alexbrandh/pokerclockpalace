
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
}

export function useMobileOptimization() {
  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isFullscreen: false,
    orientation: 'portrait',
    viewportHeight: window.innerHeight,
    safeAreaInsets: { top: 0, bottom: 0 }
  });

  const updateState = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const isFullscreen = !!document.fullscreenElement;
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Calculate safe area insets for mobile devices
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaTop = parseInt(computedStyle.getPropertyValue('--sat') || '0');
    const safeAreaBottom = parseInt(computedStyle.getPropertyValue('--sab') || '0');

    setState({
      isMobile,
      isFullscreen,
      orientation,
      viewportHeight: window.innerHeight,
      safeAreaInsets: {
        top: safeAreaTop,
        bottom: safeAreaBottom
      }
    });
  }, []);

  useEffect(() => {
    updateState();
    
    const handleResize = () => updateState();
    const handleFullscreenChange = () => updateState();
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
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.warn('Could not enter fullscreen:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Could not exit fullscreen:', error);
    }
  }, []);

  return {
    ...state,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen: state.isFullscreen ? exitFullscreen : enterFullscreen
  };
}
