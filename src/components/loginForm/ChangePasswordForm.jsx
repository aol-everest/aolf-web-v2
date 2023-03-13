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
      className="active show"
      autoComplete="off"
      onSubmit={handleSubmit(changePassword)}
    >
      <p className="info">
        We have sent a password reset code by email ({username}). Enter it below
        to reset your password.
      </p>
      <input
        type="text"
        {...register("code")}
        className={classNames({ validate: errors.code })}
        placeholder="Code"
        autoComplete="off"
        aria-invalid="false"
        aria-haspopup="false"
        spellCheck="false"
      />
      {errors.code && <p className="validation-input">{errors.code.message}</p>}
      <input
        {...register("password")}
        type="password"
        placeholder="New Password"
        className={classNames({ validate: errors.password })}
        autoComplete="new-password"
        aria-invalid="false"
        aria-haspopup="false"
        spellCheck="false"
      />
      {errors.password && (
        <p className="validation-input">{errors.password.message}</p>
      )}
      <input
        {...register("passwordConfirmation")}
        type="password"
        placeholder="Confirm Password"
        className={classNames({ validate: errors.passwordConfirmation })}
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
      {showMessage && <p className="validation-input">{message}</p>}
      <button type="submit" className="mt-4 modal-window__btn btn-primary">
        Change Password
      </button>
      <DevTool control={control} />
    </form>
  );
};
