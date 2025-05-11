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
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isDebug = urlParams.get('debug') === 'true' || urlParams.get('debug') === '';

  // Create a specialized logger for the debug helper
  const logger = {
    log: function() {
      console.log('[AOLF Widget Debug]', new Date().toISOString(), ...arguments);
    },
    info: function() {
      console.info('[AOLF Widget Debug]', new Date().toISOString(), ...arguments);
    },
    warn: function() {
      console.warn('[AOLF Widget Debug]', new Date().toISOString(), ...arguments);
    },
    error: function() {
      console.error('[AOLF Widget Debug]', new Date().toISOString(), ...arguments);
    }
  };

  // Detect device details
  const detectDevice = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';

    // Get details about browser and platform
    const device = {
      userAgent: ua,
      isIOS: /iPhone|iPad|iPod|iOS|CriOS/.test(ua) ||
             (/Safari/.test(ua) && /Apple/.test(navigator.vendor) && !/Chrome|Android/.test(ua)) ||
             (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1),
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
          } catch (e) {
            // Not parseable, ignore
          }
        }
      } catch (e) {
        logger.error('Error processing message:', e);
      }
    });

    // Monitor message sending (override postMessage)
    const originalPostMessage = window.postMessage;
    window.postMessage = function() {
      logger.log('postMessage sent:', ...arguments);
      return originalPostMessage.apply(this, arguments);
    };
  };

  // Add debug overlay for both mobile and desktop
  const createDebugOverlay = () => {
    const deviceInfo = detectDevice();

    // Create the debug overlay
    const overlay = document.createElement('div');
    overlay.id = 'aolf-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: ${deviceInfo.isMobile ? '100%' : '400px'};
      background: rgba(0,0,0,0.85);
      color: lime;
      font-family: monospace;
      font-size: ${deviceInfo.isMobile ? '12px' : '14px'};
      padding: 10px;
      max-height: ${deviceInfo.isMobile ? '150px' : '400px'};
      overflow-y: auto;
      z-index: 999999;
      display: none;
      border-top: 2px solid lime;
      box-shadow: 0 -3px 10px rgba(0,0,0,0.5);
    `;

    // Create toggle button - always visible
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Auth Debug';
    toggleBtn.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: lime;
      border: 1px solid lime;
      border-radius: 5px;
      padding: 6px 12px;
      font-size: ${deviceInfo.isMobile ? '12px' : '14px'};
      z-index: 9999999;
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

    // Request auth button
    const requestAuthBtn = document.createElement('button');
    requestAuthBtn.textContent = 'Request Auth';
    requestAuthBtn.style.cssText = 'background:#060; color:white; border:none; padding:5px 10px; cursor:pointer;';
    requestAuthBtn.onclick = () => {
      if (window.aolfWidgetDiagnostics && window.aolfWidgetDiagnostics.testIOSMessageFormat) {
        window.aolfWidgetDiagnostics.testIOSMessageFormat();
      }
    };

    // Check tokens button
    const checkTokensBtn = document.createElement('button');
    checkTokensBtn.textContent = 'Check Tokens';
    checkTokensBtn.style.cssText = 'background:#600; color:white; border:none; padding:5px 10px; cursor:pointer;';
    checkTokensBtn.onclick = () => {
      if (window.aolfWidgetDiagnostics && window.aolfWidgetDiagnostics.checkTokens) {
        window.aolfWidgetDiagnostics.checkTokens();
      }
    };

    // Reload widget button
    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = 'Reload Widget';
    reloadBtn.style.cssText = 'background:#066; color:white; border:none; padding:5px 10px; cursor:pointer;';
    reloadBtn.onclick = () => {
      if (window.aolfWidgetDiagnostics && window.aolfWidgetDiagnostics.reloadAuthWidget) {
        window.aolfWidgetDiagnostics.reloadAuthWidget();
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
    controlsSection.appendChild(requestAuthBtn);
    controlsSection.appendChild(checkTokensBtn);
    controlsSection.appendChild(reloadBtn);
    controlsSection.appendChild(clearBtn);

    // Create log area
    const logSection = document.createElement('div');
    logSection.id = 'debug-overlay-log';
    logSection.style.cssText = 'max-height:300px; overflow-y:auto; font-size:12px;';

    // Assemble overlay
    overlay.appendChild(deviceSection);
    overlay.appendChild(controlsSection);
    overlay.appendChild(logSection);

    // Toggle functionality
    let isVisible = false;
    toggleBtn.addEventListener('click', () => {
      isVisible = !isVisible;
      overlay.style.display = isVisible ? 'block' : 'none';

      // Save preference
      try {
        localStorage.setItem('aolf-debug-visible', isVisible ? 'true' : 'false');
      } catch (e) {}
    });

    // Check saved preference
    try {
      const savedVisibility = localStorage.getItem('aolf-debug-visible');
      if (savedVisibility === 'true') {
        isVisible = true;
        overlay.style.display = 'block';
      }
    } catch (e) {}

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

  // Add diagnostic tools to help identify authentication issues
  const addAuthDiagnosticTools = () => {
    if (typeof window === 'undefined') return;

    // Add global diagnostic functions for testing auth flow
    window.aolfWidgetDiagnostics = {
      // Dump stored tokens
      checkTokens: () => {
        try {
          logger.info('Checking token storage:');

          // Check localStorage
          if (typeof localStorage !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              try {
                if (key.includes('token') || key.includes('auth') || key.includes('session')) {
                  const item = localStorage.getItem(key);
                  logger.info(`LocalStorage item: ${key} (length: ${item ? item.length : 0})`);
                }
              } catch (e) {
                // Skip this item
              }
            }
          }

          // Check for auth object
          const hasAuth = typeof window.Auth !== 'undefined';
          logger.info(`Auth global object exists: ${hasAuth}`);

          return {
            hasLocalStorage: typeof localStorage !== 'undefined',
            hasAuth: hasAuth
          };
        } catch (e) {
          logger.error('Error checking tokens:', e);
          return { error: e.message };
        }
      },

      // Force iOS format test message
      testIOSMessageFormat: () => {
        try {
          // Create test message in iOS format
          const testMessage = {
            data: JSON.stringify({
              type: 'auth-profile',
              data: {
                isAuthenticated: true,
                profile: { first_name: 'Test', last_name: 'User' },
                tokens: { accessToken: 'test-token' }
              }
            })
          };

          // Send to parent (if in iframe)
          if (window.parent !== window) {
            window.parent.postMessage(testMessage, '*');
            logger.info('Sent iOS format test message to parent');
            return { sent: true, format: 'iOS' };
          } else {
            logger.warn('Not running in iframe, cannot send test message');
            return { sent: false, reason: 'not in iframe' };
          }
        } catch (e) {
          logger.error('Error sending test message:', e);
          return { error: e.message };
        }
      },

      // Force a reload of the auth widget iframe
      reloadAuthWidget: () => {
        try {
          if (window.parent !== window) {
            // If we're in an iframe, tell parent to reload us
            window.parent.postMessage({ type: 'reload-auth-widget' }, '*');
            return { requested: true };
          } else {
            // If we're the parent, try to find and reload the auth iframe
            const iframe = document.getElementById('auth-profile-iframe');
            if (iframe) {
              const src = iframe.src;
              iframe.src = 'about:blank';
              setTimeout(() => {
                iframe.src = src;
              }, 100);
              return { reloaded: true, iframe: 'auth-profile-iframe' };
            }
            return { reloaded: false, reason: 'iframe not found' };
          }
        } catch (e) {
          logger.error('Error reloading auth widget:', e);
          return { error: e.message };
        }
      }
    };

    // Add diagnostic button to mobile overlay
    if (detectDevice().isMobile) {
      const diagButton = document.createElement('button');
      diagButton.textContent = 'Auth Test';
      diagButton.style.cssText = `
        position: fixed;
        bottom: 5px;
        left: 5px;
        background: rgba(0,0,0,0.7);
        color: orange;
        border: 1px solid orange;
        border-radius: 5px;
        padding: 5px 10px;
        font-size: 12px;
        z-index: 9999999;
      `;

      diagButton.addEventListener('click', () => {
        // Run diagnostics when clicked
        window.aolfWidgetDiagnostics.checkTokens();

        // Ask user if they want to test message format
        if (confirm('Test iOS message format?')) {
          window.aolfWidgetDiagnostics.testIOSMessageFormat();
        }

        // Ask if they want to reload the widget
        if (confirm('Reload auth widget?')) {
          window.aolfWidgetDiagnostics.reloadAuthWidget();
        }
      });

      // Add to document when body is ready
      if (document.body) {
        document.body.appendChild(diagButton);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(diagButton);
        });
      }
    }
  };

  // Initialize
  if (isDebug) {
    detectDevice();
    monitorPostMessages();
    addAuthDiagnosticTools();

    // Initialize after DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createDebugOverlay);
    } else {
      setTimeout(createDebugOverlay, 500);
    }

    logger.info('Debug helper initialized');
    console.log('%c AOLF Widget Debugger Active ', 'background: #222; color: lime; font-size: 14px;');
  }
})();
