import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
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
      <DevTool control={control} />
    </form>
  );
};
