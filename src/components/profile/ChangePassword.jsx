import { useAuth } from '@contexts';
import { Auth } from '@utils';
import classNames from 'classnames';
import { Formik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

export const ChangePassword = ({ isMobile, updateCompleteAction }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const submitAction = async (values) => {
    const { password: newPassword, oldPassword } = values;
    setLoading(true);
    try {
      await Auth.changePassword({
        email: user.profile.email,
        oldPassword,
        newPassword,
      });
      updateCompleteAction({});
      setShowSuccessMessage(true);
    } catch (ex) {
      console.log(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      updateCompleteAction({
        message: message ? `Error: ${message} (${statusCode})` : ex.message,
        isError: true,
      });
    }
    setLoading(false);
  };
  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <Formik
        enableReinitialize
        initialValues={{
          oldPassword: '',
          password: '',
          passwordConfirmation: '',
        }}
        validationSchema={Yup.object().shape({
          oldPassword: Yup.string()
            .required('Password is required')
            .min(8, 'Must Contain 8 Characters'),
          password: Yup.string()
            .required('Password is required')
            .min(8, 'Must Contain 8 Characters'),
          passwordConfirmation: Yup.string()
            .required('Password is required')
            .oneOf([Yup.ref('password'), null], 'Passwords must match'),
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
            <form className="profile-form-box" onSubmit={handleSubmit}>
              <div className="profile-form-wrap">
                {showSuccessMessage && (
                  <div className="success-message-cp">
                    <i className="fas fa-check-circle"></i>
                    {'  '}Your password has been changed successfully
                  </div>
                )}
                <div className="form-item col-1-2 relative">
                  <label for="password">Current Password</label>
                  <input
                    type="password"
                    className={classNames('mt-0 w-100', {
                      validate: errors.oldPassword && touched.oldPassword,
                    })}
                    placeholder="Current Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.oldPassword}
                    name="oldPassword"
                  />
                </div>

                {errors.oldPassword && touched.oldPassword && (
                  <p className="validation-input">{errors.oldPassword}</p>
                )}
                <div className="form-item col-1-2 relative">
                  <label for="cpassword">New Password</label>
                  <input
                    placeholder="New Password"
                    type="password"
                    className={classNames('w-100', {
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
                <div className="form-item col-1-2 relative">
                  <label for="cpassword">Confirm New Password</label>
                  <input
                    type="password"
                    className={classNames('w-100', {
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
                <div className="form-actions col-1-1">
                  <button type="submit" className="primary-btn">
                    Change Password
                  </button>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
