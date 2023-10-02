import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
    <form className="wcf-form" id="log-in-form" onSubmit={handleSubmit(signIn)}>
      <div className="wcf-form__fields">
        <div className="wcf-input wcf-form__field">
          <label htmlFor="log-in-email" className="wcf-input__label">
            Email
          </label>
          <input
            type="email"
            id="log-in-email"
            className={classNames("wcf-input__field", {
              error: errors.username,
            })}
            placeholder="Enter your email"
            {...register("username")}
          />
          {errors.username && (
            <label htmlFor="log-in-email" className="wcf-select__error-message">
              {errors.username.message}
            </label>
          )}
        </div>

        <div className="wcf-input wcf-form__field">
          <label htmlFor="log-in-password" className="wcf-input__label">
            Password
          </label>
          <input
            type={passwordType}
            className={classNames("wcf-input__field", {
              error: errors.password,
            })}
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
            <label
              htmlFor="welcome-sessions"
              className="wcf-select__error-message"
            >
              {errors.password.message}
            </label>
          )}
        </div>
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
          <span className="sr-only">Loading...</span>
        </button>
      )}
      {!loading && (
        <button className="wcf-button wcf-form__button" type="submit">
          Log in
        </button>
      )}

      <p className="wcf-body-small wcf-form__note">
        <a className="wcf-link" href="#" onClick={forgotPassword}>
          Forgot your password?
        </a>
      </p>

      <DevTool control={control} />
    </form>
  );
};
