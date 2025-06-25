
export interface MobileOptimizationState {
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

export interface FullscreenManager {
  isFullscreen: boolean;
  fullscreenSupported: boolean;
  enterFullscreen: () => Promise<boolean>;
  exitFullscreen: () => Promise<boolean>;
  toggleFullscreen: () => Promise<boolean>;
}

export interface OrientationManager {
  orientation: 'portrait' | 'landscape';
  screenOrientationSupported: boolean;
  lockToLandscape: () => Promise<boolean>;
}
