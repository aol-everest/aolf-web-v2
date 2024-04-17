import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { number, object, ref, string } from 'yup';
import { useState, useEffect } from 'react';

const schema = object().shape({
  password: string()
    .required('Password is required')
    .min(8, 'Must Contain 8 Characters'),
  passwordConfirmation: string().oneOf(
    [ref('password'), null],
    'Passwords must match',
  ),
  code: number()
    .positive('Verification code is invalid')
    .integer('Verification code is invalid')
    .typeError('Verification code is invalid')
    .test(
      'len',
      'Must be exactly 6 characters',
      (val) => val.toString().length === 6,
    )
    .required('Verification code is required')
    .nullable(),
});

export const ResetPasswordForm = ({
  resetPassword,
  showMessage,
  message,
  toSignInMode,
  username,
  resetCodeAction,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(59);
  const [type, setType] = useState('password');
  const [typeCPassword, setTypeCPassword] = useState('password');

  useEffect(() => {
    // Function to handle the countdown logic
    const interval = setInterval(() => {
      // Decrease seconds if greater than 0
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      // When seconds reach 0, decrease minutes if greater than 0
      if (seconds === 0) {
        if (minutes === 0) {
          // Stop the countdown when both minutes and seconds are 0
          clearInterval(interval);
        } else {
          // Reset seconds to 59 and decrease minutes by 1
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000); // Run this effect every 1000ms (1 second)

    return () => {
      // Cleanup: stop the interval when the component unmounts
      clearInterval(interval);
    };
  }, [seconds]); // Re-run this effect whenever 'seconds' changes

  const resendOTP = (e) => {
    if (e) e.preventDefault();
    if (minutes <= 0 && seconds <= 0) {
      setMinutes(2);
      setSeconds(30);
      resetCodeAction();
    }
  };

  const handleToggle = () => {
    if (type === 'password') {
      setType('text');
    } else {
      setType('password');
    }
  };
  const handleToggleCPassword = () => {
    if (typeCPassword === 'password') {
      setTypeCPassword('text');
    } else {
      setTypeCPassword('password');
    }
  };

  return (
    <form onSubmit={handleSubmit(resetPassword)}>
      <section class="section-login-register">
        <div class="container">
          <h1 class="page-title">Reset password</h1>
          <div class="page-description">
            We have sent a password reset code by email ({username}). Enter it
            below to reset your password.
          </div>
          <div class="form-login-register">
            <div class="form-item">
              <label for="code">Code</label>
              <input
                {...register('code')}
                type="text"
                className={classNames('input-field', {
                  validate: errors.code,
                })}
                placeholder="Code"
              />
              {errors.code && (
                <div class="validation-input">{errors.code.message}</div>
              )}
            </div>
            <div class="form-item password">
              <label for="pass">New password</label>
              <input
                {...register('password')}
                type="password"
                className={classNames('input-field password', {
                  validate: errors.password,
                })}
                placeholder="New password"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                pattern=".{6,}"
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
            <div class="form-item password">
              <label for="pass">Confirm password</label>
              <input
                {...register('passwordConfirmation')}
                type="password"
                className={classNames('input-field password', {
                  validate: errors.passwordConfirmation,
                })}
                placeholder="Confirm password"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                pattern=".{6,}"
              />

              <button class="showPassBtn" onClick={handleToggleCPassword}>
                <img
                  src="/img/PasswordEye.svg"
                  width="16"
                  height="16"
                  alt="Show Password"
                />
              </button>
              {errors.passwordConfirmation && (
                <div class="validation-input">
                  {errors.passwordConfirmation.message}
                </div>
              )}
            </div>
            <div class="form-item">
              {seconds > 0 || minutes > 0 ? (
                <a
                  href="#"
                  className={classNames('forgot-pass', {
                    '!tw-text-slate-300': seconds > 0 || minutes > 0,
                  })}
                  onClick={resendOTP}
                >
                  Resend code in{' '}
                  <span class="tw-font-bold tw-text-slate-400">
                    {minutes < 10 ? `0${minutes}` : minutes}:
                    {seconds < 10 ? `0${seconds}` : seconds}
                  </span>{' '}
                  minutes
                </a>
              ) : (
                <a href="#" className="forgot-pass" onClick={resendOTP}>
                  Resend code
                </a>
              )}
            </div>
            {showMessage && <div class="common-error-message">{message}</div>}
            <div class="form-action">
              <button class="submit-btn">Change password</button>
            </div>
            <div class="form-other-info">
              <a href="#" onClick={toSignInMode}>
                Back to login
              </a>
            </div>
          </div>
        </div>
      </section>
      <DevTool control={control} />
    </form>
  );
};
