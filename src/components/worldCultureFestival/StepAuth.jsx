/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { api, Auth } from "@utils";
import { useAuth } from "@contexts";
import { MESSAGE_EMAIL_VERIFICATION_SUCCESS } from "@constants";
import classNames from "classnames";
import { useRouter } from "next/router";
import Link from "next/link";
import startsWith from "lodash.startswith";
import { useAnalytics } from "use-analytics";
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
  const navigateTo = `/us-en/world-culture-festival?s=1&t=${
    props.values.ticketCount
  }&sa=${JSON.stringify(props.values.sessionsAttending)}`;
  // console.log(navigateTo);
  const { authenticated, user, setUser } = useAuth();
  const [authMode, setAuthMode] = useState(SIGNUP_MODE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [username, setUsername] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { identify, track } = useAnalytics();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    track("view_screen", {
      screen_name: "wcf_registration_signup_page",
      utm_parameters: JSON.stringify(router.query),
      sessions_attending_arr: JSON.stringify(props.values.sessionsAttending),
      number_of_tickets: props.values.ticketCount,
    });
  }, [router.isReady]);

  const switchView = (view) => (e) => {
    if (e) e.preventDefault();
    setAuthMode(view);
    if (view === LOGIN_MODE) {
      track("view_screen", {
        screen_name: "wcf_registration_login_page",
        utm_parameters: JSON.stringify(router.query),
        sessions_attending_arr: JSON.stringify(props.values.sessionsAttending),
        number_of_tickets: props.values.ticketCount,
      });
    }
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
    track("click_button", {
      screen_name: "wcf_registration_login_page",
      event_target: "login_button",
      utm_parameters: JSON.stringify(router.query),
      sessions_attending_arr: JSON.stringify(props.values.sessionsAttending),
      number_of_tickets: props.values.ticketCount,
    });
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
        let subscriptions = "";
        if (userInfo.profile.subscriptions) {
          subscriptions = JSON.stringify(
            userInfo.profile.subscriptions.map(({ sfid, name }) => {
              return {
                id: sfid,
                name,
              };
            }),
          );
        }
        identify(userInfo.profile.email, {
          id: userInfo.profile.username,
          sfid: userInfo.profile.id,
          email: userInfo.profile.email,
          name: userInfo.profile.name,
          first_name: userInfo.profile.first_name,
          last_name: userInfo.profile.last_name,
          avatar: userInfo.profile.userProfilePic,
          state: userInfo.profile.personMailingState, // State
          country: userInfo.profile.personMailingCountry, // Country
          subscriptions: subscriptions,
          sky_flag: userInfo.profile.isMandatoryWorkshopAttended,
          sahaj_flag: userInfo.profile.isSahajGraduate,
          silence_course_count: userInfo.profile.aosCountTotal,
        });
        track("login_user", {
          screen_name: "wcf_registration_login_page",
          utm_parameters: JSON.stringify(router.query),
          sessions_attending_arr: JSON.stringify(
            props.values.sessionsAttending,
          ),
          number_of_tickets: props.values.ticketCount,
        });

        props.setFieldValue("state", userInfo.profile.personMailingState);
        let userCountry = userInfo.profile.personMailingCountry
          ? userInfo.profile.personMailingCountry.toUpperCase()
          : "US";
        let userPhoneNumber = userInfo.profile.personMobilePhone || "";
        if (
          userCountry === "" ||
          userCountry === "USA" ||
          userCountry === "UNITED STATES OF AMERICA"
        ) {
          userCountry = "US";
        }
        props.setFieldValue("country", userCountry);
        props.setFieldValue("phoneCountry", userCountry);

        if (
          !startsWith(userPhoneNumber, "+") &&
          userCountry === "US" &&
          !startsWith(userPhoneNumber, "+1")
        ) {
          userPhoneNumber = "+1" + userPhoneNumber;
          props.setFieldValue("phoneCountry", "US");
        }

        props.setFieldValue("phoneNumber", userPhoneNumber);

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
    track("click_button", {
      screen_name:
        authMode === SIGNUP_MODE
          ? "wcf_registration_signup_page"
          : "wcf_registration_login_page",
      event_target: "facebook_login_button",
      utm_parameters: JSON.stringify(router.query),
      sessions_attending_arr: JSON.stringify(props.values.sessionsAttending),
      number_of_tickets: props.values.ticketCount,
    });
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
    track("click_button", {
      screen_name:
        authMode === SIGNUP_MODE
          ? "wcf_registration_signup_page"
          : "wcf_registration_login_page",
      event_target: "google_login_button",
      utm_parameters: JSON.stringify(router.query),
      sessions_attending_arr: JSON.stringify(props.values.sessionsAttending),
      number_of_tickets: props.values.ticketCount,
    });
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
    props.setFieldValue("state", null);
    props.setFieldValue("country", "US");
    props.setFieldValue("phoneCountry", "US");
    props.setFieldValue("phoneNumber", "");
  };

  const signUp = async ({ username, password, firstName, lastName }) => {
    setLoading(true);
    setShowMessage(false);
    track("click_button", {
      screen_name: "wcf_registration_signup_page",
      event_target: "signup_button",
      utm_parameters: JSON.stringify(router.query),
      sessions_attending_arr: JSON.stringify(props.values.sessionsAttending),
      number_of_tickets: props.values.ticketCount,
    });
    try {
      await Auth.signup({ email: username, password, firstName, lastName });
      track("signup_user", {
        screen_name: "wcf_registration_login_page",
        utm_parameters: JSON.stringify(router.query),
        sessions_attending_arr: JSON.stringify(props.values.sessionsAttending),
        number_of_tickets: props.values.ticketCount,
      });
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
        <div className="world-culture-festival__background world-culture-festival__background_people-3">
          <img src="/img/wcf-bg-image.png" />
        </div>

        <div className="container world-culture-festival__container">
          <div className="world-culture-festival__column">
            <p className="wcf-body world-culture-festival__subtitle">
              Log In with your Art of Living Journey account or Sign Up below:
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
      <div className="world-culture-festival__background world-culture-festival__background_people-3">
        <img src="/img/wcf-bg-image.png" />
      </div>

      <div className="container world-culture-festival__container">
        <div className="world-culture-festival__column">
          <center>
            <img
              src={profile.userProfilePic || "/img/avatar-icon.svg"}
              name="aboutme"
              width="140"
              height="140"
              border="0"
              className="avatar"
            />
            <p className="wcf-body world-culture-festival__subtitle">
              Not {profile.name} ?{" "}
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
