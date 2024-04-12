/* eslint-disable react/no-unescaped-entities */
import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { useState } from 'react';

const passwordSchema = object().shape({
  password: string().required('Password is required'),
});

const userNameSchema = object().shape({
  username: string()
    .email('This type of email does not exist. Please enter a valid one.')
    .required('Email is required'),
});

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
            class="input-field password"
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
        <div class="form-other-info">
          <a href="#" onClick={updateStep(0)}>
            Sign-in as another user
          </a>
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
  children,
}) => {
  const [step, setStep] = useState(0);

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

  const renderStep = () => {
    if (step === 0) {
      return (
        <StepInputUserName
          username={username}
          showMessage={showMessage}
          message={message}
          onSubmit={setUserNameAction(1)}
        >
          {children}
        </StepInputUserName>
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
              <button class="submit-btn">Sign in with passkey</button>
            </div>
            <div class="form-action">
              <button class="submit-btn">Sign in with magic link</button>
            </div>
            <div class="form-other-info">
              <a href="#" onClick={updateStep(0)}>
                Sign-in as another user
              </a>
            </div>
          </div>
        </>
      );
    }
    if (step === 2) {
      return (
        <StepInputPassword
          username={username}
          showMessage={showMessage}
          message={message}
          onSubmit={signInWithPasswordAction}
          forgotPassword={forgotPassword}
          updateStep={updateStep}
        />
      );
    }
  };

  return (
    <section class="section-login-register">
      <div class="container">
        <h1 class="page-title">Log in to your account</h1>

        {/* <div class="form-login-register">
            <div class="form-item">
              <label for="email">Email address</label>
              <input
                {...register('username')}
                type="email"
                class="input-field"
                placeholder="Email address"
              />
            </div>
            <div class="form-item password">
              <label for="pass">Password</label>
              <input
                {...register('password')}
                type="password"
                class="input-field password"
                placeholder="Password"
              />
              <button class="showPassBtn">
                <img
                  src="/img/PasswordEye.svg"
                  width="16"
                  height="16"
                  alt="Show Password"
                />
              </button>
            </div>
            <div class="form-item">
              <a href="#" class="forgot-pass">
                Forgot password
              </a>
            </div>
            <div class="form-action">
              <button class="submit-btn">Log in</button>
            </div>
            <div class="form-other-info">
              Don't have an account?{' '}
              <a href="#" onClick={toSignUpMode}>
                Sign up
              </a>
            </div>
          </div> */}
        {renderStep(children)}
        <div class="form-other-info">
          Don't have an account?{' '}
          <a href="#" onClick={toSignUpMode}>
            Sign up
          </a>
        </div>
      </div>
    </section>
  );
};
