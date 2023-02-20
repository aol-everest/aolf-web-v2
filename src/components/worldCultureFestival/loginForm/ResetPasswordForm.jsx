import React from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";

const schema = object().shape({
  username: string()
    .email("This type of email does not exist. Please enter a valid one.")
    .required("Email is required"),
});

export const ResetPasswordForm = ({
  resetPassword,
  showMessage,
  message,
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
      onSubmit={handleSubmit(resetPassword)}
    >
      <p className="info">
        Please enter your email address. We will send you an email to reset your
        password.
      </p>
      <div className="wcf-form__fields">
        <div className="wcf-input wcf-form__field">
          <label for="log-in-email" className="wcf-input__label">
            Email
          </label>
          <input
            type="email"
            id="log-in-email"
            className="wcf-input__field"
            placeholder="Enter your email"
            {...register("username")}
          />
          {errors.username && (
            <p className="validation-input">{errors.username.message}</p>
          )}
        </div>
        {showMessage && <p className="validation-input">{message}</p>}
      </div>

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
          Send email
        </button>
      )}

      <DevTool control={control} />
    </form>
  );
};
