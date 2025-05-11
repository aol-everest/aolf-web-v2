import { useEffect, useRef } from 'react';
import { useAuth } from '@contexts';
import { api } from '@utils';
import { Auth } from '@utils/auth';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import Script from 'next/script';

/**
 * AOLF Auth Widget - Cross-Domain Authentication Widget
 *
 * This widget manages authentication between multiple AOLF sites
 * by providing a consistent interface for auth data.
 *
 * LOGGING CONTROLS:
 * -----------------
 * Logging is DISABLED BY DEFAULT to reduce console noise.
 *
 * To ENABLE logging and debugging:
 *   localStorage.setItem('aolf-widget-debug', 'true');
 *   // Or use the global helper:
 *   window.AolfWidgetControls.enableLogging();
 *   // Window reload may be required
 *
 * To DISABLE logging and debugging:
 *   localStorage.removeItem('aolf-widget-debug');
 *   // Or use the global helper:
 *   window.AolfWidgetControls.disableLogging();
 *
 * Warnings and errors will always be logged regardless of these settings.
 */

// Update to allow all artofliving.org subdomains and localhost for development
const ALLOWED_ORIGIN_REGEX =
  /^https?:\/\/(localhost(:\d+)?|([a-z0-9-]+\.)*(members\.)?artofliving\.org|test7\.artofliving\.org)$/i;

// Custom logger with timestamps and prefixes
const logger = {
  prefix: '[Auth Widget]',
  isEnabled: () => {
    // Only enable logging if debug mode is enabled
    if (typeof window !== 'undefined') {
      // If debug is enabled, enable logging
      if (localStorage.getItem('aolf-widget-debug') === 'true') {
        return true;
      }
    }
    // Default: disabled in all environments unless debug is enabled
    return false;
  },
  log: (...args) => {
    if (logger.isEnabled()) {
      console.log(logger.prefix, new Date().toISOString(), ...args);
    }
  },
  info: (...args) => {
    if (logger.isEnabled()) {
      console.info(logger.prefix, new Date().toISOString(), ...args);
    }
  },
  warn: (...args) => {
    // Always show warnings
    console.warn(logger.prefix, new Date().toISOString(), ...args);
  },
  error: (...args) => {
    // Always show errors
    console.error(logger.prefix, new Date().toISOString(), ...args);
  },
  debug: (...args) => {
    if (logger.isEnabled()) {
      console.debug(logger.prefix, new Date().toISOString(), ...args);
    }
  },
};

// Add global controls for logging
if (typeof window !== 'undefined') {
  window.AolfWidgetControls = window.AolfWidgetControls || {};
  window.AolfWidgetControls.enableLogging = () => {
    localStorage.setItem('aolf-widget-debug', 'true');
    console.info('[Auth Widget] Logging enabled');
  };
  window.AolfWidgetControls.disableLogging = () => {
    localStorage.removeItem('aolf-widget-debug');
    console.info('[Auth Widget] Logging disabled');
  };
}

// Component to optimize script loading - delays non-critical scripts
function OptimizedScripts() {
  return (
    <>
      {/* Completely disable Google Tag Manager */}
      <Script id="gtm-blocker" strategy="beforeInteractive">
        {`
          // Block GTM
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push = function() {
            // Only allow pageview events, block everything else
            if (arguments[0] && arguments[0].event === 'pageview') {
              Array.prototype.push.apply(this, arguments);
            }
          };

          // Block GA
          window.ga = function() {};
          window.__gaTracker = function() {};

          // Log script blocking
          console.log('[Auth Widget]', new Date().toISOString(), 'Script blocker initialized');
        `}
      </Script>

      {/* Optimize React and other libs */}
      <Script id="script-optimization" strategy="beforeInteractive">
        {`
          // Prevent loading of non-essential scripts
          (function() {
            const originalAppendChild = Node.prototype.appendChild;
            Node.prototype.appendChild = function(node) {
              if (node.nodeName === 'SCRIPT') {
                const src = node.src || '';

                // Allow list - scripts needed for widget functionality
                const allowList = [
                  '_next/',
                  'chunk-',
                  'webpack-',
                  'main-'
                ];

                // Block list - scripts we know we don't need
                const blockList = [
                  'gtm',
                  'google-analytics',
                  'analytics',
                  'facebook',
                  'pixel',
                  'hotjar',
                  'amplitude'
                ];

                // Check if script should be blocked
                const isBlocked = blockList.some(pattern => src.includes(pattern));
                const isAllowed = allowList.some(pattern => src.includes(pattern));

                if (isBlocked || (!isAllowed && src !== '')) {
                  console.log('[Auth Widget]', new Date().toISOString(), 'Blocked script:', src);
                  // Return empty node to avoid errors
                  return document.createComment('Script blocked: ' + src);
                }
              }

              return originalAppendChild.call(this, node);
            };

            console.log('[Auth Widget]', new Date().toISOString(), 'Script optimization active');
          })();
        `}
      </Script>
    </>
  );
}

// Add this right at the top of the file to track script initialization
if (typeof window !== 'undefined') {
  // Check if logging is disabled first
  const isLoggingEnabled = () => {
    try {
      if (localStorage.getItem('aolf-widget-debug') === 'true') {
        return true;
      }
      return false; // Default to disabled
    } catch (e) {
      return false; // Default to disabled if we can't check localStorage
    }
  };

  // Only log if debug is enabled
  if (isLoggingEnabled()) {
    console.log('[AUTH DEBUG] Script initialized at', new Date().toISOString());
  }

  // Try to load Auth if it's available
  const tryGetEmergencyTokens = async () => {
    try {
      // Check if Auth is globally available
      if (window.Auth?.getSession) {
        if (isLoggingEnabled()) {
          console.log('[AUTH DEBUG] Found Auth on window');
        }
        const tokens = await window.Auth.getSession();
        if (isLoggingEnabled()) {
          console.log('[AUTH DEBUG] Got tokens from global Auth:', !!tokens);
        }
        // Clone tokens to ensure no functions or non-serializable data
        const safeTokens = tokens
          ? {
              accessToken:
                typeof tokens.accessToken === 'object'
                  ? tokens.accessToken.jwtToken ||
                    JSON.stringify(tokens.accessToken)
                  : tokens.accessToken,
              idToken:
                typeof tokens.idToken === 'object'
                  ? tokens.idToken.jwtToken || JSON.stringify(tokens.idToken)
                  : tokens.idToken,
            }
          : null;
        return safeTokens;
      }

      // Try to dynamically import Auth
      try {
        const AuthModule = await import('@utils/auth');
        if (AuthModule.Auth?.getSession) {
          if (isLoggingEnabled()) {
            console.log('[AUTH DEBUG] Imported Auth module');
          }
          const tokens = await AuthModule.Auth.getSession();
          if (isLoggingEnabled()) {
            console.log(
              '[AUTH DEBUG] Got tokens from imported Auth:',
              !!tokens,
            );
          }
          // Clone tokens to ensure no functions or non-serializable data
          const safeTokens = tokens
            ? {
                accessToken:
                  typeof tokens.accessToken === 'object'
                    ? tokens.accessToken.jwtToken ||
                      JSON.stringify(tokens.accessToken)
                    : tokens.accessToken,
                idToken:
                  typeof tokens.idToken === 'object'
                    ? tokens.idToken.jwtToken || JSON.stringify(tokens.idToken)
                    : tokens.idToken,
              }
            : null;
          return safeTokens;
        }
      } catch (importErr) {
        if (isLoggingEnabled()) {
          console.log('[AUTH DEBUG] Could not import Auth module:', importErr);
        }
      }
    } catch (err) {
      console.error('[AUTH DEBUG] Error getting emergency tokens:', err);
    }
    return null;
  };

  // NOTE: Emergency global message handler removed to avoid confusion on other apps
}

function AuthProfileWidget() {
  const authObject = useAuth();

  // Extract data using the correct structure from the auth object
  const isAuthenticated = authObject?.isAuthenticated || false;

  // Extract profile from the correct location in the auth object
  const profile = authObject?.profile || null;

  // Extract tokens from the correct location
  // Tokens are directly on authObject.tokens, not under passwordLess
  const tokens = authObject?.tokens || {};

  // Log the extracted data for debugging
  if (logger.isEnabled()) {
    console.log('[AUTH DEBUG] Extracted auth data:', {
      isAuthenticated,
      profileName: profile
        ? `${profile.first_name} ${profile.last_name}`
        : 'N/A',
      hasTokens: !!tokens?.accessToken,
    });
  }

  // Refs to track message handler and setup state
  const messageHandlerRef = useRef(null);
  const listenerSetupRef = useRef(false);
  const prevProfileSignatureRef = useRef(null);

  // Try to get Auth module
  const getAuthTokens = async () => {
    try {
      if (typeof Auth !== 'undefined') {
        const authModule = Auth; // Use a local variable to avoid passing the Auth object
        const session = await authModule.getSession();

        // Make tokens safe for serialization - ensure we're not sending functions
        return session
          ? {
              accessToken:
                typeof session.accessToken === 'object'
                  ? session.accessToken.jwtToken ||
                    JSON.stringify(session.accessToken)
                  : session.accessToken,
              idToken:
                typeof session.idToken === 'object'
                  ? session.idToken.jwtToken || JSON.stringify(session.idToken)
                  : session.idToken,
            }
          : null;
      } else if (window.Auth) {
        const authModule = window.Auth; // Use a local variable to avoid passing the Auth object
        const session = await authModule.getSession();

        // Make tokens safe for serialization - ensure we're not sending functions
        return session
          ? {
              accessToken:
                typeof session.accessToken === 'object'
                  ? session.accessToken.jwtToken ||
                    JSON.stringify(session.accessToken)
                  : session.accessToken,
              idToken:
                typeof session.idToken === 'object'
                  ? session.idToken.jwtToken || JSON.stringify(session.idToken)
                  : session.idToken,
            }
          : null;
      }
    } catch (err) {
      console.error('Error getting Auth tokens:', err);
    }
    return null;
  };

  // Create a helper function to generate the auth profile response
  async function createResponseData() {
    // Get current auth state
    const responseData = {
      type: 'auth-profile',
      data: {
        isAuthenticated: isAuthenticated || false,
        profile: profile
          ? {
              // Clean up profile data and ensure it's serializable
              first_name: profile.first_name || profile.firstName || '',
              last_name: profile.last_name || profile.lastName || '',
              email: profile.email || '',
              avatar: profile.avatar || profile.picture || '',
            }
          : null,
        // Convert tokens to simple objects that are cloneable
        tokens: tokens
          ? {
              accessToken:
                typeof tokens.accessToken === 'object'
                  ? tokens.accessToken.jwtToken ||
                    JSON.stringify(tokens.accessToken)
                  : tokens.accessToken,
              idToken:
                typeof tokens.idToken === 'object'
                  ? tokens.idToken.jwtToken || JSON.stringify(tokens.idToken)
                  : tokens.idToken,
              // Exclude functions and non-cloneable properties
            }
          : null,
        exploreMenu:
          introData?.map((item) => {
            // Ensure each menu item is serializable without functions
            return {
              name: item.title || item.name || '',
              link: item.url || item.link || '#',
            };
          }) || [],
      },
    };

    // Clean the data to ensure it contains no functions
    function deepCleanForPostMessage(obj) {
      if (!obj || typeof obj !== 'object') return obj;

      // For arrays
      if (Array.isArray(obj)) {
        return obj.map((item) => deepCleanForPostMessage(item));
      }

      // For regular objects
      const cleanObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          // Skip functions
          if (typeof value === 'function') continue;

          // For objects, recursively clean
          if (value && typeof value === 'object') {
            cleanObj[key] = deepCleanForPostMessage(value);
          } else {
            cleanObj[key] = value;
          }
        }
      }
      return cleanObj;
    }

    // Return cleaned response
    return deepCleanForPostMessage(responseData);
  }

  // Optimize for reduced bundle size using conditional imports
  const {
    data: introData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['get-started-intro-series'],
    queryFn: async () => {
      logger.info('Fetching intro series data...');
      try {
        const response = await api.get({
          path: 'get-started-intro-series',
        });
        logger.info(
          `Fetched ${response?.data?.length || 0} intro series items`,
        );
        return response?.data;
      } catch (error) {
        if (error.message?.includes('User needs to be authenticated')) {
          logger.warn('User not authenticated, skipping intro series fetch');
          return [];
        }
        logger.error('Error fetching intro series data:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Reduce network requests
    retry: 1,
    // Add optional logging
    onSuccess: (data) => {
      logger.info(`Successfully loaded ${data.length} menu items`);
    },
    onError: (err) => {
      logger.error('Failed to load menu items:', err);
    },
  });

  // Log loading state changes
  useEffect(() => {
    if (isLoading) {
      logger.info('Loading intro series data...');
    } else if (error) {
      logger.error('Error loading intro series:', error);
    }
  }, [isLoading, error]);

  // Log authentication state on changes
  useEffect(() => {
    logger.info(
      `Auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`,
    );
    if (isAuthenticated) {
      logger.debug(
        'User profile available:',
        profile?.first_name,
        profile?.last_name,
      );
      logger.debug(
        'Tokens available:',
        !!tokens?.accessToken,
        !!tokens?.idToken,
      );
    }
  }, [isAuthenticated, profile, tokens]);

  // Set up message listener with useRef to avoid recreation on each render
  useEffect(() => {
    // Define the message handler function - keep it simple
    async function messageHandler(event) {
      // Skip empty messages completely
      if (!event.data) return;

      // Check origin first before any processing
      if (!ALLOWED_ORIGIN_REGEX.test(event.origin)) {
        // Only log unauthorized origins from specific domains we care about
        // Skip logging for ad networks, analytics, etc. that pollute the console
        const skipLoggingDomains = [
          'stripe.com',
          'talkable.com',
          'google',
          'facebook',
          'analytics',
        ];
        const shouldLog = !skipLoggingDomains.some((domain) =>
          event.origin.includes(domain),
        );

        if (shouldLog) {
          logger.warn(
            'Rejected message from unauthorized origin:',
            event.origin,
          );
        }
        return;
      }

      // Now log the message since it's from an authorized source
      logger.info(`Message from ${event.origin}:`, event.data);

      // Handle messages that might be stringified JSON (common on iOS)
      let messageData = event.data;
      if (typeof messageData === 'string') {
        try {
          // Try to parse as JSON - this is often needed for iOS Chrome
          messageData = JSON.parse(messageData);
          logger.info('Parsed string message:', messageData);
        } catch (e) {
          // Only log unparseable message if it looks like it might be relevant
          // This reduces console noise from unrelated postMessages
          if (
            messageData.includes('auth') ||
            messageData.includes('profile') ||
            messageData.includes('token')
          ) {
            logger.warn('Received unparseable string message, ignoring');
          }
          return;
        }
      }

      // Now that we have an object, handle by message type
      if (typeof messageData === 'object') {
        // Handle get-auth-profile request
        if (messageData.type === 'get-auth-profile') {
          logger.info(
            '📣 Processing get-auth-profile request from:',
            event.origin,
          );

          try {
            // Create response with available data
            const response = await createResponseData();

            // Log full response for debugging
            if (logger.isEnabled()) {
              console.log(
                '[AUTH DEBUG] Full response payload:',
                JSON.stringify(response),
              );
            }

            // Special handling for iOS browsers - stringify the message
            try {
              // Check if we should stringify based on browser
              const isIOSDevice = /iPhone|iPad|iPod|iOS|CriOS/i.test(
                navigator?.userAgent,
              );

              if (isIOSDevice) {
                // For iOS devices - ALWAYS use string format
                const responseStr = JSON.stringify(response);
                event.source.postMessage(responseStr, event.origin);
                logger.info(
                  '✅ Sent stringified auth profile response (iOS format)',
                );
              } else {
                // For other devices - try direct object first
                try {
                  // Attempt to send the object directly first (works better with the receiver code)
                  event.source.postMessage(response, event.origin);
                  logger.info('✅ Sent object auth profile response');
                } catch (objErr) {
                  // Fall back to string for compatibility
                  const responseStr = JSON.stringify(response);
                  event.source.postMessage(responseStr, event.origin);
                  logger.info(
                    '✅ Sent stringified auth profile response (fallback)',
                  );
                }
              }
            } catch (strErr) {
              // Log the error
              logger.warn('Response sending failed:', strErr);

              // Attempt a final basic serialized response
              try {
                // Create a basic minimal response with core data only
                const minimalResponse = JSON.stringify({
                  type: 'auth-profile',
                  data: {
                    isAuthenticated: !!isAuthenticated,
                    profile: profile
                      ? {
                          first_name:
                            profile.first_name || profile.firstName || '',
                          last_name:
                            profile.last_name || profile.lastName || '',
                          email: profile.email || '',
                        }
                      : null,
                    tokens: null, // Omit tokens from minimal response
                    exploreMenu: [],
                  },
                });

                event.source.postMessage(minimalResponse, event.origin);
                logger.info('✅ Sent minimal auth profile response');
              } catch (finalErr) {
                // If all else fails, try to send the simplest possible response
                logger.error('All serialization attempts failed:', finalErr);
                const emptyResponse = JSON.stringify({
                  type: 'auth-profile',
                  data: { isAuthenticated: false },
                });
                event.source.postMessage(emptyResponse, event.origin);
              }
            }
          } catch (err) {
            logger.error('Failed to send auth profile:', err);
          }
        }
        // Handle ping request
        else if (messageData.type === 'auth-widget-ping') {
          try {
            const pongResponse = {
              type: 'auth-widget-pong',
              timestamp: new Date().toISOString(),
            };

            // Special handling for iOS browsers - stringify the message
            try {
              // Use JSON stringify for iOS compatibility
              const pongStr = JSON.stringify(pongResponse);
              event.source.postMessage(pongStr, event.origin);
            } catch (strErr) {
              // Fallback to regular object if stringify fails
              event.source.postMessage(pongResponse, event.origin);
            }

            logger.debug('Replied to ping from', event.origin);
          } catch (err) {
            logger.error('Failed to respond to ping:', err);
          }
        }
      }
    }

    // Set up listener just once
    if (!listenerSetupRef.current) {
      logger.info('Setting up message listener');
      window.addEventListener('message', messageHandler);
      messageHandlerRef.current = messageHandler;
      listenerSetupRef.current = true;

      // Send initialization notification
      if (window.parent !== window) {
        try {
          setTimeout(() => {
            // For better iOS support, detect parent origin if possible
            const getParentOrigin = () => {
              // Try to get parent origin from ancestorOrigins
              if (
                window.location &&
                window.location.ancestorOrigins &&
                window.location.ancestorOrigins.length > 0
              ) {
                return window.location.ancestorOrigins[0];
              }

              // Fallback to wildcard
              return '*';
            };

            const parentOrigin = getParentOrigin();

            // Let parent know we're ready - no user data here, just a notification
            try {
              // iOS Chrome needs simpler messages
              const readyMsg = JSON.stringify({
                type: 'auth-widget-ready',
                timestamp: new Date().toISOString(),
              });
              window.parent.postMessage(readyMsg, parentOrigin);
              logger.info('Sent ready notification to parent');
            } catch (e) {
              // Fallback to standard approach
              window.parent.postMessage(
                {
                  type: 'auth-widget-ready',
                  timestamp: new Date().toISOString(),
                },
                '*',
              );
              logger.info('Sent ready notification to parent (fallback)');
            }

            // Send a test ping to verify communication - no user data
            try {
              // iOS Chrome needs simpler messages
              const pingMsg = JSON.stringify({
                type: 'auth-widget-ping',
                source: 'initialization',
              });
              window.parent.postMessage(pingMsg, parentOrigin);
            } catch (e) {
              // Fallback to standard approach
              window.parent.postMessage(
                {
                  type: 'auth-widget-ping',
                  source: 'initialization',
                },
                '*',
              );
            }
          }, 500);
        } catch (e) {
          logger.error('Error sending initialization message:', e);
        }
      }

      return () => {
        logger.info('Removing message listener');
        window.removeEventListener('message', messageHandler);
        listenerSetupRef.current = false;
      };
    }
  }, []);

  // Add a simple diagnostic ping
  useEffect(() => {
    if (!listenerSetupRef.current) return;

    const pingInterval = setInterval(() => {
      try {
        if (window.parent !== window) {
          // For better iOS support, detect parent origin if possible
          const getParentOrigin = () => {
            // Try to get parent origin from ancestorOrigins
            if (
              window.location &&
              window.location.ancestorOrigins &&
              window.location.ancestorOrigins.length > 0
            ) {
              return window.location.ancestorOrigins[0];
            }
            // Fallback to wildcard
            return '*';
          };

          const parentOrigin = getParentOrigin();

          // Simple ping with no user data - stringify for iOS compatibility
          try {
            const pingMsg = JSON.stringify({
              type: 'auth-widget-ping',
              source: 'periodic-check',
            });
            window.parent.postMessage(pingMsg, parentOrigin);
          } catch (e) {
            // Fallback to standard approach
            window.parent.postMessage(
              {
                type: 'auth-widget-ping',
                source: 'periodic-check',
              },
              '*',
            );
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }, 10000);

    return () => clearInterval(pingInterval);
  }, []);

  // Validate auth data before sending updates to parent
  useEffect(() => {
    // Skip if listener hasn't been set up yet or if data hasn't really changed
    if (!messageHandlerRef.current || !listenerSetupRef.current) return;

    // Create a simple version profile checker to avoid unnecessary updates
    const profileSignature = isAuthenticated
      ? `${!!tokens?.accessToken}-${profile?.first_name}-${profile?.last_name}-${introData?.length}`
      : 'not-authenticated';

    // Compare with previous value
    if (prevProfileSignatureRef.current === profileSignature) {
      // Skip update if nothing meaningful changed
      return;
    }

    logger.info(`Auth data changed, profile signature: ${profileSignature}`);
    prevProfileSignatureRef.current = profileSignature;

    // Send a notification that auth data is updated
    try {
      // Only send actual valid auth data - never send dummy data
      (async () => {
        // Only proceed if we have a real authenticated user or explicitly not authenticated
        if (isAuthenticated === true || isAuthenticated === false) {
          const responseData = await createResponseData();

          // Verify we're not sending dummy test data
          const hasDummyData =
            responseData.data &&
            responseData.data.profile &&
            Object.values(responseData.data.profile).some((value) => {
              if (typeof value === 'string' && value) {
                const suspiciousTerms = [
                  'test',
                  'dummy',
                  'placeholder',
                  'direct',
                  'diagnostic',
                  'emergency',
                ];
                return suspiciousTerms.some((term) =>
                  value.toLowerCase().includes(term),
                );
              }
              return false;
            });

          if (hasDummyData) {
            logger.warn('Prevented sending auth update with dummy data');
            return;
          }

          // Make sure response is serializable before sending
          const message = {
            type: 'auth-widget-data-updated',
            hasAuth: !!isAuthenticated,
            timestamp: new Date().toISOString(),
            data: responseData.data, // Include the full auth data for the parent to use
          };

          try {
            // iOS Chrome requires a simpler message format and targetOrigin pattern
            // Use JSON stringify to ensure deep cloning of objects
            const messageStr = JSON.stringify(message);

            // Try first with specific targetOrigin - required for security
            let sent = false;
            if (window.parent !== window) {
              // Try with parent's origin if we can detect it
              if (
                window.location &&
                window.location.ancestorOrigins &&
                window.location.ancestorOrigins.length > 0
              ) {
                const parentOrigin = window.location.ancestorOrigins[0];
                window.parent.postMessage(messageStr, parentOrigin);
                sent = true;
                logger.info(
                  `Sent auth data to specific origin: ${parentOrigin}`,
                );
              }

              // If we couldn't determine parent origin, use wildcard as fallback
              if (!sent) {
                window.parent.postMessage(messageStr, '*');
                logger.info('Sent auth data using wildcard origin');
              }
            }
          } catch (postMsgErr) {
            // If the enhanced approach fails, fall back to basic approach
            logger.error(
              'Enhanced postMessage failed, trying fallback',
              postMsgErr,
            );
            window.parent.postMessage(message, '*');
          }

          logger.info(
            'Notified parent that auth data was updated with real profile data',
          );
        }
      })();
    } catch (err) {
      logger.error('Failed to notify parent of auth update:', err);
    }
  }, [isAuthenticated, profile, introData, tokens]); // Only update when these change

  // Log component render
  logger.debug('AuthProfileWidget rendered');

  // Direct global handler for get-auth-profile message - improve error handling
  if (typeof window !== 'undefined') {
    // Use a simplified logger for the global context
    const globalLogger = {
      isEnabled: () => {
        try {
          if (localStorage.getItem('aolf-widget-debug') === 'true') {
            return true;
          }
          // Default: disabled in all environments
          return false;
        } catch (e) {
          return false; // Default to disabled if we can't check localStorage
        }
      },
      log: (...args) => {
        if (globalLogger.isEnabled()) {
          console.log(
            '[Auth Widget Direct]',
            new Date().toISOString(),
            ...args,
          );
        }
      },
      error: (...args) =>
        console.error(
          '[Auth Widget Direct]',
          new Date().toISOString(),
          ...args,
        ),
    };

    if (globalLogger.isEnabled()) {
      globalLogger.log('Script loaded');
    }

    // Update direct response handler to use safe object structures
    const createSafeResponse = (data) => {
      // Create a clone-safe response by ensuring all properties are serializable
      return {
        type: 'auth-profile',
        data: {
          isAuthenticated: !!data.isAuthenticated,
          profile: data.profile
            ? {
                // Only include actual profile data, no dummy values
                first_name:
                  data.profile.first_name || data.profile.firstName || '',
                last_name:
                  data.profile.last_name || data.profile.lastName || '',
                email: data.profile.email || '',
                avatar: data.profile.avatar || data.profile.picture || '',
              }
            : null,
          tokens: data.tokens || null,
          exploreMenu: Array.isArray(data.exploreMenu)
            ? data.exploreMenu.map((item) => ({
                name: item.name || item.title || '',
                link: item.link || item.url || '#',
              }))
            : [],
        },
      };
    };

    // Direct global handler for get-auth-profile message
    window.addEventListener('message', function directMessageHandler(event) {
      // Skip processing for empty messages
      if (!event.data) return;

      // Check origin before doing any processing
      if (!ALLOWED_ORIGIN_REGEX.test(event.origin)) {
        // Skip logging unauthorized origins to reduce console noise
        return;
      }

      if (globalLogger.isEnabled()) {
        globalLogger.log(
          'Received message:',
          typeof event.data === 'string'
            ? event.data
            : JSON.stringify(event.data),
        );
      }

      try {
        // Check if this is the message we're looking for
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // Failed to parse as JSON, skip silently to reduce console noise
            return;
          }
        }

        if (data && data.type === 'get-auth-profile') {
          if (globalLogger.isEnabled()) {
            globalLogger.log(
              '📣 Received get-auth-profile request from:',
              event.origin,
            );
          }

          // Only respond with actual auth data - don't use dummy values
          try {
            if (authObject && authObject.isAuthenticated) {
              // Extract only serializable data from the auth object to avoid DataCloneError
              const safeAuthObject = {
                isAuthenticated: !!authObject.isAuthenticated,
                profile: authObject.profile
                  ? {
                      first_name:
                        authObject.profile.first_name ||
                        authObject.profile.firstName ||
                        '',
                      last_name:
                        authObject.profile.last_name ||
                        authObject.profile.lastName ||
                        '',
                      email: authObject.profile.email || '',
                      avatar:
                        authObject.profile.avatar ||
                        authObject.profile.picture ||
                        '',
                    }
                  : null,
                tokens: authObject.tokens
                  ? {
                      accessToken:
                        typeof authObject.tokens.accessToken === 'object'
                          ? authObject.tokens.accessToken.jwtToken ||
                            JSON.stringify(authObject.tokens.accessToken)
                          : authObject.tokens.accessToken,
                      idToken:
                        typeof authObject.tokens.idToken === 'object'
                          ? authObject.tokens.idToken.jwtToken ||
                            JSON.stringify(authObject.tokens.idToken)
                          : authObject.tokens.idToken,
                    }
                  : null,
              };

              // Use the safe response creator with the cleaned auth data
              const directResponse = createSafeResponse(safeAuthObject);

              // Check if we should stringify based on browser
              const isIOSDevice = /iPhone|iPad|iPod|iOS|CriOS/i.test(
                navigator?.userAgent,
              );

              if (isIOSDevice) {
                // For iOS devices - ALWAYS use string format
                const responseString = JSON.stringify(directResponse);
                event.source.postMessage(responseString, event.origin);
              } else {
                // For desktop/Android - try object first, then string
                try {
                  // Try sending the object directly first
                  event.source.postMessage(directResponse, event.origin);
                } catch (objErr) {
                  // Fall back to stringified format
                  const responseString = JSON.stringify(directResponse);
                  event.source.postMessage(responseString, event.origin);
                  globalLogger.log('Used string fallback for response');
                }
              }

              if (globalLogger.isEnabled()) {
                globalLogger.log(
                  '✅ Sent real auth response to:',
                  event.origin,
                );
              }
            } else {
              // Send a response indicating not authenticated without dummy data
              const emptyResponse = JSON.stringify({
                type: 'auth-profile',
                data: {
                  isAuthenticated: false,
                  profile: null,
                  tokens: null,
                  exploreMenu: [],
                },
              });

              event.source.postMessage(emptyResponse, event.origin);
              if (globalLogger.isEnabled()) {
                globalLogger.log(
                  '✅ Sent unauthenticated response to:',
                  event.origin,
                );
              }
            }
          } catch (err) {
            globalLogger.error('Failed to send response:', err);

            // Last resort fallback - send minimal data
            try {
              const fallbackResponse = JSON.stringify({
                type: 'auth-profile',
                data: {
                  isAuthenticated: false,
                  profile: null,
                  tokens: null,
                  exploreMenu: [],
                },
              });
              event.source.postMessage(fallbackResponse, event.origin);
              globalLogger.log('Sent fallback response after error');
            } catch (finalErr) {
              globalLogger.error('All response attempts failed');
            }
          }
        }
      } catch (err) {
        globalLogger.error('Error processing message:', err);
      }
    });
  }

  // Simplified diagnostic script
  <Script id="diagnostic-check" strategy="beforeInteractive">
    {`
      // Immediate verification script - run before React loads
      try {
        // Check if logging is disabled
        const isLoggingEnabled = () => {
          try {
            if (localStorage.getItem('aolf-widget-debug') === 'true') {
              return true;
            }
            return false; // Default to disabled for diagnostics
          } catch (e) {
            return false; // Default to disabled if can't check localStorage
          }
        };

        if (isLoggingEnabled()) {
          console.log('[AUTH DEBUG] Early init script running');
        }

        // Try to load the Auth utility if possible
        const tryGetAuth = async () => {
          try {
            // This is a dynamic import attempt - might not work in all browsers
            if (window.Auth || window.auth) {
              const Auth = window.Auth || window.auth;
              if (isLoggingEnabled()) {
                console.log('[AUTH DEBUG] Found Auth in window');
              }

              // Try to get session
              if (Auth.getSession) {
                const tokens = await Auth.getSession();
                if (isLoggingEnabled()) {
                  console.log('[AUTH DEBUG] Got tokens from Auth:', tokens ? 'yes' : 'no');
                }
                // Make tokens safe for serialization
                return tokens ? {
                  accessToken: typeof tokens.accessToken === 'object' ?
                    (tokens.accessToken.jwtToken || JSON.stringify(tokens.accessToken)) :
                    tokens.accessToken,
                  idToken: typeof tokens.idToken === 'object' ?
                    (tokens.idToken.jwtToken || JSON.stringify(tokens.idToken)) :
                    tokens.idToken
                } : null;
              }
            }
          } catch (err) {
            if (isLoggingEnabled()) {
              console.log('[AUTH DEBUG] Error accessing Auth:', err);
            }
          }
          return null;
        };

        // Block non-essential third-party domains
        const blockDomains = [
          'www.dwin1.com',
          'r.stripe.com',
          'cdn.segment.com',
          'tracking',
          'analytics',
          'hotjar',
          'monitor'
        ];

        // Override fetch to block monitoring requests
        const originalFetch = window.fetch;
        window.fetch = function(resource, options) {
          const url = resource.toString();
          // Check if URL contains any of the blocked domains
          if (blockDomains.some(domain => url.includes(domain)) || url.includes('monitoring')) {
            if (isLoggingEnabled()) {
              console.log('[AUTH DEBUG] Blocked fetch request to:', url);
            }
            // Return a dummy promise that resolves with empty response
            return Promise.resolve(new Response('', { status: 200 }));
          }

          // Forward all other requests to original fetch
          return originalFetch.apply(this, arguments);
        };

        // Intercept postMessage to prevent sending dummy data
        const originalPostMessage = window.postMessage;
        window.postMessage = function(message, targetOrigin, transfer) {
          // Check if this is an auth response with dummy data
          if (message && typeof message === 'object' && message.type === 'auth-profile') {
            if (message.data && message.data.profile) {
              const profile = message.data.profile;
              // If any profile field contains test, dummy, direct, diagnostic, emergency strings
              const suspectValues = ['test', 'dummy', 'direct', 'diagnostic', 'emergency', 'afterinteractive'];
              const hasDummyData = Object.values(profile).some(value => {
                if (typeof value === 'string') {
                  return suspectValues.some(suspect => value.toLowerCase().includes(suspect));
                }
                return false;
              });

              if (hasDummyData) {
                console.warn('[AUTH DEBUG] Blocked sending message with dummy data');
                // Return without sending
                return;
              }
            }
          }

          // Otherwise, proceed with the original postMessage
          return originalPostMessage.apply(this, arguments);
        };
      } catch(e) {
        console.error('[AUTH DEBUG] Early init error:', e);
      }
    `}
  </Script>;

  return (
    <>
      <Head>
        <title>AOLF Auth Widget</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="googlebot" content="noindex" />
        <meta name="google" content="notranslate" />

        {/* Prevent page tracking */}
        <meta name="referrer" content="no-referrer" />

        {/* Prevent resource hints that might load unnecessary resources */}
        <meta httpEquiv="x-dns-prefetch-control" content="off" />
      </Head>

      {/* Optimize script loading */}
      <OptimizedScripts />

      {/* Simple verification script */}
      <Script id="diagnostic-check-main" strategy="afterInteractive">
        {`
          // Simple verification script
          try {
            // Check if logging is disabled
            const isLoggingEnabled = () => {
              try {
                if (localStorage.getItem('aolf-widget-debug') === 'true') {
                  return true;
                }
                return false; // Default to disabled for diagnostics
              } catch (e) {
                return false; // Default to disabled if can't check localStorage
              }
            };

            const diagnosticLogger = {
              log: (...args) => {
                if (isLoggingEnabled()) {
                  console.log('[Auth Widget Diagnostic]', new Date().toISOString(), ...args);
                }
              },
              // Always show errors
              error: (...args) => console.error('[Auth Widget Diagnostic]', new Date().toISOString(), ...args)
            };

            // Try to get Auth module
            const getAuthTokens = async () => {
              try {
                if (typeof Auth !== 'undefined') {
                  const authModule = Auth; // Use a local variable to avoid passing the Auth object
                  diagnosticLogger.log('Auth module found');
                  const session = await authModule.getSession();
                  diagnosticLogger.log('Got session from Auth');
                  // Make tokens safe for serialization - ensure we're not sending functions
                  return session ? {
                    accessToken: typeof session.accessToken === 'object' ?
                      (session.accessToken.jwtToken || JSON.stringify(session.accessToken)) :
                      session.accessToken,
                    idToken: typeof session.idToken === 'object' ?
                      (session.idToken.jwtToken || JSON.stringify(session.idToken)) :
                      session.idToken
                  } : null;
                } else if (window.Auth) {
                  const authModule = window.Auth; // Use a local variable to avoid passing the Auth object
                  diagnosticLogger.log('Auth found on window');
                  const session = await authModule.getSession();
                  diagnosticLogger.log('Got session from window.Auth');
                  // Make tokens safe for serialization - ensure we're not sending functions
                  return session ? {
                    accessToken: typeof session.accessToken === 'object' ?
                      (session.accessToken.jwtToken || JSON.stringify(session.accessToken)) :
                      session.accessToken,
                    idToken: typeof session.idToken === 'object' ?
                      (session.idToken.jwtToken || JSON.stringify(session.idToken)) :
                      session.idToken
                  } : null;
                }
              } catch (err) {
                diagnosticLogger.error('Error getting Auth tokens:', err);
              }
              return null;
            };

            // Function to validate profile data to ensure we don't send dummy data
            const containsDummyData = (profile) => {
              if (!profile) return false;

              const suspiciousTerms = ['test', 'dummy', 'placeholder', 'direct', 'diagnostic', 'emergency', 'afterinteractive'];

              return Object.values(profile).some(value => {
                if (typeof value === 'string' && value) {
                  return suspiciousTerms.some(term => value.toLowerCase().includes(term));
                }
                return false;
              });
            };

            // Additional block for removing dummy data from postMessage responses
            const originalPostMessage = window.postMessage;
            window.postMessage = function(message, targetOrigin, transfer) {
              // Before sending any message, ensure it's properly serializable
              let safeMessage = message;

              // If it's an object, deep clone it and remove functions
              if (message && typeof message === 'object') {
                try {
                  // We'll first convert to JSON and back to purge any functions or non-serializable data
                  safeMessage = JSON.parse(JSON.stringify(message));
                } catch (err) {
                  // If it fails JSON serialization, we need to create a clean version manually
                  diagnosticLogger.error('Message failed JSON serialization, using fallback cleanup');

                  // Simple clean - only handle basic object
                  if (!Array.isArray(message)) {
                    safeMessage = {};
                    // Copy only primitive values, skip functions
                    for (const key in message) {
                      if (typeof message[key] !== 'function') {
                        try {
                          // Test if this property can be cloned
                          JSON.stringify(message[key]);
                          safeMessage[key] = message[key];
                        } catch (e) {
                          // Skip this property if it can't be serialized
                        }
                      }
                    }
                  }
                }

                // Check for auth profile data
                if (safeMessage.type === 'auth-profile' && safeMessage.data && safeMessage.data.profile) {
                  if (containsDummyData(safeMessage.data.profile)) {
                    diagnosticLogger.log('Blocked sending message with dummy profile data');
                    return; // Don't send the message
                  }
                }

                // Check for auth update data
                if (safeMessage.type === 'auth-widget-data-updated' && safeMessage.data && safeMessage.data.profile) {
                  if (containsDummyData(safeMessage.data.profile)) {
                    diagnosticLogger.log('Blocked sending auth update with dummy profile data');
                    return; // Don't send the message
                  }
                }
              }

              // Try sending the safe message
              try {
                return originalPostMessage.call(this, safeMessage, targetOrigin, transfer);
              } catch (err) {
                diagnosticLogger.error('Failed to postMessage even after cleanup:', err);
                // Last resort - try stringifying the entire message
                try {
                  if (typeof safeMessage === 'object' && safeMessage !== null) {
                    const stringMessage = JSON.stringify(safeMessage);
                    return originalPostMessage.call(this, stringMessage, targetOrigin, transfer);
                  }
                } catch (finalErr) {
                  diagnosticLogger.error('All postMessage attempts failed');
                }
              }
            };

            // Block all direct responses to auth-profile requests
            // Instead, let the main React component handle it
            window.addEventListener('message', function(event) {
              // Only act as a blocker - don't send any responses
              if (event.data) {
                let data = event.data;
                if (typeof data === 'string') {
                  try {
                    data = JSON.parse(data);
                  } catch(e) {
                    return; // Not JSON, ignore
                  }
                }

                // If this is an auth request, let the main handlers take care of it
                // Do not respond here with any data (not even dummy blocked data)
                if (data && data.type === 'get-auth-profile') {
                  if (isLoggingEnabled()) {
                    diagnosticLogger.log('Auth profile request received - letting main handler process it');
                  }
                  // Don't do anything here - no response sent
                }
              }
            }, true); // Use capture phase to run before other handlers

            diagnosticLogger.log('Diagnostic script initialized (afterInteractive)');
          } catch(err) {
            console.error('[Auth Widget Diagnostic] Error:', err);
          }
        `}
      </Script>
    </>
  );
}

// Mark this page as not needing layout components
AuthProfileWidget.noHeader = true;
AuthProfileWidget.hideFooter = true;

export default AuthProfileWidget;
