import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { number, object, ref, string } from "yup";

const schema = object().shape({
  password: string()
    .required("Password is required")
    .min(8, "Must Contain 8 Characters"),
  passwordConfirmation: string().oneOf(
    [ref("password"), null],
    "Passwords must match",
  ),
  code: number()
    .positive("Verification code is invalid")
    .integer("Verification code is invalid")
    .typeError("Verification code is invalid")
    .test(
      "len",
      "Must be exactly 6 characters",
      (val) => val.toString().length === 6,
    )
    .required("Verification code is required")
    .nullable(),
});

export const ChangePasswordForm = ({
  changePassword,
  showMessage,
  message,
  username,
  loading,
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
    <form
      className="wcf-form"
      id="log-in-form"
      onSubmit={handleSubmit(changePassword)}
    >
      <p className="info">
        We have sent a password reset code by email ({username}). Enter it below
        to reset your password.
      </p>
      <div className="wcf-form__fields">
        <div className="wcf-input wcf-form__field">
          <label htmlFor="log-in-password" className="wcf-input__label">
            Code
          </label>
          <input
            type="text"
            {...register("code")}
            className={classNames("wcf-input__field", {
              error: errors.code,
            })}
            placeholder="Code"
            autoComplete="off"
            aria-invalid="false"
            aria-haspopup="false"
            spellCheck="false"
          />
          {errors.code && (
            <label htmlFor="log-in-email" className="wcf-select__error-message">
              {errors.code.message}
            </label>
          )}
        </div>
        <div className="wcf-input wcf-form__field">
          <label htmlFor="log-in-password" className="wcf-input__label">
            New Password
          </label>
          <input
            type="password"
            className={classNames("wcf-input__field", {
              error: errors.password,
            })}
            placeholder="Enter your new password"
            {...register("password")}
            autoComplete="new-password"
            aria-invalid="false"
            aria-haspopup="false"
            spellCheck="false"
          />
          {errors.password && (
            <label htmlFor="log-in-email" className="wcf-select__error-message">
              {errors.password.message}
            </label>
          )}
        </div>
        <div className="wcf-input wcf-form__field">
          <label htmlFor="log-in-password" className="wcf-input__label">
            Confirm Password
          </label>
          <input
            type="password"
            className={classNames("wcf-input__field", {
              error: errors.passwordConfirmation,
            })}
            placeholder="Confirm your Password"
            {...register("passwordConfirmation")}
            autoComplete="new-password"
            aria-invalid="false"
            aria-haspopup="false"
            spellCheck="false"
          />
          {errors.passwordConfirmation && (
            <label htmlFor="log-in-email" className="wcf-select__error-message">
              {errors.passwordConfirmation.message}
            </label>
          )}
        </div>
      </div>

      {showMessage && <p className="validation-input">{message}</p>}
      {loading && (
        <button className="wcf-button wcf-form__button" type="button" disabled>
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span className="sr-only">Loading...</span>
        </button>
      )}
      {!loading && (
        <button className="wcf-button wcf-form__button" type="submit">
          Change Password
        </button>
      )}

      <DevTool control={control} />
    </form>
  );
};
