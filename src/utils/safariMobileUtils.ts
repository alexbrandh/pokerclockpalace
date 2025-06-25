
export interface SafariMobileInfo {
  isIOSSafari: boolean;
  isStandalone: boolean;
  version: string;
  supportsFullscreen: boolean;
}

export function detectSafariMobile(): SafariMobileInfo {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS|OPiOS/.test(userAgent);
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
    supportsFullscreen
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

export function createPseudoFullscreen() {
  console.log('🍎 Creating pseudo-fullscreen for Safari iOS');
  
  // Hide address bar by scrolling
  window.scrollTo(0, 1);
  
  // Set body styles for fullscreen-like experience
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = '0';
  document.body.style.left = '0';
  document.body.style.width = '100%';
  document.body.style.height = '100vh';
  
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
