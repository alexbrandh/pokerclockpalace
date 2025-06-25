
import { useState, useEffect, useCallback } from 'react';
import type { OrientationManager } from '@/types/mobile-optimization';

export function useOrientationManager(): OrientationManager {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [screenOrientationSupported, setScreenOrientationSupported] = useState(false);

  const updateOrientation = useCallback(() => {
    const currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    setOrientation(currentOrientation);
  }, []);

  useEffect(() => {
    // Check screen orientation API support
    const supported = !!(screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation);
    setScreenOrientationSupported(supported);
    
    updateOrientation();
    
    const handleOrientationChange = () => {
      setTimeout(updateOrientation, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', updateOrientation);
    };
  }, [updateOrientation]);

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

  return {
    orientation,
    screenOrientationSupported,
    lockToLandscape
  };
}
