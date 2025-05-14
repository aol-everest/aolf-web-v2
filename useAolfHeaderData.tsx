import { useEffect, useState } from 'react';

// Create a simple logger implementation if the imported one is not available
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

// Improved iOS detection
function isIOSDevice(): boolean {
  if (typeof window === 'undefined' || !window.navigator) return false;

  try {
    const ua = window.navigator.userAgent;
    const platform = window.navigator.platform || '';

    // First check: iOS-specific platforms
    const isIOSPlatform = /iPad|iPhone|iPod/.test(platform);

    // Second check: iOS-specific user agents (includes iPad that pretends to be desktop)
    const isIOSUserAgent = /iPhone|iPad|iPod|iOS|CriOS/.test(ua);

    // Third check: Safari browser on Apple hardware
    const isSafariOnApple =
      /Safari/.test(ua) &&
      /Apple/.test(navigator.vendor) &&
      !/Chrome|Android/.test(ua);

    // Fourth check: special case for iOS 13+ iPads that report as MacOS
    const isIPadOS =
      /Macintosh/.test(ua) &&
      navigator.maxTouchPoints > 1 &&
      typeof window.ontouchstart !== 'undefined';

    return isIOSPlatform || isIOSUserAgent || isSafariOnApple || isIPadOS;
  } catch (e) {
    headerLogger.error('Error detecting iOS device:', e);
    return false;
  }
}

/**
 * Safe message sender - properly handles iOS compatibility
 */
const safePostMessage = (
  targetWindow: Window,
  message: any,
  targetOrigin: string,
): boolean => {
  try {
    // Always verify targetOrigin is valid
    if (!targetOrigin || targetOrigin === '') {
      headerLogger.error('Invalid target origin provided:', targetOrigin);
      targetOrigin = '*'; // Fallback to wildcard, though less secure
    }

    // IMPORTANT: Fix for iOS - use exact origin instead of wildcard
    // Extract the origin from the iframe's src if available
    if (targetOrigin === '*' && targetWindow !== window) {
      try {
        // If this is an iframe sending to parent, get parent's origin
        if (
          window.parent === targetWindow &&
          window.location.ancestorOrigins &&
          window.location.ancestorOrigins.length > 0
        ) {
          targetOrigin = window.location.ancestorOrigins[0];
          headerLogger.debug(`Using detected parent origin: ${targetOrigin}`);
        }
        // If trying to send to iframe, use its src origin
        else if (targetWindow !== window.parent) {
          const iframeElement = document.getElementById(
            'auth-profile-iframe',
          ) as HTMLIFrameElement;
          if (iframeElement && iframeElement.src) {
            const url = new URL(iframeElement.src);
            targetOrigin = url.origin;
            headerLogger.debug(`Using iframe's src origin: ${targetOrigin}`);
          }
        }
      } catch (e) {
        headerLogger.warn(
          'Failed to determine exact origin, using wildcard',
          e,
        );
      }
    }

    // For iOS devices, always use stringified format
    if (isIOSDevice()) {
      const messageStr = JSON.stringify(message);
      targetWindow.postMessage(messageStr, targetOrigin);
      headerLogger.debug(`Sent stringified message to ${targetOrigin}`);
      return true;
    } else {
      // Try object first (works better on desktop), but be ready to fallback
      try {
        targetWindow.postMessage(message, targetOrigin);
        headerLogger.debug(`Sent object message to ${targetOrigin}`);
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
          headerLogger.debug(
            `Sent stringified message to ${targetOrigin} (fallback)`,
          );
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

      // Parse message data - with enhanced iOS compatibility
      // iOS Safari often sends data in a nested format like {data: "{\"type\":\"auth-profile\",\"data\":{...}"}
      let messageData = event.data;

      // First handle string message format (standard)
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

      // Handle iOS Safari's special nesting format - look for nested stringified data
      if (
        typeof messageData === 'object' &&
        messageData?.data &&
        typeof messageData.data === 'string'
      ) {
        try {
          const innerData = JSON.parse(messageData.data);
          messageData = innerData; // Replace with the parsed inner data
          if (debug) {
            headerLogger.debug('Successfully extracted nested iOS format data');
          }
        } catch (e) {
          // Not JSON data or not in the expected format, keep using the original format
          headerLogger.debug(
            'Nested data string was not valid JSON, using as-is',
          );
        }
      }

      // Handle different message types
      if (
        messageData?.type === 'auth-profile' ||
        messageData?.type === 'auth-widget-data-updated'
      ) {
        const authData =
          messageData.type === 'auth-profile' ? messageData.data : messageData;

        // Enhanced authentication state logging - this helps identify issues
        headerLogger.info(`Received ${messageData.type} data`, {
          isAuthenticated: !!authData?.isAuthenticated,
          hasAuth: !!authData?.hasAuth,
          hasProfile: !!authData?.profile,
          hasTokens: !!authData?.tokens,
          accessTokenPresent: !!authData?.tokens?.accessToken,
          idTokenPresent: !!authData?.tokens?.idToken,
          timeStamp: authData?.authTime || new Date().toISOString(),
          menuItems: authData?.menu?.length || 0,
          exploreItems: authData?.exploreMenu?.length || 0,
        });

        if (authData) {
          // Check additional authentication indicators
          const isLoggedIn =
            !!authData.isAuthenticated ||
            !!authData.hasAuth ||
            (!!authData.tokens &&
              (!!authData.tokens.accessToken || !!authData.tokens.idToken));

          if (debug) {
            headerLogger.debug(
              `Auth verification - Final state: ${isLoggedIn ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'}`,
              {
                isAuthenticated: !!authData.isAuthenticated,
                hasAuth: !!authData.hasAuth,
                hasTokens: !!authData.tokens,
                tokensValid: authData.tokens
                  ? !!authData.tokens.accessToken
                  : false,
              },
            );
          }

          // Process the data to ensure consistent naming
          const processedData: AolfHeaderData = {
            // Use the verified authentication state
            isAuthenticated: isLoggedIn,
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
            // Pass through tokens if available - ensure they're properly extracted
            tokens:
              authData.tokens &&
              (authData.tokens.accessToken || authData.tokens.idToken)
                ? {
                    accessToken: authData.tokens.accessToken || '',
                    idToken: authData.tokens.idToken || '',
                  }
                : undefined,
            // Convert exploreMenu items if available
            exploreMenu: Array.isArray(authData.exploreMenu)
              ? authData.exploreMenu
              : [],
          };

          // Display token information in debug mode to help identify issues
          if (debug && authData.tokens) {
            headerLogger.debug('Token information', {
              hasAccessToken: !!authData.tokens.accessToken,
              accessTokenLength: authData.tokens.accessToken
                ? String(authData.tokens.accessToken).substring(0, 10) + '...'
                : 'none',
              hasIdToken: !!authData.tokens.idToken,
              idTokenPresent: !!authData.tokens.idToken,
            });
          }

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
      } else if (messageData?.type === 'reload-auth-widget') {
        // Handle widget reload request (from debug tools)
        headerLogger.info('Received request to reload auth widget iframe');

        try {
          // Reload the iframe with a fresh connection
          if (iframe) {
            const originalSrc = iframe.src;
            // First clear the src
            iframe.src = 'about:blank';

            // Then after a brief pause, restore the original src
            setTimeout(() => {
              headerLogger.info('Reloading auth widget iframe');
              iframe.src = originalSrc;
            }, 100);
          }
        } catch (e) {
          headerLogger.error('Error reloading auth widget iframe', e);
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

        // Extract the exact origin from the iframe's src
        let targetOrigin = app2Origin;

        // Verify the origin is valid
        if (!targetOrigin || targetOrigin === '') {
          // Try to extract from iframe src
          try {
            if (iframeElement.src) {
              const url = new URL(iframeElement.src);
              targetOrigin = url.origin;
              headerLogger.debug(`Using iframe src origin: ${targetOrigin}`);
            }
          } catch (e) {
            headerLogger.warn('Could not extract origin from iframe src', e);
          }

          // If still empty, fallback to wildcard
          if (!targetOrigin || targetOrigin === '') {
            targetOrigin = '*';
            headerLogger.warn(
              'Using wildcard origin as fallback (less secure)',
            );
          }
        }

        headerLogger.debug(
          `Sending get-auth-profile request to ${targetOrigin}`,
        );

        // Use the safe post message helper that handles iOS properly
        safePostMessage(iframeElement.contentWindow, message, targetOrigin);
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
