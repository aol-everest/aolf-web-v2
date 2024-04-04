/* eslint-disable react/no-unescaped-entities */
import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';

const schema = object().shape({
  username: string()
    .email('This type of email does not exist. Please enter a valid one.')
    .required('Email is required'),
  password: string().required('Password is required'),
});

export const SigninForm = ({
  signIn,
  forgotPassword,
  showMessage,
  message,
  toSignUpMode,
  children,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(signIn)}>
      <section class="section-login-register">
        <div class="container">
          <h1 class="page-title">Log in to your account</h1>
          <div class="page-description">
            Welcome back! Please enter your details.
          </div>
          {children}
          <div class="form-login-register">
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
          </div>
        </div>
        {showMessage && <p className="validation-input">{message}</p>}
        <DevTool control={control} />
      </section>
    </form>
  );
};
