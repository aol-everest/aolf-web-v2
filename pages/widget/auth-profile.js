import { useEffect, useRef } from 'react';
import { useAuth } from '@contexts';
import { api } from '@utils';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import Script from 'next/script';

const ALLOWED_ORIGIN_REGEX = /^https:\/\/([a-z0-9-]+\.)*artofliving\.org$/i;

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

  // Use ref to prevent removing/adding the same listener multiple times
  const messageHandlerRef = useRef(null);
  const listenerSetupRef = useRef(false);

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

  // Set up message listener with useRef to avoid recreation on each render
  useEffect(() => {
    // Define the message handler function
    const createMessageHandler = () => {
      return function handler(event) {
        // Log all incoming postMessages for debugging
        logger.debug(
          'Received event from origin:',
          event.origin,
          'type:',
          event.data?.type,
        );

        // Validate origin
        if (!ALLOWED_ORIGIN_REGEX.test(event.origin)) {
          logger.warn('Rejected message from invalid origin:', event.origin);
          return;
        }

        // Create menu items from intro data
        const exploreMenu = introData.map((item) => ({
          name: item.title,
          link: item.slug ? `/us-en/explore/${item.slug}` : '#',
        }));

        if (event.data?.type === 'get-auth-profile') {
          logger.info(
            'Received auth profile request from origin:',
            event.origin,
          );

          // Create response data
          const responseData = {
            type: 'auth-profile',
            data: {
              isAuthenticated,
              tokens: isAuthenticated
                ? {
                    accessToken: tokens?.accessToken,
                    idToken: tokens?.idToken,
                  }
                : null,
              profile,
              exploreMenu,
            },
          };

          // Log response size (but not content for security)
          logger.debug('Response payload size details:', {
            profileSize: profile ? JSON.stringify(profile).length : 0,
            menuItemsCount: exploreMenu.length,
            totalSize: JSON.stringify(responseData).length,
          });

          // Send the response
          try {
            event.source.postMessage(responseData, event.origin);
            logger.info('Auth profile sent successfully to:', event.origin);
          } catch (err) {
            logger.error('Failed to send auth profile:', err);
          }
        }
      };
    };

    // Only set up the listener once
    if (!listenerSetupRef.current) {
      logger.info('Setting up postMessage listener (initial setup)');
      messageHandlerRef.current = createMessageHandler();
      window.addEventListener('message', messageHandlerRef.current);
      listenerSetupRef.current = true;

      // Add a diagnostic check to verify if we're receiving any messages
      const diagInterval = setInterval(() => {
        logger.debug(
          'Diagnostic: postMessage listener is active, waiting for messages...',
        );

        // Try to trigger a message to self to verify listener is working
        try {
          window.parent.postMessage({ type: 'auth-widget-ping' }, '*');
        } catch (e) {
          // Ignore security errors for cross-origin frames
        }
      }, 10000); // Check every 10 seconds

      return () => {
        logger.info('Cleaning up postMessage listener and diagnostic interval');
        window.removeEventListener('message', messageHandlerRef.current);
        clearInterval(diagInterval);
        listenerSetupRef.current = false;
      };
    }
  }, []); // Empty dependency array - only run once

  // Update the handler when important data changes
  useEffect(() => {
    // Skip if listener hasn't been set up yet
    if (!messageHandlerRef.current || !listenerSetupRef.current) return;

    logger.debug('Updating message handler with new data');

    // Remove old handler
    window.removeEventListener('message', messageHandlerRef.current);

    // Create new handler with updated data
    messageHandlerRef.current = function handler(event) {
      logger.debug(
        'Received event from origin:',
        event.origin,
        'type:',
        event.data?.type,
      );

      // Validate origin
      if (!ALLOWED_ORIGIN_REGEX.test(event.origin)) {
        logger.warn('Rejected message from invalid origin:', event.origin);
        return;
      }

      // Create menu items from intro data
      const exploreMenu = introData.map((item) => ({
        name: item.title,
        link: item.slug ? `/us-en/explore/${item.slug}` : '#',
      }));

      if (event.data?.type === 'get-auth-profile') {
        logger.info('Received auth profile request from origin:', event.origin);

        // Create response data
        const responseData = {
          type: 'auth-profile',
          data: {
            isAuthenticated,
            tokens: isAuthenticated
              ? {
                  accessToken: tokens?.accessToken,
                  idToken: tokens?.idToken,
                }
              : null,
            profile,
            exploreMenu,
          },
        };

        // Send the response
        try {
          event.source.postMessage(responseData, event.origin);
          logger.info('Auth profile sent successfully to:', event.origin);
        } catch (err) {
          logger.error('Failed to send auth profile:', err);
        }
      }
    };

    // Add updated handler
    window.addEventListener('message', messageHandlerRef.current);

    return () => {
      // Cleanup not needed here as it will be done by the main setup effect
    };
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

      {/* Add diagnostic script to ensure postMessage is working */}
      <Script id="diagnostic-check" strategy="afterInteractive">
        {`
          // Safely verify postMessage is working
          try {
            window.addEventListener('message', function diagnosticListener(e) {
              if (e.data?.type === 'auth-widget-ping') {
                console.log('[Auth Widget]', new Date().toISOString(), 'Self diagnostic ping received - postMessage is working');
              }
            });

            // Log that we're ready to receive messages
            console.log('[Auth Widget]', new Date().toISOString(), 'Widget initialized and ready to receive messages');

            // Check if this is embedded in an iframe
            if (window.parent !== window) {
              console.log('[Auth Widget]', new Date().toISOString(), 'Widget is embedded in an iframe - correct configuration');
            } else {
              console.warn('[Auth Widget]', new Date().toISOString(), 'Widget is NOT embedded in an iframe - this may cause issues');
            }
          } catch(e) {
            console.error('[Auth Widget]', new Date().toISOString(), 'Diagnostic script error:', e);
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
