import React, { useState } from "react";
import classNames from "classnames";
import MaskedInput from "react-text-mask";
import { Formik } from "formik";
import * as Yup from "yup";

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

  const submitAction = async (values) => {
    const {
      contactCity,
      contactPhone,
      contactAddress,
      contactState,
      contactZip,
    } = values;
    const { token: accessToken, updateCompleteAction } = this.props;
    setLoading(true);
    try {
      const results = await secure_fetch(`${API.REST.UPDATE_USER_PROFILE}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        accessToken,
        body: JSON.stringify({
          contactCity,
          contactPhone,
          contactAddress,
          contactState,
          contactZip,
        }),
      });

      if (!results.ok) {
        throw new Error(results.statusText);
      }
      const { status, error: errorMessage } = await results.json();

      if (status === 400) {
        throw new Error(errorMessage);
      }
      updateCompleteAction({});
    } catch (ex) {
      console.log(ex);
      updateCompleteAction({ message: ex.message, isError: true });
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
      {loading && <div class="cover-spin"></div>}
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
          await this.submitAction(values);
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
            <form class="profile-update__form" onSubmit={handleSubmit}>
              {!isMobile && <h6 class="profile-update__title">Profile:</h6>}
              <div class="profile-update__card">
                <div
                  class={classNames("input-block w-100", {
                    "mt-0": !isMobile,
                  })}
                >
                  <input
                    type="text"
                    placeholder="Street Address"
                    class={classNames("mt-0 w-100", {
                      validate: errors.contactAddress && touched.contactAddress,
                    })}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactAddress}
                    name="contactAddress"
                  />
                  {errors.contactAddress && touched.contactAddress && (
                    <p class="validation-input">{errors.contactAddress}</p>
                  )}
                </div>

                <div
                  id="city-input"
                  class={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    placeholder="City"
                    class={classNames({
                      validate: errors.contactCity && touched.contactCity,
                      "w-100": isMobile,
                    })}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactCity}
                    name="contactCity"
                  />
                  {errors.contactCity && touched.contactCity && (
                    <p class="validation-input">{errors.contactCity}</p>
                  )}
                </div>

                <div
                  id="state-input"
                  class={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    placeholder="State"
                    maxLength="2"
                    class={classNames({
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
                    <p class="validation-input">{errors.contactState}</p>
                  )}
                </div>

                <div
                  id="zip-input"
                  class={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    placeholder="Zip"
                    class={classNames({
                      validate: errors.contactZip && touched.contactZip,
                      "w-100": isMobile,
                    })}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactZip}
                    name="contactZip"
                  />
                  {errors.contactZip && touched.contactZip && (
                    <p class="validation-input">{errors.contactZip}</p>
                  )}
                </div>

                <div
                  class={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    readOnly={true}
                    placeholder="First Name"
                    class={classNames({
                      "w-100": isMobile,
                    })}
                    value={values.firstName}
                    name="firstName"
                  />
                </div>

                <div
                  class={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    type="text"
                    readOnly={true}
                    class={classNames({
                      "w-100": isMobile,
                    })}
                    placeholder="Last Name"
                    value={values.lastName}
                    name="lastName"
                  />
                </div>

                <div
                  class={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <input
                    readOnly={true}
                    value={email}
                    class={classNames({
                      "w-100": isMobile,
                    })}
                    type="email"
                    placeholder="Email"
                  />
                </div>
                <div
                  class={classNames("input-block", {
                    "w-100": isMobile,
                  })}
                >
                  <MaskedInput
                    placeholder="Phone Number"
                    mask={phoneNumberMask}
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactPhone}
                    class={classNames({
                      validate: errors.contactPhone && touched.contactPhone,
                      "w-100": isMobile,
                    })}
                  />

                  {errors.contactPhone && touched.contactPhone && (
                    <p class="validation-input">{errors.contactPhone}</p>
                  )}
                </div>
              </div>
              <button type="submit" class="btn-primary d-block ml-auto mt-4 v2">
                Update Profile
              </button>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
