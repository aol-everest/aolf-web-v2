import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { object, ref, string } from 'yup';
import { useState, useEffect } from 'react';

const schema = object().shape({
  password: string()
    .test(
      'no-spaces',
      'Password cannot contain spaces',
      (value) => !/\s/.test(value),
    )
    .required('Password is required')
    .min(8, 'Must Contain 8 Characters'),
  passwordConfirmation: string().oneOf(
    [ref('password'), null],
    'Passwords must match',
  ),
});

export const NewPasswordForm = ({
  completeNewPassword,
  showMessage,
  message,
  toSignInMode,
}) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [type, setType] = useState('password');
  const [typeCPassword, setTypeCPassword] = useState('password');

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
  const trimValue = (name, value) => {
    setValue(name, value.trim(), { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(completeNewPassword)}>
      <section className="section-login-register">
        <div className="container">
          <h1 className="page-title">Reset password</h1>
          <div className="page-description">
            You have to change your password. Please enter your new password
            below.
          </div>
          <div className="form-login-register">
            <div className="form-item password">
              <label for="pass">New password</label>
              <input
                {...register('password')}
                onBlur={(e) => trimValue('password', e.target.value)}
                type={type}
                className={classNames('input-field password', {
                  validate: errors.password,
                })}
                placeholder="New password"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                pattern=".{6,}"
              />

              <button
                class={classNames('showPassBtn', type)}
                type="button"
                onClick={handleToggle}
              >
                <span className="icon-aol"></span>
              </button>
              {errors.password && (
                <div className="validation-input">
                  {errors.password.message}
                </div>
              )}
            </div>
            <div className="form-item password">
              <label for="pass">Confirm password</label>
              <input
                {...register('passwordConfirmation')}
                onBlur={(e) =>
                  trimValue('passwordConfirmation', e.target.value)
                }
                type={typeCPassword}
                className={classNames('input-field password', {
                  validate: errors.passwordConfirmation,
                })}
                placeholder="Confirm password"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                pattern=".{6,}"
              />
              <button
                class={classNames('showPassBtn', typeCPassword)}
                type="button"
                onClick={handleToggleCPassword}
              >
                <span className="icon-aol"></span>
              </button>

              {errors.passwordConfirmation && (
                <div className="validation-input">
                  {errors.passwordConfirmation.message}
                </div>
              )}
            </div>

            {showMessage && (
              <div className="common-error-message">{message}</div>
            )}
            <div className="form-action">
              <button className="submit-btn" type="submit">
                Change password
              </button>
            </div>
            <div className="form-other-info">
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
