import React, { useState } from "react";
import classNames from "classnames";
import { Formik } from "formik";
import * as Yup from "yup";
import { Auth } from "aws-amplify";

export const ChangePassword = ({ isMobile, updateCompleteAction }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const submitAction = async (values) => {
    const { password: newPassword, oldPassword } = values;
    setLoading(true);
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(user, oldPassword, newPassword);
      updateCompleteAction({});
      setShowSuccessMessage(true);
    } catch (ex) {
      console.log(ex);
      updateCompleteAction({ message: ex.message, isError: true });
    }
    setLoading(false);
  };
  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <Formik
        enableReinitialize
        initialValues={{
          oldPassword: "",
          password: "",
          passwordConfirmation: "",
        }}
        validationSchema={Yup.object().shape({
          oldPassword: Yup.string()
            .required("Password is required")
            .min(8, "Must Contain 8 Characters"),
          password: Yup.string()
            .required("Password is required")
            .min(8, "Must Contain 8 Characters"),
          passwordConfirmation: Yup.string().oneOf(
            [Yup.ref("password"), null],
            "Passwords must match",
          ),
        })}
        onSubmit={async (values, { resetForm, setStatus }) => {
          await submitAction(values);
          //resetForm({});
          //setStatus({ success: true });
        }}
      >
        {(props) => {
          const {
            values,
            touched,
            errors,
            dirty,
            isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit,
            handleReset,
            submitCount,
          } = props;
          return (
            <form className="profile-update__form" onSubmit={handleSubmit}>
              {!isMobile && (
                <h6 className="profile-update__title">Change Password:</h6>
              )}
              <div className="profile-update__card">
                {showSuccessMessage && (
                  <div className="success-message-cp">
                    <i className="fas fa-check-circle"></i>
                    {"  "}Your password has been changed successfully
                  </div>
                )}
                <div className="input-block w-100">
                  <input
                    type="password"
                    className={classNames("mt-0 w-100", {
                      validate: errors.oldPassword && touched.oldPassword,
                    })}
                    placeholder="Old Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.oldPassword}
                    name="oldPassword"
                  />
                </div>

                {errors.oldPassword && touched.oldPassword && (
                  <p className="validation-input">{errors.oldPassword}</p>
                )}
                <div className="input-block w-100">
                  <input
                    placeholder="New Password"
                    type="password"
                    className={classNames("w-100", {
                      validate: errors.password && touched.password,
                    })}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    name="password"
                  />
                </div>
                {errors.password && touched.password && (
                  <p className="validation-input">{errors.password}</p>
                )}
                <div className="input-block w-100">
                  <input
                    type="password"
                    className={classNames("w-100", {
                      validate:
                        errors.passwordConfirmation &&
                        touched.passwordConfirmation,
                    })}
                    placeholder="Confirm New Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.passwordConfirmation}
                    name="passwordConfirmation"
                  />
                </div>

                {errors.passwordConfirmation &&
                  touched.passwordConfirmation && (
                    <p className="validation-input">
                      {errors.passwordConfirmation}
                    </p>
                  )}
              </div>
              <button
                type="submit"
                className="btn-primary d-block ml-auto mt-4 v2"
              >
                Change Password
              </button>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
