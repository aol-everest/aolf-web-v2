import { useEffect, useState } from 'react';
import { useAuth } from '@contexts';
import { api } from '@utils';
import { Auth } from '@utils/auth';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import Script from 'next/script';

/**
 * AOLF Auth Widget - Cross-Domain Authentication Widget (iOS Compatible)
 *
 * This widget manages authentication between multiple AOLF sites by providing a consistent
 * interface for auth data, using post-robot for reliable cross-domain communication.
 *
 * Optimized for iOS compatibility with additional error handling and recovery mechanisms.
 */

// Simple logger for debugging
const logger = {
  debug: (...args) => console.debug('[Auth Widget]', ...args),
  info: (...args) => console.info('[Auth Widget]', ...args),
  warn: (...args) => console.warn('[Auth Widget]', ...args),
  error: (...args) => console.error('[Auth Widget]', ...args),
  isEnabled: () => {
    // Check if debug mode is enabled via URL param or localStorage
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get('debug') === 'true' ||
        urlParams.get('debug') === 'widget'
      ) {
        return true;
      }
      return localStorage.getItem('aolf-widget-debug') === 'true';
    }
    return false;
  },
};

// Device detection for iOS-specific handling
const isIOS = () => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod|iOS|CriOS/.test(ua) ||
    (/Safari/.test(ua) &&
      /Apple/.test(navigator.vendor) &&
      !/Chrome|Android/.test(ua)) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
};

function AuthProfileWidget() {
  const authObject = useAuth();
  const [communicationError, setCommunicationError] = useState(false);
  const [communicationAttempts, setCommunicationAttempts] = useState(0);

  // Extract important auth data
  const isAuthenticated = authObject?.isAuthenticated || false;
  const profile = authObject?.profile || null;
  const tokens = authObject?.tokens || null;

  // Fetch intro menu items if authenticated
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
        return response?.data || [];
      } catch (error) {
        if (error.message?.includes('User needs to be authenticated')) {
          return [];
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Log authentication state changes for debugging
  useEffect(() => {
    if (logger.isEnabled()) {
      logger.info(
        `Auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`,
      );
      if (isAuthenticated && profile) {
        logger.debug('User profile:', profile.first_name, profile.last_name);
      }
    }
  }, [isAuthenticated, profile]);

  // Handle communication recovery
  useEffect(() => {
    if (communicationError && communicationAttempts < 3) {
      logger.warn(
        `Communication error detected. Attempt ${communicationAttempts + 1}/3 to recover`,
      );

      // Wait a bit longer on iOS devices
      const recoveryDelay = isIOS() ? 800 : 500;

      const recoveryTimer = setTimeout(() => {
        logger.info('Attempting to recover communication...');
        setCommunicationAttempts((prev) => prev + 1);
        setCommunicationError(false);
      }, recoveryDelay);

      return () => clearTimeout(recoveryTimer);
    }
  }, [communicationError, communicationAttempts]);

  // Setup post-robot handlers
  useEffect(() => {
    // Skip if window is not available (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    // Wait for post-robot to be available
    const setupInterval = setInterval(() => {
      if (window.postRobot) {
        clearInterval(setupInterval);
        initPostRobot();
      }
    }, 100);

    // Timeout after 5 seconds if post-robot doesn't load
    const setupTimeout = setTimeout(() => {
      clearInterval(setupInterval);
      logger.error('Post-robot failed to load within timeout');
    }, 5000);

    function initPostRobot() {
      clearTimeout(setupTimeout);
      logger.info('Post-robot available, initializing handlers');
      console.log(introData);

      // Create auth response data function
      const createResponseData = () => {
        return {
          isAuthenticated: !!isAuthenticated,
          profile: profile
            ? {
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                avatar: profile.avatar || profile.picture || '',
              }
            : null,
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
              }
            : null,
          exploreMenu:
            introData?.map((item) => ({
              name: item.title || item.name || '',
              link: item.url || item.link || '#',
            })) || [],
          // Add extra properties to help with debugging
          authTime: new Date().toISOString(),
          hasAuth: !!isAuthenticated,
          hasTokens: !!tokens,
          hasProfile: !!profile,
          platform: isIOS() ? 'ios' : 'other',
        };
      };

      // Handle get-auth-profile requests via post-robot with improved error handling
      const listener = window.postRobot.on('get-auth-profile', (event) => {
        if (logger.isEnabled()) {
          logger.info('Received get-auth-profile request from:', event.origin);
        }

        // Reset communication error state on successful request
        setCommunicationError(false);
        setCommunicationAttempts(0);

        // Return the response data directly - post-robot handles serialization
        return createResponseData();
      });

      // When auth data changes, notify parent if we're in an iframe
      let prevAuthSignature = '';

      const notifyAuthUpdate = () => {
        if (window.parent !== window) {
          // Get a signature of the current auth state to avoid unnecessary updates
          const authSignature = `${isAuthenticated}-${!!profile}-${!!tokens}`;

          // Only send if something meaningful changed
          if (authSignature !== prevAuthSignature) {
            prevAuthSignature = authSignature;

            if (logger.isEnabled()) {
              logger.info('Auth state changed, notifying parent');
            }

            // Use post-robot to send data to parent with error handling
            try {
              window.postRobot
                .send(
                  window.parent,
                  'auth-widget-data-updated',
                  createResponseData(),
                )
                .catch((err) => {
                  logger.error('Failed to notify parent of auth update:', err);
                  setCommunicationError(true);
                });
            } catch (err) {
              logger.error('Error sending auth update:', err);
              setCommunicationError(true);
            }
          }
        }
      };

      // Set up notification on auth changes - less frequent on iOS to reduce overhead
      const notifyInterval = setInterval(
        notifyAuthUpdate,
        isIOS() ? 3000 : 2000,
      );

      // Send ready notification to parent
      if (window.parent !== window) {
        // Delay ready event slightly longer on iOS
        const readyDelay = isIOS() ? 800 : 500;

        try {
          setTimeout(() => {
            window.postRobot
              .send(window.parent, 'auth-widget-ready', {
                timestamp: new Date().toISOString(),
                platform: isIOS() ? 'ios' : 'other',
              })
              .catch((err) => {
                logger.error('Failed to send ready notification:', err);
                setCommunicationError(true);
              });
          }, readyDelay);
        } catch (e) {
          logger.error('Error sending ready notification:', e);
          setCommunicationError(true);
        }
      }

      // Clean up listeners on unmount
      return () => {
        logger.debug('Cleaning up post-robot listeners');
        try {
          listener.cancel();
          clearInterval(notifyInterval);
        } catch (err) {
          logger.error('Error cleaning up listeners:', err);
        }
      };
    }

    return () => {
      clearInterval(setupInterval);
      clearTimeout(setupTimeout);
    };
  }, [isAuthenticated, profile, tokens, introData, communicationAttempts]);

  return (
    <>
      <Head>
        <title>AOLF Auth Widget</title>
        <meta name="robots" content="noindex" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        {/* Prevent iOS text size adjustment and scaling issues */}
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </Head>

      {/* Mobile debug overlay */}
      {logger.isEnabled() && (
        <Script id="debug-overlay" strategy="afterInteractive">
          {`
            // Create a simple mobile debug overlay
            (function() {
              const overlay = document.createElement('div');
              overlay.id = 'mobile-debug-overlay';
              overlay.style.cssText = \`
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                max-height: 40vh;
                background-color: rgba(0, 0, 0, 0.8);
                color: #0f0;
                font-family: monospace;
                font-size: 10px;
                padding: 8px;
                overflow-y: auto;
                z-index: 9999;
                border-top: 2px solid #0f0;
                -webkit-overflow-scrolling: touch;
              \`;

              const deviceInfo = document.createElement('div');
              deviceInfo.style.cssText = \`
                background-color: #305;
                padding: 5px;
                margin-bottom: 10px;
                border-radius: 4px;
                font-weight: bold;
              \`;

              // Device info with more detail for debugging
              const ua = navigator.userAgent;
              const isIOS = /iPhone|iPad|iPod|iOS|CriOS/.test(ua) ||
                           (/Safari/.test(ua) && /Apple/.test(navigator.vendor));

              deviceInfo.innerHTML = \`
                <div>Device: \${isIOS ? '📱 iOS' : '🖥️ Desktop/Android'}</div>
                <div>Auth: \${${isAuthenticated} ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
                <div>URL: \${window.location.href}</div>
                <div>PostRobot: \${window.postRobot ? '✅ Loaded' : '❌ Not Loaded'}</div>
              \`;

              overlay.appendChild(deviceInfo);

              // Add to the document
              document.body.appendChild(overlay);

              // Add helper to force reload iframe
              window.reloadWidget = function() {
                location.reload();
              };

              // Log initialization
              console.log('[Auth Widget Debug] Debug overlay initialized');
            })();
          `}
        </Script>
      )}
    </>
  );
}

// Mark this page as not needing layout components
AuthProfileWidget.noHeader = true;
AuthProfileWidget.hideFooter = true;

export default AuthProfileWidget;
