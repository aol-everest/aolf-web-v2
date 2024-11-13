import Link from '@components/linkWithUTM';
import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { useState } from 'react';
import { StyledInput } from '@components/checkout';

const schema = object().shape({
  username: string()
    .email('This type of email does not exist. Please enter a valid one.')
    .required('Email is required'),
  password: string()
    .test(
      'no-spaces',
      'Password cannot contain spaces',
      (value) => !/\s/.test(value),
    )
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
    setValue,
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
  const trimValue = (name, value) => {
    setValue(name, value.trim(), { shouldValidate: true });
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
                onBlur={(e) => trimValue('firstName', e.target.value)}
                type="text"
                className="input-field"
                placeholder="First name"
              />
              {errors.firstName && (
                <div className="validation-input !tw-mb-0">
                  {errors.firstName.message}
                </div>
              )}
            </div>
            <div className="form-item">
              <label for="lname">Last name</label>
              <input
                {...register('lastName')}
                onBlur={(e) => trimValue('lastName', e.target.value)}
                type="text"
                className="input-field"
                placeholder="Last name"
              />
              {errors.lastName && (
                <div className="validation-input !tw-mb-0">
                  {errors.lastName.message}
                </div>
              )}
            </div>

            <div className="form-item">
              <label for="email">Email address</label>
              <input
                {...register('username')}
                onBlur={(e) => trimValue('username', e.target.value)}
                type="email"
                className="input-field"
                placeholder="Email address"
              />

              {errors.username && (
                <div className="validation-input !tw-mb-0">
                  {errors.username.message}
                </div>
              )}
            </div>
            <div className="form-item password">
              <label for="pass">Password</label>
              <input
                {...register('password')}
                onBlur={(e) => trimValue('password', e.target.value)}
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
              {errors.password && (
                <div className="validation-input !tw-mb-0">
                  {errors.password.message}
                </div>
              )}
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
