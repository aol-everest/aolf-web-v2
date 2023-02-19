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
        {showMessage && <p className="validation-input">{message}</p>}
        <a className="link" href="#" onClick={forgotPassword}>
          Don’t remember your password?
        </a>
      </div>

      <button className="wcf-button wcf-form__button" type="submit">
        Log in
      </button>
      <DevTool control={control} />
    </form>
  );
};
