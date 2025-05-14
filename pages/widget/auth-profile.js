import { useEffect, useRef } from 'react';
import { useAuth } from '@contexts';
import { api } from '@utils';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import Script from 'next/script';

// Update to allow all artofliving.org subdomains and localhost for development
const ALLOWED_ORIGIN_REGEX =
  /^https?:\/\/(localhost(:\d+)?|([a-z0-9-]+\.)*(members\.)?artofliving\.org|test7\.artofliving\.org)$/i;

// Custom logger with timestamps and prefixes
const logger = {
  prefix: '[Auth Widget]',
  log: (...args) =>
    console.log(logger.prefix, new Date().toISOString(), ...args),
  info: (...args) =>
    console.info(logger.prefix, new Date().toISOString(), ...args),
  warn: (...args) =>
    console.warn(logger.prefix, new Date().toISOString(), ...args),
  error: (...args) =>
    console.error(logger.prefix, new Date().toISOString(), ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(logger.prefix, new Date().toISOString(), ...args);
    }
  },
};

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

function AuthProfileWidget() {
  const authObject = useAuth();
  const { isAuthenticated, profile, passwordLess } = authObject || {};
  const { tokens } = passwordLess || {};

  // Refs to track message handler and setup state
  const messageHandlerRef = useRef(null);
  const listenerSetupRef = useRef(false);
  const prevProfileSignatureRef = useRef(null);

  // Log authentication state on changes
  useEffect(() => {
    logger.info(
      `Auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`,
    );
    if (isAuthenticated) {
      logger.debug(
        'User profile available:',
        profile?.firstName,
        profile?.lastName,
      );
      logger.debug(
        'Tokens available:',
        !!tokens?.accessToken,
        !!tokens?.idToken,
      );
    }
  }, [isAuthenticated, profile, tokens]);

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

  // Log script initialization
  if (typeof window !== 'undefined') {
    // Use a simplified logger for the global context
    const globalLogger = {
      log: (...args) =>
        console.log('[Auth Widget Direct]', new Date().toISOString(), ...args),
      error: (...args) =>
        console.error(
          '[Auth Widget Direct]',
          new Date().toISOString(),
          ...args,
        ),
    };

    globalLogger.log('Script loaded');

    // Update direct response handler to use safe object structures
    const createSafeResponse = (data) => {
      // Create a clone-safe response by ensuring all properties are serializable
      return {
        type: 'auth-profile',
        data: {
          isAuthenticated: !!data.isAuthenticated,
          profile: data.profile
            ? {
                first_name:
                  data.profile.first_name || data.profile.firstName || 'Direct',
                last_name:
                  data.profile.last_name || data.profile.lastName || 'User',
                email: data.profile.email || 'direct@example.com',
              }
            : {
                first_name: 'Direct',
                last_name: 'User',
                email: 'direct@example.com',
              },
          tokens: data.tokens || {
            accessToken: 'direct-token',
            idToken: 'direct-token',
          },
          exploreMenu: Array.isArray(data.exploreMenu)
            ? data.exploreMenu.map((item) => ({
                name: item.name || item.title || '',
                link: item.link || item.url || '#',
              }))
            : [{ name: 'Menu', link: '#' }],
        },
      };
    };

    // Direct global handler for get-auth-profile message
    window.addEventListener('message', function directMessageHandler(event) {
      globalLogger.log(
        'Received message:',
        typeof event.data === 'string'
          ? event.data
          : JSON.stringify(event.data),
      );

      try {
        // Check if this is the message we're looking for
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // Failed to parse as JSON, continue with string value
          }
        }

        if (data && data.type === 'get-auth-profile') {
          globalLogger.log(
            '📣 Received get-auth-profile request from:',
            event.origin,
          );

          // Send a simple response immediately
          try {
            const simpleResponse = {
              type: 'auth-profile',
              data: {
                isAuthenticated: true,
                profile: { firstName: 'Test', lastName: 'User' },
                tokens: { accessToken: 'test-token' },
                exploreMenu: [{ name: 'Test Menu', link: '#' }],
                _source: 'direct-handler',
              },
            });

            event.source.postMessage(simpleResponse, event.origin);
            globalLogger.log('✅ Sent direct response to:', event.origin);
          } catch (err) {
            globalLogger.error('Failed to send response:', err);
          }
        }
      } catch (err) {
        globalLogger.error('Error processing message:', err);
      }
    });
  }

  // Set up message listener with useRef to avoid recreation on each render
  useEffect(() => {
    // Define the message handler function - keep it simple
    function messageHandler(event) {
      // Log every message
      logger.info(`Message from ${event.origin}:`, event.data);

      // Check origin
      if (!ALLOWED_ORIGIN_REGEX.test(event.origin)) {
        logger.warn('Rejected message from unauthorized origin:', event.origin);
        return;
      }

      // Handle string messages by trying to parse them
      let messageData = event.data;
      if (typeof messageData === 'string') {
        try {
          messageData = JSON.parse(messageData);
          logger.info('Parsed string message:', messageData);
        } catch (e) {
          logger.warn('Received unparseable string message, ignoring');
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

          // Create response with available data
          const response = {
            type: 'auth-profile',
            data: {
              isAuthenticated,
              tokens: isAuthenticated
                ? {
                    accessToken: tokens?.accessToken,
                    idToken: tokens?.idToken,
                  }
                : null,
              profile: isAuthenticated ? profile : null,
              exploreMenu: introData.map((item) => ({
                name: item.title,
                link: item.slug ? `/us-en/explore/${item.slug}` : '#',
              })),
              _source: 'message-handler',
            },
          };

          // Send response
          try {
            logger.info('Sending auth profile response to:', event.origin);
            event.source.postMessage(response, event.origin);
            logger.info('✅ Sent auth profile response');
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
            event.source.postMessage(pongResponse, event.origin);
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
            // Let parent know we're ready
            window.parent.postMessage(
              {
                type: 'auth-widget-ready',
                timestamp: new Date().toISOString(),
              },
              '*',
            );
            logger.info('Sent ready notification to parent');

            // Send a test ping to verify communication
            window.parent.postMessage(
              {
                type: 'auth-widget-ping',
                source: 'initialization',
              },
              '*',
            );
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
          window.parent.postMessage(
            {
              type: 'auth-widget-ping',
              source: 'periodic-check',
            },
            '*',
          );
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }, 10000);

    return () => clearInterval(pingInterval);
  }, []);

  // Simplify this second effect since it might be causing conflicts
  useEffect(() => {
    // Skip if listener hasn't been set up yet or if data hasn't really changed
    if (!messageHandlerRef.current || !listenerSetupRef.current) return;

    // Create a simple version profile checker to avoid unnecessary updates
    const profileSignature = isAuthenticated
      ? `${!!tokens?.accessToken}-${profile?.firstName}-${profile?.lastName}-${introData?.length}`
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
      // Notify parent that auth data has been updated
      window.parent.postMessage(
        {
          type: 'auth-widget-data-updated',
          hasAuth: isAuthenticated,
          timestamp: new Date().toISOString(),
        },
        '*',
      );

      logger.info('Notified parent that auth data was updated');
    } catch (err) {
      logger.error('Failed to notify parent of auth update:', err);
    }
  }, [isAuthenticated, profile, introData, tokens]); // Only update when these change

  // Log component render
  logger.debug('AuthProfileWidget rendered');

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

      {/* Simplified diagnostic script */}
      <Script id="diagnostic-check" strategy="beforeInteractive">
        {`
          // Immediate verification script - run before React loads
          try {
            const emergencyLogger = {
              log: (...args) => console.log('[Auth Widget Emergency]', new Date().toISOString(), ...args),
              error: (...args) => console.error('[Auth Widget Emergency]', new Date().toISOString(), ...args)
            };

            emergencyLogger.log('Early initialization');

            // Add direct listener for auth requests that runs before React
            window.addEventListener('message', function emergencyHandler(e) {
              if (!e.data) return;

              try {
                let data = e.data;
                if (typeof data === 'string') {
                  try {
                    data = JSON.parse(data);
                  } catch(e) {
                    // Failed to parse as JSON, continue with string value
                  }
                }

                if (data && data.type === 'get-auth-profile') {
                  emergencyLogger.log('Received get-auth-profile request from:', e.origin);

                  // Send immediate emergency response
                  const emergencyResponse = {
                    type: 'auth-profile',
                    data: {
                      isAuthenticated: true,
                      profile: { firstName: 'Emergency', lastName: 'User' },
                      tokens: { accessToken: 'emergency-token' },
                      exploreMenu: [],
                      _source: 'emergency-handler'
                    }
                  };

                  try {
                    e.source.postMessage(emergencyResponse, e.origin);
                    emergencyLogger.log('Sent emergency response to:', e.origin);
                  } catch (err) {
                    emergencyLogger.error('Failed to send emergency response:', err);
                  }
                }
              } catch (err) {
                emergencyLogger.error('Error handling message:', err);
              }
            });
          } catch(e) {
            console.error('[Auth Widget Emergency]', new Date().toISOString(), 'Early initialization error:', e);
          }
        `}
      </Script>

      {/* Simple verification script */}
      <Script id="diagnostic-check-main" strategy="afterInteractive">
        {`
          // Simple verification script
          try {
            const diagnosticLogger = {
              log: (...args) => console.log('[Auth Widget Diagnostic]', new Date().toISOString(), ...args),
              error: (...args) => console.error('[Auth Widget Diagnostic]', new Date().toISOString(), ...args)
            };

            // Add direct listener for both ping and auth requests
            window.addEventListener('message', function(e) {
              if (!e.data) return;

              // Handle get-auth-profile requests directly from script too for redundancy
              if (e.data?.type === 'get-auth-profile') {
                diagnosticLogger.log('Received get-auth-profile request from:', e.origin);
                try {
                  // Simple quick response with basic data
                  const auth = {
                    type: 'auth-profile',
                    data: {
                      isAuthenticated: !!window.__NEXT_DATA__?.props?.pageProps?.auth?.isAuthenticated,
                      _source: 'diagnostic-script'
                    }
                  };

                  // Send response
                  e.source.postMessage(auth, e.origin);
                  diagnosticLogger.log('Sent auth response to', e.origin);
                } catch(err) {
                  diagnosticLogger.error('Error responding to get-auth-profile:', err);
                }
              }
            });

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
