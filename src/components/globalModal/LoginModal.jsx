import React, { useState } from "react";
import { useGlobalModalContext } from "@contexts";
import { Auth } from "aws-amplify";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const LOGIN_MODE = "LOGIN_MODE";
const SIGNUP_MODE = "SIGNUP_MODE";
const RESET_PASSWORD_REQUEST = "RESET_PASSWORD_REQUEST";
const NEW_PASSWORD_REQUEST = "NEW_PASSWORD_REQUEST";
const CHANGE_PASSWORD_REQUEST = "CHANGE_PASSWORD_REQUEST";

const MESSAGE_SIGNUP_SUCCESS = "Sign up completed successfully.";
const MESSAGE_VERIFICATION_CODE_SENT_SUCCESS =
  "A verification code has been emailed to you. Please use the verification code and reset your password.";

const schema = yup.object().shape({
  username: yup
    .string()
    .email("Email is invalid")
    .required("Email is required"),
  password: yup.string().required(),
});

export const LoginModal = () => {
  const { hideModal, store } = useGlobalModalContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  // const { modalProps } = store || {};
  // const { title, confirmBtn } = modalProps || {};

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [mode, setMode] = useState(LOGIN_MODE);

  const handleModalToggle = () => {
    hideModal();
  };

  const switchView = (view) => (e) => {
    if (e) e.preventDefault();
    setMode(view);
  };

  const signIn = async ({ username, password }) => {
    try {
      const user = await Auth.signIn(username, password);
      console.log(user);
      // router.push("/client-protected");
    } catch (error) {
      console.log("error signing in", error);
      setLoading(false);
      setMessage(error.message);
      setShowMessage(true);
    }
  };

  return (
    <div class="modal-window auth show active">
      <div class="modal-window__card show">
        {loading && <div class="cover-spin"></div>}
        <div
          class={classNames("success-message-container", {
            "d-none": !showSuccessMessage,
          })}
        >
          <div class="success-message">
            <div class="icon-container">
              <i class="fas fa-check-circle"></i>
            </div>
            {successMessage}
          </div>
        </div>
        <div class="modal-window__header">
          <button
            class="modal-window__close modal-window__close_mobile"
            onClick={handleModalToggle}
          >
            <div class="close-line"></div>
            <div class="close-line"></div>
          </button>
          <h6 class="modal-window__subtitle">
            You’re minutes away from the next step in your journey
          </h6>
          <div class="auth-btn-wrapper">
            <button
              class={classNames("auth-btn", {
                active: mode === LOGIN_MODE,
              })}
              id="login"
              onClick={switchView(LOGIN_MODE)}
            >
              Log In
            </button>
            <button
              class={classNames("auth-btn", {
                active: mode === SIGNUP_MODE,
              })}
              id="signup"
              onClick={switchView(SIGNUP_MODE)}
            >
              Sign Up
            </button>
          </div>
        </div>
        <div class="modal-window__body">
          <div class="icon-wrapper">
            <div class="icon">
              <img src="./img/ic-facebook.svg" alt="facebook" />
            </div>
            <div class="icon">
              <img src="./img/google.svg" alt="google" />
            </div>
          </div>
          <p>or</p>
          {mode === LOGIN_MODE && (
            <form
              id="login-form"
              class="active show"
              onSubmit={handleSubmit(signIn)}
            >
              <input
                {...register("username")}
                type="email"
                placeholder="Email"
              />
              {errors.username && (
                <p class="validation-input">{errors.username.message}</p>
              )}
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
              />
              {errors.password && (
                <p class="validation-input">{errors.password.message}</p>
              )}
              {showMessage && <p class="validation-input">{message}</p>}
              <a class="link" href="#">
                Don’t remember your password?
              </a>
              <button class="mt-4 modal-window__btn btn-primary" type="submit">
                Log In
              </button>
            </form>
          )}
          {mode === SIGNUP_MODE && (
            <form id="signup-form" class="active show">
              <input type="email" class="validate" placeholder="Email" />
              <p class="validation-input" id="validation-email">
                This type of email does not exist. Please enter a valid one.
              </p>
              <input type="password" placeholder="Password" />
              <input type="text" placeholder="First Name" />
              <input type="text" placeholder="Last Name" />
              <div class="checkbox-wrapper">
                <input
                  class="custom-checkbox"
                  type="checkbox"
                  name="program"
                  id="program"
                />
                <label for="program"></label>
                <p class="checkbox-text">
                  By signing up, I agree to
                  <a href="#" class="link">
                    Terms of Service
                  </a>{" "}
                  and
                  <a href="#" class="link">
                    Privacy Policy
                  </a>
                </p>
              </div>
              <button class="mt-4 modal-window__btn btn-primary">
                Sign Up
              </button>
            </form>
          )}

          <button
            class="modal-window__close modal-window__close_desktop"
            onClick={handleModalToggle}
          >
            <div class="close-line"></div>
            <div class="close-line"></div>
          </button>
        </div>
      </div>
    </div>
  );
};
