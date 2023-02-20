import React from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, ref, number } from "yup";

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
    .min(6)
    .required("Verification code is required"),
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
          <label for="log-in-password" className="wcf-input__label">
            Code
          </label>
          <input
            type="text"
            {...register("code")}
            className="wcf-input__field"
            placeholder="Code"
            autoComplete="off"
            aria-invalid="false"
            aria-haspopup="false"
            spellCheck="false"
          />
          {errors.code && (
            <p className="validation-input">{errors.code.message}</p>
          )}
        </div>
        <div className="wcf-input wcf-form__field">
          <label for="log-in-password" className="wcf-input__label">
            New Password
          </label>
          <input
            type="password"
            className="wcf-input__field"
            placeholder="Enter your new password"
            {...register("password")}
            autoComplete="new-password"
            aria-invalid="false"
            aria-haspopup="false"
            spellCheck="false"
          />
          {errors.password && (
            <p className="validation-input">{errors.password.message}</p>
          )}
        </div>
        <div className="wcf-input wcf-form__field">
          <label for="log-in-password" className="wcf-input__label">
            Confirm Password
          </label>
          <input
            type="password"
            className="wcf-input__field"
            placeholder="Confirm your Password"
            {...register("passwordConfirmation")}
            autoComplete="new-password"
            aria-invalid="false"
            aria-haspopup="false"
            spellCheck="false"
          />
          {errors.passwordConfirmation && (
            <p className="validation-input">
              {errors.passwordConfirmation.message}
            </p>
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
          <span class="sr-only">Loading...</span>
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
