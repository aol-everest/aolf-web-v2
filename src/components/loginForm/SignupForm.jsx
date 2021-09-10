import React from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  username: yup
    .string()
    .email("This type of email does not exist. Please enter a valid one.")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Must Contain 8 Characters"),
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
});

export const SignupForm = ({ signUp, showMessage, message }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form
      id="signup-form"
      className="active show"
      onSubmit={handleSubmit(signUp)}
    >
      <input
        {...register("username")}
        type="email"
        className={classNames({ validate: errors.username })}
        placeholder="Email"
      />
      {errors.username && (
        <p className="validation-input">{errors.username.message}</p>
      )}
      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        className={classNames({ validate: errors.password })}
      />
      {errors.password && (
        <p className="validation-input">{errors.password.message}</p>
      )}
      <input
        {...register("firstName")}
        type="text"
        placeholder="First Name"
        className={classNames({ validate: errors.firstName })}
      />
      {errors.firstName && (
        <p className="validation-input">{errors.firstName.message}</p>
      )}
      <input
        {...register("lastName")}
        type="text"
        placeholder="Last Name"
        className={classNames({ validate: errors.lastName })}
      />
      {errors.lastName && (
        <p className="validation-input">{errors.lastName.message}</p>
      )}
      <div className="checkbox-wrapper">
        <p className="checkbox-text">
          By signing up, I agree to{" "}
          <a href="/us/ts-cs" target="_blank" className="link">
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://www.artofliving.org/us-en/privacy-policy"
            target="_blank"
            className="link"
          >
            Privacy Policy
          </a>
        </p>
      </div>
      {showMessage && <p className="validation-input">{message}</p>}
      <button className="mt-4 modal-window__btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};
