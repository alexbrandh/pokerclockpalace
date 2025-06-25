
export interface SafariMobileInfo {
  isIOSSafari: boolean;
  isStandalone: boolean;
  version: string;
  supportsFullscreen: boolean;
  isChromeMobile: boolean;
}

export function detectSafariMobile(): SafariMobileInfo {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS|OPiOS/.test(userAgent);
  const isChromeMobile = /Chrome/.test(userAgent) && /Mobile/.test(userAgent);
  const isStandalone = (window.navigator as any).standalone === true;
  
  // Extract Safari version
  const versionMatch = userAgent.match(/Version\/([0-9]+\.[0-9]+)/);
  const version = versionMatch ? versionMatch[1] : '0.0';
  
  // Check fullscreen support more thoroughly
  const supportsFullscreen = !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as any).webkitRequestFullscreen ||
    (document.documentElement as any).webkitEnterFullscreen
  );
  
  return {
    isIOSSafari: isIOS && isSafari,
    isStandalone,
    version,
    supportsFullscreen,
    isChromeMobile
  };
}

export function addIOSMetaTags() {
  const head = document.head;
  
  // Remove existing meta tags to avoid duplicates
  const existingTags = head.querySelectorAll('meta[name^="apple-mobile-web-app"]');
  existingTags.forEach(tag => tag.remove());
  
  // Add iOS-specific meta tags
  const metaTags = [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Poker Clock' },
    { name: 'mobile-web-app-capable', content: 'yes' }
  ];
  
  metaTags.forEach(({ name, content }) => {
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    head.appendChild(meta);
  });
}

let fullscreenVideoElement: HTMLVideoElement | null = null;

export function createVideoFullscreen(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('🍎 Creating video-based fullscreen for Safari iOS');
    
    try {
      // Create invisible video element
      if (!fullscreenVideoElement) {
        fullscreenVideoElement = document.createElement('video');
        fullscreenVideoElement.style.position = 'fixed';
        fullscreenVideoElement.style.top = '0';
        fullscreenVideoElement.style.left = '0';
        fullscreenVideoElement.style.width = '100vw';
        fullscreenVideoElement.style.height = '100vh';
        fullscreenVideoElement.style.zIndex = '-1';
        fullscreenVideoElement.style.opacity = '0';
        fullscreenVideoElement.style.pointerEvents = 'none';
        fullscreenVideoElement.muted = true;
        fullscreenVideoElement.playsInline = true;
        
        // Create a minimal video source (1x1 transparent pixel)
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 1, 1);
        }
        
        // Convert canvas to video blob
        canvas.toBlob((blob) => {
          if (blob && fullscreenVideoElement) {
            const url = URL.createObjectURL(blob);
            fullscreenVideoElement.src = url;
          }
        });
        
        document.body.appendChild(fullscreenVideoElement);
      }
      
      // Use webkitEnterFullscreen for true fullscreen on Safari iOS
      if ((fullscreenVideoElement as any).webkitEnterFullscreen) {
        (fullscreenVideoElement as any).webkitEnterFullscreen();
        
        fullscreenVideoElement.addEventListener('webkitfullscreenchange', () => {
          const isInFullscreen = (document as any).webkitFullscreenElement === fullscreenVideoElement;
          console.log('🍎 Video fullscreen change:', isInFullscreen);
          resolve(isInFullscreen);
        }, { once: true });
      } else {
        // Fallback to pseudo-fullscreen
        resolve(createPseudoFullscreen());
      }
    } catch (error) {
      console.error('🍎 Video fullscreen error:', error);
      resolve(createPseudoFullscreen());
    }
  });
}

export function exitVideoFullscreen(): boolean {
  console.log('🍎 Exiting video fullscreen');
  
  try {
    if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
      return true;
    }
    
    if (fullscreenVideoElement && (fullscreenVideoElement as any).webkitExitFullscreen) {
      (fullscreenVideoElement as any).webkitExitFullscreen();
      return true;
    }
    
    return exitPseudoFullscreen();
  } catch (error) {
    console.error('🍎 Exit video fullscreen error:', error);
    return exitPseudoFullscreen();
  }
}

export function createPseudoFullscreen() {
  console.log('🍎 Creating pseudo-fullscreen for Safari iOS');
  
  // Hide Safari UI elements
  window.scrollTo(0, 1);
  
  // Set body styles for fullscreen-like experience
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = '0';
  document.body.style.left = '0';
  document.body.style.width = '100%';
  document.body.style.height = '100vh';
  document.body.style.background = 'black';
  
  // Hide address bar more aggressively
  const metaViewport = document.querySelector('meta[name=viewport]');
  if (metaViewport) {
    (metaViewport as HTMLMetaElement).content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }
  
  // Try to lock orientation
  try {
    if (screen.orientation && (screen.orientation as any).lock) {
      (screen.orientation as any).lock('landscape');
    }
  } catch (e) {
    console.log('⚠️ Could not lock orientation:', e);
  }
  
  return true;
}

export function exitPseudoFullscreen() {
  console.log('🍎 Exiting pseudo-fullscreen for Safari iOS');
  
  // Reset body styles
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.width = '';
  document.body.style.height = '';
  document.body.style.background = '';
  
  // Reset viewport
  const metaViewport = document.querySelector('meta[name=viewport]');
  if (metaViewport) {
    (metaViewport as HTMLMetaElement).content = 'width=device-width, initial-scale=1.0';
  }
  
  // Unlock orientation
  try {
    if (screen.orientation && (screen.orientation as any).unlock) {
      (screen.orientation as any).unlock();
    }
  } catch (e) {
    console.log('⚠️ Could not unlock orientation:', e);
  }
  
  return true;
}
