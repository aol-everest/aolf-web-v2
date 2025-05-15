# Central Auth Service with API

## Overview

The Central Auth Service with API approach is a robust solution for cross-domain authentication across AOLF web applications. This architecture solves the challenges related to sharing authentication state across different domains, particularly addressing browser limitations with localStorage in iframes on iOS Safari.

## Architecture

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│              │     │               │     │              │
│  App1.aolf   │◄────┤  auth.aolf    │────►│  App2.aolf   │
│  (React App) │     │  (Auth API)   │     │  (React App) │
│              │     │               │     │              │
└──────────────┘     └───────────────┘     └──────────────┘
        ▲                    ▲                    ▲
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                     ┌───────────────┐
                     │               │
                     │  AWS Cognito  │
                     │               │
                     └───────────────┘
```

### Core Components

1. **Centralized Auth Service**

   - A dedicated authentication microservice
   - Deployed on its own subdomain (e.g., `auth.aolf.com`)
   - Acts as the single source of truth for authentication state
   - Manages communication with AWS Cognito

2. **Authentication API**

   - RESTful endpoints for all authentication operations
   - Secured with HTTPS and proper CORS configuration
   - Handles token management and validation
   - Provides consistent user identity across applications

3. **Session Management**
   - Server-side session storage (Redis, DynamoDB, etc.)
   - HTTP-only cookies for secure session tracking
   - Domain-level cookies (`.aolf.com`) for cross-subdomain access

## Authentication Flow

### Initial Login

1. User navigates to any AOLF application (App1 or App2)
2. Application checks for authentication by calling auth service
3. If unauthenticated, redirects to `auth.aolf.com/login`
4. User authenticates with credentials
5. Auth service:
   - Authenticates with AWS Cognito
   - Receives and securely stores tokens
   - Sets HTTP-only, secure cookies on `.aolf.com` domain
   - Redirects back to the original application

### Cross-Application Navigation

1. User is authenticated in App1
2. User navigates to App2 (different domain/subdomain)
3. App2 calls `auth.aolf.com/validate` with cookies included
4. Auth service validates session and returns user context
5. App2 initializes with authenticated state
6. No re-login required

### Token Refresh

1. Auth service manages token expiration internally
2. Applications don't need to handle token refresh logic
3. Auth service proactively refreshes tokens with Cognito
4. All applications benefit from refreshed session automatically

## API Endpoints

The auth service exposes these primary endpoints:

```
POST /login           - Authenticates user with credentials
POST /refresh         - Refreshes tokens before expiration
GET  /validate        - Validates current session and returns user context
POST /logout          - Terminates session and clears cookies
GET  /user            - Returns current user profile information
```

## Client Implementation

### React Authentication Hook

```typescript
// useAuth.ts
import { useState, useEffect } from 'react';

const AUTH_API = 'https://auth.aolf.com';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on component mount
  useEffect(() => {
    validateSession();
  }, []);

  // Check if user is authenticated
  const validateSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${AUTH_API}/validate`, {
        method: 'GET',
        credentials: 'include', // Ensures cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setUser(null);
    } catch (err) {
      setError(err);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    validateSession,
  };
}
```

### Auth Provider Component

```typescript
// AuthProvider.tsx
import React, { createContext, useContext } from 'react';
import { useAuth } from './useAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for child components to get auth object
export const useAuthContext = () => useContext(AuthContext);
```

## Backend Implementation

### Express.js Auth Service Example

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {
  CognitoIdentityProvider,
} = require('@aws-sdk/client-cognito-identity-provider');

const app = express();
const cognito = new CognitoIdentityProvider({ region: 'us-east-1' });

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [/\.aolf\.com$/], // Allow all subdomains
    credentials: true,
  }),
);

// Cognito configuration
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// Session storage (in-memory for example, use Redis/DynamoDB in production)
const sessions = {};

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const authResult = await cognito.initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const sessionId = generateSessionId();
    sessions[sessionId] = {
      accessToken: authResult.AuthenticationResult.AccessToken,
      refreshToken: authResult.AuthenticationResult.RefreshToken,
      idToken: authResult.AuthenticationResult.IdToken,
      expiresAt: Date.now() + authResult.AuthenticationResult.ExpiresIn * 1000,
    };

    // Set HTTP-only cookie with session ID
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: '.aolf.com',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Get user info from Cognito
    const userInfo = await getUserInfo(
      authResult.AuthenticationResult.AccessToken,
    );

    res.json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
});

// Validate session endpoint
app.get('/validate', async (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId || !sessions[sessionId]) {
    return res.status(401).json({ authenticated: false });
  }

  const session = sessions[sessionId];

  // Check if token is expired or about to expire
  if (session.expiresAt <= Date.now() + 5 * 60 * 1000) {
    try {
      // Refresh the token
      const refreshResult = await refreshTokens(session.refreshToken);

      // Update session with new tokens
      sessions[sessionId] = {
        ...session,
        accessToken: refreshResult.AuthenticationResult.AccessToken,
        idToken: refreshResult.AuthenticationResult.IdToken,
        expiresAt:
          Date.now() + refreshResult.AuthenticationResult.ExpiresIn * 1000,
      };
    } catch (error) {
      // If refresh fails, invalidate session
      delete sessions[sessionId];
      res.clearCookie('sessionId');
      return res.status(401).json({ authenticated: false });
    }
  }

  // Get user info from Cognito
  try {
    const userInfo = await getUserInfo(sessions[sessionId].accessToken);
    return res.json({
      authenticated: true,
      user: userInfo,
    });
  } catch (error) {
    delete sessions[sessionId];
    res.clearCookie('sessionId');
    return res.status(401).json({ authenticated: false });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
  }

  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    domain: '.aolf.com',
  });

  res.json({ success: true });
});

// Helper functions
async function getUserInfo(accessToken) {
  const result = await cognito.getUser({
    AccessToken: accessToken,
  });

  // Format user attributes into a user object
  const user = {
    username: result.Username,
    attributes: {},
  };

  result.UserAttributes.forEach((attr) => {
    user.attributes[attr.Name] = attr.Value;
  });

  return user;
}

async function refreshTokens(refreshToken) {
  return await cognito.initiateAuth({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  });
}

function generateSessionId() {
  return require('crypto').randomBytes(64).toString('hex');
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
```

## Benefits

### Security

1. **Token Protection**

   - Access tokens never exposed to client-side JavaScript
   - HTTP-only cookies prevent XSS attacks
   - Server-side token management reduces leak risk

2. **CSRF Protection**

   - Implement with CSRF tokens for state-changing operations
   - SameSite cookie attributes limit cross-site requests

3. **Fine-grained Access Control**
   - Centralized authorization decisions
   - Consistent permission enforcement across apps

### User Experience

1. **Seamless Cross-App Navigation**

   - No re-authentication when moving between applications
   - Single logout affects all applications
   - Consistent user state across the ecosystem

2. **Resilience**
   - No localStorage corruption issues
   - Works reliably across all browsers, including iOS Safari
   - No iframe communication limitations

### Development

1. **Simplified Client Code**

   - Applications don't need token management logic
   - Consistent auth implementation across all apps
   - Clean separation of concerns

2. **Centralized Authentication Logic**

   - Auth fixes and updates deployed in one place
   - Easier to upgrade security practices
   - Simplified compliance management

3. **Scalability**
   - New applications can easily integrate
   - Auth service can be scaled independently
   - Consistent user experience as ecosystem grows

## Implementation Considerations

### Deployment

1. **Infrastructure**

   - Deploy as containerized service (Docker/Kubernetes)
   - Consider serverless options (AWS Lambda + API Gateway)
   - Ensure high availability with load balancing

2. **Session Storage**
   - Use Redis or DynamoDB for distributed session storage
   - Implement proper session cleanup/expiration
   - Consider session replication for reliability

### Security Hardening

1. **Rate Limiting**

   - Implement IP-based rate limiting for login attempts
   - Add request throttling to prevent brute force attacks

2. **Monitoring**

   - Log authentication events
   - Set up alerts for suspicious activities
   - Monitor token usage patterns

3. **HTTPS**
   - Enforce HTTPS for all communication
   - Implement proper certificate management
   - Consider HSTS headers

### CORS Configuration

```javascript
// Example CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from all AOLF subdomains
      if (!origin || /\.aolf\.com$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  }),
);
```

## Migration Path

1. **Build Auth Service**

   - Develop and deploy the central auth service
   - Implement Cognito integration
   - Test thoroughly with security reviews

2. **Update Client Applications**

   - Create new auth hooks/providers for React apps
   - Implement dual-mode during transition
   - Test cross-domain flows

3. **Gradual Rollout**

   - Deploy to staging environment first
   - Roll out to subset of production users
   - Monitor for issues and performance

4. **Full Transition**
   - Switch all applications to new auth service
   - Remove legacy authentication code
   - Continue monitoring for issues

## Conclusion

The Central Auth Service with API approach provides a robust, secure, and scalable solution for cross-domain authentication in the AOLF ecosystem. By centralizing authentication logic and leveraging HTTP-only cookies for session management, this architecture eliminates browser inconsistencies and localStorage limitations while improving overall security posture.
