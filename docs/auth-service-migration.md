# Authentication Service Migration Guide

## Current Authentication System

The current AOLF authentication system uses:

1. **AWS Cognito** for identity management
2. **Traditional username/password authentication** directly calling Cognito APIs
3. **Social login providers** (Google, Facebook) through Cognito Hosted UI
4. **Passwordless authentication** using FIDO2/WebAuthn (implemented with `amazon-cognito-passwordless-auth`)

## Migration to Central Auth Service

This document outlines how to migrate the current authentication system to the Central Auth Service with API, as described in `central-auth-service.md`.

### 1. Auth Service Components

#### Server-Side (Node.js/Express)

Create a new microservice with the following endpoints:

```
POST /login           - Traditional username/password authentication
POST /login/fido2     - FIDO2/WebAuthn passwordless authentication
GET  /login/fido2/challenge - Generate challenge for FIDO2 authentication
POST /login/social    - Handle OAuth redirects from social providers
POST /refresh         - Refresh tokens
GET  /validate        - Validate session
POST /logout          - End session
GET  /user            - Return user profile information
POST /register        - User registration
POST /password/reset  - Password reset request
POST /password/confirm - Confirm password reset
```

#### Client SDK (React)

Create a client SDK that provides hooks and components for React applications:

```
useAuth()             - Authentication hook
AuthProvider          - Context provider
FIDO2Manager          - FIDO2 credential management UI
PasswordlessButton    - FIDO2 authentication button
```

#### Auth Service Pages

In addition to the API endpoints, the Auth Service should include these key UI pages:

1. **Authentication Pages**

   - `/login` - Main login page that supports email/password, social login, and passwordless options
   - `/register` - User registration page
   - `/logout` - Logout confirmation page

2. **Password Management**

   - `/password/reset` - Request password reset form
   - `/password/new` - Set new password after reset

3. **FIDO2/WebAuthn Management**

   - `/passwordless/register` - Register new FIDO2 authenticator
   - `/passwordless/manage` - Manage existing authenticators

4. **Account Verification**

   - `/verify` - Email verification page
   - `/verify/success` - Verification success confirmation

5. **Developer Resources**
   - `/` - Landing page with service information
   - `/docs` - API documentation and usage examples

These pages ensure a consistent user experience across all applications and provide centralized management of authentication processes.

### 2. Passwordless Implementation

The current implementation uses the `amazon-cognito-passwordless-auth` library for FIDO2/WebAuthn support. The migration will require implementing this functionality in the Central Auth Service.

#### Server-Side Requirements

1. **FIDO2 Server Library**

   - Use `@simplewebauthn/server` for FIDO2/WebAuthn server implementation
   - Implement registration and authentication flows

2. **Challenge Generation**

   - Create endpoint to generate authentication challenges
   - Store challenges in server-side session

3. **Credential Storage**
   - Store FIDO2 credential IDs and public keys in database
   - Associate credentials with user accounts

#### Client-Side Integration

1. **FIDO2 Client Library**

   - Use `@simplewebauthn/browser` for client-side implementation
   - Replace current `amazon-cognito-passwordless-auth` implementation

2. **UI Components**
   - Migrate `Fido2Toast` and other UI components
   - Maintain existing UX patterns

### 3. Technical Stack: Next.js Full-Stack Solution

For the Auth Service implementation, we'll use Next.js to provide both the API backend and the client SDK frontend in a single unified project.

#### Advantages of Next.js for Auth Service

1. **Unified Codebase**

   - Single repository for both client SDK and server API
   - Shared TypeScript types between frontend and backend
   - Simplified deployment and maintenance
   - Consistent development experience

2. **API Routes**

   - Built-in API routes via `/pages/api/*` or newer `/app/api/*` (App Router)
   - Automatic route handling and middleware support
   - Easy integration with authentication patterns

3. **Edge Runtime**

   - Deploy APIs closer to users for reduced latency
   - Better performance for authentication operations
   - Suitable for global user distribution

4. **Frontend SDK Development**
   - Build React hooks and components in the same project
   - Package and distribute as npm module if needed
   - Support for SSR where appropriate

#### Project Structure

```
/auth-service
  /app (or /pages in Pages Router)
    /api
      /login
        route.ts                # POST /api/login
      /login/fido2
        route.ts                # POST /api/login/fido2
      /login/fido2/challenge
        route.ts                # GET /api/login/fido2/challenge
      /login/social
        route.ts                # POST /api/login/social
      /refresh
        route.ts                # POST /api/refresh
      /validate
        route.ts                # GET /api/validate
      /logout
        route.ts                # POST /api/logout
      /user
        route.ts                # GET /api/user
      /register
        route.ts                # POST /api/register
      /password
        /reset
          route.ts              # POST /api/password/reset
        /confirm
          route.ts              # POST /api/password/confirm

    # Auth UI Pages
    /login
      page.tsx                  # Login page
    /register
      page.tsx                  # Registration page
    /logout
      page.tsx                  # Logout confirmation page
    /password
      /reset
        page.tsx                # Request password reset
      /new
        page.tsx                # Set new password
    /passwordless
      /register
        page.tsx                # Register new authenticator
      /manage
        page.tsx                # Manage authenticators
    /verify
      page.tsx                  # Email verification
      /success
        page.tsx                # Verification success

    # Root and docs pages
    page.tsx                    # Landing page
    /docs
      page.tsx                  # Documentation page

  /components
    /auth
      LoginForm.tsx             # Reusable login form
      RegistrationForm.tsx      # Registration form
      PasswordResetForm.tsx     # Password reset form
      Fido2Manager.tsx          # FIDO2 credential management
    /layout
      Header.tsx                # Header with AOLF branding
      Footer.tsx                # Footer with links
      Layout.tsx                # Main layout wrapper

  /lib
    /auth
      cognito.ts                # AWS Cognito integration
      session.ts                # Session management
      fido2.ts                  # FIDO2/WebAuthn implementation
      tokens.ts                 # Token generation/validation

  /sdk
    /react
      hooks.tsx                 # React hooks (useAuth, etc.)
      context.tsx               # AuthProvider context
      components
        Fido2Manager.tsx        # FIDO2 credential management UI
        PasswordlessButton.tsx  # FIDO2 authentication button

    index.ts                    # SDK entry point

  /middleware.ts                # Handle CORS, security headers, etc.
```

#### Auth Service Pages Implementation

1. **Login Page (`/login/page.tsx`)**

This is the central authentication page that all AOLF applications can redirect to:

```tsx
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Layout } from '@/components/layout/Layout';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  // Get redirect URL from query params
  const redirectUri = searchParams.get('redirect_uri') || '/';

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        // Redirect back to the application that requested login
        window.location.href = redirectUri;
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <h1>Sign in to AOLF</h1>
        {error && <div className="error-message">{error}</div>}
        <LoginForm onSubmit={handleLogin} />
        <div className="auth-options">
          <button
            onClick={() =>
              (window.location.href = `/api/login/social?provider=google&redirect_uri=${encodeURIComponent(redirectUri)}`)
            }
          >
            Continue with Google
          </button>
          <button
            onClick={() =>
              (window.location.href = `/api/login/social?provider=facebook&redirect_uri=${encodeURIComponent(redirectUri)}`)
            }
          >
            Continue with Facebook
          </button>
          <button
            onClick={() =>
              (window.location.href = `/passwordless/register?redirect_uri=${encodeURIComponent(redirectUri)}`)
            }
          >
            Use Passwordless Login
          </button>
        </div>
        <div className="auth-links">
          <a href={`/register?redirect_uri=${encodeURIComponent(redirectUri)}`}>
            Create account
          </a>
          <a
            href={`/password/reset?redirect_uri=${encodeURIComponent(redirectUri)}`}
          >
            Forgot password?
          </a>
        </div>
      </div>
    </Layout>
  );
}
```

2. **FIDO2 Management Page (`/passwordless/manage/page.tsx`)**

```tsx
// app/passwordless/manage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';

export default function ManageAuthenticatorsPage() {
  const [authenticators, setAuthenticators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAuthenticators() {
      try {
        const response = await fetch('/api/login/fido2/credentials', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuthenticators(data.authenticators || []);
        } else {
          setError('Failed to load authenticators');
        }
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchAuthenticators();
  }, []);

  const handleRegisterNew = () => {
    window.location.href = '/passwordless/register';
  };

  const handleDelete = async (credentialId) => {
    if (confirm('Are you sure you want to remove this authenticator?')) {
      try {
        const response = await fetch(
          `/api/login/fido2/credentials/${credentialId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          },
        );

        if (response.ok) {
          setAuthenticators(
            authenticators.filter((a) => a.credentialId !== credentialId),
          );
        } else {
          setError('Failed to delete authenticator');
        }
      } catch (err) {
        setError('An error occurred');
      }
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <h1>Manage Passwordless Authenticators</h1>
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {authenticators.length === 0 ? (
              <div className="no-authenticators">
                <p>You don't have any authenticators registered yet.</p>
              </div>
            ) : (
              <div className="authenticators-list">
                <h2>Your Authenticators</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Added On</th>
                      <th>Last Used</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authenticators.map((auth) => (
                      <tr key={auth.credentialId}>
                        <td>{auth.friendlyName}</td>
                        <td>{new Date(auth.createdAt).toLocaleDateString()}</td>
                        <td>
                          {auth.lastUsed
                            ? new Date(auth.lastUsed).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(auth.credentialId)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="action-buttons">
              <button onClick={handleRegisterNew}>
                Register New Authenticator
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
```

3. **Root Landing Page (`/page.tsx`)**

```tsx
// app/page.tsx
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';

export default function HomePage() {
  return (
    <Layout>
      <div className="hero-section">
        <h1>AOLF Authentication Service</h1>
        <p>
          Centralized authentication and identity management for AOLF
          applications
        </p>
      </div>

      <div className="features-section">
        <div className="feature">
          <h2>Single Sign-On</h2>
          <p>Sign in once, access all AOLF applications securely</p>
        </div>
        <div className="feature">
          <h2>Passwordless Login</h2>
          <p>Use biometrics or security keys for enhanced security</p>
        </div>
        <div className="feature">
          <h2>Social Login</h2>
          <p>Easily sign in with your existing Google or Facebook account</p>
        </div>
      </div>

      <div className="cta-section">
        <Link href="/login" className="cta-button">
          Sign In
        </Link>
        <Link href="/register" className="secondary-button">
          Create Account
        </Link>
      </div>

      <div className="docs-section">
        <h2>For Developers</h2>
        <p>Integrate authentication into your AOLF applications:</p>
        <Link href="/docs" className="docs-button">
          View Documentation
        </Link>
      </div>
    </Layout>
  );
}
```

#### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@aws-sdk/client-cognito-identity-provider": "^3.400.0",
    "@simplewebauthn/server": "^8.0.0",
    "@simplewebauthn/browser": "^8.0.0",
    "iron-session": "^6.3.1",
    "jsonwebtoken": "^9.0.0",
    "@aws-sdk/client-dynamodb": "^3.400.0",
    "@aws-sdk/lib-dynamodb": "^3.400.0"
  }
}
```

#### Database Integration

For storing FIDO2 credentials and sessions:

```typescript
// In lib/db.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Store FIDO2 credential
export async function storeCredential(credential) {
  const command = new PutCommand({
    TableName: 'Fido2Credentials',
    Item: {
      userId: credential.userId,
      credentialId: credential.credentialId,
      publicKey: credential.publicKey,
      counter: credential.counter,
      friendlyName: credential.friendlyName,
      createdAt: new Date().toISOString(),
    },
  });

  return docClient.send(command);
}
```

#### Session Management

Using iron-session for secure, encrypted cookie-based sessions:

```typescript
// lib/session.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'aolf_auth_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    domain: process.env.COOKIE_DOMAIN || '.aolf.com',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  return getIronSession(cookies(), sessionOptions);
}
```

#### Deployment Options

1. **Vercel (Recommended for Simplicity)**

   - One-click deployment with GitHub integration
   - Automatic CI/CD pipeline
   - Edge function support for global distribution
   - Custom domain (auth.aolf.com) configuration

2. **AWS Amplify**

   - Deeper integration with AWS ecosystem
   - Compatible with existing AWS resources
   - Simplified deployment to AWS infrastructure

3. **Custom AWS Deployment**
   - Export as standalone Node.js application
   - Deploy to ECS/Fargate containers or Lambda functions
   - Configure with API Gateway and CloudFront for distribution

### 4. Migration Steps

#### Phase 1: Auth Service Setup

1. Create new auth service repository with Next.js
2. Implement core authentication endpoints (login, validate, refresh)
3. Add Cognito integration using AWS SDK
4. Set up database for session storage
5. Configure CORS for cross-domain access
6. Deploy service to new subdomain (auth.aolf.com)

#### Phase 2: UI Pages Development

1. Implement login, registration, and password reset pages
2. Create FIDO2/WebAuthn management interfaces
3. Develop landing page and documentation
4. Test with real user flows

#### Phase 3: Passwordless Authentication

1. Implement FIDO2/WebAuthn registration flow
2. Implement FIDO2/WebAuthn authentication flow
3. Migrate credential management UI components
4. Test browser compatibility (especially iOS Safari)

#### Phase 4: Client SDK Development

1. Create React hooks for authentication
2. Implement React context provider
3. Create UI components for login options
4. Add social login support
5. Build credential management interface

#### Phase 5: Migration of Sign-in Page

Migrate the current sign-in page (`/us-en/signin/index.jsx`) to use the new Auth Service SDK:

1. Replace direct Cognito calls with Auth Service API calls
2. Update UI components to use new SDK
3. Test all authentication flows:
   - Username/password login
   - Social login
   - Passwordless login
   - User registration
   - Password reset

### 5. Application Integration

Add configuration to your applications to use the Auth Service:

```tsx
// In your app's _app.js or similar entry point
import { AuthProvider } from '@aolf/auth-client';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider
      authServiceUrl="https://auth.aolf.com"
      appId="app1"
      redirectUri={process.env.NEXT_PUBLIC_APP_URL}
    >
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

Then in your components:

```tsx
import { useAuth } from '@aolf/auth-client';

function ProtectedComponent() {
  const { user, loading, error, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    // Redirect to Auth Service or show login button
    return <button onClick={() => login()}>Sign In</button>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  );
}
```

### 6. Detailed Passwordless Migration

The current passwordless implementation has these key components:

```
Fido2Toast               - UI component for credential management
Fido2Recommendation      - UI for suggesting FIDO2 enrollment
AuthenticatorsManager    - UI for managing FIDO2 credentials
usePasswordlessAuth      - Hook providing passwordless functionality
```

#### Migrating to Auth Service

1. **Server-Side**

```javascript
// AUTH SERVICE (Express.js)
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

// Endpoint to generate registration options
app.get('/fido2/registration-options', async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const user = await getUserFromSession(sessionId);

  // Generate registration options
  const options = await generateRegistrationOptions({
    rpName: 'AOLF',
    rpID: 'aolf.com',
    userID: user.id,
    userName: user.email,
    timeout: 60000,
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'required',
      residentKey: 'preferred',
    },
  });

  // Store challenge in session
  await storeRegistrationChallenge(user.id, options.challenge);

  res.json(options);
});

// Endpoint to verify registration
app.post('/fido2/register', async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const user = await getUserFromSession(sessionId);
  const challenge = await getRegistrationChallenge(user.id);

  // Verify registration
  const verification = await verifyRegistrationResponse({
    response: req.body,
    expectedChallenge: challenge,
    expectedOrigin: 'https://app.aolf.com',
    expectedRPID: 'aolf.com',
  });

  if (verification.verified) {
    // Store credential in database
    await storeCredential({
      userId: user.id,
      credentialId: verification.registrationInfo.credentialID,
      publicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.counter,
      friendlyName: req.body.friendlyName,
    });

    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Verification failed' });
  }
});

// Similar endpoints for authentication options and verification
```

2. **Client-Side SDK**

```typescript
// auth-service.ts
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

export class AuthService {
  private apiUrl = 'https://auth.aolf.com';

  async registerFido2Credential(friendlyName: string): Promise<boolean> {
    try {
      // Get registration options
      const optionsResponse = await fetch(
        `${this.apiUrl}/fido2/registration-options`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      const options = await optionsResponse.json();

      // Start registration
      const credential = await startRegistration(options);

      // Verify registration
      const verificationResponse = await fetch(
        `${this.apiUrl}/fido2/register`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...credential,
            friendlyName,
          }),
        },
      );

      return (await verificationResponse.json()).success;
    } catch (error) {
      console.error('FIDO2 registration error:', error);
      return false;
    }
  }

  async authenticateWithFido2(): Promise<boolean> {
    try {
      // Get authentication options
      const optionsResponse = await fetch(
        `${this.apiUrl}/fido2/authentication-options`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      const options = await optionsResponse.json();

      // Start authentication
      const credential = await startAuthentication(options);

      // Verify authentication
      const verificationResponse = await fetch(
        `${this.apiUrl}/fido2/authenticate`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credential),
        },
      );

      const result = await verificationResponse.json();
      return result.success;
    } catch (error) {
      console.error('FIDO2 authentication error:', error);
      return false;
    }
  }

  // ... other auth methods (login, logout, etc.)
}
```

### 7. Updated Sign-in Page

The current sign-in page will be updated to use the new Auth Service API:

```jsx
// pages/us-en/signin/index.jsx
import { useAuth } from '@auth-service/react'; // New SDK import

function LoginPage() {
  const router = useRouter();
  const {
    user,
    loading,
    error,
    login,
    loginWithFido2,
    loginWithSocial,
    resetPassword,
    confirmResetPassword,
    register,
  } = useAuth();

  const [mode, setMode] = useQueryState(
    'mode',
    parseAsString.withDefault(SIGN_IN_MODE),
  );
  const [navigateTo] = useQueryState('next');
  const [username, setUsername] = useState(null);

  // ... other state variables

  const signInAction = async ({ username, password, isStudent = false }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      const success = await login(username, password);

      if (success && isStudent) {
        await verifyStudentEmail(username);
        showAlert(
          ALERT_TYPES.NEW_ALERT,
          { children: <StudentVerificationCodeMessage /> },
          2000,
        );
      }

      setEnableAutoRedirect(true);
    } catch (ex) {
      setMessage(ex.message);
      setShowMessage(true);
    }
    setLoading(false);
  };

  // ... other methods (updated to use the new SDK)

  return (
    <main className="login-register-page">
      {renderForm()}
      <Fido2Manager /> {/* Replaced Fido2Toast */}
      {loading && !isHolding && (
        <div className="loading-overlay">
          <div className="overlay-loader"></div>
          <div className="loading-text">Please wait...</div>
        </div>
      )}
    </main>
  );
}
```

### 8. Environment Configuration

Update environment variables for the Auth Service:

```
# .env.local in React apps
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.aolf.com
NEXT_PUBLIC_APP_DOMAIN=app.aolf.com
```

```
# .env in Auth Service
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
CORS_ALLOWED_ORIGINS=https://app.aolf.com,https://app2.aolf.com
COOKIE_DOMAIN=.aolf.com
SESSION_SECRET=your-secure-random-string-here
```

### 9. Testing Plan

1. **Unit Tests**

   - Test each Auth Service endpoint
   - Test React hooks and components

2. **Integration Tests**

   - Test end-to-end authentication flows
   - Test cross-domain cookie handling

3. **Compatibility Tests**

   - Test on major browsers (Chrome, Firefox, Safari, Edge)
   - Test on mobile browsers (iOS Safari, Chrome on Android)
   - Verify FIDO2 functionality on mobile devices

4. **Security Tests**
   - Penetration testing
   - CSRF protection verification
   - XSS vulnerability scanning

### 10. Rollout Strategy

1. **Staged Deployment**

   - Deploy Auth Service to staging environment
   - Integrate with test applications
   - Verify all functionality

2. **Dual-Mode Operation**

   - Initially run both authentication systems in parallel
   - Add feature flag to toggle between systems

3. **Gradual Migration**

   - Migrate developer/test accounts first
   - Move small percentage of users to new system
   - Monitor for issues and performance

4. **Full Cutover**
   - Complete migration of all users
   - Decommission old authentication code
   - Maintain Cognito as the identity provider

### 11. Fallback Mechanisms

1. **Authentication Fallback**

   - If passwordless auth fails, offer password login
   - If Auth Service is unavailable, provide clear error message

2. **Session Recovery**
   - Implement robust token refresh mechanism
   - Handle cases where cookies are missing or corrupted

### 12. Post-Migration Monitoring

1. **Metrics to Track**

   - Login success/failure rates
   - Authentication method usage (password vs. passwordless)
   - API response times
   - Error rates

2. **Alerting**
   - Set up alerts for authentication failures
   - Monitor for unusual activity patterns
   - Track session validation errors
