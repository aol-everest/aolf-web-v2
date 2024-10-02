/* eslint-disable react/no-unescaped-entities */
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { useState } from 'react';
import { useAuth, useLocalUserCache } from '@contexts';
import { Passwordless as NewPasswordlessComponent } from '@components/passwordLessAuth/NewComp';

const passwordSchema = object().shape({
  password: string().trim().required('Password is required'),
});

const userNameSchema = object().shape({
  username: string()
    .email('This type of email does not exist. Please enter a valid one.')
    .required('Email is required'),
});

const Container = (props) => {
  return (
    <section className="section-login-register">
      <div className="container">
        {/* <h1 className="page-title">Log in to your account</h1> */}
        {props.children}
      </div>
    </section>
  );
};

const StepInputUserName = ({ showMessage, message, children, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userNameSchema),
    defaultValues: {
      username: '',
    },
  });
  return (
    <>
      <div className="page-description">
        Welcome back! Please enter your details.
      </div>
      {children}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-login-register">
          <div className="form-item">
            <label for="email">Email address</label>
            <input
              id="email"
              type="email"
              className={classNames('input-field', {
                validate: errors.username,
              })}
              placeholder="Email address"
              {...register('username')}
            />
            {errors.username && (
              <div className="validation-input">{errors.username.message}</div>
            )}
          </div>
          {showMessage && <div className="common-error-message">{message}</div>}
          <div className="form-action">
            <button
              className="submit-btn"
              type="submit"
              disabled={errors.username?.message}
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

const StepInputPassword = ({
  showMessage,
  message,
  onSubmit,
  forgotPassword,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });
  const [type, setType] = useState('password');
  const handleToggle = () => {
    if (type === 'password') {
      setType('text');
    } else {
      setType('password');
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-login-register">
        {/* <div className="form-item">
          <label for="email">Email address</label>
          <p>{username}</p>
        </div> */}
        <div className="form-item password">
          <label for="pass">Password</label>
          <input
            type={type}
            className={classNames('input-field password', {
              validate: errors.password,
            })}
            placeholder="Password"
            autoComplete="current-password"
            autocapitalize="off"
            autocorrect="off"
            {...register('password')}
          />
          <button
            class={classNames('showPassBtn', type)}
            type="button"
            onClick={handleToggle}
          >
            <span className="icon-aol"></span>
          </button>
          {errors.password && (
            <div className="validation-input">{errors.password.message}</div>
          )}
        </div>
        {showMessage && <div className="common-error-message">{message}</div>}
        <div className="form-item">
          <a href="#" className="forgot-pass" onClick={forgotPassword}>
            Reset Password
          </a>
        </div>
        <div className="form-action">
          <button className="submit-btn" type="submit">
            Log in
          </button>
        </div>
      </div>
    </form>
  );
};

export const SigninForm = ({
  signIn,
  forgotPassword,
  showMessage,
  message,
  toSignUpMode,
  setUsername,
  username,
  loading,
  setLoading,
  backToFlowAction,
  children,
}) => {
  const authObj = useAuth();
  const {
    requestSignInLink,
    lastError,
    authenticateWithFido2,
    busy,
    signInStatus,
    signingInStatus,
    signOut,
    toggleShowAuthenticatorManager,
  } = authObj.passwordLess;
  const [step, setStep] = useState(0);
  const [newUsername, setNewUsername] = useState(username);
  const [showSignInOptionsForUser, setShowSignInOptionsForUser] =
    useState('LAST_USER');
  const { lastSignedInUsers } = useLocalUserCache();

  const toggleShowAuthenticatorManagerAction = (e) => {
    if (e) e.preventDefault();
    toggleShowAuthenticatorManager();
  };

  const signOutAction = (e) => {
    if (e) e.preventDefault();
    signOut();
  };

  const signInWithMagicLink = () => {
    requestSignInLink({
      username: user.username,
    });
  };

  const signInWithTouch = () => {
    authenticateWithFido2({
      username: user.username,
      credentials: user.credentials,
    });
  };

  if (signInStatus === 'SIGNED_IN') {
    // reset state fields for entering new username
    if (newUsername) {
      setNewUsername('');
    }
    if (showSignInOptionsForUser !== 'LAST_USER') {
      setShowSignInOptionsForUser('LAST_USER');
    }
  }

  if (
    signInStatus === 'CHECKING' ||
    signInStatus === 'REFRESHING_SIGN_IN' ||
    !lastSignedInUsers
  ) {
    return (
      <Container>
        <div className="passwordless-flex">
          <div className="passwordless-loading-spinner" />
          <div>Checking your sign-in status...</div>
        </div>
      </Container>
    );
  }
  if (signingInStatus === 'SIGNING_IN_WITH_LINK') {
    return (
      <Container>
        <div className="passwordless-flex">
          <div className="passwordless-loading-spinner" />
          <div>Checking the sign-in link...</div>
        </div>
      </Container>
    );
  }

  if (signingInStatus === 'SIGNING_OUT') {
    return (
      <Container>
        <div className="passwordless-flex">
          <div className="passwordless-loading-spinner" />
          <div>Signing out, please wait...</div>
        </div>
      </Container>
    );
  }

  if (setLoading) {
    if (!loading) {
      setLoading(
        signingInStatus === 'REQUESTING_SIGNIN_LINK' ||
          signingInStatus === 'STARTING_SIGN_IN_WITH_FIDO2',
      );
    } else if (
      signingInStatus === 'SIGNIN_LINK_REQUESTED' ||
      signingInStatus === 'FIDO2_SIGNIN_FAILED'
    ) {
      setLoading(false);
    }
  }

  if (signingInStatus === 'SIGNIN_LINK_REQUESTED') {
    return (
      <Container>
        <div className="passwordless-flex passwordless-flex-align-start">
          <svg
            width="24px"
            height="20px"
            viewBox="0 0 24 20"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1.8,17.4 L1.8,3.23906256 L12,13.4402345 L22.2,3.23906256 L22.2,17.5195313 L1.8,17.5195313 L1.8,17.4 Z M21,1.8 L12,10.8 L3,1.8 L21,1.8 Z M0,0 L0,19.2 L24,19.2 L24,0 L0,0 Z"></path>
          </svg>
          <div>
            <div className="passwordless-text-left">
              <strong>Please check your email.</strong>
            </div>
            <div>We&apos;ve emailed you a secret sign-in link</div>
          </div>
        </div>
      </Container>
    );
  }

  if (authObj.isAuthenticated) {
    //if (children) return <>{children}</>;
    return (
      <Container>
        <h1 className="page-title">Success, you are now logged in</h1>
        <div className="page-description">
          You&apos;re currently signed-in as:{' '}
          <span className="tw-font-semibold">{authObj?.profile.email}</span>
        </div>
        <div className="form-action">
          <button className="submit-btn" onClick={backToFlowAction}>
            Continue where you left off
          </button>
        </div>
        <div className="form-other-info">
          <a href="#" onClick={toggleShowAuthenticatorManagerAction}>
            Manage authenticators
          </a>
        </div>
        <div className="form-other-info">
          <a href="#" onClick={signOutAction}>
            Sign out
          </a>
        </div>
      </Container>
    );
  }

  const lastUser = lastSignedInUsers.find((u) => u.email);
  const user =
    newUsername && showSignInOptionsForUser === 'NEW_USER'
      ? {
          email: newUsername,
          username: newUsername,
          useFido: 'YES',
        }
      : showSignInOptionsForUser === 'LAST_USER'
        ? lastUser
        : undefined;

  if (user) {
    setUsername(user.email);
  }

  const updateStep = (stepNumber) => (e) => {
    if (e) e.preventDefault();
    setStep(stepNumber);
  };

  const setUserNameAction =
    (step) =>
    ({ username }) => {
      setUsername(username);
      if (step) {
        setStep(step);
      }
    };

  const signInWithPasswordAction = ({ password }) => {
    signIn({ username, password });
  };

  const onUsernameSubmitAction = ({ username }) => {
    setNewUsername(username);
    setShowSignInOptionsForUser('NEW_USER');
    setUserNameAction(1);
  };

  const signInWithAnotherUserAction = (e) => {
    if (e) e.preventDefault();
    setShowSignInOptionsForUser('NEW_USER_ENTRY');
    setStep(0);
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          <h1 className="page-title">Log in to your account</h1>
          {signInStatus === 'NOT_SIGNED_IN' && user && (
            <>
              <div className="page-description">
                Welcome back{' '}
                <span className="tw-font-semibold">{user.email}</span>!
              </div>
              {/* {children} */}
              <div className="passwordless-flex">
                {signingInStatus === 'SIGNIN_LINK_EXPIRED' && (
                  <div className="passwordless-flex passwordless-flex-align-start">
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      className="rotate-45"
                    >
                      <path d="M18,11.1 L12.9,11.1 L12.9,6 L11.1,6 L11.1,11.1 L6,11.1 L6,12.9 L11.1,12.9 L11.1,17.9988281 L12.9,17.9988281 L12.9,12.9 L18,12.9 L18,11.1 Z M12,24 C5.38359372,24 0,18.6164063 0,12 C0,5.38300776 5.38359372,0 12,0 C18.6164063,0 24,5.38300776 24,12 C24,18.6164063 18.6164063,24 12,24 Z M12,1.8 C6.37617192,1.8 1.8,6.37558596 1.8,12 C1.8,17.6238281 6.37617192,22.2 12,22.2 C17.6238281,22.2 22.2,17.6238281 22.2,12 C22.2,6.37558596 17.6238281,1.8 12,1.8 Z"></path>
                    </svg>
                    <div>
                      <div className="passwordless-text-left">
                        <strong>Authentication error.</strong>
                      </div>
                      <div>
                        The sign-in link you tried to use is no longer valid
                      </div>
                    </div>
                  </div>
                )}
                {signingInStatus === 'REQUESTING_SIGNIN_LINK' && (
                  <>
                    <div className="passwordless-loading-spinner" />
                    <div>Starting sign-in...</div>
                  </>
                )}
                {signingInStatus === 'STARTING_SIGN_IN_WITH_FIDO2' && (
                  <>
                    <div className="passwordless-loading-spinner" />
                    <div>Starting sign-in...</div>
                  </>
                )}
                {signingInStatus === 'COMPLETING_SIGN_IN_WITH_FIDO2' && (
                  <>
                    <div className="passwordless-loading-spinner" />
                    <div>Completing your sign-in...</div>
                  </>
                )}
              </div>
              <StepInputPassword
                username={username}
                showMessage={showMessage}
                message={message}
                onSubmit={signInWithPasswordAction}
                forgotPassword={forgotPassword}
                updateStep={updateStep}
              />
              {/* <div className="form-action">
                <button className="submit-btn" onClick={updateStep(2)}>
                  Continue with password
                </button>
              </div> */}
              <div className="or-separator mt-2 pt-1">
                <span>OR</span>
              </div>
              <div className="login-options-1">
                <div
                  className="login-option-item"
                  onClick={signInWithTouch}
                  disabled={busy}
                >
                  <div className="option-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 6.75V4.875C1.5 3.0075 3.0075 1.5 4.875 1.5H6.75"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.25 1.5H13.125C14.9925 1.5 16.5 3.0075 16.5 4.875V6.75"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.5 12V13.125C16.5 14.9925 14.9925 16.5 13.125 16.5H12"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.75 16.5H4.875C3.0075 16.5 1.5 14.9925 1.5 13.125V11.25"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.75 7.125V10.875C12.75 12.375 12 13.125 10.5 13.125H7.5C6 13.125 5.25 12.375 5.25 10.875V7.125C5.25 5.625 6 4.875 7.5 4.875H10.5C12 4.875 12.75 5.625 12.75 7.125Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.25 9H3.75"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>
                    Sign in with <strong>face or touch</strong>
                  </span>
                </div>
                <div
                  className="login-option-item"
                  onClick={signInWithMagicLink}
                  disabled={busy}
                >
                  <div className="option-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.4525 9C1.86 8.2875 1.5 7.3725 1.5 6.375C1.5 4.11 3.3525 2.25 5.625 2.25H9.375C11.64 2.25 13.5 4.11 13.5 6.375C13.5 8.64 11.6475 10.5 9.375 10.5H7.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.5475 9C16.14 9.7125 16.5 10.6275 16.5 11.625C16.5 13.89 14.6475 15.75 12.375 15.75H8.625C6.36 15.75 4.5 13.89 4.5 11.625C4.5 9.36 6.3525 7.5 8.625 7.5H10.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>
                    Sign in with <strong>magic link</strong>
                  </span>
                </div>
              </div>
              <div className="form-other-info">
                <a href="#" onClick={signInWithAnotherUserAction}>
                  Sign-in as another user
                </a>
              </div>
            </>
          )}
          {signInStatus === 'NOT_SIGNED_IN' && !user && (
            <>
              <StepInputUserName
                username={username}
                showMessage={showMessage}
                message={message}
                onSubmit={onUsernameSubmitAction}
              >
                {children}
              </StepInputUserName>
              {/* <div className="form-action">
                <button
                  className="submit-btn"
                  onClick={() => authenticateWithFido2()}
                  disabled={busy}
                >
                  Sign in with passkey
                </button>
              </div> */}
            </>
          )}
        </>
      );
    }
    if (step === 1) {
      return (
        <>
          <div className="page-description">
            Welcome back <span className="tw-font-semibold">{username}</span>!
          </div>
          <div className="form-login-register">
            {showMessage && (
              <div className="common-error-message">{message}</div>
            )}
            <div className="form-action">
              <button className="submit-btn" onClick={updateStep(2)}>
                Continue with password
              </button>
            </div>
            <NewPasswordlessComponent
              username={username}
            ></NewPasswordlessComponent>

            <div className="form-other-info">
              <a href="#" onClick={signInWithAnotherUserAction}>
                Sign-in as another user
              </a>
            </div>
          </div>
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <StepInputPassword
            username={username}
            showMessage={showMessage}
            message={message}
            onSubmit={signInWithPasswordAction}
            forgotPassword={forgotPassword}
            updateStep={updateStep}
          />
          <div className="form-other-info">
            <a href="#" onClick={signInWithAnotherUserAction}>
              Sign-in as another user
            </a>
          </div>
        </>
      );
    }
  };

  return (
    <Container>
      {renderStep(children)}

      <div className="form-other-info">
        Don't have an account?{' '}
        <a href="#" onClick={toSignUpMode}>
          Sign up
        </a>
      </div>
      {lastError && (
        <div className="common-error-message">
          {lastError.message.startsWith(
            'The operation either timed out or was not allowed',
          )
            ? ''
            : lastError.message}
        </div>
      )}
    </Container>
  );
};
