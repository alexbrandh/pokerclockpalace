
import { useMobileState } from './useMobileState';
import { useOrientationManager } from './useOrientationManager';
import { useFullscreenManager } from './useFullscreenManager';
import type { MobileOptimizationState } from '@/types/mobile-optimization';

export function useMobileOptimization() {
  const {
    isMobile,
    orientation,
    viewportHeight,
    safeAreaInsets,
    debugInfo,
    setDebugInfo
  } = useMobileState();

  const {
    screenOrientationSupported,
    lockToLandscape
  } = useOrientationManager();

  const {
    isFullscreen,
    fullscreenSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  } = useFullscreenManager(setDebugInfo, lockToLandscape);

  const state: MobileOptimizationState = {
    isMobile,
    isFullscreen,
    orientation,
    viewportHeight,
    safeAreaInsets,
    fullscreenSupported,
    debugInfo,
    screenOrientationSupported
  };

  return {
    ...state,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
