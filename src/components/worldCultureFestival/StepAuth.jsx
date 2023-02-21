/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { api, Auth } from "@utils";
import { useAuth } from "@contexts";
import { MESSAGE_EMAIL_VERIFICATION_SUCCESS } from "@constants";
import classNames from "classnames";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  SigninForm,
  SignupForm,
  NewPasswordForm,
  ResetPasswordForm,
  ChangePasswordForm,
} from "./loginForm";

const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

const LOGIN_MODE = "LOGIN_MODE";
const SIGNUP_MODE = "SIGNUP_MODE";
const RESET_PASSWORD_REQUEST = "RESET_PASSWORD_REQUEST";
const NEW_PASSWORD_REQUEST = "NEW_PASSWORD_REQUEST";
const CHANGE_PASSWORD_REQUEST = "CHANGE_PASSWORD_REQUEST";

const MESSAGE_SIGNUP_SUCCESS = "Sign up completed successfully.";
const MESSAGE_VERIFICATION_CODE_SENT_SUCCESS =
  "A verification code has been emailed to you. Please use the verification code and reset your password.";

export function StepAuth({ errors, handleNext, ...props }) {
  const navigateTo = "/us-en/world-culture-festival?s=1";
  const { authenticated, user, setUser } = useAuth();
  const [authMode, setAuthMode] = useState(SIGNUP_MODE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [username, setUsername] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const switchView = (view) => (e) => {
    if (e) e.preventDefault();
    setAuthMode(view);
  };

  const getActualMessage = (message) => {
    if (!message) {
      return null;
    }
    const matches = message.match(/\[(.*?)\]/);
    if (matches) {
      return matches[1];
    }
    return message;
  };

  const signIn = async ({ username, password, isStudent = false }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      const { newPasswordRequired } = await Auth.authenticateUser(
        username,
        password,
      );
      if (newPasswordRequired) {
        setCurrentUser({ username, password });
        setAuthMode(NEW_PASSWORD_REQUEST);
        setLoading(false);
      } else {
        const userInfo = await Auth.reFetchProfile();
        setUser(userInfo);
        handleNext();
      }
    } catch (ex) {
      // await Auth.signOut();
      const data = ex.response?.data;
      let errorMessage = ex.message.match(/\[(.*)\]/);
      if (errorMessage) {
        errorMessage = errorMessage[1];
      } else {
        errorMessage = ex.message;
      }
      const { message, statusCode } = data || {};
      if (statusCode === 500) {
        setMessage(
          message ? `Error: Unable to login. (${message})` : errorMessage,
        );
      } else {
        setMessage(
          message ? `Error: ${message} (${statusCode})` : errorMessage,
        );
      }
      console.error(ex);
      setShowMessage(true);
      setLoading(false);
    }
  };

  const fbLogin = () => {
    const params = {
      state: navigateTo,
      identity_provider: "Facebook",
      redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN,
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      response_type: "CODE",
      scope: "email phone profile aws.cognito.signin.user.admin openid",
    };
    window.location.replace(
      `https://${
        process.env.NEXT_PUBLIC_COGNITO_DOMAIN
      }/oauth2/authorize?${encodeFormData(params)}`,
    );
  };

  const googleLogin = () => {
    const params = {
      state: navigateTo,
      identity_provider: "Google",
      redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN,
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      response_type: "CODE",
      scope: "email phone profile aws.cognito.signin.user.admin openid",
    };
    window.location.replace(
      `https://${
        process.env.NEXT_PUBLIC_COGNITO_DOMAIN
      }/oauth2/authorize?${encodeFormData(params)}`,
    );
  };

  const signout = async () => {
    await Auth.logout();
    setUser(null);
  };

  const signUp = async ({ username, password, firstName, lastName }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await Auth.signup({ email: username, password, firstName, lastName });
      await signIn({ username, password });
      handleNext();
    } catch (ex) {
      let errorMessage = ex.message.match(/\[(.*)\]/);
      if (errorMessage) {
        errorMessage = errorMessage[1];
      } else {
        errorMessage = ex.message;
      }
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setMessage(message ? `Error: ${message} (${statusCode})` : errorMessage);
      setShowMessage(true);
    }
    setLoading(false);
  };

  const resetPassword = async ({ username }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      const { resendTemporaryPassword } = await Auth.sendCode({
        email: username,
      });
      setUsername(username);
      setShowSuccessMessage(true);
      setSuccessMessage(MESSAGE_VERIFICATION_CODE_SENT_SUCCESS);
      setTimeout(() => {
        setAuthMode(
          resendTemporaryPassword ? LOGIN_MODE : CHANGE_PASSWORD_REQUEST,
        );
        setShowSuccessMessage(false);
        setSuccessMessage(null);
      }, 3000);
    } catch (ex) {
      let errorMessage = ex.message.match(/\[(.*)\]/);
      if (errorMessage) {
        errorMessage = errorMessage[1];
      } else {
        errorMessage = ex.message;
      }
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setMessage(message ? `Error: ${message} (${statusCode})` : errorMessage);
      setShowMessage(true);
    }
    setLoading(false);
  };

  const changePassword = async ({ code, password }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await Auth.resetPassword({ email: username, code: "" + code, password });
      setUsername(null);
      setAuthMode(LOGIN_MODE);
    } catch (ex) {
      console.log("error signing in", ex);
      let errorMessage = ex.message.match(/\[(.*)\]/);
      if (errorMessage) {
        errorMessage = errorMessage[1];
      } else {
        errorMessage = ex.message;
      }
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setMessage(message ? `Error: ${message} (${statusCode})` : errorMessage);
      setShowMessage(true);
    }
    setLoading(false);
  };

  const completeNewPassword = async ({ password }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await Auth.changeNewPassword({
        email: currentUser.username,
        password: currentUser.password,
        newPassword: password,
      });
      setCurrentUser(null);
      setAuthMode(LOGIN_MODE);
      // hideModal();
    } catch (ex) {
      console.log(ex);
      let errorMessage = ex.message.match(/\[(.*)\]/);
      if (errorMessage) {
        errorMessage = errorMessage[1];
      } else {
        errorMessage = ex.message;
      }
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setMessage(message ? `Error: ${message} (${statusCode})` : errorMessage);
      setShowMessage(true);
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <section className="world-culture-festival">
        <div className="world-culture-festival__background world-culture-festival__background_people-1">
          <img src="/img/joel-reyer-QlYwXbFeymE-unsplash.png" />
        </div>

        <div className="container world-culture-festival__container">
          <div className="world-culture-festival__column">
            <p className="wcf-body world-culture-festival__subtitle">
              <span>Sign in</span> with your Art of Living Journey account or
              log in below:
            </p>

            {(authMode === LOGIN_MODE || authMode === SIGNUP_MODE) && (
              <div className="wcf-auth-selector world-culture-festival__selector">
                <button
                  className={classNames("wcf-auth-selector__button", {
                    "wcf-auth-selector__button_active":
                      authMode === SIGNUP_MODE,
                  })}
                  type="button"
                  data-target="sign-up-form"
                  onClick={switchView(SIGNUP_MODE)}
                >
                  Sign Up
                </button>
                <button
                  className={classNames("wcf-auth-selector__button", {
                    "wcf-auth-selector__button_active": authMode === LOGIN_MODE,
                  })}
                  type="button"
                  data-target="log-in-form"
                  onClick={switchView(LOGIN_MODE)}
                >
                  Log in
                </button>
              </div>
            )}
            {authMode === LOGIN_MODE && (
              <SigninForm
                loading={loading}
                signIn={signIn}
                forgotPassword={switchView(RESET_PASSWORD_REQUEST)}
                showMessage={showMessage}
                message={getActualMessage(message)}
              />
            )}

            {authMode === SIGNUP_MODE && (
              <SignupForm
                loading={loading}
                signUp={signUp}
                showMessage={showMessage}
                message={getActualMessage(message)}
              />
            )}

            {authMode === NEW_PASSWORD_REQUEST && (
              <NewPasswordForm
                loading={loading}
                completeNewPassword={completeNewPassword}
                showMessage={showMessage}
                message={getActualMessage(message)}
              />
            )}
            {authMode === RESET_PASSWORD_REQUEST && (
              <ResetPasswordForm
                loading={loading}
                resetPassword={resetPassword}
                showMessage={showMessage}
                message={getActualMessage(message)}
              />
            )}
            {authMode === CHANGE_PASSWORD_REQUEST && (
              <ChangePasswordForm
                loading={loading}
                changePassword={changePassword}
                showMessage={showMessage}
                username={username}
                message={getActualMessage(message)}
              />
            )}

            <p className="wcf-body-small world-culture-festival__policy">
              By signing in, I agree to{" "}
              <Link prefetch={false} href="/policy/ppa-course" legacyBehavior>
                <a target="_blank" className="wcf-link">
                  Terms of Service
                </a>
              </Link>{" "}
              and{" "}
              <a
                className="wcf-link"
                href="https://www.artofliving.org/us-en/privacy-policy"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </a>
            </p>
            {(authMode === LOGIN_MODE || authMode === SIGNUP_MODE) && (
              <>
                <div className="world-culture-festival__divider">OR</div>

                <div className="world-culture-festival__third-party-auth">
                  <button
                    className="wcf-icon-button"
                    type="button"
                    onClick={googleLogin}
                  >
                    <img src="/img/google.png" alt="Sign in with Google" />
                  </button>

                  <button
                    className="wcf-icon-button"
                    type="button"
                    onClick={fbLogin}
                  >
                    <img src="/img/fb-icon.png" alt="Sign in with Facebook" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }
  const { profile } = user;
  return (
    <section className="world-culture-festival">
      <div className="world-culture-festival__background world-culture-festival__background_people-1">
        <img src="/img/joel-reyer-QlYwXbFeymE-unsplash.png" />
      </div>

      <div className="container world-culture-festival__container">
        <div className="world-culture-festival__column">
          <center>
            <img
              src={profile.userProfilePic}
              name="aboutme"
              width="140"
              height="140"
              border="0"
              class="avatar"
            />
            <p className="wcf-body world-culture-festival__subtitle">
              Not {profile.name}?{" "}
              <a className="wcf-link" onClick={signout}>
                Sign out
              </a>
              :
            </p>
          </center>
          <button className="wcf-button wcf-form__button" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
