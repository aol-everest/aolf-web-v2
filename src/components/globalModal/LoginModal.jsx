import React, { useState } from "react";
import { useGlobalModalContext } from "@contexts";
import { Auth } from "aws-amplify";
import classNames from "classnames";
import { useRouter } from "next/router";
import { FaCheckCircle } from "react-icons/fa";
import {
  SignupForm,
  SigninForm,
  ResetPasswordForm,
  ChangePasswordForm,
  NewPasswordForm,
} from "./../loginForm";

const LOGIN_MODE = "LOGIN_MODE";
const SIGNUP_MODE = "SIGNUP_MODE";
const RESET_PASSWORD_REQUEST = "RESET_PASSWORD_REQUEST";
const NEW_PASSWORD_REQUEST = "NEW_PASSWORD_REQUEST";
const CHANGE_PASSWORD_REQUEST = "CHANGE_PASSWORD_REQUEST";

const MESSAGE_SIGNUP_SUCCESS = "Sign up completed successfully.";
const MESSAGE_VERIFICATION_CODE_SENT_SUCCESS =
  "A verification code has been emailed to you. Please use the verification code and reset your password.";

export const LoginModal = () => {
  const router = useRouter();
  const { hideModal, store } = useGlobalModalContext();
  const { modalProps } = store || {};
  const { navigateTo, hideCloseBtn = false } = modalProps || {};

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [mode, setMode] = useState(LOGIN_MODE);
  const [username, setUsername] = useState(null);

  const handleModalToggle = () => {
    hideModal();
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

  const signIn = async ({ username, password }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      const user = await Auth.signIn(username, password);
      if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
        setUsername(username);
        setMode(NEW_PASSWORD_REQUEST);
      }
      if (!hideCloseBtn) {
        hideModal();
      }
      if (navigateTo) {
        setLoading(false);
        return router.push(navigateTo);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message);
      setShowMessage(true);
    }
    setLoading(false);
  };

  const fbLogin = () => {
    Auth.federatedSignIn({ provider: "Facebook" });
  };

  const googleLogin = () => {
    Auth.federatedSignIn({ provider: "Google" });
  };

  const signUp = async ({ username, password, firstName, lastName }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await Auth.signUp({
        username,
        password,
        attributes: {
          email: username,
          given_name: firstName,
          family_name: lastName,
        },
      });
      await signIn({ username, password });
    } catch (error) {
      console.error(error);
      setMessage(error.message);
      setShowMessage(true);
    }
    setLoading(false);
  };

  const resetPassword = async ({ username }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await Auth.forgotPassword(username);
      setUsername(username);
      setShowSuccessMessage(true);
      setSuccessMessage(MESSAGE_VERIFICATION_CODE_SENT_SUCCESS);
      setTimeout(() => {
        setMode(CHANGE_PASSWORD_REQUEST);
        setShowSuccessMessage(false);
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
      setShowMessage(true);
    }
    setLoading(false);
  };

  const changePassword = async ({ code, password }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await Auth.forgotPasswordSubmit(username, "" + code, password);
      setUsername(null);
      setMode(LOGIN_MODE);
    } catch (error) {
      console.log("error signing in", error);
      setMessage(error.message);
      setShowMessage(true);
    }
    setLoading(false);
  };

  const completeNewPassword = async ({ password }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await Auth.completeNewPassword(username, password);
      setUsername(null);
      setMode(LOGIN_MODE);
    } catch (error) {
      console.log("error signing in", error);
      setMessage(error.message);
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
