import { ALERT_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAnalytics } from 'use-analytics';
import {
  ChangePasswordForm,
  NewPasswordForm,
  ResetPasswordForm,
  SigninForm,
  SignupForm,
} from '@components/loginForm';
import { useQueryState, parseAsString } from 'nuqs';
import {
  signIn,
  signOut,
  signUp,
  signInWithRedirect,
  resetPassword,
  confirmResetPassword,
  updatePassword,
  confirmSignIn,
} from 'aws-amplify/auth';
// import { Passwordless as PasswordlessComponent } from '@components/passwordLessAuth';
import { Fido2Toast } from '@components/passwordLessAuth/NewComp';

import 'amazon-cognito-passwordless-auth/passwordless.css';

const SIGN_IN_MODE = 's-in';
const SIGN_UP_MODE = 's-up';
const RESET_PASSWORD_REQUEST = 'spr';
const NEW_PASSWORD_REQUEST = 'npr';
const CHANGE_PASSWORD_REQUEST = 'cpr';

const VerificationCodeMessage = () => (
  <div class="confirmation-message-info">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40px"
      height="40px"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="#ff865b" stroke-width="1.5" />
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="#ff865b"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <br />
    <br />A verification code has been emailed to you. Please use the
    verification code and reset your password.
  </div>
);

const PasswordChangeSuccessMessage = () => (
  <div class="confirmation-message-info">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40px"
      height="40px"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="#ff865b" stroke-width="1.5" />
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="#ff865b"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <br />
    <br />
    Your password has been successfully updated. Your account is now secured
    with the new password.
  </div>
);

function LoginPage() {
  const router = useRouter();
  // const { identify } = useAnalytics();
  const { showAlert } = useGlobalAlertContext();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsString.withDefault(SIGN_IN_MODE),
  );
  const [navigateTo] = useQueryState('next');
  const [username, setUsername] = useState(null);

  const switchView = (view) => (e) => {
    if (e) e.preventDefault();
    setMode(view);
    if (view === RESET_PASSWORD_REQUEST) {
      resetPasswordAction();
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

  const validateStudentEmail = (email) => {
    const regex = new RegExp(process.env.NEXT_PUBLIC_STUDENT_EMAIL_REGEX);
    const isStudentEmail = regex.test(email) && email.indexOf('alumni') < 0;
    return isStudentEmail;
  };

  const backToFlowAction = (e) => {
    if (e) e.preventDefault();
    if (navigateTo) {
      router.push(navigateTo);
    } else {
      router.push('/us-en');
    }
  };

  const signInAction = async ({ username, password, isStudent = false }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await signOut({ global: true });
      const { isSignedIn, nextStep } = await signIn({ username, password });
      console.log(isSignedIn, nextStep);
      switch (nextStep.signInStep) {
        case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
          setMode(NEW_PASSWORD_REQUEST);
          // Collect the confirmation code from the user and pass to confirmResetPassword.
          break;
        case 'DONE':
          if (navigateTo) {
            router.push(navigateTo);
          } else {
            router.push('/us-en');
          }
          break;
      }
    } catch (ex) {
      console.log(ex);
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

      setShowMessage(true);
    }
    setLoading(false);
  };

  const resetPasswordAction = async () => {
    setLoading(true);
    setShowMessage(false);
    try {
      const output = await resetPassword({ username });
      handleResetPasswordNextSteps(output);
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

  const handleResetPasswordNextSteps = (output) => {
    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        // eslint-disable-next-line no-case-declarations
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(
          `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`,
        );

        showAlert(ALERT_TYPES.NEW_ALERT, {
          children: <VerificationCodeMessage />,
        });
        // Collect the confirmation code from the user and pass to confirmResetPassword.
        break;
      case 'DONE':
        console.log('Successfully reset password.');
        if (navigateTo) {
          router.push(navigateTo);
        } else {
          router.push('/us-en');
        }
        break;
    }
  };

  const handleConfirmResetPassword = async ({ code, password }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await confirmResetPassword({
        username,
        confirmationCode: '' + code,
        newPassword: password,
      });
      setMode(SIGN_IN_MODE);
      showAlert(ALERT_TYPES.NEW_ALERT, {
        children: <PasswordChangeSuccessMessage />,
      });
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

  const handleUpdatePassword = async ({ password }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: password,
      });
      console.log(isSignedIn, nextStep);
      if (isSignedIn && nextStep.signInStep === 'DONE') {
        if (navigateTo) {
          router.push(navigateTo);
        } else {
          router.push('/us-en');
        }
      }
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

  const fbLogin = async () => {
    setLoading(true);
    setShowMessage(false);
    await signInWithRedirect({
      provider: 'Facebook',
      customState: navigateTo,
    });
  };

  const googleLogin = async () => {
    setLoading(true);
    setShowMessage(false);
    await signInWithRedirect({
      provider: 'Google',
      customState: navigateTo,
    });
  };

  const signUpAction = async ({ username, password, firstName, lastName }) => {
    setLoading(true);
    setShowMessage(false);
    const isStudentFlowEnabled =
      process.env.NEXT_PUBLIC_ENABLE_STUDENT_FLOW === 'true';
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email: username,
            given_name: firstName,
            family_name: lastName, // E.164 number convention
          },
          // optional
          autoSignIn: true, // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }
        },
      });
      console.log(isSignUpComplete, userId, nextStep);
      // await Auth.signup({ email: username, password, firstName, lastName });
      const isStudent = isStudentFlowEnabled && validateStudentEmail(username);
      await signInAction({ username, password, isStudent });
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

  const socialLoginRender = () => {
    return (
      <div class="login-options">
        <button class="google-icon" onClick={googleLogin}>
          <img src="/img/google-icon.svg" />
        </button>
        <button class="facebook-icon" onClick={fbLogin}>
          <img src="/img/facebook-icon.svg" />
        </button>
        {/* <button class="apple-icon">
          <img src="/img/apple-icon.svg" />
        </button> */}
      </div>
    );
  };

  const renderForm = () => {
    switch (mode) {
      case SIGN_UP_MODE:
        return (
          <SignupForm
            signUp={signUpAction}
            showMessage={showMessage}
            message={getActualMessage(message)}
            toSignInMode={switchView(SIGN_IN_MODE)}
          >
            {socialLoginRender()}
          </SignupForm>
        );
      case RESET_PASSWORD_REQUEST:
        return (
          <ResetPasswordForm
            resetPassword={handleConfirmResetPassword}
            showMessage={showMessage}
            message={getActualMessage(message)}
            toSignInMode={switchView(SIGN_IN_MODE)}
            username={username}
            resetCodeAction={resetPasswordAction}
          ></ResetPasswordForm>
        );
      case NEW_PASSWORD_REQUEST:
        return (
          <NewPasswordForm
            completeNewPassword={handleUpdatePassword}
            showMessage={showMessage}
            message={getActualMessage(message)}
            toSignInMode={switchView(SIGN_IN_MODE)}
          ></NewPasswordForm>
        );
      default:
        return (
          <SigninForm
            signIn={signInAction}
            forgotPassword={switchView(RESET_PASSWORD_REQUEST)}
            toSignUpMode={switchView(SIGN_UP_MODE)}
            showMessage={showMessage}
            message={getActualMessage(message)}
            setUsername={setUsername}
            username={username}
            setLoading={setLoading}
            loading={loading}
            backToFlowAction={backToFlowAction}
          >
            {socialLoginRender()}
          </SigninForm>
        );
    }
  };

  return (
    <main class="login-register-page">
      {renderForm()}

      <Fido2Toast />
      {loading && (
        <div class="loading-overlay">
          <div class="overlay-loader"></div>
          <div class="loading-text">Please wait...</div>
        </div>
      )}
    </main>
  );
}
LoginPage.hideFooter = true;

export default LoginPage;
