import { MESSAGE_EMAIL_VERIFICATION_SUCCESS } from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { Auth, api } from '@utils';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useAnalytics } from 'use-analytics';
import {
  ChangePasswordForm,
  NewPasswordForm,
  ResetPasswordForm,
  SigninForm,
  SignupForm,
} from '@components/loginForm';
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
  parseAsTimestamp,
  parseAsIsoDateTime,
  parseAsArrayOf,
  parseAsJson,
  parseAsStringEnum,
  parseAsStringLiteral,
  parseAsNumberLiteral,
  createParser,
} from 'nuqs';
import {
  signIn,
  signOut,
  signUp,
  signInWithRedirect,
  resetPassword,
  confirmResetPassword,
  updatePassword,
} from 'aws-amplify/auth';
import {
  Passwordless as PasswordlessComponent,
  Fido2Toast,
} from '@components/passwordLessAuth';

import 'amazon-cognito-passwordless-auth/passwordless.css';

const SIGN_IN_MODE = 's-in';
const SIGN_UP_MODE = 's-up';
const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST';
const NEW_PASSWORD_REQUEST = 'NEW_PASSWORD_REQUEST';
const CHANGE_PASSWORD_REQUEST = 'CHANGE_PASSWORD_REQUEST';

const MESSAGE_SIGNUP_SUCCESS = 'Sign up completed successfully.';
const MESSAGE_VERIFICATION_CODE_SENT_SUCCESS =
  'A verification code has been emailed to you. Please use the verification code and reset your password.';

const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
};

function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { identify } = useAnalytics();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsString.withDefault(SIGN_IN_MODE),
  );
  const [navigateTo] = useQueryState('next');
  const [username, setUsername] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
    const regex = new RegExp(process.env.NEXT_PUBLIC_STUDENT_EMAIL_REGEX);
    const isStudentEmail = regex.test(email) && email.indexOf('alumni') < 0;
    return isStudentEmail;
  };

  const signInAction = async ({ username, password, isStudent = false }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      await signOut({ global: true });
      const { isSignedIn, nextStep } = await signIn({ username, password });
      console.log(isSignedIn, nextStep);
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
    // setLoading(true);
    // setShowMessage(false);
    // try {
    //   const { newPasswordRequired } = await Auth.authenticateUser(
    //     username,
    //     password,
    //   );
    //   if (newPasswordRequired) {
    //     setCurrentUser({ username, password });
    //     setMode(NEW_PASSWORD_REQUEST);
    //     setLoading(false);
    //   } else {
    //     const userInfo = await Auth.reFetchProfile();
    //     setUser(userInfo);
    //     identify(userInfo.profile.email, {
    //       id: userInfo.profile.username,
    //       sfid: userInfo.profile.id,
    //       email: userInfo.profile.email,
    //       first_name: userInfo.profile.first_name,
    //       last_name: userInfo.profile.last_name,
    //       subscriptions: userInfo.profile.subscriptions,
    //       sky_flag: userInfo.profile.isMandatoryWorkshopAttended,
    //       sahaj_flag: userInfo.profile.isSahajGraduate,
    //       silence_course_count: userInfo.profile.aosCountTotal,
    //     });

    //     if (isStudent) {
    //       await api.post({
    //         path: 'verify-email',
    //         body: {
    //           email: username,
    //         },
    //       });
    //       setShowSuccessMessage(true);
    //       setSuccessMessage(MESSAGE_EMAIL_VERIFICATION_SUCCESS);
    //       setTimeout(() => {
    //         setLoading(false);
    //         setShowSuccessMessage(false);
    //         setSuccessMessage(null);
    //         hideModal();
    //         if (navigateTo) {
    //           return pushRouteWithUTMQuery(router, navigateTo);
    //         } else {
    //           router.reload(window.location.pathname);
    //         }
    //       }, 3000);
    //     } else {
    //       setLoading(false);
    //       hideModal();
    //       if (navigateTo) {
    //         return pushRouteWithUTMQuery(router, navigateTo);
    //       } else {
    //         router.reload(window.location.pathname);
    //       }
    //     }
    //     // const user = await Auth.signIn(username, password);
    //     // if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
    //     //   setCurrentUser(user);
    //     //   setMode(NEW_PASSWORD_REQUEST);
    //     //   setLoading(false);
    //     // } else {
    //     //   const token = user.signInUserSession.idToken.jwtToken;
    //     //   await api.get({
    //     //     path: "profile",
    //     //     token,
    //     //   });

    //     //   setLoading(false);
    //     //   hideModal();
    //     //   if (navigateTo) {
    //     //     return pushRouteWithUTMQuery(router,navigateTo);
    //     //   } else {
    //     //     router.reload(window.location.pathname);
    //     //   }
    //     // }
    //   }
    // } catch (ex) {
    //   // await Auth.signOut();
    //   const data = ex.response?.data;
    //   let errorMessage = ex.message.match(/\[(.*)\]/);
    //   if (errorMessage) {
    //     errorMessage = errorMessage[1];
    //   } else {
    //     errorMessage = ex.message;
    //   }
    //   const { message, statusCode } = data || {};
    //   if (statusCode === 500) {
    //     setMessage(
    //       message ? `Error: Unable to login. (${message})` : errorMessage,
    //     );
    //   } else {
    //     setMessage(
    //       message ? `Error: ${message} (${statusCode})` : errorMessage,
    //     );
    //   }
    //   console.error(ex);
    //   setShowMessage(true);
    //   setLoading(false);
    // }
  };

  const resetPasswordAction = async ({ username }) => {
    setLoading(true);
    setShowMessage(false);
    try {
      const output = await resetPassword({ username });
      handleResetPasswordNextSteps(output);
      // const { resendTemporaryPassword } = await Auth.sendCode({
      //   email: username,
      // });
      // setUsername(username);
      // setShowSuccessMessage(true);
      // setSuccessMessage(MESSAGE_VERIFICATION_CODE_SENT_SUCCESS);
      // setTimeout(() => {
      //   setMode(resendTemporaryPassword ? LOGIN_MODE : CHANGE_PASSWORD_REQUEST);
      //   setShowSuccessMessage(false);
      //   setSuccessMessage(null);
      // }, 3000);
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
        // Collect the confirmation code from the user and pass to confirmResetPassword.
        break;
      case 'DONE':
        console.log('Successfully reset password.');
        break;
    }
  };

  const handleConfirmResetPassword = async ({
    username,
    confirmationCode,
    newPassword,
  }) => {
    try {
      await confirmResetPassword({ username, confirmationCode, newPassword });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdatePassword = async (oldPassword, newPassword) => {
    try {
      await updatePassword({ oldPassword, newPassword });
    } catch (err) {
      console.log(err);
    }
  };

  const fbLogin = async () => {
    // const params = {
    //   state: navigateTo || router.asPath,
    //   identity_provider: 'Facebook',
    //   redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN,
    //   client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    //   response_type: 'CODE',
    //   scope: 'email phone profile aws.cognito.signin.user.admin openid',
    // };
    await signInWithRedirect({
      provider: 'Facebook',
      customState: navigateTo || router.asPath,
    });
    // window.location.replace(
    //   `https://${
    //     process.env.NEXT_PUBLIC_COGNITO_DOMAIN
    //   }/oauth2/authorize?${encodeFormData(params)}`,
    // );
  };

  const googleLogin = async () => {
    // const params = {
    //   state: navigateTo || router.asPath,
    //   identity_provider: 'Google',
    //   redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN,
    //   client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    //   response_type: 'CODE',
    //   scope: 'email phone profile aws.cognito.signin.user.admin openid',
    // };
    await signInWithRedirect({
      provider: 'Google',
      customState: navigateTo || router.asPath,
    });
    // window.location.replace(
    //   `https://${
    //     process.env.NEXT_PUBLIC_COGNITO_DOMAIN
    //   }/oauth2/authorize?${encodeFormData(params)}`,
    // );
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
      // await signInAction({ username, password, isStudent });
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
        <button class="google-icon">
          <img src="/img/google-icon.svg" onClick={googleLogin} />
        </button>
        <button class="facebook-icon" onClick={fbLogin}>
          <img src="/img/facebook-icon.svg" />
        </button>
        <button class="apple-icon">
          <img src="/img/apple-icon.svg" />
        </button>
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
            signUp={signUpAction}
            showMessage={showMessage}
            message={getActualMessage(message)}
            toSignInMode={switchView(SIGN_IN_MODE)}
          >
            {socialLoginRender()}
          </ResetPasswordForm>
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
          >
            {socialLoginRender()}
          </SigninForm>
        );
    }
  };

  return (
    <main class="login-register-page">
      {renderForm()}
      <PasswordlessComponent
        brand={{
          backgroundImageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Manhattan_in_the_distance_%28Unsplash%29.jpg/2880px-Manhattan_in_the_distance_%28Unsplash%29.jpg',
          customerName: 'Amazon Web Services',
          customerLogoUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1280px-Amazon_Web_Services_Logo.svg.png',
        }}
      ></PasswordlessComponent>
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
