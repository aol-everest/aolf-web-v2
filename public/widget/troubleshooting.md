# Auth Widget Troubleshooting Guide

This document provides solutions to common issues with the authentication widget communication.

## Common Issues

### 1. Widget not receiving messages

**Symptoms:**
- No response after sending a postMessage
- Logs show message events aren't being received

**Potential Causes & Solutions:**

a) **Origin mismatch**
   - The widget only accepts messages from `*.artofliving.org` domains
   - Check the sending domain matches this pattern
   - In development, you may need to use a local domain like `local.artofliving.org`

b) **Iframe not loaded**
   - Make sure to send the message after the iframe is fully loaded
   - Use the iframe's `onload` event before sending messages:
     ```js
     iframe.onload = () => {
       iframe.contentWindow.postMessage({ type: 'get-auth-profile' }, targetOrigin);
     };
     ```

c) **Cross-domain restrictions**
   - Both domains must use HTTPS (except for localhost)
   - Check browser console for security errors
   - Make sure to specify the exact target origin when sending messages

d) **User not authenticated**
   - The widget will still respond, but with `isAuthenticated: false`
   - Check the response data to confirm authentication status

### 2. Widget loads but returns empty menu

**Symptoms:**
- Authentication works correctly
- Profile data is returned
- Menu items array is empty

**Potential Causes & Solutions:**

a) **API failure**
   - Check for API errors in the widget logs
   - Ensure the user has permissions to access the menu data
   - Verify the API endpoint is accessible and returns data

b) **Token expiration**
   - The access token may have expired
   - Try refreshing the page or logging in again

### 3. Multiple postMessage listeners

**Symptoms:**
- Logs show multiple "Setting up listener" messages
- Listeners are frequently added and removed

**Solutions:**
- Update to the latest widget version (fixed in v2.1.0+)
- Use the debug helper script to monitor message flow
- Ensure your app doesn't create multiple iframe instances

## Debugging Tools

### Using the Debug Helper

Add the debug helper script to your application:

```html
<script src="https://YOUR-SUBDOMAIN.artofliving.org/widget/debug-helper.js"></script>
```

This will:
1. Add a visual debug panel
2. Log all postMessage communication
3. Help troubleshoot cross-domain issues

### Enabling Advanced Logging

Add `?debug=true` to your URL or set the localStorage flag:

```js
localStorage.setItem("aolf-widget-debug", "true");
```

### Reading Widget Logs

The widget logs with the prefix `[Auth Widget]` and includes:
- Authentication status changes
- API requests and responses
- Message events and data
- Error information

## Browser Compatibility

The widget relies on the `postMessage` API which is supported in:
- Chrome 74+
- Firefox 78+
- Safari 12.1+
- Edge 79+

For older browsers, you may need a polyfill or fallback approach.

## Still Having Issues?

If the troubleshooting steps above don't resolve your issue:
1. Enable the debug helper and collect all logs
2. Check browser network tab for API errors
3. Verify both domains are properly configured with HTTPS
4. Contact support with the collected information 
