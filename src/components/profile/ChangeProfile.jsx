import React, { useState } from "react";
import classNames from "classnames";
import MaskedInput from "react-text-mask";
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import { api } from "@utils";
import { FaRegEdit, FaCheckCircle } from "react-icons/fa";
import { useGlobalModalContext } from "@contexts";
import { MODAL_TYPES, US_STATES } from "@constants";
import { StyledInput, Dropdown } from "@components/checkout";
import { ChangeEmail } from "@components/profile";
import Style from "./ChangeProfile.module.scss";

const phoneNumberMask = [
  "(",
  /[1-9]/,
  /\d/,
  /\d/,
  ")",
  " ",
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

const MESSAGE_EMAIL_VERIFICATION_SUCCESS =
  "A verification link has been emailed to you. Please use the link to verify your student email.";

export const ChangeProfile = ({
  isMobile,
  profile = {},
  updateCompleteAction,
}) => {
  const [loading, setLoading] = useState(false);
  const { showModal, hideModal } = useGlobalModalContext();

  const allowEmailEdit = profile.cognito.UserStatus !== "EXTERNAL_PROVIDER";

  const editEmailAction = (e) => {
    if (e) e.preventDefault();
    showModal(MODAL_TYPES.EMPTY_MODAL, {
      children: (handleModalToggle) => {
        return (
          <ChangeEmail
            closeDetailAction={handleModalToggle}
            existingEmail={profile.email}
          />
        );
      },
    });
  };

  const submitAction = async (values) => {
    const { contactPhone, contactAddress, contactState, contactZip } = values;
    setLoading(true);
    try {
      const { status, error: errorMessage } = await api.post({
        path: "updateProfile",
        body: {
          contactPhone,
          contactAddress,
          contactState,
          contactZip,
        },
      });

      if (status === 400) {
        throw new Error(errorMessage);
      }
      updateCompleteAction({});
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

  const validateStudentEmail = (email) => {
    const regex = new RegExp("[a-z0-9]+@[a-z]+.edu$");
    const isStudentEmail = regex.test(email) && email.indexOf("alumni") < 0;
    return isStudentEmail;
  };

  const handleVerifyStudentEmail = async () => {
    setLoading(true);
    try {
      await api.post({
        path: "verify-email",
        body: {
          email: email,
        },
      });
    } catch (ex) {
      console.log(ex);
    }
    setLoading(false);
    showModal(MODAL_TYPES.EMPTY_MODAL, {
      title: "Verification code sent.",
      children: (handleModalToggle) => (
        <div className="alert__modal modal-window modal-window_no-log modal fixed-right fade active show">
          <div className=" modal-dialog modal-dialog-centered active">
            <div className="modal-content">
              <h2 className="modal-content-title !tw-text-2xl">
                {MESSAGE_EMAIL_VERIFICATION_SUCCESS}
              </h2>

              <p className="tw-flex tw-justify-center">
                <a
                  href="#"
                  className="tw-mt-6 btn btn-lg btn-primary"
                  onClick={handleModalToggle}
                >
                  Close
                </a>
              </p>
            </div>
          </div>
        </div>
      ),
    });
  };

  const {
    first_name,
    last_name,
    personMailingCity,
    personMailingCountry,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
    email,
    isStudentVerified,
    studentVerificationDate,
    studentVerificationExpiryDate,
  } = profile;

  const showVerifyStudentStatus =
    validateStudentEmail(email) &&
    (!isStudentVerified ||
      (isStudentVerified &&
        dayjs(new Date()).diff(dayjs(studentVerificationDate), "y", true) > 1 &&
        dayjs(studentVerificationExpiryDate).isAfter(dayjs(new Date()))));

  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <Formik
        enableReinitialize
        initialValues={{
          firstName: first_name || "",
          lastName: last_name || "",
          contactPhone: personMobilePhone || "",
          contactAddress: personMailingStreet || "",
          contactState: personMailingState || "",
          contactZip: personMailingPostalCode || "",
        }}
        validationSchema={Yup.object().shape({
          contactPhone: Yup.string()
            .required("Phone is required")
            .matches(/^[0-9-()\s+]+$/, { message: "Phone is invalid" })
            .min(10, "Phone is invalid")
            .max(18, "Phone is invalid"),
          contactAddress: Yup.string().required("Address is required"),
          contactState: Yup.string().required("State is required"),
          contactZip: Yup.string()
            .required("Zip is required!")
            .matches(/^[0-9]+$/, { message: "Zip is invalid" })
            .min(2, "Zip is invalid")
            .max(10, "Zip is invalid"),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          await submitAction(values);
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
              {!isMobile && <h6 className="profile-update__title">Profile:</h6>}
              <div className="profile-update__card order__card">
                <StyledInput
                  containerClass={classNames(Style.address, "tw-mt-0")}
                  className={classNames(Style.address, "tw-mt-0 !tw-w-full")}
                  placeholder="Address"
                  formikProps={props}
                  formikKey="contactAddress"
                  fullWidth
                ></StyledInput>
                <Dropdown
                  containerClass={classNames({ "w-100": isMobile })}
                  placeholder="State"
                  formikProps={props}
                  formikKey="contactState"
                  options={US_STATES}
                ></Dropdown>
                <StyledInput
                  containerClass={classNames({ "w-100": isMobile })}
                  className="zip"
                  placeholder="Zip"
                  formikProps={props}
                  formikKey="contactZip"
                ></StyledInput>

                <div
                  className={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    readOnly={true}
                    placeholder="First Name"
                    className={classNames({
                      "w-100": isMobile,
                    })}
                    value={values.firstName}
                    name="firstName"
                  />
                </div>

                <div
                  className={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    readOnly={true}
                    className={classNames({
                      "w-100": isMobile,
                    })}
                    placeholder="Last Name"
                    value={values.lastName}
                    name="lastName"
                  />
                </div>

                <div
                  className={classNames(
                    "input-block inline-edit-input-container",
                    {
                      "w-100": isMobile,
                    },
                  )}
                >
                  <input
                    readOnly={true}
                    value={email}
                    className={classNames({
                      "w-100": isMobile,
                    })}
                    type="email"
                    placeholder="Email"
                  />
                  {allowEmailEdit && (
                    <a className="icon" href="#" onClick={editEmailAction}>
                      <FaRegEdit />
                    </a>
                  )}
                </div>
                <div
                  className={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <MaskedInput
                    placeholder="Phone Number"
                    mask={phoneNumberMask}
                    type="tel"
                    name="contactPhone"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactPhone}
                    className={classNames({
                      validate: errors.contactPhone && touched.contactPhone,
                      "w-100": isMobile,
                    })}
                  />

                  {errors.contactPhone && touched.contactPhone && (
                    <p className="validation-input">{errors.contactPhone}</p>
                  )}
                </div>
              </div>
              <div className="tw-flex tw-justify-end tw-mt-6">
                {showVerifyStudentStatus && (
                  <button
                    type="button"
                    className="btn-primary ml-auto v2"
                    onClick={handleVerifyStudentEmail}
                  >
                    Verify Student Status
                  </button>
                )}
                <button type="submit" className="btn-primary d-block ml-4 v2">
                  Update Profile
                </button>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
