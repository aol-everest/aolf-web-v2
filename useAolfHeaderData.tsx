import { useEffect, useState } from 'react';

// Add type definitions for post-robot
declare global {
  interface Window {
    postRobot: {
      on: (
        eventName: string,
        handler: (event: any) => any,
      ) => { cancel: () => void };
      send: (target: Window, eventName: string, data?: any) => Promise<any>;
    };
  }
}

// Simple logger for debugging
const headerLogger = {
  info: (message: string, data?: any) =>
    console.info(`[HeaderData] ${message}`, data || ''),
  debug: (message: string, data?: any) =>
    console.debug(`[HeaderData] ${message}`, data || ''),
  warn: (message: string, data?: any) =>
    console.warn(`[HeaderData] ${message}`, data || ''),
  error: (message: string, data?: any) =>
    console.error(`[HeaderData] ${message}`, data || ''),
};

// Types for the auth profile data
export interface AolfHeaderProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  photourl?: string;
  userProfilePic?: string;
}

export interface AolfHeaderMenuItem {
  label: string;
  href: string;
}

export interface AolfExploreMenuItem {
  name: string;
  link: string;
}

export interface AolfHeaderData {
  isAuthenticated: boolean;
  profile: AolfHeaderProfile | null;
  tokens?: {
    accessToken: string;
    idToken: string;
  };
  exploreMenu?: AolfExploreMenuItem[];
}

/**
 * Determines if debug mode should be enabled
 */
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get('debug');
  const localStorageDebug = localStorage.getItem('aolf-widget-debug');
  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname.endsWith('.local');

  return (
    debugParam === 'true' ||
    debugParam === 'widget' ||
    localStorageDebug === 'true' ||
    isLocalHost
  );
};

/**
 * Loads the debug helper script if debugging is enabled
 */
const loadDebugHelper = (app2Origin: string): void => {
  if (!isDebugEnabled()) return;

  headerLogger.info('Debug mode enabled, loading debug helper');

  const existingScript = document.getElementById('aolf-debug-helper');
  if (existingScript) return;

  const script = document.createElement('script');
  script.id = 'aolf-debug-helper';
  script.src = `${app2Origin}/widget/debug-helper.js`;
  script.async = true;
  script.onload = () => headerLogger.debug('Debug helper script loaded');
  script.onerror = (e) =>
    headerLogger.error('Failed to load debug helper script', e);

  document.head.appendChild(script);
};

/**
 * Check if post-robot is available
 * (Script will be loaded directly in the app layout head)
 */
const checkPostRobot = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (typeof window !== 'undefined' && window.postRobot) {
      headerLogger.debug('Post-robot already available in window');
      resolve();
      return;
    }

    // Wait for a short time to see if it becomes available (may be loading)
    let attempts = 0;
    const maxAttempts = 10; // Increase max attempts
    const checkInterval = setInterval(() => {
      attempts++;

      if (window && window.postRobot) {
        clearInterval(checkInterval);
        headerLogger.debug('Post-robot became available');
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        const errorMsg = 'Post-robot not available after waiting';
        headerLogger.error(errorMsg);
        reject(new Error(errorMsg));
      }
    }, 300); // Check less frequently to reduce console spam
  });
};

// Track active listeners globally to prevent duplicates
let activeListeners: {
  authUpdate?: { cancel: () => void };
  ready?: { cancel: () => void };
  click?: { cancel: () => void };
} = {};

/**
 * Detect if the current device is running iOS
 */
const isIOS = (): boolean => {
  if (typeof window === 'undefined' || !navigator) return false;

  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod|iOS|CriOS/.test(ua) ||
    (/Safari/.test(ua) &&
      /Apple/.test(navigator.vendor) &&
      !/Chrome|Android/.test(ua)) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
};

/**
 * Get iOS version if applicable
 */
const getIOSVersion = (): number | null => {
  if (!isIOS()) return null;

  const ua = navigator.userAgent;
  const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return null;
};

/**
 * Hook to get authentication data from the AOLF auth widget
 * Simplified to use post-robot for cross-domain communication
 */
export function useAolfHeaderData(app2Origin: string, app2WidgetUrl: string) {
  const [headerData, setHeaderData] = useState<AolfHeaderData | null>(null);
  const debug = isDebugEnabled();
  const [communicationErrors, setCommunicationErrors] = useState(0);

  // Set up auto-recovery for communication errors
  useEffect(() => {
    if (communicationErrors > 3) {
      headerLogger.warn(
        `Detected ${communicationErrors} communication errors, attempting auto-recovery`,
      );

      // Find the iframe
      const iframe = document.getElementById(
        'auth-profile-iframe',
      ) as HTMLIFrameElement | null;

      // Attempt recovery by reloading the iframe
      if (iframe) {
        const currentSrc = iframe.src;
        iframe.src = 'about:blank';

        setTimeout(() => {
          iframe.src =
            currentSrc +
            (currentSrc.includes('?') ? '&' : '?') +
            'reload=' +
            Date.now();
          headerLogger.info('Iframe reloaded to fix communication issues');
        }, 100);

        // Reset error counter
        setCommunicationErrors(0);
      }
    }
  }, [communicationErrors]);

  useEffect(() => {
    headerLogger.info(`Initializing with app2Origin: ${app2Origin}`, { debug });

    // Log device information for debugging
    const deviceIsIOS = isIOS();
    const iosVersion = getIOSVersion();
    if (debug) {
      headerLogger.info(
        `Device: ${deviceIsIOS ? 'iOS' : 'non-iOS'} ${iosVersion ? `(iOS ${iosVersion})` : ''}`,
      );
    }

    // Load debug helper if debug mode is enabled
    if (debug) {
      loadDebugHelper(app2Origin);
    }

    // Create or get iframe
    let iframe = document.getElementById(
      'auth-profile-iframe',
    ) as HTMLIFrameElement | null;

    if (!iframe) {
      headerLogger.debug('Creating auth-profile-iframe');
      iframe = document.createElement('iframe');
      iframe.id = 'auth-profile-iframe';

      // Style for interactive visible iframe instead of hidden one
      iframe.style.cssText =
        'border:none; overflow:hidden; height:60px; width:auto; min-width:100px;';

      // Add debug param if in debug mode
      const debugParam = debug ? '&debug=true' : '';

      // Add client origin to help with cross-domain setup
      const clientOrigin =
        typeof window !== 'undefined'
          ? encodeURIComponent(window.location.origin)
          : '';

      // Add device info to URL
      const deviceParam = deviceIsIOS ? '&device=ios' : '';
      const versionParam = iosVersion ? `&iosVersion=${iosVersion}` : '';
      const timestamp = `&t=${Date.now()}`;

      iframe.src = `${app2WidgetUrl}?client=${clientOrigin}${debugParam}${deviceParam}${versionParam}${timestamp}`;

      // Add special attributes for iOS
      if (deviceIsIOS) {
        // Ensure we allow interaction for iOS
        iframe.setAttribute('allow', 'payment');

        // Do not use sandbox on iOS as it can cause postMessage issues
        if (!iosVersion || iosVersion < 14) {
          iframe.setAttribute(
            'sandbox',
            'allow-scripts allow-same-origin allow-forms allow-popups',
          );
        }
      }

      document.body.appendChild(iframe);

      if (debug) {
        headerLogger.debug('Added iframe with attributes', {
          id: iframe.id,
          src: iframe.src,
          isIOS: deviceIsIOS,
          iosVersion,
        });
      }
    } else {
      headerLogger.debug('Using existing auth-profile-iframe');
    }

    // Just check if post-robot is available (should be loaded in head)
    checkPostRobot()
      .then(() => {
        headerLogger.info('Post-robot available, setting up communication');

        if (!window.postRobot) {
          headerLogger.error('Post-robot not available after check');
          return;
        }

        // Setup communication with the iframe
        if (!iframe || !iframe.contentWindow) {
          headerLogger.error('Iframe not available for communication');
          return;
        }

        // Clean up any existing listeners to prevent duplicates
        if (activeListeners.authUpdate) {
          try {
            activeListeners.authUpdate.cancel();
            headerLogger.debug('Cleaned up existing auth update listener');
          } catch (err) {
            headerLogger.warn('Error cleaning up auth update listener:', err);
          }
        }

        if (activeListeners.ready) {
          try {
            activeListeners.ready.cancel();
            headerLogger.debug('Cleaned up existing ready listener');
          } catch (err) {
            headerLogger.warn('Error cleaning up ready listener:', err);
          }
        }

        if (activeListeners.click) {
          try {
            activeListeners.click.cancel();
            headerLogger.debug('Cleaned up existing click listener');
          } catch (err) {
            headerLogger.warn('Error cleaning up click listener:', err);
          }
        }

        // Function to request auth profile from iframe
        const requestAuthProfile = () => {
          if (!iframe || !iframe.contentWindow) {
            headerLogger.error('iframe or contentWindow not available');
            return;
          }

          headerLogger.debug('Requesting auth-profile data');

          try {
            const origin = iframe.src ? new URL(iframe.src).origin : app2Origin;
            headerLogger.debug('Sending get-auth-profile request to ' + origin);

            window.postRobot
              .send(iframe.contentWindow, 'get-auth-profile', {
                timestamp: Date.now(),
              })
              .then((event) => {
                const authData = event.data;
                headerLogger.info('Received auth profile data', {
                  isAuthenticated: authData.isAuthenticated,
                  hasProfile: !!authData.profile,
                  hasTokens: !!authData.tokens,
                });

                // Process the data
                const processedData: AolfHeaderData = {
                  isAuthenticated: !!authData.isAuthenticated,
                  profile: authData.profile
                    ? {
                        firstName:
                          authData.profile.first_name ||
                          authData.profile.firstName ||
                          '',
                        lastName:
                          authData.profile.last_name ||
                          authData.profile.lastName ||
                          '',
                        email: authData.profile.email || '',
                        avatar: authData.profile.avatar || '',
                      }
                    : null,
                  tokens: authData.tokens,
                  exploreMenu: authData.exploreMenu || [],
                };

                // Reset error counter on successful communication
                if (communicationErrors > 0) {
                  setCommunicationErrors(0);
                }

                // Update state with the data
                setHeaderData(processedData);
              })
              .catch((err) => {
                headerLogger.error('Error requesting auth profile', err);
                setCommunicationErrors((prev) => prev + 1);
              });
          } catch (err) {
            headerLogger.error('Error sending message to iframe', err);
            setCommunicationErrors((prev) => prev + 1);
          }
        };

        // Listen for auth data updates from the iframe
        const listener = window.postRobot.on(
          'auth-widget-data-updated',
          (event) => {
            const authData = event.data;
            headerLogger.info('Received auth data update', authData);

            // Process and set the updated data
            const processedData: AolfHeaderData = {
              isAuthenticated: !!authData.isAuthenticated,
              profile: authData.profile
                ? {
                    firstName:
                      authData.profile.first_name ||
                      authData.profile.firstName ||
                      '',
                    lastName:
                      authData.profile.last_name ||
                      authData.profile.lastName ||
                      '',
                    email: authData.profile.email || '',
                    avatar: authData.profile.avatar || '',
                  }
                : null,
              tokens: authData.tokens,
              exploreMenu: authData.exploreMenu || [],
            };

            setHeaderData(processedData);
          },
        );

        // Listen for click events from the iframe
        const clickListener = window.postRobot.on(
          'auth-widget-clicked',
          (event) => {
            const clickData = event.data;
            headerLogger.info(
              'Received click event from auth widget',
              clickData,
            );

            if (clickData.action === 'login') {
              // Handle login button click - redirect to login page or open login modal
              headerLogger.info(
                'Login button clicked, redirecting to login page',
              );

              // You can replace this with your login URL or modal opening code
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            } else if (clickData.action === 'profile') {
              // Handle profile avatar click - redirect to profile page or open dropdown
              headerLogger.info(
                'Profile avatar clicked, redirecting to profile page',
              );

              // You can replace this with your profile URL or dropdown code
              if (typeof window !== 'undefined') {
                window.location.href = '/profile';
              }
            }
          },
        );

        // Store the click listener reference
        activeListeners.click = clickListener;

        // Store the listener reference
        activeListeners.authUpdate = listener;

        // Listen for when the widget is ready
        const readyListener = window.postRobot.on('auth-widget-ready', () => {
          headerLogger.debug('Auth widget is ready, requesting auth profile');
          // Use a slightly longer delay on iOS
          const readyDelay = isIOS() ? 300 : 100;
          setTimeout(requestAuthProfile, readyDelay);
        });

        // Store the ready listener reference
        activeListeners.ready = readyListener;

        // Request auth profile immediately as well
        requestAuthProfile();

        // Return cleanup function
        return () => {
          try {
            // Clean up post-robot listeners
            if (activeListeners.authUpdate) {
              activeListeners.authUpdate.cancel();
            }
            if (activeListeners.ready) {
              activeListeners.ready.cancel();
            }
            if (activeListeners.click) {
              activeListeners.click.cancel();
            }

            // Clear the activeListeners object
            activeListeners = {};

            headerLogger.debug('Cleaned up post-robot listeners');
          } catch (err) {
            headerLogger.warn('Error cleaning up listeners', err);
          }
        };
      })
      .catch((err) => {
        headerLogger.error(
          'Post-robot not available. Please ensure it is loaded in the page head.',
          err,
        );
        console.error(err);
      });

    // Cleanup when component unmounts
    return () => {
      headerLogger.debug('Cleaning up component');
    };
  }, [app2Origin, app2WidgetUrl, debug, communicationErrors]);

  return headerData;
}
