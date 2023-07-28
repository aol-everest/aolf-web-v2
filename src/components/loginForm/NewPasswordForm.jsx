import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { object, ref, string } from "yup";

const schema = object().shape({
  password: string()
    .required("Password is required")
    .min(8, "Must Contain 8 Characters"),
  passwordConfirmation: string().oneOf(
    [ref("password"), null],
    "Passwords must match",
  ),
});

export const NewPasswordForm = ({
  completeNewPassword,
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
    <form className="active show" onSubmit={handleSubmit(completeNewPassword)}>
      <p className="info">
        You have to change your password. Please enter your new password below.
      </p>
      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        className={classNames({ validate: errors.password })}
        autoComplete="new-password"
        aria-invalid="false"
        aria-haspopup="false"
        spellCheck="false"
      />
      {errors.password && (
        <p className="validation-input">{errors.password.message}</p>
      )}
      <input
        {...register("passwordConfirmation")}
        type="password"
        placeholder="Confirm Password"
        className={classNames({ validate: errors.password })}
        autoComplete="new-password"
        aria-invalid="false"
        aria-haspopup="false"
        spellCheck="false"
      />
      {errors.passwordConfirmation && (
        <p className="validation-input">
          {errors.passwordConfirmation.message}
        </p>
      )}
      {showMessage && <p className="validation-input">{message}</p>}
      <button type="submit" className="mt-4 modal-window__btn btn-primary">
        Change Password
      </button>
      <DevTool control={control} />
    </form>
  );
};
