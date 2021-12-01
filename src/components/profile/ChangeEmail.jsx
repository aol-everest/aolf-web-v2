import React, { useState } from "react";
import { Auth } from "aws-amplify";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import * as yup from "yup";
import { api } from "@utils";
import { FaCheckCircle } from "react-icons/fa";

const ChangeEmailStep = ({
  onSubmit,
  showMessage,
  message,
  existingEmail,
  showSuccessMessage,
}) => {
  const schema = yup.object().shape({
    username: yup
      .string()
      .notOneOf(
        [existingEmail, null],
        `${existingEmail} is already your email address`,
      )
      .required("Email is required")
      .email("Email is invalid"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  return (
    <form className="active show" onSubmit={handleSubmit(onSubmit)}>
      <div
        className={classNames("success-message-container", {
          "d-none": !showSuccessMessage,
        })}
      >
        <div className="success-message text-center p-2">
          <div className="icon-container">
            <FaCheckCircle />
          </div>
          A verification link has been emailed to you. Please use the
          verification link to verify new email.
        </div>
      </div>
      <div className="course-details-card__body">
        <h3 className="course-join-card__title section-title">
          Change user name / email
        </h3>
        <div className="form-group row p-5">
          <label
            htmlFor="staticEmail"
            className="col-sm-2 col-form-label d-none d-md-block"
          >
            Email
          </label>
          <div className="col-sm-10">
            <input
              type="text"
              {...register("username")}
              className={classNames("w-full", { validate: errors.username })}
              placeholder="Enter new email"
            />
            {errors.username && (
              <p className="validation-input">{errors.username.message}</p>
            )}

            {showMessage && <p className="validation-input">{message}</p>}
          </div>
        </div>
      </div>
      <div className="course-join-card__footer">
        <button className="btn-secondary">Submit new email</button>
      </div>
    </form>
  );
};

export const ChangeEmail = ({ closeDetailAction, existingEmail }) => {
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  async function onChangeEmailSubmitted({ username }) {
    setLoading(true);
    try {
      const user = await Auth.currentAuthenticatedUser();

      if (user.attributes.email === username) {
        throw new Error(`${username} is already your email address`);
      }

      setSubmittedEmail(username);

      await api.post({
        path: "change-email",
        body: {
          newEmail: username,
        },
      });

      // await Auth.currentAuthenticatedUser({ bypassCache: true });
      setShowSuccessMessage(true);
      setMessage("");
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
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      await api.post({
        path: "change-email-confirm",
        body: {
          code,
          newEmail: submittedEmail,
          accessToken:
            currentAuthenticatedUser.signInUserSession.accessToken.jwtToken,
        },
      });

      await Auth.currentAuthenticatedUser({ bypassCache: true });
      // setStep("change-email");
      setMessage("");
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
    <div className="profile-modal active show z-50">
      <div className="digital-member-join_journey course-join-card show">
        <div className="close-modal new-btn-modal" onClick={closeDetailAction}>
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
        {loading && <div className="cover-spin"></div>}
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
