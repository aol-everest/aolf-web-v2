/* eslint-disable react/no-unescaped-entities */
import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { useState } from 'react';
import { useAuth, useLocalUserCache } from '@contexts';
import { configure } from '@components/passwordLessAuth/config';
import { Passwordless as NewPasswordlessComponent } from '@components/passwordLessAuth/NewComp';

const passwordSchema = object().shape({
  password: string().required('Password is required'),
});

const userNameSchema = object().shape({
  username: string()
    .email('This type of email does not exist. Please enter a valid one.')
    .required('Email is required'),
});

const Container = (props) => {
  return (
    <section class="section-login-register">
      <div class="container">
        <h1 class="page-title">Log in to your account</h1>
        {props.children}
      </div>
    </section>
  );
};

const StepInputUserName = ({ showMessage, message, children, onSubmit }) => {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userNameSchema),
    defaultValues: {
      username: '',
    },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div class="page-description">
        Welcome back! Please enter your details.
      </div>
      {children}
      <div class="form-login-register">
        <div class="form-item">
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
            <div class="validation-input">{errors.username.message}</div>
          )}
        </div>
        {showMessage && <div class="common-error-message">{message}</div>}
        <div class="form-action">
          <button
            class="submit-btn"
            type="submit"
            disabled={errors.username?.message}
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

const StepInputPassword = ({
  username,
  showMessage,
  message,
  onSubmit,
  forgotPassword,
  updateStep,
}) => {
  const {
    register,
    control,
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
      <div class="form-login-register">
        <div class="form-item">
          <label for="email">Email address</label>
          <p>{username}</p>
        </div>
        <div class="form-item password">
          <label for="pass">Password</label>
          <input
            type={type}
            className={classNames('input-field password', {
              validate: errors.password,
            })}
            placeholder="Password"
            required
            autoComplete="current-password"
            autocapitalize="off"
            autocorrect="off"
            {...register('password')}
          />
          <button class="showPassBtn" onClick={handleToggle}>
            <img
              src="/img/PasswordEye.svg"
              width="16"
              height="16"
              alt="Show Password"
            />
          </button>
          {errors.password && (
            <div class="validation-input">{errors.password.message}</div>
          )}
        </div>
        {showMessage && <div class="common-error-message">{message}</div>}
        <div class="form-item">
          <a href="#" class="forgot-pass" onClick={forgotPassword}>
            Forgot password
          </a>
        </div>
        <div class="form-action">
          <button class="submit-btn" type="submit">
            Sign in
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
  children,
}) => {
  const {
    requestSignInLink,
    lastError,
    authenticateWithFido2,
    busy,
    signInStatus,
    signingInStatus,
    tokens,
    tokensParsed,
    signOut,
    toggleShowAuthenticatorManager,
    showAuthenticatorManager,
  } = useAuth().passwordLess;
  const [step, setStep] = useState(0);
  const [newUsername, setNewUsername] = useState(username);
  const [showSignInOptionsForUser, setShowSignInOptionsForUser] =
    useState('LAST_USER');
  const { lastSignedInUsers } = useLocalUserCache();
  const showFido2AuthOption = !!configure().fido2;

  console.log(signingInStatus);

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

  if (setLoading && !loading) {
    setLoading(
      signingInStatus === 'REQUESTING_SIGNIN_LINK' ||
        signingInStatus === 'STARTING_SIGN_IN_WITH_FIDO2',
    );
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

  if (signInStatus === 'SIGNED_IN' && tokens) {
    //if (children) return <>{children}</>;
    return (
      <Container>
        <div className="passwordless-flex-col">
          <div>
            You&apos;re currently signed-in as:{' '}
            <span className="passwordless-username">
              {tokensParsed?.idToken.email}
            </span>
          </div>
          <div className="passwordless-flex">
            <a
              href={`https://jwtinspector.kevhak.people.aws.dev/inspect#token=${tokens.idToken}&tab=payload`}
              target="_blank"
              rel="noreferrer"
            >
              ID token
            </a>
            <a
              href={`https://jwtinspector.kevhak.people.aws.dev/inspect#token=${tokens.accessToken}&tab=payload`}
              target="_blank"
              rel="noreferrer"
            >
              Access token
            </a>
          </div>
          <div className="passwordless-flex">
            <button
              className="passwordless-button passwordless-button-sign-out"
              onClick={toggleShowAuthenticatorManager}
              disabled={showAuthenticatorManager}
            >
              Manage authenticators
            </button>
            <button
              className="passwordless-button passwordless-button-sign-out"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </Container>
    );
  }

  const lastUser = lastSignedInUsers.at(0);
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
    console.log('IIIIIIII');
    setShowSignInOptionsForUser('NEW_USER_ENTRY');
    setStep(0);
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          {signInStatus === 'NOT_SIGNED_IN' && user && (
            <>
              <div class="page-description">Welcome back {user.email}!</div>
              <div class="form-action">
                <button class="submit-btn" onClick={updateStep(2)}>
                  Continue with password
                </button>
              </div>
              <div class="form-action">
                <button
                  class="submit-btn"
                  onClick={() => {
                    authenticateWithFido2({
                      username: user.username,
                      credentials: user.credentials,
                    });
                  }}
                  disabled={busy}
                >
                  Sign in with face or touch
                </button>
                <button
                  class="submit-btn"
                  onClick={() =>
                    requestSignInLink({
                      username: user.username,
                    })
                  }
                  disabled={busy}
                >
                  Sign in with magic link
                </button>
              </div>
              <div class="form-other-info">
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
              {/* <div class="form-action">
                <button
                  class="submit-btn"
                  onClick={() => authenticateWithFido2()}
                  disabled={busy}
                >
                  Sign in with passkey
                </button>
              </div> */}
            </>
          )}

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
        </>
      );
    }
    if (step === 1) {
      return (
        <>
          <div class="page-description">Welcome back {username}!</div>
          <div class="form-login-register">
            {showMessage && <div class="common-error-message">{message}</div>}
            <div class="form-action">
              <button class="submit-btn" onClick={updateStep(2)}>
                Continue with password
              </button>
            </div>
            <NewPasswordlessComponent
              username={username}
            ></NewPasswordlessComponent>

            <div class="form-other-info">
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
          <div class="form-other-info">
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

      <div class="form-other-info">
        Don't have an account?{' '}
        <a href="#" onClick={toSignUpMode}>
          Sign up
        </a>
      </div>
      {lastError && (
        <div className="common-error-message">{lastError.message}</div>
      )}
    </Container>
  );
};
