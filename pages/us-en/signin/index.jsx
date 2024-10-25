import { ALERT_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { api } from '@utils';
import {
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
  confirmSignIn,
} from 'aws-amplify/auth';
import { useAuth } from '@contexts';
// import { Passwordless as PasswordlessComponent } from '@components/passwordLessAuth';
import { Fido2Toast } from '@components/passwordLessAuth/NewComp';
import 'amazon-cognito-passwordless-auth/passwordless.css';

const SIGN_IN_MODE = 's-in';
const SIGN_UP_MODE = 's-up';
const RESET_PASSWORD_REQUEST = 'spr';
const NEW_PASSWORD_REQUEST = 'npr';

const StudentVerificationCodeMessage = () => (
  <div className="confirmation-message-info">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40px"
      height="40px"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="#ff865b" strokeWidth="1.5" />
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="#ff865b"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <br />
    <br />A verification link has been emailed to you. Please use the link to
    verify your student email.
  </div>
);

const VerificationCodeMessage = () => (
  <div className="confirmation-message-info">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40px"
      height="40px"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="#ff865b" strokeWidth="1.5" />
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="#ff865b"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <br />
    <br />A verification code has been emailed to you. Please use the
    verification code and reset your password.
  </div>
);

const TemporaryPasswordMessage = () => (
  <div className="confirmation-message-info">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40px"
      height="40px"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="#ff865b" strokeWidth="1.5" />
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="#ff865b"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <br />
    <br />A new temporary password has been emailed to you. Please use the
    temporary password and reset your password.
  </div>
);

const PasswordChangeSuccessMessage = () => (
  <div className="confirmation-message-info">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40px"
      height="40px"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="#ff865b" strokeWidth="1.5" />
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="#ff865b"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
  const authObj = useAuth();
  console.log(authObj);
  const { fetchCurrentUser, isAuthenticated } = authObj;
  const { busy, authenticateWithPassword } = authObj.passwordLess;
  // const { identify } = useAnalytics();
  const { showAlert } = useGlobalAlertContext();

  const [timeLeft, setTimeLeft] = useState(20);
  const [enableAutoRedirect, setEnableAutoRedirect] = useState(false);
  const [promiseHolder, setPromiseHolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHolding, setHolding] = useState(false);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsString.withDefault(SIGN_IN_MODE),
  );
  const [navigateTo] = useQueryState('next');
  const [username, setUsername] = useState(null);

  useEffect(() => {
    if (enableAutoRedirect) {
      // Set up the countdown interval
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      // Set up the redirection after 20 seconds
      const timer = setTimeout(() => {
        router.push('/target-page'); // Replace '/target-page' with your desired redirect path
      }, 20000);

      // Clear both timeout and interval when the component unmounts
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [enableAutoRedirect]);

  const clearMessageAction = () => {
    setMessage(null);
    setShowMessage(false);
  };

  const switchView = (view) => (e) => {
    if (e) e.preventDefault();
    setMode(view);
  };

  const getActualMessage = (message) => {
    if (!message) {
      return null;
    }
    if (
      message ===
      'Temporary password has expired and must be reset by an administrator.'
    ) {
      return 'Temporary password has expired. Please use the ‘Reset Password’ link.';
    }
    const matches = message.match(/\[(.*?)\]/);
    if (matches) {
      return matches[1];
    }
    return message;
  };

  const validateStudentEmail = (email) => {
    if (!email) {
      return false;
    }
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
  const newPasswordFlow = () => {
    return new Promise((resolve, reject) => {
      setMode(NEW_PASSWORD_REQUEST);
      setHolding(true);
      // Store the promise resolve method in the state
      setPromiseHolder({ resolve, reject });
    });
  };

  const signInAction = async ({ username, password, isStudent = false }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await signOut({ global: true });
      await authenticateWithPassword({
        username: username,
        password: password,
        newPassword: newPasswordFlow,
      }).signedIn;
      await fetchCurrentUser();
      if (isStudent) {
        await api.post({
          path: 'verify-email',
          body: {
            email: username,
          },
        });
        setLoading(false);
        showAlert(
          ALERT_TYPES.NEW_ALERT,
          {
            children: <StudentVerificationCodeMessage />,
          },
          2000,
        );
      }
      /* const { nextStep } = await signIn({ username, password });
      switch (nextStep.signInStep) {
        case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
          setMode(NEW_PASSWORD_REQUEST);
          // Collect the confirmation code from the user and pass to confirmResetPassword.
          break;
        case 'DONE':
          await fetchCurrentUser();
          if (isStudent) {
            await api.post({
              path: 'verify-email',
              body: {
                email: username,
              },
            });
            setLoading(false);
            showAlert(
              ALERT_TYPES.NEW_ALERT,
              {
                children: <StudentVerificationCodeMessage />,
              },
              2000,
            );
            setTimeout(() => {
              // if (navigateTo) {
              //   router.push(navigateTo);
              // } else {
              //   router.push('/us-en');
              // }
            }, 1000);
          } else {
            // if (navigateTo) {
            //   router.push(navigateTo);
            // } else {
            //   router.push('/us-en');
            // }
          }
          break;
      } */
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
  const handleTemporaryPassword = async (username) => {
    let isTemporaryPasswordSucceeded = false;

    try {
      const {
        data,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'resend-temporary-password',
        body: { email: username },
      });

      isTemporaryPasswordSucceeded = true;
      if (data?.User?.UserStatus === 'FORCE_CHANGE_PASSWORD') {
        showAlert(
          ALERT_TYPES.NEW_ALERT,
          {
            children: <TemporaryPasswordMessage />,
          },
          // 2000,
        );
      }
    } catch (error) {
      console.log(error);
      isTemporaryPasswordSucceeded = false;
    }

    return isTemporaryPasswordSucceeded;
  };

  const handleResetPassword = async (username) => {
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
  };

  const resetPasswordAction = async () => {
    setLoading(true);
    setShowMessage(false);
    const isTemporaryPasswordSucceeded =
      await handleTemporaryPassword(username);

    if (isTemporaryPasswordSucceeded === false) {
      await handleResetPassword(username);
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

        showAlert(
          ALERT_TYPES.NEW_ALERT,
          {
            children: <VerificationCodeMessage />,
          },
          // 2000,
        );
        setMode(RESET_PASSWORD_REQUEST);
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
      showAlert(
        ALERT_TYPES.NEW_ALERT,
        {
          children: <PasswordChangeSuccessMessage />,
        },
        2000,
      );
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
      if (promiseHolder) {
        promiseHolder.resolve(password);
        setHolding(false);
        setMode(SIGN_IN_MODE);
      }
      /* const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: password,
      });
      if (isSignedIn && nextStep.signInStep === 'DONE') {
        if (navigateTo) {
          router.push(navigateTo);
        } else {
          router.push('/us-en');
        }
      } */
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
      customState: navigateTo || router.asPath,
    });
  };

  const signUpAction = async ({ username, password, firstName, lastName }) => {
    setLoading(true);
    setShowMessage(false);
    const isStudentFlowEnabled =
      process.env.NEXT_PUBLIC_ENABLE_STUDENT_FLOW === 'true';
    try {
      await signUp({
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
      <div className="login-options">
        <button className="google-icon" onClick={googleLogin}>
          <img src="/img/google-icon.svg" />
        </button>
        <button className="facebook-icon" onClick={fbLogin}>
          <img src="/img/facebook-icon.svg" />
        </button>
        {/* <button className="apple-icon">
          <img src="/img/apple-icon.svg" />
        </button> */}
      </div>
    );
  };

  const renderForm = () => {
    if (isAuthenticated) {
      return (
        <SigninForm
          signIn={signInAction}
          forgotPassword={resetPasswordAction}
          toSignUpMode={switchView(SIGN_UP_MODE)}
          showMessage={showMessage}
          message={getActualMessage(message)}
          setUsername={setUsername}
          username={username}
          setLoading={setLoading}
          loading={loading}
          backToFlowAction={backToFlowAction}
          clearMessageAction={clearMessageAction}
        >
          {socialLoginRender()}
        </SigninForm>
      );
    }
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
            forgotPassword={resetPasswordAction}
            toSignUpMode={switchView(SIGN_UP_MODE)}
            showMessage={showMessage}
            message={getActualMessage(message)}
            setUsername={setUsername}
            username={username}
            setLoading={setLoading}
            loading={loading}
            backToFlowAction={backToFlowAction}
            clearMessageAction={clearMessageAction}
          >
            {socialLoginRender()}
          </SigninForm>
        );
    }
  };

  return (
    <main className="login-register-page">
      {renderForm()}

      <Fido2Toast />
      {(loading || busy) && !isHolding && (
        <div className="loading-overlay">
          <div className="overlay-loader"></div>
          <div className="loading-text">Please wait...</div>
        </div>
      )}
    </main>
  );
}
LoginPage.hideFooter = true;

export default LoginPage;
