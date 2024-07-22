import { updatePassword } from 'aws-amplify/auth';
import classNames from 'classnames';
import { Formik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { Loader } from '@components';

export const ChangePassword = ({ updateCompleteAction }) => {
  const [loading, setLoading] = useState(false);
  const [passwordSelected, setPasswordSelected] = useState([]);

  const togglePassword = (type) => {
    let updatedPasswordSelected;

    if (passwordSelected.includes(type)) {
      updatedPasswordSelected = passwordSelected.filter(
        (item) => item !== type,
      );
    } else {
      updatedPasswordSelected = [...passwordSelected, type];
    }
    setPasswordSelected(updatedPasswordSelected);
  };

  const submitAction = async (values) => {
    const { password: newPassword, oldPassword } = values;
    setLoading(true);
    try {
      await updatePassword({
        oldPassword,
        newPassword,
      });
      updateCompleteAction({
        message: 'Your password has been changed successfully',
        isError: false,
      });
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
      {loading && <Loader />}
      <Formik
        enableReinitialize
        initialValues={{
          oldPassword: '',
          password: '',
          passwordConfirmation: '',
        }}
        validationSchema={Yup.object().shape({
          oldPassword: Yup.string()
            .trim()
            .required('Password is required')
            .min(8, 'Must Contain 8 Characters'),
          password: Yup.string()
            .trim()
            .required('Password is required')
            .min(8, 'Must Contain 8 Characters')
            .notOneOf(
              [Yup.ref('oldPassword')],
              'New password cannot be the same as the existing password',
            ),
          passwordConfirmation: Yup.string()
            .trim()
            .required('Password is required')
            .oneOf([Yup.ref('password'), null], 'Passwords must match'),
        })}
        onSubmit={async (values, { resetForm, setStatus }) => {
          await submitAction(values);
          resetForm({});
          //setStatus({ success: true });
        }}
      >
        {(props) => {
          const {
            values,
            touched,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
          } = props;

          const oldPasswordType = passwordSelected.includes('oldPassword')
            ? 'text'
            : 'password';
          const passwordType = passwordSelected.includes('password')
            ? 'text'
            : 'password';
          const passwordConfirmType = passwordSelected.includes(
            'passwordConfirmation',
          )
            ? 'text'
            : 'password';
          return (
            <form className="profile-form-box" onSubmit={handleSubmit}>
              <div className="profile-form-wrap">
                <div className="form-item col-1-1 relative">
                  <label for="password">Current Password</label>
                  <input
                    type={oldPasswordType}
                    className={classNames('mt-0 w-100', {
                      validate: errors.oldPassword && touched.oldPassword,
                    })}
                    placeholder="Current Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.oldPassword}
                    name="oldPassword"
                    autocapitalize="off"
                  />
                  <button
                    class={classNames('showPassBtn', oldPasswordType)}
                    type="button"
                    onClick={() => togglePassword('oldPassword')}
                  >
                    <span className="icon-aol"></span>
                  </button>

                  {errors.oldPassword && touched.oldPassword && (
                    <p className="validation-input">{errors.oldPassword}</p>
                  )}
                </div>

                <div className="form-item col-1-1 relative">
                  <label for="cpassword">New Password</label>
                  <input
                    placeholder="New Password"
                    autocapitalize="off"
                    type={passwordType}
                    className={classNames('w-100', {
                      validate: errors.password && touched.password,
                    })}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    name="password"
                  />
                  <button
                    class={classNames('showPassBtn', passwordType)}
                    type="button"
                    onClick={() => togglePassword('password')}
                  >
                    <span className="icon-aol"></span>
                  </button>
                  <label className="input-msg">Minimum 8 characters</label>
                  {errors.password && touched.password && (
                    <p className="validation-input">{errors.password}</p>
                  )}
                </div>

                <div className="form-item col-1-2 relative">
                  <label for="cpassword">Confirm New Password</label>
                  <input
                    type={passwordConfirmType}
                    className={classNames('w-100', {
                      validate:
                        errors.passwordConfirmation &&
                        touched.passwordConfirmation,
                    })}
                    placeholder="Confirm New Password"
                    autocapitalize="off"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.passwordConfirmation}
                    name="passwordConfirmation"
                  />
                  <button
                    class={classNames('showPassBtn', passwordConfirmType)}
                    type="button"
                    onClick={() => togglePassword('passwordConfirmation')}
                  >
                    <span className="icon-aol"></span>
                  </button>

                  {errors.passwordConfirmation &&
                    touched.passwordConfirmation && (
                      <p className="validation-input">
                        {errors.passwordConfirmation}
                      </p>
                    )}
                </div>

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
