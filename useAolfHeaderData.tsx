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
  menu: AolfHeaderMenuItem[];
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
 * Load post-robot script if not already loaded
 */
const loadPostRobot = (app2Origin: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.postRobot) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('post-robot-script');
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'post-robot-script';
    script.src = `${app2Origin}/widget/post-robot.min.js`;
    script.async = true;
    script.onload = () => {
      headerLogger.debug('Post-robot script loaded');
      resolve();
    };
    script.onerror = (e) => {
      headerLogger.error('Failed to load post-robot script', e);
      reject(e);
    };

    document.head.appendChild(script);
  });
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
      iframe.style.display = 'none';

      // Add debug param if in debug mode
      const debugParam = debug ? '&debug=true' : '';

      // Add client origin to help with cross-domain setup
      const clientOrigin =
        typeof window !== 'undefined'
          ? encodeURIComponent(window.location.origin)
          : '';

      iframe.src = `${app2WidgetUrl}?client=${clientOrigin}${debugParam}`;

      document.body.appendChild(iframe);

      if (debug) {
        headerLogger.debug('Added iframe with attributes', {
          id: iframe.id,
          src: iframe.src,
        });
      }
    } else {
      headerLogger.debug('Using existing auth-profile-iframe');
    }

    // Load post-robot
    loadPostRobot(app2Origin)
      .then(() => {
        if (!window.postRobot) {
          headerLogger.error('Post-robot failed to load properly');
          return;
        }

        headerLogger.info('Post-robot loaded, setting up communication');

        // Function to request auth profile from iframe
        const requestAuthProfile = () => {
          if (!iframe || !iframe.contentWindow) {
            headerLogger.error('iframe or contentWindow not available');
            return;
          }

          try {
            window.postRobot
              .send(iframe.contentWindow, 'get-auth-profile')
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
                        first_name:
                          authData.profile.first_name ||
                          authData.profile.firstName ||
                          '',
                        last_name:
                          authData.profile.last_name ||
                          authData.profile.lastName ||
                          '',
                        email: authData.profile.email || '',
                        avatar: authData.profile.avatar || '',
                      }
                    : null,
                  menu: [],
                  tokens: authData.tokens,
                  exploreMenu: authData.exploreMenu || [],
                };

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
            headerLogger.info('Received auth data update', {
              isAuthenticated: authData.isAuthenticated,
              hasProfile: !!authData.profile,
            });

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
                    first_name:
                      authData.profile.first_name ||
                      authData.profile.firstName ||
                      '',
                    last_name:
                      authData.profile.last_name ||
                      authData.profile.lastName ||
                      '',
                    email: authData.profile.email || '',
                    avatar: authData.profile.avatar || '',
                  }
                : null,
              menu: [],
              tokens: authData.tokens,
              exploreMenu: authData.exploreMenu || [],
            };

            setHeaderData(processedData);
          },
        );

        // Listen for when the widget is ready
        const readyListener = window.postRobot.on('auth-widget-ready', () => {
          headerLogger.debug('Auth widget is ready, requesting auth profile');
          setTimeout(requestAuthProfile, 100);
        });

        // Request auth profile immediately
        requestAuthProfile();

        // Clean up
        return () => {
          listener.cancel();
          readyListener.cancel();
        };
      })
      .catch((err) => {
        headerLogger.error('Failed to initialize post-robot', err);
      });

    // Cleanup when component unmounts
    return () => {
      headerLogger.debug('Cleaning up');
    };
  }, [app2Origin, app2WidgetUrl, debug]);

  return headerData;
}
