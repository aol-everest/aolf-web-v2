import React from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Must Contain 8 Characters"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
  code: yup
    .number()
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
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form className="active show" onSubmit={handleSubmit(changePassword)}>
      <p className="info">
        We have sent a password reset code by email ({username}). Enter it below
        to reset your password.
      </p>
      <input
        type="text"
        {...register("code")}
        className={classNames({ validate: errors.code })}
        placeholder="Code"
      />
      {errors.code && <p className="validation-input">{errors.code.message}</p>}
      <input
        {...register("password")}
        type="password"
        placeholder="New Password"
        className={classNames({ validate: errors.password })}
      />
      {errors.password && (
        <p className="validation-input">{errors.password.message}</p>
      )}
      <input
        {...register("passwordConfirmation")}
        type="password"
        placeholder="Confirm Password"
        className={classNames({ validate: errors.passwordConfirmation })}
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
    </form>
  );
};
