import React, { useState } from "react";
import classNames from "classnames";
import MaskedInput from "react-text-mask";
import { Formik } from "formik";
import * as Yup from "yup";
import { api } from "@utils";
import { FaRegEdit } from "react-icons/fa";
import { useGlobalModalContext } from "@contexts";
import { MODAL_TYPES } from "@constants";
import { ChangeEmail } from "@components/profile";

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

export const ChangeProfile = ({
  isMobile,
  profile = {},
  updateCompleteAction,
}) => {
  const [loading, setLoading] = useState(false);
  const { showModal, hideModal } = useGlobalModalContext();

  const editEmailAction = () => {
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
    const {
      contactCity,
      contactPhone,
      contactAddress,
      contactState,
      contactZip,
    } = values;
    setLoading(true);
    try {
      const { status, error: errorMessage } = await api.post({
        path: "updateProfile",
        body: {
          contactCity,
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
  } = profile;
  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <Formik
        enableReinitialize
        initialValues={{
          firstName: first_name || "",
          lastName: last_name || "",
          contactCity: personMailingCity || "",
          contactPhone: personMobilePhone || "",
          contactAddress: personMailingStreet || "",
          contactState: personMailingState || "",
          contactZip: personMailingPostalCode || "",
        }}
        validationSchema={Yup.object().shape({
          contactCity: Yup.string().required("City is required"),
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
              <div className="profile-update__card">
                <div
                  className={classNames("input-block w-100", {
                    "mt-0": !isMobile,
                  })}
                >
                  <input
                    type="text"
                    placeholder="Street Address"
                    className={classNames("mt-0 w-100", {
                      validate: errors.contactAddress && touched.contactAddress,
                    })}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactAddress}
                    name="contactAddress"
                  />
                  {errors.contactAddress && touched.contactAddress && (
                    <p className="validation-input">{errors.contactAddress}</p>
                  )}
                </div>

                <div
                  id="city-input"
                  className={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    placeholder="City"
                    className={classNames({
                      validate: errors.contactCity && touched.contactCity,
                      "w-100": isMobile,
                    })}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactCity}
                    name="contactCity"
                  />
                  {errors.contactCity && touched.contactCity && (
                    <p className="validation-input">{errors.contactCity}</p>
                  )}
                </div>

                <div
                  id="state-input"
                  className={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    placeholder="State"
                    maxLength="2"
                    className={classNames({
                      validate: errors.contactState && touched.contactState,
                      "w-100": isMobile,
                    })}
                    onChange={(e) => {
                      let value = e.target.value || "";
                      value = value.toUpperCase().trim();
                      props.setFieldValue("contactState", value);
                    }}
                    onBlur={handleBlur}
                    value={values.contactState}
                    name="contactState"
                  />
                  {errors.contactState && touched.contactState && (
                    <p className="validation-input">{errors.contactState}</p>
                  )}
                </div>

                <div
                  id="zip-input"
                  className={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    placeholder="Zip"
                    className={classNames({
                      validate: errors.contactZip && touched.contactZip,
                      "w-100": isMobile,
                    })}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactZip}
                    name="contactZip"
                  />
                  {errors.contactZip && touched.contactZip && (
                    <p className="validation-input">{errors.contactZip}</p>
                  )}
                </div>

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
                  <a className="icon" href="#" onClick={editEmailAction}>
                    <FaRegEdit />
                  </a>
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
              <button
                type="submit"
                className="btn-primary d-block ml-auto mt-4 v2"
              >
                Update Profile
              </button>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
