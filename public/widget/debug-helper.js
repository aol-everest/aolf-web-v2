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

  // Create a small widget to display logs visually
  function createDebugWidget() {
    const widget = document.createElement('div');
    widget.style.cssText = 'position:fixed;bottom:0;right:0;background:#f0f0f0;border:1px solid #ccc;padding:10px;max-width:300px;max-height:300px;overflow:auto;z-index:10000;font-family:monospace;font-size:12px;';
    widget.innerHTML = `
      <div style="border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:5px;font-weight:bold;">
        AOLF Widget Debug
        <button id="clear-debug" style="float:right;padding:0 5px;">Clear</button>
        <button id="close-debug" style="float:right;padding:0 5px;margin-right:5px;">X</button>
      </div>
      <div id="debug-log" style=""></div>
    `;
    document.body.appendChild(widget);

    // Add event handlers
    document.getElementById('clear-debug').addEventListener('click', function() {
      document.getElementById('debug-log').innerHTML = '';
    });
    document.getElementById('close-debug').addEventListener('click', function() {
      widget.style.display = 'none';
    });

    // Add messages to the debug widget
    window.addEventListener('message', function(event) {
      const logDiv = document.getElementById('debug-log');
      const msgDiv = document.createElement('div');
      msgDiv.style.borderBottom = '1px dotted #ccc';
      msgDiv.style.marginBottom = '5px';
      msgDiv.style.paddingBottom = '5px';

      // Format message by type
      if (event.data?.type === 'auth-profile') {
        msgDiv.innerHTML = `
          <div style="color:#0066cc;font-weight:bold;">${event.data.type}</div>
          <div style="margin-left:10px;">Origin: ${event.origin}</div>
          <div style="margin-left:10px;">Auth: ${event.data.data.isAuthenticated ? '✓' : '✗'}</div>
          <div style="margin-left:10px;">Menu items: ${event.data.data.exploreMenu?.length || 0}</div>
          <div style="margin-left:10px;">Profile: ${event.data.data.profile ? '✓' : '✗'}</div>
          <div style="color:#666;font-size:10px;">${new Date().toISOString()}</div>
        `;
      } else {
        msgDiv.innerHTML = `
          <div style="color:#cc6600;font-weight:bold;">${event.data?.type || 'unknown'}</div>
          <div style="margin-left:10px;">Origin: ${event.origin}</div>
          <div style="color:#666;font-size:10px;">${new Date().toISOString()}</div>
        `;
      }

      logDiv.prepend(msgDiv);
    });

    return widget;
  }

  // Intercept and log all postMessage events
  const originalPostMessage = window.postMessage;
  const originalAddEventListener = window.addEventListener;

  // Intercept postMessage
  window.postMessage = function(message, targetOrigin, transfer) {
    logger.log('postMessage sent:', message, 'to', targetOrigin);
    return originalPostMessage.call(this, message, targetOrigin, transfer);
  };

  // Intercept addEventListener for message events
  window.addEventListener = function(type, listener, options) {
    if (type === 'message') {
      const wrappedListener = function(event) {
        logger.log('postMessage received:', event.data, 'from', event.origin);
        return listener.call(this, event);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Monitor iframe creation
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.tagName === 'IFRAME') {
          logger.log('New iframe detected:', node.id || 'unnamed', 'src:', node.src);

          // Check if this is likely our auth widget iframe
          if (node.id === 'auth-profile-iframe' || node.src.includes('/widget/auth-profile')) {
            logger.info('Auth profile iframe detected');

            // Monitor iframe load event
            node.addEventListener('load', () => {
              logger.info('Auth profile iframe loaded');
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

  logger.info('Debug helper initialized');
  console.log('%c AOLF Widget Debugger Active ', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');
})();
