import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CookieStorage,
} from 'amazon-cognito-identity-js';
import { parse } from 'tldts';

const isLocal = process.env.NODE_ENV === 'development';

const getParentDomain = () => {
  // Check if running in a browser
  if (typeof window === 'undefined') {
    return null; // Return null on the server side
  }

  const hostname = window.location.hostname; // e.g., "qa.members.us.artofliving.org"
  const { domain } = parse(hostname); // Extract the root domain using tldts

  // Fallback logic for cases where parsing fails or domain is undefined
  if (!domain) {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`; // Fallback to "example.com"
    }
    return hostname; // Return hostname as-is
  }

  if (isLocal || domain === 'herokuapp.com') {
    return undefined;
  }
  return `.${domain}`;
};

const PARENT_DOMAIN = getParentDomain();

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  Storage: new CookieStorage({
    domain: PARENT_DOMAIN,
    secure: !isLocal,
  }),
};

/*
 * Common functions
 */
export function getCognitoUserPool() {
  return new CognitoUserPool(poolData);
}

export function getCurrentCognitoUser() {
  let userPool = getCognitoUserPool();
  return userPool.getCurrentUser();
}

export function getCognitoUser(username) {
  let userPool = getCognitoUserPool();
  return new CognitoUser({ Username: username, Pool: userPool });
}

export function getCognitoIdToken(user) {
  return new Promise((resolve) => {
    resolve(user.getSignInUserSession().getIdToken().jwtToken);
  });
}

/*
 * Retrieve users attributes as nominated in cognito (email, username)
 */
export function getUserAttributes(user) {
  return new Promise((resolve, reject) => {
    user.getSession((err) => {
      if (err) {
        reject(err);
        return;
      }
      user.getUserAttributes((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          result = result.reduce((map, item) => {
            map[item.Name] = item.Value;
            return map;
          }, {});
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });
  });
}

/*
 * Initiate SignUp workflow
 */
export function signUpCognitoUser(username, password, email) {
  return new Promise((resolve, reject) => {
    let userPool = getCognitoUserPool();
    let attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];
    userPool.signUp(username, password, attributes, null, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/*
 * Initiate SignIn workflow
 */
export function signInCognitoUser(username, password) {
  return new Promise((resolve, reject) => {
    let userPool = getCognitoUserPool();
    let user = new CognitoUser({ Username: username, Pool: userPool });
    user.authenticateUser(
      new AuthenticationDetails({ Username: username, Password: password }),
      {
        onSuccess: (response) => {
          resolve({ type: 'onSuccess', response });
        },
        onFailure: (e) => {
          reject(e);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // User was signed up by an admin and must provide new
          // password and required attributes, if any, to complete
          // authentication.

          // the api doesn't accept this field back
          delete userAttributes.email_verified;
          resolve({
            type: 'newPasswordRequired',
            user,
            userAttributes,
            requiredAttributes,
          });
        },
      },
    );
  });
}

/*
 * Verify user using a code
 */
export function confirmCognitoUser(username, code) {
  return new Promise((resolve, reject) => {
    let userPool = getCognitoUserPool();
    let user = new CognitoUser({ Username: username, Pool: userPool });
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/*
 * handleNewPassword: to be called when a user was signed up by an admin and must provide
 * new password.
 */
export function handleNewPassword(user, userAttributes, newPassword) {
  return new Promise((resolve) => {
    user.completeNewPasswordChallenge(newPassword, userAttributes);
    resolve();
  });
}

/*
 * Verification of user attributes (email address)
 */
export function getAttributeVerificationCode(user, attribute) {
  return new Promise((resolve, reject) => {
    user.getAttributeVerificationCode(attribute, {
      onSuccess: (r) => {
        resolve(r);
      },
      onFailure: (e) => {
        reject(e);
      },
      inputVerificationCode: null,
    });
  });
}

export function verifyAttribute(user, attribute, code) {
  return new Promise((resolve, reject) => {
    user.verifyAttribute(attribute, code, {
      onSuccess: (r) => {
        resolve(r);
      },
      onFailure: (e) => {
        reject(e);
      },
    });
  });
}

/**
 * Forgot password workflow
 */
export function forgotPassword(user) {
  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: (r) => {
        resolve(r);
      },
      onFailure: (e) => {
        reject(e);
      },
      inputVerificationCode: null,
    });
  });
}

export function confirmPassword(user, code, password) {
  return new Promise((resolve, reject) => {
    user.confirmPassword(code, password, {
      onSuccess: (r) => {
        resolve(r);
      },
      onFailure: (e) => {
        reject(e);
      },
    });
  });
}
