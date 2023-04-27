import React, { useState } from "react";
import { useGlobalModalContext } from "@contexts";
import classNames from "classnames";
import { useRouter } from "next/router";
import { FaCheckCircle } from "react-icons/fa";
import { useAnalytics } from "use-analytics";
import {
  SignupForm,
  SigninForm,
  ResetPasswordForm,
  ChangePasswordForm,
  NewPasswordForm,
} from "./../loginForm";
import { api, Auth } from "@utils";
import { useAuth } from "@contexts";
import { MESSAGE_EMAIL_VERIFICATION_SUCCESS } from "@constants";
import { pushRouteWithUTMQuery } from "@service";

const LOGIN_MODE = "LOGIN_MODE";
const SIGNUP_MODE = "SIGNUP_MODE";
const RESET_PASSWORD_REQUEST = "RESET_PASSWORD_REQUEST";
const NEW_PASSWORD_REQUEST = "NEW_PASSWORD_REQUEST";
const CHANGE_PASSWORD_REQUEST = "CHANGE_PASSWORD_REQUEST";

const MESSAGE_SIGNUP_SUCCESS = "Sign up completed successfully.";
const MESSAGE_VERIFICATION_CODE_SENT_SUCCESS =
  "A verification code has been emailed to you. Please use the verification code and reset your password.";

const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

export const LoginModal = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const { identify } = useAnalytics();
  const { hideModal, store } = useGlobalModalContext();
  const { modalProps } = store || {};
  const {
    navigateTo,
    hideCloseBtn = false,
    closeModalAction,
    defaultView = LOGIN_MODE,
  } = modalProps || {};

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [mode, setMode] = useState(defaultView);
  const [username, setUsername] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const handleModalToggle = () => {
    hideModal();
    if (closeModalAction) {
      closeModalAction();
    }
  };

  const switchView = (view) => (e) => {
    if (e) e.preventDefault();
    setMode(view);
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

  const validateStudentEmail = (email) => {
    const regex = new RegExp("[a-z0-9]+@[a-zA-Z0-9.+-]+.edu$");
    const isStudentEmail = regex.test(email) && email.indexOf("alumni") < 0;
    return isStudentEmail;
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
        setMode(NEW_PASSWORD_REQUEST);
        setLoading(false);
      } else {
        const userInfo = await Auth.reFetchProfile();
        setUser(userInfo);
        identify(userInfo.profile.email, {
          id: userInfo.profile.username,
          sfid: userInfo.profile.id,
          email: userInfo.profile.email,
          first_name: userInfo.profile.first_name,
          last_name: userInfo.profile.last_name,
        });

        if (isStudent) {
          await api.post({
            path: "verify-email",
            body: {
              email: username,
            },
          });
          setShowSuccessMessage(true);
          setSuccessMessage(MESSAGE_EMAIL_VERIFICATION_SUCCESS);
          setTimeout(() => {
            setLoading(false);
            setShowSuccessMessage(false);
            setSuccessMessage(null);
            hideModal();
            if (navigateTo) {
              return pushRouteWithUTMQuery(router, navigateTo);
            } else {
              router.reload(window.location.pathname);
            }
          }, 3000);
        } else {
          setLoading(false);
          hideModal();
          if (navigateTo) {
            return pushRouteWithUTMQuery(router, navigateTo);
          } else {
            router.reload(window.location.pathname);
          }
        }
        // const user = await Auth.signIn(username, password);
        // if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
        //   setCurrentUser(user);
        //   setMode(NEW_PASSWORD_REQUEST);
        //   setLoading(false);
        // } else {
        //   const token = user.signInUserSession.idToken.jwtToken;
        //   await api.get({
        //     path: "profile",
        //     token,
        //   });

        //   setLoading(false);
        //   hideModal();
        //   if (navigateTo) {
        //     return pushRouteWithUTMQuery(router,navigateTo);
        //   } else {
        //     router.reload(window.location.pathname);
        //   }
        // }
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

  const signUp = async ({ username, password, firstName, lastName }) => {
    setLoading(true);
    setShowMessage(false);
    const isStudentFlowEnabled =
      process.env.NEXT_PUBLIC_ENABLE_STUDENT_FLOW === "true";
    try {
      await Auth.signup({ email: username, password, firstName, lastName });
      const isStudent = isStudentFlowEnabled && validateStudentEmail(username);
      await signIn({ username, password, isStudent });
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
        setMode(resendTemporaryPassword ? LOGIN_MODE : CHANGE_PASSWORD_REQUEST);
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
      setMode(LOGIN_MODE);
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
      setMode(LOGIN_MODE);
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

  return (
    <div className="modal-window auth show active">
      <div className="modal-window__card show">
        {loading && <div className="cover-spin"></div>}
        <div
          className={classNames("success-message-container", {
            "d-none": !showSuccessMessage,
          })}
        >
          <div className="success-message">
            <div className="icon-container">
              <FaCheckCircle />
            </div>
            {successMessage}
          </div>
        </div>
        <div className="modal-window__header">
          {!hideCloseBtn && (
            <button
              className="modal-window__close modal-window__close_mobile"
              onClick={handleModalToggle}
            >
              <div className="close-line"></div>
              <div className="close-line"></div>
            </button>
          )}
          {(mode === RESET_PASSWORD_REQUEST ||
            mode === NEW_PASSWORD_REQUEST ||
            mode === CHANGE_PASSWORD_REQUEST) && (
            <span
              role="button"
              className="back-button"
              onClick={switchView(LOGIN_MODE)}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                enableBackground="new 0 0 24 24"
                version="1.0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {" "}
                <polyline
                  fill="none"
                  points="12.5,21 3.5,12 12.5,3 "
                  stroke="#000000"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                ></polyline>{" "}
                <line
                  fill="none"
                  stroke="#000000"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  x1="22"
                  x2="3.5"
                  y1="12"
                  y2="12"
                ></line>{" "}
              </svg>
            </span>
          )}
          <h6 className="modal-window__subtitle">
            You’re minutes away from the next step in your journey
          </h6>
          {(mode === LOGIN_MODE || mode === SIGNUP_MODE) && (
            <div className="auth-btn-wrapper">
              <button
                className={classNames("auth-btn", {
                  active: mode === LOGIN_MODE,
                })}
                id="login"
                onClick={switchView(LOGIN_MODE)}
              >
                Log In
              </button>
              <button
                className={classNames("auth-btn", {
                  active: mode === SIGNUP_MODE,
                })}
                id="signup"
                onClick={switchView(SIGNUP_MODE)}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
        <div className="modal-window__body">
          {mode === NEW_PASSWORD_REQUEST && (
            <NewPasswordForm
              completeNewPassword={completeNewPassword}
              showMessage={showMessage}
              message={getActualMessage(message)}
            />
          )}
          {mode === RESET_PASSWORD_REQUEST && (
            <ResetPasswordForm
              resetPassword={resetPassword}
              showMessage={showMessage}
              message={getActualMessage(message)}
            />
          )}
          {mode === CHANGE_PASSWORD_REQUEST && (
            <ChangePasswordForm
              changePassword={changePassword}
              showMessage={showMessage}
              username={username}
              message={getActualMessage(message)}
            />
          )}
          {(mode === LOGIN_MODE || mode === SIGNUP_MODE) && (
            <>
              <div className="icon-wrapper">
                <div className="icon" onClick={fbLogin}>
                  <img src="/img/ic-facebook.svg" alt="facebook" />
                </div>
                <div className="icon" onClick={googleLogin}>
                  <img src="/img/google.svg" alt="google" />
                </div>
              </div>
              <p>or</p>
              {mode === LOGIN_MODE && (
                <SigninForm
                  signIn={signIn}
                  forgotPassword={switchView(RESET_PASSWORD_REQUEST)}
                  showMessage={showMessage}
                  message={getActualMessage(message)}
                />
              )}
              {mode === SIGNUP_MODE && (
                <SignupForm
                  signUp={signUp}
                  showMessage={showMessage}
                  message={getActualMessage(message)}
                />
              )}
            </>
          )}
          {!hideCloseBtn && (
            <button
              className="modal-window__close modal-window__close_desktop"
              onClick={handleModalToggle}
            >
              <div className="close-line"></div>
              <div className="close-line"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
