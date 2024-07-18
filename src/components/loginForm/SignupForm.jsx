import Link from '@components/linkWithUTM';
import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { useState } from 'react';

const schema = object().shape({
  username: string()
    .email('This type of email does not exist. Please enter a valid one.')
    .required('Email is required'),
  password: string()
    .required('Password is required')
    .min(8, 'Must Contain 8 Characters'),
  firstName: string().required('First Name is required'),
  lastName: string().required('Last Name is required'),
});

export const SignupForm = ({
  signUp,
  showMessage,
  message,
  toSignInMode,
  children,
}) => {
  const [type, setType] = useState('password');
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleToggle = () => {
    if (type === 'password') {
      setType('text');
    } else {
      setType('password');
    }
  };

  return (
    <form onSubmit={handleSubmit(signUp)}>
      <section className="section-login-register">
        <div className="container">
          <h1 className="page-title">Create an account</h1>
          {children}
          <div className="form-login-register">
            <div className="form-item">
              <label for="fname">First name</label>
              <input
                {...register('firstName')}
                type="text"
                className="input-field"
                placeholder="First name"
              />
            </div>
            <div className="form-item">
              <label for="lname">Last name</label>
              <input
                {...register('lastName')}
                type="text"
                className="input-field"
                placeholder="Last name"
              />
            </div>
            <div className="form-item">
              <label for="email">Email address</label>
              <input
                {...register('username')}
                type="email"
                className="input-field"
                placeholder="Email address"
              />
            </div>
            <div className="form-item password">
              <label for="pass">Password</label>
              <input
                {...register('password')}
                type={type}
                className="input-field password"
                placeholder="Password"
              />
              <button
                class={classNames('showPassBtn', type)}
                type="button"
                onClick={handleToggle}
              >
                <span className="icon-aol"></span>
              </button>
            </div>
            <div className="form-item checkbox">
              <label className="toc" for="toc">
                By signing up, I agree to{' '}
                <Link prefetch={false} href="/policy/ppa-course" legacyBehavior>
                  <a target="_blank">Terms of Service</a>
                </Link>{' '}
                and{' '}
                <a
                  href="https://www.artofliving.org/us-en/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            {showMessage && (
              <div className="common-error-message">{message}</div>
            )}
            <div className="form-action">
              <button className="submit-btn" type="submit">
                Sign up
              </button>
            </div>
            <div className="form-other-info">
              Already have an account?{' '}
              <a href="#" onClick={toSignInMode}>
                Log in
              </a>
            </div>
          </div>
        </div>
      </section>
      <DevTool control={control} />
    </form>
  );
};
