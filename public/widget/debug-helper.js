/**
 * AOLF Auth Widget Debug Helper
 *
 * Include this script in your app to monitor communication with the auth widget iframe.
 * It will log all messages between your app and the widget iframe.
 *
 * Usage:
 * <script src="https://YOUR-APP2-SUBDOMAIN.artofliving.org/widget/debug-helper.js"></script>
 */

(function() {
  // Always run the debug helper regardless of environment to ensure desktop support
  const isDebugMode = true;

  // Create logger
  const logger = {
    prefix: '[AOLF Widget Debug]',
    log: (...args) => console.log(logger.prefix, new Date().toISOString(), ...args),
    info: (...args) => console.info(logger.prefix, new Date().toISOString(), ...args),
    warn: (...args) => console.warn(logger.prefix, new Date().toISOString(), ...args),
    error: (...args) => console.error(logger.prefix, new Date().toISOString(), ...args),
    debug: (...args) => console.debug(logger.prefix, new Date().toISOString(), ...args),
    // Add formatted JSON output for objects
    json: (obj) => console.log(logger.prefix, new Date().toISOString(), JSON.stringify(obj, null, 2))
  };

  // Detect device type - enhanced for better iOS detection
  const detectDevice = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';

    const isIOS = /iPhone|iPad|iPod|iOS|CriOS/.test(ua) ||
           (/Safari/.test(ua) && /Apple/.test(navigator.vendor) && !/Chrome|Android/.test(ua)) ||
           (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

    // Get details about browser and platform
    const device = {
      userAgent: ua,
      isIOS: isIOS,
      isChrome: /Chrome/.test(ua) && !/Edge|Edg/.test(ua),
      isSafari: /Safari/.test(ua) && !/Chrome|Android/.test(ua),
      isFirefox: /Firefox/.test(ua),
      isEdge: /Edge|Edg/.test(ua),
      isMobile: /Mobi|Android|iPhone|iPad|iPod/.test(ua),
      isIPad: /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1),
      platform: platform
    };

    // Log detailed device info
    logger.info('Device detected:', device);

    return device;
  };

  // Enhanced postMessage monitoring
  const monitorPostMessages = () => {
    // Listen to all messages
    window.addEventListener('message', (event) => {
      try {
        const eventData = event.data;

        // Try to intelligently display the message data
        logger.log('postMessage received:',
          eventData,
          'from',
          event.origin
        );

        // For iOS, check for nested JSON strings
        if (typeof eventData === 'object' && eventData?.data && typeof eventData.data === 'string') {
          try {
            const parsedData = JSON.parse(eventData.data);
            logger.info('iOS format detected - Nested data:', parsedData);

            // Look for auth info and analyze it
            if (parsedData.type === 'auth-profile' || parsedData.type === 'auth-widget-data-updated') {
              logger.info('AUTH DATA ANALYSIS:', {
                isAuthenticated: parsedData.data?.isAuthenticated || false,
                hasProfile: !!parsedData.data?.profile,
                hasTokens: !!parsedData.data?.tokens,
                tokenInfo: parsedData.data?.tokens ? {
                  hasAccessToken: !!parsedData.data.tokens.accessToken,
                  hasIdToken: !!parsedData.data.tokens.idToken,
                } : null
              });
            }
          } catch (e) {
            // Not parseable, ignore
          }
        }
      } catch (e) {
        logger.error('Error processing message:', e);
      }
    });

    // Override window postMessage to capture all outgoing messages
    const originalPostMessage = window.postMessage;
    window.postMessage = function() {
      logger.log('postMessage sent:', ...arguments);
      return originalPostMessage.apply(this, arguments);
    };
  };

  // Global emergency debug function
  window.showAolfDebugger = function() {
    createDebugOverlay();
    logger.info('Debugger panel forced visible via console command');
  };

  // Create debug overlay for both mobile and desktop
  const createDebugOverlay = () => {
    // Remove any existing debugger first
    const existingDebugger = document.getElementById('aolf-debug-overlay');
    if (existingDebugger) {
      existingDebugger.remove();
    }

    const deviceInfo = detectDevice();

    // Create the debug overlay
    const overlay = document.createElement('div');
    overlay.id = 'aolf-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: ${deviceInfo.isMobile ? '100%' : '400px'};
      background: rgba(0,0,0,0.85);
      color: lime;
      font-family: monospace;
      font-size: ${deviceInfo.isMobile ? '12px' : '14px'};
      padding: 10px;
      max-height: ${deviceInfo.isMobile ? '50%' : '80%'};
      overflow-y: auto;
      z-index: 9999999;
      border: 2px solid lime;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.8);
    `;

    // Create toggle button - always visible
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Auth Debug';
    toggleBtn.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: lime;
      border: 1px solid lime;
      border-radius: 5px;
      padding: 6px 12px;
      font-size: ${deviceInfo.isMobile ? '12px' : '14px'};
      z-index: 10000000;
      cursor: pointer;
      font-weight: bold;
    `;

    // Add device info and controls to the overlay
    const deviceSection = document.createElement('div');
    deviceSection.style.cssText = 'margin-bottom: 15px;';
    deviceSection.innerHTML = `
      <div style="background:#333; padding:8px; margin-bottom:10px;">
        <div><strong>Device:</strong> ${deviceInfo.isIOS ? 'iOS' : deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</div>
        <div><strong>Browser:</strong> ${
          deviceInfo.isChrome ? 'Chrome' :
          deviceInfo.isSafari ? 'Safari' :
          deviceInfo.isFirefox ? 'Firefox' :
          deviceInfo.isEdge ? 'Edge' : 'Other'
        }</div>
        <div><strong>Platform:</strong> ${deviceInfo.platform}</div>
        <div><strong>Resolution:</strong> ${window.innerWidth}x${window.innerHeight}</div>
        <div><strong>Message Mode:</strong> ${deviceInfo.isIOS ? 'iOS Format (nested)' : 'Standard'}</div>
        <div style="font-size:10px;color:#999;margin-top:5px;word-break:break-all;">${deviceInfo.userAgent.substring(0, 100)}...</div>
      </div>
    `;

    // Add control buttons
    const controlsSection = document.createElement('div');
    controlsSection.style.cssText = 'display:flex; gap:5px; margin-bottom:10px; flex-wrap:wrap;';

    // Force authentication test button
    const forceAuthBtn = document.createElement('button');
    forceAuthBtn.textContent = 'Force Auth';
    forceAuthBtn.style.cssText = 'background:#060; color:white; border:none; padding:5px 10px; cursor:pointer;';
    forceAuthBtn.onclick = () => {
      logger.info('Attempting to force auth detection...');

      // Find the auth iframe
      const iframe = document.getElementById('auth-profile-iframe');
      if (iframe && iframe.contentWindow) {
        // Attempt to send message with different origins
        try {
          const message = { type: 'get-auth-profile' };

          // Try different approaches for different browsers
          if (deviceInfo.isIOS) {
            logger.info('Using iOS approach');
            iframe.contentWindow.postMessage(JSON.stringify(message), '*');
            setTimeout(() => {
              iframe.contentWindow.postMessage({ data: JSON.stringify(message) }, '*');
            }, 100);
          } else {
            logger.info('Using standard approach');
            iframe.contentWindow.postMessage(message, '*');
          }

          logger.info('Force auth message sent');
        } catch (e) {
          logger.error('Error forcing auth:', e);
        }
      } else {
        logger.error('Auth iframe not found');
      }
    };

    // Reload widget iframe button
    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = 'Reload Frame';
    reloadBtn.style.cssText = 'background:#600; color:white; border:none; padding:5px 10px; cursor:pointer;';
    reloadBtn.onclick = () => {
      logger.info('Reloading auth iframe...');

      // Find the auth iframe
      const iframe = document.getElementById('auth-profile-iframe');
      if (iframe) {
        const originalSrc = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => {
          const separator = originalSrc.includes('?') ? '&' : '?';
          iframe.src = originalSrc + separator + 'reload=' + Date.now();
          logger.info('Iframe reloaded with src:', iframe.src);
        }, 100);
      } else {
        logger.error('Auth iframe not found');
      }
    };

    // Check auth status button
    const checkAuthBtn = document.createElement('button');
    checkAuthBtn.textContent = 'Check Auth';
    checkAuthBtn.style.cssText = 'background:#066; color:white; border:none; padding:5px 10px; cursor:pointer;';
    checkAuthBtn.onclick = () => {
      logger.info('Checking auth status...');

      // Get auth info from localStorage if available
      try {
        let authFound = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('token') || key.includes('auth') || key.includes('user'))) {
            logger.info(`Found auth-related key: ${key}, value length:`, localStorage.getItem(key)?.length || 0);
            authFound = true;
          }
        }

        if (!authFound) {
          logger.info('No auth data found in localStorage');
        }
      } catch (e) {
        logger.error('Error checking localStorage:', e);
      }

      // Check auth context in window
      if (window.Auth) {
        logger.info('Auth object found in window');
      }

      // Check for header data
      if (window.headerData) {
        logger.info('Header data found:', window.headerData);
      }
    };

    // Clear logs button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Logs';
    clearBtn.style.cssText = 'background:#333; color:white; border:none; padding:5px 10px; cursor:pointer;';
    clearBtn.onclick = () => {
      const logArea = document.getElementById('debug-overlay-log');
      if (logArea) logArea.innerHTML = '';
    };

    // Add buttons to controls
    controlsSection.appendChild(forceAuthBtn);
    controlsSection.appendChild(reloadBtn);
    controlsSection.appendChild(checkAuthBtn);
    controlsSection.appendChild(clearBtn);

    // Create log area
    const logSection = document.createElement('div');
    logSection.id = 'debug-overlay-log';
    logSection.style.cssText = 'max-height:300px; overflow-y:auto; font-size:12px;';

    // Assemble overlay
    overlay.appendChild(deviceSection);
    overlay.appendChild(controlsSection);
    overlay.appendChild(logSection);

    // Toggle functionality for the button
    toggleBtn.addEventListener('click', () => {
      overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    });

    // Add to document
    document.body.appendChild(toggleBtn);
    document.body.appendChild(overlay);

    // Override console.log to also output to overlay
    const logArea = document.getElementById('debug-overlay-log');
    const originalConsoleLog = console.log;
    const originalConsoleInfo = console.info;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    if (logArea) {
      // Helper to add log entry
      const addLogEntry = (type, args) => {
        const entry = document.createElement('div');
        entry.style.color = type === 'error' ? 'red' : type === 'warn' ? 'yellow' : type === 'info' ? 'cyan' : 'lime';
        entry.style.borderBottom = '1px solid #333';
        entry.style.padding = '4px 0';
        entry.style.wordBreak = 'break-word';

        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        let content = `[${timestamp}] [${type.toUpperCase()}] `;

        // Format args for display
        content += args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');

        entry.textContent = content;
        logArea.insertBefore(entry, logArea.firstChild);

        // Limit entries
        if (logArea.children.length > 100) {
          logArea.removeChild(logArea.lastChild);
        }
      };

      // Override console methods
      console.log = function() {
        addLogEntry('log', Array.from(arguments));
        return originalConsoleLog.apply(console, arguments);
      };

      console.info = function() {
        addLogEntry('info', Array.from(arguments));
        return originalConsoleInfo.apply(console, arguments);
      };

      console.warn = function() {
        addLogEntry('warn', Array.from(arguments));
        return originalConsoleWarn.apply(console, arguments);
      };

      console.error = function() {
        addLogEntry('error', Array.from(arguments));
        return originalConsoleError.apply(console, arguments);
      };
    }

    return { overlay, toggleBtn };
  };

  // Add global helper for reloading the auth iframe
  window.reloadAuthFrame = function() {
    const iframe = document.getElementById('auth-profile-iframe');
    if (iframe) {
      const originalSrc = iframe.src;
      iframe.src = 'about:blank';
      setTimeout(() => {
        const separator = originalSrc.includes('?') ? '&' : '?';
        iframe.src = originalSrc + separator + 'reload=' + Date.now() + '&allowWildcard=true';
        console.log('Auth iframe reloaded with src:', iframe.src);
      }, 100);
      return true;
    }
    return false;
  };

  // Force create debug overlay with high visibility on all devices
  const initDebugger = () => {
    detectDevice();
    monitorPostMessages();

    // Initialize after DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createDebugOverlay, 500);
      });
    } else {
      setTimeout(createDebugOverlay, 500);
    }

    logger.info('Debug helper initialized - use window.showAolfDebugger() to show debugger if not visible');
    console.log('%c AOLF Widget Debugger Active ', 'background: #222; color: lime; font-size: 14px;');
  };

  // Immediately initialize the debugger
  initDebugger();
})();
