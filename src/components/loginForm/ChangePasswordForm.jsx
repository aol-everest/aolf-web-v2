import React from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form class="active show" onSubmit={handleSubmit(changePassword)}>
      <p class="info">
        We have sent a password reset code by email. Enter it below to reset
        your password.
      </p>
      <input
        type="text"
        {...register("code")}
        className={classNames({ validate: errors.username })}
        placeholder="Code"
      />
      {errors.code && <p class="validation-input">{errors.code.message}</p>}
      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        className={classNames({ validate: errors.password })}
      />
      {errors.password && (
        <p class="validation-input">{errors.password.message}</p>
      )}
      <input
        {...register("passwordConfirmation")}
        type="password"
        placeholder="Password"
        className={classNames({ validate: errors.password })}
        type="password"
      />
      {errors.passwordConfirmation && (
        <p class="validation-input">{errors.passwordConfirmation.message}</p>
      )}
      {showMessage && (
        <p class="validation-input">{this.getActualMessage(message)}</p>
      )}
      <button type="submit" class="mt-4 modal-window__btn btn-primary">
        Change Password
      </button>
    </form>
  );
};
