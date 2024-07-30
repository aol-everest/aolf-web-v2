import { useAuth } from '@contexts';
import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import { api } from '@utils';
import classNames from 'classnames';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheckCircle } from 'react-icons/fa';
import { object, string } from 'yup';
import { Loader } from '@components';

const ChangeEmailStep = ({
  onSubmit,
  showMessage,
  message,
  existingEmail,
  showSuccessMessage,
}) => {
  const schema = object().shape({
    username: string()
      .notOneOf(
        [existingEmail, null],
        `${existingEmail} is already your email address`,
      )
      .required('Email is required')
      .email('Email is invalid'),
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  return (
    <form className="active show" onSubmit={handleSubmit(onSubmit)}>
      <div
        className={classNames('success-message-container-cp', {
          'd-none': !showSuccessMessage,
        })}
      >
        <div className="success-message tw-text-center">
          <div className="icon-container">
            <FaCheckCircle />
          </div>
          A verification link has been emailed to you. Please use the
          verification link to verify new email.
        </div>
      </div>
      <div className="course-details-card__body">
        <h3 className="course-join-card__title section-title tw-mb-2">
          Change email
        </h3>
        <div className="row tw-px-5 tw-pt-5">
          <div className="col-sm-12">
            <input
              type="text"
              {...register('username')}
              className={classNames('tw-w-full tw-mb-0', {
                validate: errors.username,
              })}
              placeholder="Enter new email"
            />
            {errors.username && (
              <p className="tw-text-sm tw-text-red-700">
                {errors.username.message}
              </p>
            )}

            {showMessage && (
              <p className="tw-text-sm tw-text-red-700">{message}</p>
            )}
          </div>
        </div>
      </div>
      <div className="course-join-card__footer">
        <button className="btn-secondary">Submit</button>
      </div>
      <DevTool control={control} />
    </form>
  );
};

export const ChangeEmail = ({ closeDetailAction, existingEmail }) => {
  const { profile } = useAuth();
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  async function onChangeEmailSubmitted({ username }) {
    setLoading(true);
    try {
      if (profile.email === username) {
        throw new Error(`${username} is already your email address`);
      }

      setSubmittedEmail(username);

      await api.post({
        path: 'change-email',
        body: {
          newEmail: username,
        },
      });

      // await Auth.currentAuthenticatedUser({ bypassCache: true });
      setShowSuccessMessage(true);
      setMessage('');
      setShowMessage(false);
    } catch (ex) {
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setMessage(message ? `Error: ${message} (${statusCode})` : ex.message);
      setShowMessage(true);
    }
    setLoading(false);
  }

  async function onConfirmCodeSubmitted({ code }) {
    setLoading(true);
    try {
      /* const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      await api.post({
        path: "change-email-confirm",
        body: {
          code,
          newEmail: submittedEmail,
          accessToken:
            currentAuthenticatedUser.signInUserSession.accessToken.jwtToken,
        },
      });

      await Auth.currentAuthenticatedUser({ bypassCache: true }); */
      // setStep("change-email");
      setMessage('');
      setShowMessage(false);
    } catch (ex) {
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setMessage(message ? `Error: ${message} (${statusCode})` : ex.message);
      setShowMessage(true);
    }
    setLoading(false);
  }

  // async function onConfirmCodeResendCode() {
  //   try {
  //     const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();

  //     await async_fetch(`${process.env.domain}/change-email`, {
  //       method: "post",
  //       body: JSON.stringify({
  //         newEmail: submittedEmail,
  //         accessToken:
  //           currentAuthenticatedUser.signInUserSession.accessToken.jwtToken,
  //       }),
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `${(await Auth.currentSession())
  //           .getIdToken()
  //           .getJwtToken()}`,
  //       },
  //     });
  //   } catch (e) {
  //     console.log(e.message);
  //   }
  // }

  return (
    <div className="profile-modal active show tw-z-50">
      <div className="digital-member-join_journey course-join-card show tw-mt-8 sm:tw-mt-0">
        <div className="close-modal new-btn-modal" onClick={closeDetailAction}>
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
        {loading && <Loader />}
        <ChangeEmailStep
          onSubmit={onChangeEmailSubmitted}
          existingEmail={existingEmail}
          showMessage={showMessage}
          message={message}
          showSuccessMessage={showSuccessMessage}
        />

        <div
          className="close-modal d-md-flex d-none"
          onClick={closeDetailAction}
        >
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
      </div>
    </div>
  );
};
