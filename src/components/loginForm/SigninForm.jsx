import React from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  username: yup
    .string()
    .email("This type of email does not exist. Please enter a valid one.")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const SigninForm = ({
  signIn,
  forgotPassword,
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
    <form
      id="login-form"
      className="active show"
      onSubmit={handleSubmit(signIn)}
    >
      <input
        {...register("username")}
        type="email"
        placeholder="Email"
        className={classNames({ validate: errors.username })}
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
      {showMessage && <p className="validation-input">{message}</p>}
      <a className="link" href="#" onClick={forgotPassword}>
        Don’t remember your password?
      </a>
      <button className="mt-4 modal-window__btn btn-primary" type="submit">
        Log In
      </button>
    </form>
  );
};
