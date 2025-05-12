/**
 * AOLF Auth Widget Debug Helper
 * A lightweight debugging tool for auth widget communication
 * Enhanced for iOS compatibility
 */

(function() {
  // Create simple logger
  const logger = {
    prefix: '[Debug]',
    log: (...args) => console.log(logger.prefix, ...args),
    info: (...args) => console.info(logger.prefix, ...args),
    warn: (...args) => console.warn(logger.prefix, ...args),
    error: (...args) => console.error(logger.prefix, ...args)
  };

  // Device detection with better iOS detection
  function detectDevice() {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod|iOS|CriOS/.test(ua) ||
                  (/Safari/.test(ua) && /Apple/.test(navigator.vendor) && !/Chrome|Android/.test(ua)) ||
                  (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

    const browser =
      /Chrome/.test(ua) && !/Edge|Edg/.test(ua) ? 'Chrome' :
      /Safari/.test(ua) && !/Chrome|Android/.test(ua) ? 'Safari' :
      /Firefox/.test(ua) ? 'Firefox' :
      /Edge|Edg/.test(ua) ? 'Edge' : 'Other';

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua);
    const isIOSSafari = isIOS && /Safari/.test(ua) && !/Chrome|CriOS/.test(ua);
    const iosVersion = isIOS ? (ua.match(/OS (\d+)_(\d+)_?(\d+)?/) || ['']).slice(1).join('.') : 'N/A';

    logger.info(`Device: ${isIOS ? 'iOS' : isMobile ? 'Mobile' : 'Desktop'}, Browser: ${browser}${isIOS ? `, iOS Version: ${iosVersion}` : ''}`);

    return {
      isIOS,
      isMobile,
      browser,
      ua,
      isIOSSafari,
      iosVersion,
      isKnownProblematicIOS: isIOS && parseFloat(iosVersion) < 15
    };
  }

  // Track postMessage communication with additional details
  function monitorMessages() {
    window.addEventListener('message', (event) => {
      try {
        const device = detectDevice();
        const isMessageObject = typeof event.data === 'object';
        const source = event.source === window.parent ? 'PARENT' :
                       event.source === window ? 'SELF' : 'OTHER';

        let dataPreview = '';
        if (typeof event.data === 'string') {
          dataPreview = event.data.substring(0, 100) + (event.data.length > 100 ? '...' : '');
        } else if (isMessageObject) {
          try {
            dataPreview = JSON.stringify(event.data).substring(0, 100) + '...';
          } catch (e) {
            dataPreview = '[Complex Object]';
          }
        }

        logger.log(`📨 Message from: ${source} (${event.origin}), Data: ${dataPreview}`);

        if (device.isIOS && window.debugLogMessageDetails && isMessageObject) {
          console.group('iOS Message Details');
          try {
            console.log('Full message data:', event.data);
            console.log('Origin:', event.origin);
            console.log('Source:', source);
          } catch (err) {
            console.log('Error logging full details:', err);
          }
          console.groupEnd();
        }
      } catch (e) {
        // Ignore errors
      }
    });
  }

  // Create debug overlay with iOS-specific information
  function createDebugOverlay() {
    const device = detectDevice();

    // Create overlay container with better iOS styling
    const overlay = document.createElement('div');
    overlay.id = 'auth-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: ${device.isMobile ? '90%' : '380px'};
      background: rgba(0,0,0,0.85);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000000;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #00ff00;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      -webkit-overflow-scrolling: touch;
    `;

    // Create toggle button that's easier to tap on iOS
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Debug';
    toggleBtn.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #006600;
      color: white;
      border: none;
      border-radius: 4px;
      padding: ${device.isIOS ? '8px 16px' : '5px 10px'};
      font-size: ${device.isIOS ? '16px' : '12px'};
      cursor: pointer;
      z-index: 10000001;
      min-width: ${device.isIOS ? '60px' : 'auto'};
      min-height: ${device.isIOS ? '40px' : 'auto'};
      touch-action: manipulation;
    `;

    // Create header with enhanced device info for iOS
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom: 10px; padding: 5px; background: #333;';
    header.innerHTML = `
      <div><strong>Device:</strong> ${device.isIOS ? 'iOS' : device.isMobile ? 'Mobile' : 'Desktop'}</div>
      <div><strong>Browser:</strong> ${device.browser}</div>
      ${device.isIOS ? `<div><strong>iOS:</strong> ${device.iosVersion}</div>` : ''}
      <div><strong>PostRobot:</strong> ${window.postRobot ? '✅' : '❌'}</div>
    `;

    // Create log container
    const logContainer = document.createElement('div');
    logContainer.id = 'debug-log-container';

    // Add buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 5px; margin-top: 5px;';

    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = 'background:#600; color:white; border:none; padding:3px 8px; cursor:pointer; font-size:11px; flex: 1;';
    clearBtn.onclick = () => {
      logContainer.innerHTML = '';
    };

    // Add reload iframe button
    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = 'Reload Auth';
    reloadBtn.style.cssText = 'background:#060; color:white; border:none; padding:3px 8px; cursor:pointer; font-size:11px; flex: 1;';
    reloadBtn.onclick = () => {
      if (window.reloadAuthFrame) {
        window.reloadAuthFrame();
      } else {
        const iframe = document.getElementById('auth-profile-iframe');
        if (iframe) {
          const src = iframe.src;
          iframe.src = 'about:blank';
          setTimeout(() => {
            iframe.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
            logger.info('Auth iframe reloaded');
          }, 100);
        } else {
          logger.error('Auth iframe not found');
        }
      }
    };

    // iOS specific debug button
    if (device.isIOS) {
      const iosDebugBtn = document.createElement('button');
      iosDebugBtn.textContent = 'iOS Debug';
      iosDebugBtn.style.cssText = 'background:#336; color:white; border:none; padding:3px 8px; cursor:pointer; font-size:11px; flex: 1;';
      iosDebugBtn.onclick = () => {
        window.debugLogMessageDetails = !window.debugLogMessageDetails;
        iosDebugBtn.style.background = window.debugLogMessageDetails ? '#339' : '#336';
        logger.info('iOS detailed message logging ' + (window.debugLogMessageDetails ? 'enabled' : 'disabled'));

        // Force check iframe communication
        checkIframeComm();
      };
      buttonContainer.appendChild(iosDebugBtn);
    }

    // Assemble overlay
    buttonContainer.appendChild(clearBtn);
    buttonContainer.appendChild(reloadBtn);
    header.appendChild(buttonContainer);
    overlay.appendChild(header);
    overlay.appendChild(logContainer);

    // Toggle functionality
    toggleBtn.addEventListener('click', () => {
      overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    });

    // Add to document
    document.body.appendChild(toggleBtn);
    document.body.appendChild(overlay);

    // Start with overlay hidden on desktop, visible on mobile
    overlay.style.display = device.isMobile ? 'block' : 'none';

    // Override console to capture logs
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    };

    // Function to add log entry to overlay
    function addLogEntry(type, args) {
      if (!logContainer) return;

      const entry = document.createElement('div');
      entry.style.borderBottom = '1px solid #333';
      entry.style.padding = '3px 0';
      entry.style.fontSize = '11px';
      entry.style.color =
        type === 'error' ? '#ff6666' :
        type === 'warn' ? '#ffcc00' :
        type === 'info' ? '#66ccff' : '#ffffff';

      const time = new Date().toTimeString().split(' ')[0];
      const argsText = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      entry.textContent = `[${time}] ${type.toUpperCase()}: ${argsText}`;
      logContainer.insertBefore(entry, logContainer.firstChild);

      // Limit entries
      if (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
      }
    }

    // Override console methods
    console.log = function() {
      addLogEntry('log', Array.from(arguments));
      originalConsole.log.apply(console, arguments);
    };

    console.info = function() {
      addLogEntry('info', Array.from(arguments));
      originalConsole.info.apply(console, arguments);
    };

    console.warn = function() {
      addLogEntry('warn', Array.from(arguments));
      originalConsole.warn.apply(console, arguments);
    };

    console.error = function() {
      addLogEntry('error', Array.from(arguments));
      originalConsole.error.apply(console, arguments);
    };

    return { overlay, toggleBtn, logContainer };
  }

  // Check iframe communication health
  function checkIframeComm() {
    const iframe = document.getElementById('auth-profile-iframe');
    if (!iframe || !iframe.contentWindow) {
      logger.error('Auth iframe not available for communication check');
      return;
    }

    try {
      logger.info('Testing communication with auth iframe...');

      if (!window.postRobot) {
        logger.error('PostRobot not available for communication test');
        return;
      }

      window.postRobot
        .send(iframe.contentWindow, 'get-auth-profile')
        .then(event => {
          logger.info('✅ Communication test successful!');
          logger.info(`Auth state: ${event.data.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
        })
        .catch(err => {
          logger.error('❌ Communication test failed:', err.message || err);
        });
    } catch (err) {
      logger.error('❌ Error running communication test:', err.message || err);
    }
  }

  // Global function to show debugger
  window.showAuthDebugger = function() {
    createDebugOverlay();
    logger.info('Debug overlay manually activated');
  };

  // Helper for reloading the auth iframe with iOS optimizations
  window.reloadAuthFrame = function() {
    const iframe = document.getElementById('auth-profile-iframe');
    if (iframe) {
      const device = detectDevice();
      const src = iframe.src;

      logger.info('Reloading auth iframe...');

      // Different reload approach for iOS
      if (device.isIOS) {
        // On iOS we do a complete removal and recreation of the iframe
        const parent = iframe.parentNode;
        if (parent) {
          // Create new iframe
          const newIframe = document.createElement('iframe');
          newIframe.id = 'auth-profile-iframe';

          // Copy attributes except src
          Array.from(iframe.attributes).forEach(attr => {
            if (attr.name !== 'src') {
              newIframe.setAttribute(attr.name, attr.value);
            }
          });

          // Prepare new URL with timestamp
          const newSrc = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();

          // First remove old iframe
          parent.removeChild(iframe);

          // Wait a moment before adding new iframe
          setTimeout(() => {
            newIframe.src = newSrc;
            parent.appendChild(newIframe);
            logger.info('Auth iframe fully replaced with fresh one');
          }, 100);
        }
      } else {
        // Standard approach for other platforms
        iframe.src = 'about:blank';
        setTimeout(() => {
          iframe.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
          logger.info('Auth iframe reloaded');
        }, 100);
      }
      return true;
    }
    return false;
  };

  // Check auth state helper
  window.checkAuthState = function() {
    checkIframeComm();
  };

  // Initialize
  function init() {
    const device = detectDevice();
    monitorMessages();

    // Create overlay after a short delay
    setTimeout(() => {
      createDebugOverlay();
      logger.info('Debug helper initialized');

      // If iOS and not in an iframe, show a note about testing
      if (device.isIOS && window.self === window.top) {
        logger.info('iOS detected. For best results with the auth widget, test in an actual iframe context.');

        if (device.isKnownProblematicIOS) {
          logger.warn('Warning: This iOS version may have known issues with iframe communication.');
        }
      }
    }, 500);
  }

  // Start the debugger
  init();
})();
