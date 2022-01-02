import React from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { object, string } from "yup";

const schema = object().shape({
  username: string()
    .email("This type of email does not exist. Please enter a valid one.")
    .required("Email is required"),
});

export const ResetPasswordForm = ({ resetPassword, showMessage, message }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form className="active show" onSubmit={handleSubmit(resetPassword)}>
      <p className="info">
        Please enter your email address. We will send you an email to reset your
        password.
      </p>
      <input
        {...register("username")}
        type="email"
        className={classNames({ validate: errors.username })}
        placeholder="Email"
      />
      {errors.username && (
        <p className="validation-input">{errors.username.message}</p>
      )}
      {showMessage && <p className="validation-input">{message}</p>}
      <button type="submit" className="mt-4 modal-window__btn btn-primary v2">
        Send email
      </button>
      <DevTool control={control} />
    </form>
  );
};
