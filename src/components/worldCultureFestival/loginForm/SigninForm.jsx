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
  password: string().required("Password is required"),
});

export const SigninForm = ({
  signIn,
  forgotPassword,
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
    <form className="wcf-form" id="log-in-form" onSubmit={handleSubmit(signIn)}>
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

        <div className="wcf-input wcf-form__field">
          <label for="log-in-password" className="wcf-input__label">
            Password
          </label>
          <input
            type="password"
            id="log-in-password"
            className="wcf-input__field"
            placeholder="Enter your password"
            {...register("password")}
          />
          {errors.password && (
            <p className="validation-input">{errors.password.message}</p>
          )}
        </div>

        <a className="wcf-link" href="#" onClick={forgotPassword}>
          Don’t remember your password?
        </a>
      </div>
      {showMessage && (
        <div className="validation-input tw-m-2">
          <span className="icon" />
          {message}
        </div>
      )}
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
          Log in
        </button>
      )}

      <DevTool control={control} />
    </form>
  );
};
