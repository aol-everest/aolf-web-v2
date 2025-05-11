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
  // Only run in development or when debug parameter is present
  const isDebugMode =
    window.location.search.includes('debug=true') ||
    window.location.search.includes('debug=widget') ||
    window.localStorage.getItem('aolf-widget-debug') === 'true' ||
    window.location.hostname.includes('localhost') ||
    window.location.hostname.includes('.local');

  if (!isDebugMode) {
    console.log('[AOLF Widget] Debug mode disabled. Add ?debug=true to URL or set localStorage.setItem("aolf-widget-debug", "true") to enable');
    return;
  }

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
    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod|iOS|CriOS/.test(userAgent) ||
                (/Safari/.test(userAgent) && /Apple/.test(navigator.vendor));
    const isChrome = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isEdge = /Edge|Edg/.test(userAgent);

    return {
      userAgent,
      isIOS,
      isChrome,
      isSafari,
      isFirefox,
      isEdge,
      isMobile: /Mobi|Android/i.test(userAgent),
      preferredFormat: isIOS ? 'string' : 'object'
    };
  };

  const deviceDetails = detectDevice();
  logger.info('Device detected:', deviceDetails);

  // Helper function to clean objects for postMessage
  function deepCleanForPostMessage(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    // For arrays
    if (Array.isArray(obj)) {
      return obj.map(item => deepCleanForPostMessage(item));
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

  // Parse message data if it's a string
  function parseMessageData(data) {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        // Return original if not valid JSON
        return { type: 'unknown', originalData: data.substring(0, 100) + '...' };
      }
    }
    return data || { type: 'empty' };
  }

  // Get color for message type
  function getMessageColor(msgType) {
    const colors = {
      'auth-profile': '#0066cc',
      'auth-widget-data-updated': '#9933cc',
      'get-auth-profile': '#cc3300',
      'auth-widget-ping': '#009900',
      'auth-widget-pong': '#33cc33',
      'auth-widget-ready': '#ff9900',
      'empty': '#999999',
      'unknown': '#cc6600'
    };
    return colors[msgType] || colors.unknown;
  }

  // Format message display
  function formatMessageDisplay(event) {
    let data = parseMessageData(event.data);
    let msgType = data?.type || 'unknown';
    let msgColor = getMessageColor(msgType);

    // Build HTML based on message type
    let html = `
      <div style="color:${msgColor};font-weight:bold;">${msgType}</div>
      <div style="margin-left:10px;">Origin: ${event.origin}</div>
      <div style="margin-left:10px;">Format: ${typeof event.data === 'string' ? 'String JSON' : 'Object'}</div>
    `;

    // Add message-specific details
    if (msgType === 'auth-profile' || msgType === 'auth-widget-data-updated') {
      html += `
        <div style="margin-left:10px;">Auth: ${data.data?.isAuthenticated ? '✓' : '✗'}</div>
        <div style="margin-left:10px;">Menu items: ${data.data?.exploreMenu?.length || 0}</div>
        <div style="margin-left:10px;">Profile: ${data.data?.profile ? '✓' : '✗'}</div>
        <div style="margin-left:10px;">Profile name: ${
          data.data?.profile ?
          ((data.data.profile.first_name || data.data.profile.firstName || '') + ' ' +
           (data.data.profile.last_name || data.data.profile.lastName || '')).trim() :
          'N/A'
        }</div>
        <div style="margin-left:10px;">Tokens: ${data.data?.tokens ? '✓' : '✗'}</div>
      `;
    } else if (msgType === 'auth-widget-ping') {
      html += `<div style="margin-left:10px;">Source: ${data.source || 'unknown'}</div>`;
    } else if (msgType === 'auth-widget-pong') {
      html += `<div style="margin-left:10px;">Timestamp: ${data.timestamp || 'unknown'}</div>`;
    } else if (msgType === 'auth-widget-ready') {
      html += `
        <div style="margin-left:10px;">Widget Ready</div>
        <div style="margin-left:10px;">Timestamp: ${data.timestamp || 'unknown'}</div>
      `;
    } else if (msgType === 'get-auth-profile') {
      html += `<div style="margin-left:10px;">Auth Request</div>`;
    } else if (msgType === 'unknown') {
      html += `<div style="margin-left:10px;color:#cc0000;">Unparseable message</div>`;
      if (data.originalData) {
        html += `<div style="margin-left:10px;font-size:9px;overflow:hidden;text-overflow:ellipsis;">${data.originalData}</div>`;
      }
    }

    // Add timestamp
    html += `<div style="color:#666;font-size:10px;">${new Date().toISOString()}</div>`;

    return html;
  }

  // Create a small widget to display logs visually
  function createDebugWidget() {
    const widget = document.createElement('div');
    widget.style.cssText = 'position:fixed;bottom:0;right:0;background:#f0f0f0;border:1px solid #ccc;padding:10px;max-width:350px;max-height:400px;overflow:auto;z-index:10000;font-family:monospace;font-size:12px;';
    widget.innerHTML = `
      <div style="border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:5px;font-weight:bold;">
        AOLF Widget Debug
        <button id="ping-widget" style="float:right;padding:0 5px;margin-right:5px;background:#090;color:white;font-size:10px;">Ping</button>
        <button id="refresh-auth" style="float:right;padding:0 5px;margin-right:5px;background:#009;color:white;font-size:10px;">Get Auth</button>
        <button id="clear-debug" style="float:right;padding:0 5px;">Clear</button>
        <button id="close-debug" style="float:right;padding:0 5px;margin-right:5px;">X</button>
      </div>
      <div id="device-info" style="background:#305;color:#fff;padding:5px;margin-bottom:5px;font-size:10px;"></div>
      <div id="debug-log" style=""></div>
    `;
    document.body.appendChild(widget);

    // Add device information to help with debugging
    const deviceInfoElement = document.getElementById('device-info');
    if (deviceInfoElement) {
      deviceInfoElement.innerHTML = `
        <div>Device: ${deviceDetails.isIOS ? '📱 iOS' : deviceDetails.isMobile ? '📱 Mobile' : '🖥️ Desktop'}</div>
        <div>Browser: ${
          deviceDetails.isChrome ? 'Chrome' :
          deviceDetails.isSafari ? 'Safari' :
          deviceDetails.isFirefox ? 'Firefox' :
          deviceDetails.isEdge ? 'Edge' : 'Other'
        }</div>
        <div>PostMessage Mode: ${deviceDetails.isIOS ? '📝 String JSON' : '🔄 Object'}</div>
        <div style="font-size:8px;overflow:hidden;text-overflow:ellipsis;">${deviceDetails.userAgent.substring(0, 70)}...</div>
      `;
    }

    // Add event handlers
    document.getElementById('clear-debug').addEventListener('click', function() {
      document.getElementById('debug-log').innerHTML = '';
    });
    document.getElementById('close-debug').addEventListener('click', function() {
      widget.style.display = 'none';
    });
    document.getElementById('ping-widget').addEventListener('click', function() {
      if (window.aolfDebugCommands && window.aolfDebugCommands.pingWidget) {
        window.aolfDebugCommands.pingWidget();
      }
    });
    document.getElementById('refresh-auth').addEventListener('click', function() {
      if (window.aolfDebugCommands && window.aolfDebugCommands.requestAuthProfile) {
        window.aolfDebugCommands.requestAuthProfile();
      }
    });

    // Expose a function to show the widget again
    window.showAolfDebug = function() {
      widget.style.display = 'block';
    };

    // Add messages to the debug widget
    window.addEventListener('message', function(event) {
      const logDiv = document.getElementById('debug-log');
      const msgDiv = document.createElement('div');
      msgDiv.style.borderBottom = '1px dotted #ccc';
      msgDiv.style.marginBottom = '5px';
      msgDiv.style.paddingBottom = '5px';

      // Format the message
      msgDiv.innerHTML = formatMessageDisplay(event);

      // Add to top of log
      logDiv.prepend(msgDiv);

      // Limit log size
      if (logDiv.children.length > 100) {
        logDiv.removeChild(logDiv.lastChild);
      }
    });

    return widget;
  }

  // Intercept and log all postMessage events with enhanced serialization
  const originalPostMessage = window.postMessage;
  const originalAddEventListener = window.addEventListener;

  // Safe message sender - automatically handles iOS compatibility
  function safePostMessage(window, message, targetOrigin) {
    // Always clean the message for serialization first
    const cleanMessage = deepCleanForPostMessage(message);

    try {
      // For iOS devices, always use stringified format
      if (deviceDetails.isIOS) {
        const messageStr = JSON.stringify(cleanMessage);
        window.postMessage(messageStr, targetOrigin);
        return true;
      } else {
        // Try object first, but be ready to fallback
        try {
          window.postMessage(cleanMessage, targetOrigin);
          return true;
        } catch (objErr) {
          // Fallback to string format
          const messageStr = JSON.stringify(cleanMessage);
          window.postMessage(messageStr, targetOrigin);
          return true;
        }
      }
    } catch (e) {
      logger.error('Failed to send message:', e);
      return false;
    }
  }

  // Intercept postMessage with enhanced serialization
  window.postMessage = function(message, targetOrigin, transfer) {
    try {
      // Try to parse the message if it's a string (to show in logs)
      const parsedMessage = parseMessageData(message);
      logger.log('postMessage sent:', parsedMessage, 'to', targetOrigin);

      // Proceed with the original call
      return originalPostMessage.call(this, message, targetOrigin, transfer);
    } catch (e) {
      logger.error('Error in postMessage intercept:', e);
      // Try to continue with original call on error
      return originalPostMessage.call(this, message, targetOrigin, transfer);
    }
  };

  // Intercept addEventListener for message events
  window.addEventListener = function(type, listener, options) {
    if (type === 'message') {
      const wrappedListener = function(event) {
        try {
          const parsedData = parseMessageData(event.data);
          logger.log('postMessage received:', parsedData, 'from', event.origin);
          return listener.call(this, event);
        } catch (e) {
          logger.error('Error in message listener wrapper:', e);
          // Still try to call the original listener
          return listener.call(this, event);
        }
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Add commands to manually test integration
  window.aolfDebugCommands = {
    pingWidget: function() {
      const iframe = document.getElementById('auth-profile-iframe');
      if (iframe && iframe.contentWindow) {
        const message = { type: 'auth-widget-ping', source: 'debug-command' };
        const target = iframe.src.split('/').slice(0, 3).join('/');

        safePostMessage(iframe.contentWindow, message, target);
        logger.info('Sent ping to widget');
        return true;
      }
      logger.error('Auth iframe not found');
      return false;
    },

    requestAuthProfile: function() {
      const iframe = document.getElementById('auth-profile-iframe');
      if (iframe && iframe.contentWindow) {
        const message = { type: 'get-auth-profile' };
        const target = iframe.src.split('/').slice(0, 3).join('/');

        safePostMessage(iframe.contentWindow, message, target);
        logger.info('Sent auth profile request to widget');
        return true;
      }
      logger.error('Auth iframe not found');
      return false;
    },

    showDeviceInfo: function() {
      return deviceDetails;
    },

    fixCrossOriginIssue: function() {
      const iframe = document.getElementById('auth-profile-iframe');
      if (!iframe) {
        logger.error('Auth iframe not found');
        return false;
      }

      // Extract the target origin from iframe src
      const targetOrigin = iframe.src.split('/').slice(0, 3).join('/');

      // Override the postMessage method specifically for this iframe
      if (iframe.contentWindow) {
        try {
          // Create a test message to verify communication
          const testMsg = { type: 'communication-test', timestamp: new Date().toISOString() };

          // Send it both ways to test which works
          try {
            // Method 1: As object (works on most browsers)
            iframe.contentWindow.postMessage(testMsg, targetOrigin);
            logger.info('Sent test as object');

            // Method 2: As string (works better on iOS)
            iframe.contentWindow.postMessage(JSON.stringify(testMsg), targetOrigin);
            logger.info('Sent test as string');
          } catch (e) {
            logger.error('Test message failed:', e);
          }

          return true;
        } catch (e) {
          logger.error('Failed to setup cross-origin fix:', e);
          return false;
        }
      }

      return false;
    }
  };

  // Monitor iframe creation
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.tagName === 'IFRAME') {
          logger.log('New iframe detected:', node.id || 'unnamed', 'src:', node.src);

          // Check if this is likely our auth widget iframe
          if (node.id === 'auth-profile-iframe' || (node.src && node.src.includes('/widget/auth-profile'))) {
            logger.info('Auth profile iframe detected');

            // Monitor iframe load event
            node.addEventListener('load', () => {
              logger.info('Auth profile iframe loaded');

              // Automatically request auth profile after a short delay
              setTimeout(() => {
                if (window.aolfDebugCommands && window.aolfDebugCommands.requestAuthProfile) {
                  window.aolfDebugCommands.requestAuthProfile();
                }
              }, 500);
            });
          }
        }
      });
    });
  });

  // Start observing the document
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Create visual debug widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createDebugWidget);
  } else {
    createDebugWidget();
  }

  // Add a direct command to expose all debug functions in console
  window.showAolfDebugCommands = function() {
    console.log('Available debug commands:', Object.keys(window.aolfDebugCommands));
    console.log('Run any command with: window.aolfDebugCommands.commandName()');
    return window.aolfDebugCommands;
  };

  logger.info('Debug helper initialized');
  console.log('%c AOLF Widget Debugger Active ', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');
})();
