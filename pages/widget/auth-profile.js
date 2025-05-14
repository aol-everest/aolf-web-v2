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

// Global registry for post-robot listeners
let activeListeners = {
  getAuthProfile: null,
  notifyInterval: null,
};

// Function to clean up existing listeners
const cleanupListeners = () => {
  if (typeof window === 'undefined' || !window.postRobot) return;

  try {
    // Clean up get-auth-profile listener
    if (activeListeners.getAuthProfile) {
      activeListeners.getAuthProfile.cancel();
      console.log('[Auth Widget] Cleaned up get-auth-profile listener');
    }

    // Clean up notification interval
    if (activeListeners.notifyInterval) {
      clearInterval(activeListeners.notifyInterval);
    }

    // Reset listeners object
    activeListeners = {
      getAuthProfile: null,
      notifyInterval: null,
    };
  } catch (err) {
    console.error('[Auth Widget] Error cleaning up listeners:', err);
  }
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

  // Clean up any existing listeners when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.postRobot) {
      logger.info('Component mounted, cleaning up any existing listeners');
      cleanupListeners();
    }

    // Clean up again when component unmounts
    return () => {
      if (typeof window !== 'undefined' && window.postRobot) {
        logger.info('Component unmounting, cleaning up listeners');
        cleanupListeners();
      }
    };
  }, []);

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

    // Mobile detection for specific handling
    const deviceIsIOS = isIOS();

    // Wait for post-robot to be available with longer timeout for mobile
    const setupInterval = setInterval(
      () => {
        if (window.postRobot) {
          clearInterval(setupInterval);
          initPostRobot();
        }
      },
      deviceIsIOS ? 200 : 100,
    );

    // Timeout after longer period on mobile devices
    const setupTimeout = setTimeout(
      () => {
        clearInterval(setupInterval);
        logger.error('Post-robot failed to load within timeout');
      },
      deviceIsIOS ? 10000 : 5000,
    );

    function initPostRobot() {
      clearTimeout(setupTimeout);
      logger.info('Post-robot available, initializing handlers');

      // Clean up any existing listeners before creating new ones
      cleanupListeners();

      // Configure post-robot for mobile if needed
      if (deviceIsIOS && window.postRobot.CONFIG) {
        // Extend timeout for mobile devices
        window.postRobot.CONFIG.ACK_TIMEOUT = 5000;
        window.postRobot.CONFIG.RES_TIMEOUT = 10000;
        logger.info('Configured post-robot with extended timeouts for mobile');
      }

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
          platform: deviceIsIOS ? 'ios' : 'other',
        };
      };

      try {
        // Handle get-auth-profile requests via post-robot with improved error handling
        const listener = window.postRobot.on('get-auth-profile', (event) => {
          if (logger.isEnabled()) {
            logger.info(
              'Received get-auth-profile request from:',
              event.origin,
            );
          }

          // Reset communication error state on successful request
          setCommunicationError(false);
          setCommunicationAttempts(0);

          // Log additional info for debugging on mobile
          if (deviceIsIOS && logger.isEnabled()) {
            logger.debug('Request details:', {
              source: event.source ? 'Available' : 'Null',
              sourceOrigin: event.sourceOrigin || 'Not provided',
              canReply: !!event.source && !!window.postRobot,
            });
          }

          try {
            // Ensure we're responding to a valid source
            if (!event.source) {
              logger.error('No valid source to respond to');
              return createResponseData();
            }

            // Return the response data directly - post-robot handles serialization
            return createResponseData();
          } catch (err) {
            logger.error('Error in get-auth-profile handler:', err);
            return createResponseData();
          }
        });

        // Store listener in global registry
        activeListeners.getAuthProfile = listener;

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
                    logger.error(
                      'Failed to notify parent of auth update:',
                      err,
                    );
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
          deviceIsIOS ? 3000 : 2000,
        );

        // Store interval in global registry
        activeListeners.notifyInterval = notifyInterval;

        // Send ready notification to parent
        if (window.parent !== window) {
          // Delay ready event slightly longer on iOS
          const readyDelay = deviceIsIOS ? 800 : 500;

          try {
            setTimeout(() => {
              window.postRobot
                .send(window.parent, 'auth-widget-ready', {
                  timestamp: new Date().toISOString(),
                  platform: deviceIsIOS ? 'ios' : 'other',
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
      } catch (error) {
        logger.error('Error setting up post-robot handlers:', error);
      }
    }

    return () => {
      clearInterval(setupInterval);
      clearTimeout(setupTimeout);
      cleanupListeners();
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
            height: 100%;
            width: 100%;
            background: transparent;
          }

          .auth-widget-container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            max-height: 60px;
            min-height: 40px;
            padding: 0 10px;
          }

          .auth-avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 25px 0 rgba(61, 139, 232, 0.2);
            border: 2px solid #e9e9e9;
            transition: transform 0.2s;
            background-size: cover;
            background-position: center;
            position: relative;
            font-family: Lora, sans-serif;
            font-weight: 700;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #e47c2c;
          }

          .auth-avatar:hover {
            transform: scale(1.1);
          }

          .auth-avatar:active {
            transform: scale(0.95);
          }

          .auth-avatar-image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            position: relative;
          }

          .auth-login-btn {
            padding: 7px 15px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
            white-space: nowrap;
            min-height: 46px;
          }

          .auth-login-btn:hover {
            background: #0052a3;
          }

          .auth-login-btn:active {
            background: #004080;
          }

          .user-name {
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
            color: #31364e;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px;
          }

          .avatar-container {
            display: flex;
            align-items: center;
          }

          .initials {
            font-size: 16px;
            line-height: 1;
            text-align: center;
          }

          @media (max-width: 480px) {
            .user-name {
              display: none;
            }
          }
        `,
          }}
        />
      </Head>

      {/* Interactive Widget UI - Solves iOS WebKit postMessage limitations by making iframe interactive */}
      <div className="auth-widget-container">
        {isAuthenticated && profile ? (
          <div
            className="avatar-container"
            onClick={() => {
              // This click handler makes the iframe interactive, helping with iOS limitations
              if (window.parent !== window) {
                try {
                  window.postRobot
                    .send(window.parent, 'auth-widget-clicked', {
                      action: 'profile',
                      isAuthenticated,
                      profile,
                    })
                    .catch((err) => {
                      logger.error('Failed to send click event:', err);
                    });
                } catch (err) {
                  logger.error('Error sending click event:', err);
                }
              }
            }}
          >
            <div
              className="auth-avatar"
              style={
                profile.avatar
                  ? { backgroundImage: `url(${profile.avatar})` }
                  : {}
              }
            >
              {!profile.avatar && (
                <div className="initials">
                  {profile.first_name && profile.last_name
                    ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`
                    : profile.first_name
                      ? profile.first_name.charAt(0)
                      : profile.email
                        ? profile.email.charAt(0).toUpperCase()
                        : 'U'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            className="auth-login-btn"
            onClick={() => {
              // This click handler makes the iframe interactive, helping with iOS limitations
              if (window.parent !== window) {
                try {
                  window.postRobot
                    .send(window.parent, 'auth-widget-clicked', {
                      action: 'login',
                      isAuthenticated,
                    })
                    .catch((err) => {
                      logger.error('Failed to send click event:', err);
                    });
                } catch (err) {
                  logger.error('Error sending click event:', err);
                }
              }
            }}
          >
            Login
          </button>
        )}
      </div>

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
                <div>Is iframe: \${window.parent !== window ? '✅ Yes' : '❌ No'}</div>
                <div style="font-size:8px;">\${navigator.userAgent.substring(0,60)}...</div>
              \`;

              overlay.appendChild(deviceInfo);

              // Add post-robot debug info section
              if (window.postRobot) {
                const postRobotInfo = document.createElement('div');
                postRobotInfo.style.cssText = \`
                  background-color: #063;
                  padding: 5px;
                  margin-bottom: 10px;
                  border-radius: 4px;
                  font-size: 9px;
                \`;

                // Add simple debug controls
                const debugControls = document.createElement('div');
                debugControls.innerHTML = \`
                  <button onclick="window.reloadWidget()" style="background:#600;color:white;border:none;padding:3px;margin:2px;font-size:9px;">Reload</button>
                  <button onclick="window.parent.postMessage('ping-auth','*')" style="background:#060;color:white;border:none;padding:3px;margin:2px;font-size:9px;">Ping Parent</button>
                  <button onclick="console.log('Post-Robot:',window.postRobot)" style="background:#006;color:white;border:none;padding:3px;margin:2px;font-size:9px;">Log PostRobot</button>
                \`;

                postRobotInfo.appendChild(debugControls);
                overlay.appendChild(postRobotInfo);
              }

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
