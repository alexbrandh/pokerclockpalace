
import { useState, useEffect, useCallback } from 'react';

interface MobileStateHook {
  isMobile: boolean;
  orientation: 'portrait' | 'landscape';
  viewportHeight: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
  };
  debugInfo: string;
  setDebugInfo: (info: string) => void;
  updateMobileState: () => void;
}

export function useMobileState(): MobileStateHook {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, bottom: 0 });
  const [debugInfo, setDebugInfo] = useState('');

  const updateMobileState = useCallback(() => {
    const mobile = window.innerWidth < 768;
    const currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Calculate safe area insets for mobile devices
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaTop = parseInt(computedStyle.getPropertyValue('--sat') || '0');
    const safeAreaBottom = parseInt(computedStyle.getPropertyValue('--sab') || '0');

    setIsMobile(mobile);
    setOrientation(currentOrientation);
    setViewportHeight(window.innerHeight);
    setSafeAreaInsets({
      top: safeAreaTop,
      bottom: safeAreaBottom
    });
  }, []);

  useEffect(() => {
    updateMobileState();
    
    const handleResize = () => updateMobileState();
    const handleOrientationChange = () => {
      setTimeout(updateMobileState, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateMobileState]);

  return {
    isMobile,
    orientation,
    viewportHeight,
    safeAreaInsets,
    debugInfo,
    setDebugInfo,
    updateMobileState
  };
}
