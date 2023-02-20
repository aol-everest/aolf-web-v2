import React from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import { string, object } from "yup";
import { useState } from "react";

const schema = object().shape({
  username: string()
    .email("This type of email does not exist. Please enter a valid one.")
    .required("Email is required"),
  password: string()
    .required("Password is required")
    .min(8, "Must Contain 8 Characters"),
  firstName: string().required("First Name is required"),
  lastName: string().required("Last Name is required"),
});

export const SignupForm = ({ signUp, showMessage, message, loading }) => {
  const [passwordType, setPasswordType] = useState("password");
  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  };
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
      id="sign-up-form"
      onSubmit={handleSubmit(signUp)}
    >
      <div className="wcf-form__fields">
        <div className="wcf-input wcf-form__field">
          <label for="sign-up-email" className="wcf-input__label">
            Email
          </label>
          <input
            type="email"
            id="sign-up-email"
            className="wcf-input__field"
            placeholder="Enter your email"
            {...register("username")}
          />
          {errors.username && (
            <p className="validation-input">{errors.username.message}</p>
          )}
        </div>

        <div className="wcf-input wcf-form__field">
          <label for="sign-up-password" className="wcf-input__label">
            Password
          </label>
          <input
            type={passwordType}
            className="wcf-input__field"
            placeholder="Enter your password"
            {...register("password")}
          />
          <button
            type="button"
            className="wcf-input__button"
            onClick={togglePassword}
          >
            <img src="/img/Eye.png" />
          </button>
          {errors.password && (
            <p className="validation-input">{errors.password.message}</p>
          )}
        </div>

        <div className="wcf-input wcf-form__field">
          <label for="sign-up-first-name" className="wcf-input__label">
            First name
          </label>
          <input
            type="text"
            id="sign-up-first-name"
            className="wcf-input__field"
            placeholder="Enter your first name"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="validation-input">{errors.firstName.message}</p>
          )}
        </div>

        <div className="wcf-input wcf-form__field">
          <label for="sign-up-last-name" className="wcf-input__label">
            Last name
          </label>
          <input
            type="text"
            id="sign-up-last-name"
            className="wcf-input__field"
            placeholder="Enter your last name"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="validation-input">{errors.lastName.message}</p>
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
          Sign up
        </button>
      )}
      <DevTool control={control} />
    </form>
  );
};
