import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';

const schema = object().shape({
  username: string()
    .email('This type of email does not exist. Please enter a valid one.')
    .required('Email is required'),
});

export const ResetPasswordForm = ({
  resetPassword,
  showMessage,
  message,
  toSignInMode,
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
    <form onSubmit={handleSubmit(resetPassword)}>
      <section class="section-login-register">
        <div class="container">
          <h1 class="page-title">Reset password</h1>
          <div class="page-description">
            We have sent a password reset code by email (youremail@gmail.com).
            Enter it below to reset your password.
          </div>
          <div class="form-login-register">
            <div class="form-item">
              <label for="code">Code</label>
              <input
                id="code"
                type="text"
                class="input-field"
                placeholder="Code"
                required
              />
              <div class="validation-input">Must be a valid email</div>
            </div>
            <div class="form-item password">
              <label for="pass">New password</label>
              <input
                id="email"
                type="password"
                class="input-field password"
                placeholder="New password"
                required
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                pattern=".{6,}"
              />
              <div class="validation-input">
                Must contain at least 6 characters
              </div>
              <button class="showPassBtn">
                <img
                  src="/img/PasswordEye.svg"
                  width="16"
                  height="16"
                  alt="Show Password"
                />
              </button>
            </div>
            <div class="form-item password">
              <label for="pass">Confirm password</label>
              <input
                id="email"
                type="password"
                class="input-field password"
                placeholder="Confirm password"
                required
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                pattern=".{6,}"
              />
              <div class="validation-input">
                Must contain at least 6 characters
              </div>
              <button class="showPassBtn">
                <img
                  src="/img/PasswordEye.svg"
                  width="16"
                  height="16"
                  alt="Show Password"
                />
              </button>
            </div>
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
