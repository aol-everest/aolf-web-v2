import Link from "@components/linkWithUTM";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { object, string } from "yup";

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

export const SignupForm = ({ signUp, showMessage, message }) => {
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
          <Link prefetch={false} href="/policy/ppa-course" legacyBehavior>
            <a target="_blank" className="link">
              Terms of Service
            </a>
          </Link>{" "}
          and{" "}
          <a
            href="https://www.artofliving.org/us-en/privacy-policy"
            target="_blank"
            className="link"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
        </p>
      </div>
      {showMessage && <p className="validation-input">{message}</p>}
      <button className="mt-4 modal-window__btn btn-primary" type="submit">
        Sign Up
      </button>
      <DevTool control={control} />
    </form>
  );
};
