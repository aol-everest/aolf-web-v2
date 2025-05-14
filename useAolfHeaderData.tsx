import { useEffect, useState } from 'react';
import { headerLogger } from '@/utils/logger';

export interface AolfHeaderProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  photourl?: string;
  userProfilePic?: string;
  // ...add any other fields you expect
}

export interface AolfHeaderMenuItem {
  label: string;
  href: string;
  // ...add any other fields you expect
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
 * Determines if debug mode should be enabled for the widget
 * Debug is enabled if:
 * - URL has ?debug=true or ?debug=widget
 * - localStorage has aolf-widget-debug=true
 * - Hostname is localhost or .local
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
 * Detect if device is iOS (required for message format handling)
 */
const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined' || !navigator) return false;

  const userAgent = navigator.userAgent || '';
  return (
    /iPhone|iPad|iPod|iOS|CriOS/.test(userAgent) ||
    (/Safari/.test(userAgent) && /Apple/.test(navigator.vendor || ''))
  );
};

/**
 * Safe message sender - properly handles iOS compatibility
 */
const safePostMessage = (
  targetWindow: Window,
  message: any,
  targetOrigin: string,
): boolean => {
  try {
    // For iOS devices, always use stringified format
    if (isIOSDevice()) {
      const messageStr = JSON.stringify(message);
      targetWindow.postMessage(messageStr, targetOrigin);
      return true;
    } else {
      // Try object first (works better on desktop), but be ready to fallback
      try {
        targetWindow.postMessage(message, targetOrigin);
        return true;
      } catch (objErr) {
        // Handle DataCloneError by falling back to string format
        if (
          objErr &&
          (objErr.name === 'DataCloneError' ||
            String(objErr).includes('could not be cloned'))
        ) {
          const messageStr = JSON.stringify(message);
          targetWindow.postMessage(messageStr, targetOrigin);
          return true;
        }
        throw objErr; // Re-throw if it's not a DataCloneError
      }
    }
  } catch (e) {
    headerLogger.error('Failed to send message to iframe:', e);
    return false;
  }
};

/**
 * Hook to get authentication data from the AOLF auth widget
 */
export function useAolfHeaderData(app2Origin: string, app2WidgetUrl: string) {
  const [headerData, setHeaderData] = useState<AolfHeaderData | null>(null);
  const debug = isDebugEnabled();

  useEffect(() => {
    headerLogger.info(`Initializing with app2Origin: ${app2Origin}`, { debug });

    // Load debug helper if debug mode is enabled
    if (debug) {
      loadDebugHelper(app2Origin);
    }

    let iframe = document.getElementById(
      'auth-profile-iframe',
    ) as HTMLIFrameElement | null;

    if (!iframe) {
      headerLogger.debug('Creating auth-profile-iframe');
      iframe = document.createElement('iframe');
      iframe.id = 'auth-profile-iframe';
      iframe.style.display = 'none';

      // Add debug param if in debug mode
      const debugParam = debug
        ? app2WidgetUrl.includes('?')
          ? '&debug=true'
          : '?debug=true'
        : '';
      iframe.src = app2WidgetUrl + debugParam;

      document.body.appendChild(iframe);

      if (debug) {
        headerLogger.debug('Added iframe with attributes', {
          id: iframe.id,
          src: iframe.src,
          style: iframe.style.cssText,
        });
      }
    } else {
      headerLogger.debug('Using existing auth-profile-iframe');
    }

    /**
     * Handle messages from the iframe
     */
    function handleMessage(event: MessageEvent) {
      // Log the origin of received messages
      if (debug) {
        headerLogger.debug(`Received message from: ${event.origin}`, {
          data:
            typeof event.data === 'string'
              ? event.data.substring(0, 200) + '...'
              : JSON.stringify(event.data).substring(0, 200) + '...',
        });
      } else {
        headerLogger.debug(`Received message from: ${event.origin}`);
      }

      // Check origin security - allow artofliving.org domains and localhost for dev
      if (
        !/https:\/\/([a-z0-9-]+\.)*artofliving\.org$/i.test(event.origin) &&
        !/https?:\/\/localhost(:\d+)?$/i.test(event.origin)
      ) {
        headerLogger.warn(
          `Ignored message from untrusted origin: ${event.origin}`,
        );
        return;
      }

      // Parse message data if it's a string (for iOS browser compatibility)
      let messageData = event.data;
      if (typeof messageData === 'string') {
        try {
          messageData = JSON.parse(messageData);
          if (debug) {
            headerLogger.debug(
              'Successfully parsed string message into object',
            );
          }
        } catch (e) {
          headerLogger.error('Failed to parse message data as JSON', e);
          return;
        }
      }

      // Handle different message types
      if (
        messageData?.type === 'auth-profile' ||
        messageData?.type === 'auth-widget-data-updated'
      ) {
        const authData =
          messageData.type === 'auth-profile'
            ? messageData.data
            : messageData.data;

        headerLogger.info(`Received ${messageData.type} data`, {
          isAuthenticated: authData?.isAuthenticated,
          hasProfile: !!authData?.profile,
          hasTokens: !!authData?.tokens,
          menuItems: authData?.menu?.length || 0,
          exploreItems: authData?.exploreMenu?.length || 0,
        });

        if (authData) {
          // Process the data to ensure consistent naming
          const processedData: AolfHeaderData = {
            isAuthenticated: !!authData.isAuthenticated,
            profile: authData.profile
              ? {
                  // Support both naming conventions (first_name/firstName)
                  firstName:
                    authData.profile.firstName ||
                    authData.profile.first_name ||
                    '',
                  lastName:
                    authData.profile.lastName ||
                    authData.profile.last_name ||
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
                  // Support various avatar field names
                  avatar:
                    authData.profile.avatar ||
                    authData.profile.photourl ||
                    authData.profile.userProfilePic ||
                    '',
                }
              : null,
            // Convert menu items if available, or use empty array
            menu: Array.isArray(authData.menu) ? authData.menu : [],
            // Pass through tokens if available
            tokens: authData.tokens,
            // Convert exploreMenu items if available
            exploreMenu: Array.isArray(authData.exploreMenu)
              ? authData.exploreMenu
              : [],
          };

          setHeaderData(processedData);
        }

        // Log additional details in debug mode
        if (debug && authData?.profile) {
          // Support both naming conventions (first_name/firstName)
          const firstName =
            authData.profile.firstName || authData.profile.first_name;
          const lastName =
            authData.profile.lastName || authData.profile.last_name;

          headerLogger.debug('Auth profile details', {
            name: `${firstName || ''} ${lastName || ''}`.trim(),
            email: authData.profile.email,
            hasAvatar: !!(
              authData.profile.avatar ||
              authData.profile.photourl ||
              authData.profile.userProfilePic
            ),
          });
        }
      } else if (messageData?.type === 'auth-widget-ping') {
        // Log ping messages in debug mode
        if (debug) {
          headerLogger.debug('Received ping from auth widget');
        }
      } else if (messageData?.type === 'auth-widget-ready') {
        // When widget is ready, send the auth request
        headerLogger.debug('Auth widget is ready, requesting auth profile');
        setTimeout(() => {
          requestAuthProfile(iframe);
        }, 100);
      } else if (messageData?.type === 'auth-widget-pong') {
        // Log pong responses in debug mode
        if (debug) {
          headerLogger.debug('Received pong from auth widget');
        }
      }
    }

    /**
     * Request auth profile data from the iframe
     */
    const requestAuthProfile = (iframeElement: HTMLIFrameElement | null) => {
      if (!iframeElement || !iframeElement.contentWindow) {
        headerLogger.error('iframe or contentWindow not available');
        return;
      }

      try {
        const message = { type: 'get-auth-profile' };
        headerLogger.debug(`Sending get-auth-profile request to ${app2Origin}`);

        // Use the safe post message helper that handles iOS properly
        safePostMessage(iframeElement.contentWindow, message, app2Origin);
      } catch (error) {
        headerLogger.error('Error sending message to iframe', error);
      }
    };

    // Add message event listener
    window.addEventListener('message', handleMessage);
    headerLogger.debug('Added message event listener');

    // When iframe loads, request auth profile data
    iframe.onload = () => {
      headerLogger.debug('Iframe loaded, requesting auth-profile data');
      requestAuthProfile(iframe);
    };

    /**
     * Function to manually refresh auth data
     */
    const refreshAuthData = () => {
      headerLogger.debug('Manually refreshing auth data');
      requestAuthProfile(iframe);
    };

    /**
     * Set up debugging helpers
     */
    if (typeof window !== 'undefined') {
      // Expose refresh function globally for debugging
      (window as any).refreshAolfAuthData = refreshAuthData;

      // Provide a way to enable debug mode from console
      (window as any).enableAolfWidgetDebug = () => {
        localStorage.setItem('aolf-widget-debug', 'true');
        headerLogger.info(
          'Debug mode enabled via console. Refresh the page to activate debug features.',
        );
      };

      // Provide a way to disable debug mode from console
      (window as any).disableAolfWidgetDebug = () => {
        localStorage.removeItem('aolf-widget-debug');
        headerLogger.info(
          'Debug mode disabled. Refresh the page to apply changes.',
        );
      };

      // Add ability to set URL params for debugging
      (window as any).getWidgetDebugUrl = () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('debug', 'widget');
        return currentUrl.toString();
      };

      // Add function to check device type
      (window as any).checkMobileDevice = () => {
        const userAgent = navigator?.userAgent || '';
        const isIOSDevice =
          /iPhone|iPad|iPod|iOS|CriOS/.test(userAgent) ||
          (/Safari/.test(userAgent) && /Apple/.test(navigator.vendor));
        return {
          userAgent,
          isIOSDevice,
          isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
          isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
          isFirefox: /Firefox/.test(userAgent),
        };
      };

      // Function to ping the iframe widget - useful for testing communication
      (window as any).pingWidget = () => {
        try {
          if (iframe && iframe.contentWindow) {
            // Use safe postMessage to ensure iOS compatibility
            safePostMessage(
              iframe.contentWindow,
              { type: 'auth-widget-ping', source: 'parent' },
              app2Origin,
            );
            headerLogger.info('Sent ping to widget');
            return true;
          } else {
            headerLogger.error('Iframe not available for ping');
            return false;
          }
        } catch (e) {
          headerLogger.error('Error sending ping to widget', e);
          return false;
        }
      };
    }

    // Clean up when component unmounts
    return () => {
      headerLogger.debug('Cleaning up event listener');
      window.removeEventListener('message', handleMessage);
    };
  }, [app2Origin, app2WidgetUrl, debug]);

  return headerData;
}
