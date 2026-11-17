import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_STORAGE_KEY = 'batb_pwa_prompt_dismissed';

// Shared singleton state so early beforeinstallprompt events during boot are never lost
let sharedDeferredPrompt: BeforeInstallPromptEvent | null = null;
let sharedIsInstalled =
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);
let sharedIsDismissed =
  typeof window !== 'undefined' &&
  (() => {
    try {
      return window.sessionStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  })();

const listeners = new Set<() => void>();
let listenersAttached = false;

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function detectIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (ua.includes('macintosh') && navigator.maxTouchPoints > 1)
  );
}

function attachGlobalInstallListeners() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;

  const mediaQuery = window.matchMedia('(display-mode: standalone)');
  const checkStandalone = () =>
    mediaQuery.matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  sharedIsInstalled = checkStandalone();

  mediaQuery.addEventListener?.('change', (e: MediaQueryListEvent) => {
    if (e.matches) {
      sharedIsInstalled = true;
      sharedDeferredPrompt = null;
      notifyListeners();
    }
  });

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    sharedDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    sharedIsInstalled = true;
    sharedDeferredPrompt = null;
    notifyListeners();
  });
}

attachGlobalInstallListeners();

export function usePWAInstall() {
  const [, setTick] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    attachGlobalInstallListeners();
    const onUpdate = () => setTick((n) => n + 1);
    listeners.add(onUpdate);
    return () => {
      listeners.delete(onUpdate);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!sharedDeferredPrompt || isInstalling) return false;
    setIsInstalling(true);
    try {
      await sharedDeferredPrompt.prompt();
      const { outcome } = await sharedDeferredPrompt.userChoice;
      if (outcome === 'accepted') {
        sharedIsInstalled = true;
        sharedDeferredPrompt = null;
        notifyListeners();
        return true;
      }
      // Browser consumes the event once .prompt() is called; clear until browser re-emits
      sharedDeferredPrompt = null;
      notifyListeners();
      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  const dismissPrompt = () => {
    sharedIsDismissed = true;
    try {
      window.sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    notifyListeners();
  };

  return {
    isInstallable: Boolean(sharedDeferredPrompt) && !sharedIsInstalled,
    isInstalled: sharedIsInstalled,
    isIOS: detectIOS(),
    isDismissed: sharedIsDismissed,
    isInstalling,
    install,
    dismissPrompt,
  };
}
