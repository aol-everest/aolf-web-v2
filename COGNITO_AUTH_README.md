# AWS Cognito Authentication Implementation

This document outlines how authentication with Amazon Cognito is configured and implemented in the AOLF web application.

## Overview

The application uses AWS Cognito User Pools for authentication, with a custom implementation around AWS Amplify and a passwordless authentication library. The system supports both traditional password-based authentication and modern passwordless methods.

## Configuration

### Environment Variables

The application requires these environment variables:

| Variable                                 | Description                                            | Example Value                                |
| ---------------------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| `NEXT_PUBLIC_COGNITO_REGION`             | AWS region where the Cognito User Pool is located      | us-east-2                                    |
| `NEXT_PUBLIC_COGNITO_USERPOOL`           | The User Pool ID                                       | us-east-2_cJRZyuMaS                          |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID`          | The App Client ID                                      | 7c1dm9b10534gmna14ttjpmjh5                   |
| `NEXT_PUBLIC_COGNITO_DOMAIN`             | The Cognito domain for hosted UI                       | aolf-qa-web.auth.us-east-2.amazoncognito.com |
| `NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN`    | Redirect URL after sign-in                             | http://localhost:3000/token                  |
| `NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT`   | Redirect URL after sign-out                            | http://localhost:3000                        |
| `NEXT_PUBLIC_AMPLIFY_COOKIE_DOMAIN`      | Domain for storing authentication cookies              | localhost                                    |
| `NEXT_PUBLIC_PASSWORD_LESS_API_BASE_URL` | Base URL for the FIDO2 passwordless authentication API | [API URL]                                    |

Example values are from the QA environment. For local development, these values should be placed in a `.env.test` file at the root of the project. For other environments, these values are set through CI/CD pipelines.

### AWS Configuration

Configuration is loaded from environment variables in `src/aws-exports.js`:

```javascript
const awsConfig = {
  aws_project_region: process.env.NEXT_PUBLIC_COGNITO_REGION,
  Auth: {
    region: process.env.NEXT_PUBLIC_COGNITO_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    // Additional configuration...
  },
};
```

## Authentication Implementation

### Core Components

1. **Authentication Context (`src/contexts/auth.context.js`)**

   - Manages user state
   - Handles sign-in/sign-out operations
   - Manages authentication tokens
   - Provides auth state to components via React Context

2. **Password Authentication (`src/components/passwordLessAuth/plaintext.js`)**

   - `authenticateWithPassword` - Standard password authentication
   - `authenticateWithPlaintextPassword` - Alternative implementation with MFA support

3. **Cognito API Interface (`src/components/passwordLessAuth/cognito-api.js`)**
   - Direct API calls to AWS Cognito services
   - Handles token management
   - Implements authentication flows
   - Manages user attributes

### Authentication Flow

1. **Sign-In Process**

   ```javascript
   // Initiate auth with username/password
   const authResponse = await initiateAuth({
     authflow: 'USER_PASSWORD_AUTH',
     authParameters: { USERNAME: username, PASSWORD: password },
     clientMetadata,
   });

   // Handle any challenges (MFA, new password required)
   const tokens = await handleAuthResponse({
     authResponse,
     username,
     newPassword,
     clientMetadata,
     abort: abort.signal,
   });

   // Store tokens and update user context
   await tokensCb(tokens);
   ```

2. **Token Management**

   - Securely stores ID token, access token, and refresh token
   - Automatically refreshes tokens before expiration
   - Handles token revocation during sign-out

3. **User State**
   - Tracks authentication state (`SIGNED_IN`, `NOT_SIGNED_IN`, etc.)
   - Provides user information via React Context
   - Caches previously signed-in users for convenience

## AWS Cognito API Usage

The application uses these Cognito API endpoints:

### Authentication

- `InitiateAuth` - Starts the authentication process
- `RespondToAuthChallenge` - Handles MFA and other challenges

### User Management

- `SignUp` - Registers new users
- `ConfirmSignUp` - Verifies user registration
- `GetUser` - Retrieves user attributes
- `UpdateUserAttributes` - Updates user profile information
- `RevokeToken` - Handles sign-out by revoking refresh tokens

## Security Features

1. **Secret Hash Calculation**

   - Additional security layer for Cognito API calls
   - Uses HMAC-SHA256 with client secret

2. **Secure Token Storage**

   - Cookie settings with `secure: true` and `sameSite: 'strict'`
   - Proper token lifecycle management
   - Comprehensive token clearing on sign-out

3. **MFA Support**
   - Handles SMS MFA challenges
   - Supports custom challenges

## Additional Features

1. **FIDO2/WebAuthn Integration**

   - Passwordless authentication using security keys or biometrics
   - Platform authenticator detection
   - Credential management

2. **Session Management**
   - Automatic token refresh
   - Sign-out across tabs
   - User session tracking

## FIDO2 Passwordless Authentication

The application integrates FIDO2/WebAuthn for passwordless authentication alongside traditional password-based authentication. This allows users to sign in using biometrics (fingerprint, face recognition) or security keys.

### FIDO2 Configuration

FIDO2 is configured in `_app.jsx`:

```javascript
Passwordless.configure({
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL,
  cognitoIdpEndpoint: process.env.NEXT_PUBLIC_COGNITO_REGION,
  fido2: {
    baseUrl: process.env.NEXT_PUBLIC_PASSWORD_LESS_API_BASE_URL,
    authenticatorSelection: {
      userVerification: 'required',
    },
  },
  storage: new CookieStorage({
    domain: PARENT_DOMAIN,
    secure: !isLocal,
  }),
});
```

### FIDO2 API Usage

The application uses a separate FIDO2 API endpoint (`NEXT_PUBLIC_PASSWORD_LESS_API_BASE_URL`) for WebAuthn operations:

1. **Credential Registration**:

   - `fido2StartCreateCredential()` - Initiates credential creation
   - `fido2CompleteCreateCredential()` - Completes registration

2. **Authentication**:

   - `authenticateWithFido2()` - Signs in with FIDO2 credentials
   - `fido2getCredential()` - Gets available credentials

3. **Credential Management**:
   - `fido2ListCredentials()` - Lists registered credentials
   - `fido2DeleteCredential()` - Removes credentials
   - `fido2UpdateCredential()` - Updates credential friendly name

### FIDO2 Authentication Flow

1. The application checks if the user's device supports WebAuthn
2. If supported, users can register a new credential (security key or biometric)
3. On subsequent logins, users can authenticate via their registered credential
4. The system handles the WebAuthn challenge/response with AWS Cognito

This integration provides a more secure and convenient authentication option for users with compatible devices, while maintaining traditional password login as a fallback.

## Usage Example

```javascript
import { useAuth } from 'src/contexts/auth.context';

function LoginForm() {
  const { passwordLess, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await passwordLess.signInWithPassword({
        username,
        password,
      });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return <form onSubmit={handleLogin}>{/* Form fields */}</form>;
}
```

## Environment Setup

### Local Development

For local development, you need to create a `.env.test` file in the root of the project with the Cognito configuration:

```
NEXT_PUBLIC_COGNITO_CLIENT_ID=7c1dm9b10534gmna14ttjpmjh5
NEXT_PUBLIC_COGNITO_DOMAIN=aolf-qa-web.auth.us-east-2.amazoncognito.com
NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN=http://localhost:3000/token
NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT=http://localhost:3000
NEXT_PUBLIC_COGNITO_REGION=us-east-2
NEXT_PUBLIC_COGNITO_USERPOOL=us-east-2_cJRZyuMaS
NEXT_PUBLIC_AMPLIFY_COOKIE_DOMAIN=localhost
NEXT_PUBLIC_PASSWORD_LESS_API_BASE_URL=[API URL]
```

The provided example uses QA environment credentials. You'll need to replace these with your own Cognito configuration values.

### Testing Authentication

To test the authentication implementation:

1. Start the development server:

   ```
   yarn develop:qa
   ```

2. Navigate to a route that requires authentication or open the login modal.

3. Use test credentials to log in. The application will use the Cognito configuration specified in your environment variables.

4. To test token refresh, remain logged in for more than the token expiration time (typically 1 hour).

5. To test sign-out, use the sign-out functionality and verify that cookies are cleared and the user is redirected correctly.

### CI/CD Environments

For CI/CD pipelines, the environment variables are set in the workflow configuration files:

- **Development**: Variables are set in the GitHub workflow files
- **QA**: Variables are set in the QA deployment pipeline
- **Production**: Variables are set in the production deployment pipeline

The `.github/workflows/ci.yml` file contains some of these environment variables for the CI process:

```yaml
env:
  NEXT_PUBLIC_ORGANIZATION_NAME: AOL
  NEXT_PUBLIC_COGNITO_CLIENT_ID: 6nti52m34ndg15fo2u0v1e37cf
  NEXT_PUBLIC_COGNITO_USERPOOL: us-east-2_jR9xZuvHa
```

Note that CI/CD environments use different Cognito User Pool configurations than local development.
