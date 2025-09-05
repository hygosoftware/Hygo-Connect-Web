'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SESSION_STORAGE_KEY = 'pwa_install_prompt_dismissed_session';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt in this session
    const checkSessionDismissal = () => {
      return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    };

    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Check if user has dismissed the prompt in this session
      if (checkSessionDismissal()) {
        return;
      }

      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI to notify the user they can add to home screen
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // Log the user's choice
      console.log(`User response to the install prompt: ${outcome}`);
      
      // If user dismissed, remember their choice for this session
      if (outcome === 'dismissed') {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      }
      
      // Optionally, send analytics event with outcome of user choice
      // analytics.track('pwa_install_prompt', { outcome });
    } catch (error) {
      console.error('Error handling install prompt:', error);
    } finally {
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    // Remember that user dismissed the prompt for this session
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  // Don't show the install prompt if the app is already installed
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 md:bottom-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-sm">
      <div className="flex flex-col space-y-3">
        <h3 className="font-semibold text-gray-800">Install Hygo App</h3>
        <p className="text-sm text-gray-600">
          Add Hygo to your home screen for quick access and an app-like experience.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
