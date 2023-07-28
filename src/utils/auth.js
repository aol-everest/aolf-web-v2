import { CognitoAuth } from "amazon-cognito-auth-js/dist/amazon-cognito-auth";
import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { api } from "./api";
import UserPool from "./userPool";

export const createCognitoAuth = () => {
  const config = {
    UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL,
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    AppWebDomain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    TokenScopesArray: [
      "email",
      "phone",
      "profile",
      "aws.cognito.signin.user.admin",
      "openid",
    ],
    RedirectUriSignIn: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN,
    RedirectUriSignOut: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT,
    AdvancedSecurityDataCollectionFlag: true,
  };

  return new CognitoAuth(config);
};

// Parse the response from a Cognito callback URI (assumed a token or code is in the supplied href). Returns a promise.
export const parseCognitoWebResponse = (href) => {
  return new Promise((resolve, reject) => {
    const auth = createCognitoAuth();

    // userHandler will trigger the promise
    auth.userhandler = {
      onSuccess: function (result) {
        resolve(result);
      },
      onFailure: function (err) {
        console.log(
          "🚀 ~ file: auth.js ~ line 43 ~ returnnewPromise ~ err",
          err,
        );
        console.log(err);
        reject(new Error("Failure parsing Cognito web response: " + err));
      },
    };
    auth.parseCognitoWebResponse(href);
  });
};
export const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = getUser(email);
    cognitoUser.setAuthenticationFlowType("USER_PASSWORD_AUTH");
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (data) => {
        console.log("onSuccess:", data);
        resolve({ data, newPasswordRequired: false });
      },

      onFailure: (err) => {
        console.error("onFailure:", err);
        reject(err);
      },

      newPasswordRequired: (data) => {
        console.log("newPasswordRequired:", data);
        resolve({ data, newPasswordRequired: true });
      },
    });
  });
};

export const changePassword = ({ email, oldPassword, newPassword }) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const cognitoUser = getUser(email);
    cognitoUser.setAuthenticationFlowType("USER_PASSWORD_AUTH");
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: oldPassword,
    });

    try {
      await new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authDetails, {
          onSuccess: (data) => {
            // console.log("onSuccess:", data);
            resolve({ data });
          },

          onFailure: (err) => {
            console.error("onFailure:", err);
            reject(err);
          },

          newPasswordRequired: (data) => {
            // console.log("newPasswordRequired:", data);
            resolve({ data });
          },
        });
      });
    } catch (err) {
      reject(err);
    }
    cognitoUser.changePassword(oldPassword, newPassword, (err, data) => {
      if (err) {
        console.error("onFailure:", err);
        reject(new Error(err));
      } else {
        // console.log("onSuccess:", data);
        resolve(data);
      }
    });
  });
};

export const changeNewPassword = ({ email, password, newPassword }) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const user = getUser(email);
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    try {
      await new Promise((resolve, reject) => {
        user.authenticateUser(authDetails, {
          onSuccess: (data) => {
            // console.log("onSuccess:", data);
            reject(new Error(`Something is wrong. Try again.`));
          },
          onFailure: (err) => {
            console.error("onFailure:", err);
            reject(err);
          },

          newPasswordRequired: (data) => {
            // console.log("newPasswordRequired:", data);
            resolve({ data });
          },
        });
      });
    } catch (err) {
      reject(err);
    }
    user.completeNewPasswordChallenge(newPassword, null, {
      onSuccess: (data) => {
        // console.log("onSuccess:", data);
        resolve(data);
      },
      onFailure: (err) => {
        console.error("onFailure:", err);
        reject(err);
      },
    });
  });
};

export const fetchUserProfile = async (access_token) => {
  return await api.get({
    path: "profile",
    token: access_token,
  });
};

export const getSession = async () => {
  return await new Promise((resolve, reject) => {
    const user = UserPool.getCurrentUser();
    if (user) {
      user.getSession(async (err, session) => {
        if (err) {
          reject(err);
        } else {
          if (!session.isValid()) {
            session = await renewToken({
              email: session.idToken.payload.email,
              refreshToken: session.refreshToken.token,
            });
          }
          resolve({ session, user });
        }
      });
    } else {
      reject();
    }
  });
};

export const getUserAttributes = (user) => {
  return new Promise((resolve, reject) => {
    user.getUserAttributes((err, attributes) => {
      if (err) {
        reject(err);
      } else {
        const results = {};

        for (let attribute of attributes) {
          const { Name, Value } = attribute;
          results[Name] = Value;
        }

        resolve(results);
      }
    });
  });
};

export const logout = async () => {
  const cognitoUser = UserPool.getCurrentUser();
  if (cognitoUser) {
    await cognitoUser.signOut();
  }
};

export const signup = ({ email, password, firstName, lastName }) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];

    const dataFirstName = {
      Name: "given_name",
      Value: firstName,
    };

    const dataLastName = {
      Name: "family_name",
      Value: lastName,
    };

    attributeList.push(new CognitoUserAttribute(dataFirstName));
    attributeList.push(new CognitoUserAttribute(dataLastName));
    UserPool.signUp(email, password, attributeList, null, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const getUser = (email) => {
  return new CognitoUser({
    Username: email,
    Pool: UserPool,
  });
};

export const resendTemporaryPassword = async (email) => {
  await api.post({
    path: "resend-temporary-password",
    body: { email },
  });
};

export const sendCode = ({ email }) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      await resendTemporaryPassword(email);
      resolve({ resendTemporaryPassword: true });
    } catch (ex) {
      getUser(email).forgotPassword({
        onSuccess: (data) => {
          // console.log("onSuccess:", data);
          resolve(data);
        },
        onFailure: (err) => {
          console.error("onFailure:", err);
          reject(err);
        },
        inputVerificationCode: (data) => {
          // console.log("Input code:", data);
          resolve({ resendTemporaryPassword: false, data });
        },
      });
    }
  });
};

export const resetPassword = ({ email, code, password }) => {
  return new Promise((resolve, reject) => {
    getUser(email).confirmPassword(code, password, {
      onSuccess: (data) => {
        // console.log("onSuccess:", data);
        resolve(data);
      },
      onFailure: (err) => {
        console.error("onFailure:", err);
        reject(err);
      },
    });
  });
};

export const renewToken = ({ refreshToken, email }) => {
  return new Promise((resolve, reject) => {
    const RefreshToken = new CognitoRefreshToken({
      RefreshToken: refreshToken,
    });

    const cognitoUser = getUser(email);

    cognitoUser.refreshSession(RefreshToken, (err, session) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        let retObj = {
          access_token: session.accessToken.jwtToken,
          id_token: session.idToken.jwtToken,
          refresh_token: session.refreshToken.token,
        };
        // console.log("onSuccess:", retObj);
        resolve(session);
      }
    });
  });
};

const reFetchProfile = async () => {
  try {
    const { user, session } = await getSession();
    const token = session.idToken.jwtToken;
    const userAttributes = await getUserAttributes(user);
    const profile = await fetchUserProfile(token);
    const userInfo = {
      session,
      userAttributes,
      profile,
      token,
    };

    return userInfo;
  } catch (ex) {
    console.log(ex);
    await logout();
  }
  throw new Error("Something is wrong. Try again.");
};

export const Auth = {
  parseCognitoWebResponse,
  authenticateUser,
  changePassword,
  changeNewPassword,
  fetchUserProfile,
  getSession,
  getUserAttributes,
  logout,
  signup,
  sendCode,
  resetPassword,
  renewToken,
  reFetchProfile,
};
