/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { Auth } from "aws-amplify";
import classNames from "classnames";
import { useRouter } from "next/router";
import {
  BillingInfoForm,
  UserInfoForm,
  DiscountCodeInput,
} from "@components/checkout";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "@utils";
import { Loader } from "@components";
import { useGlobalAlertContext } from "@contexts";
import { ALERT_TYPES, MEMBERSHIP_TYPES } from "@constants";

const createOptions = {
  style: {
    base: {
      fontSize: "16px",
      lineHeight: 2,
      fontWeight: 200,
      fontStyle: "normal",
      color: "#303650",
      fontFamily: "Work Sans, sans-serif",
      "::placeholder": {
        color: "#9598a6",
        fontFamily: "Work Sans, sans-serif",
        fontSize: "16px",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

const RetreatPrerequisiteWarning = () => {
  return (
    <>
      <p className="course-join-card__text">
        Our records indicate that you have not yet taken the prerequisite for
        the Journey + membership, which is{" "}
        <strong>SKY Breath Meditation</strong> (formerly known as the Happiness
        Program). In SKY Breath Meditation, you'll learn a powerful breath
        meditation to effectively settle and calm the mind.
      </p>
      <p className="course-join-card__text">
        If our records are not accurate, please contact customer service at{" "}
        <a href="tel:8552024400">(855) 202-4400</a> or email us at{" "}
        <a href="mailto:app.support@us.artofliving.org">
          app.support@us.artofliving.org
        </a>
        . We will be happy to help you so you can sign up for the Silent
        Retreat.
      </p>
    </>
  );
};

export const MembershipCheckoutStripe = ({
  offeringId,
  subsciption,
  activeSubscription,
  couponCode,
  profile,
  completeCheckoutCallback,
  authenticated,
  closeRetreatPrerequisiteWarning,
}) => {
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(null);
  const [showDetailMobileModal, setShowDetailMobileModal] = useState(false);
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();
  const elements = useElements();
  const stripe = useStripe();

  const {
    first_name,
    last_name,
    email,
    personMailingCity,
    personMailingCountry,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
    isRegisteredStripeCustomer,
    cardLast4Digit,
    subscriptionMasterSfid,
    subscriptions = [],
  } = profile;
  const { name, sfid } = subsciption || {};
  const { isCreditCardRequired } = discount || {};

  const userSubscriptions = subscriptions.reduce(
    (accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.subscriptionMasterSfid]: currentValue,
      };
    },
    {},
  );

  let extraProps = {};

  if (
    sfid === MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value &&
    userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value]
  ) {
    extraProps = {
      isSubscriptionUpgradeOrDowngrade: true,
      oldPurchasedSubscriptionId:
        userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value].sfid,
    };
  }

  const completeEnrollmentAction = async (values) => {
    if (loading) {
      return null;
    }
    if (
      MEMBERSHIP_TYPES.JOURNEY_PLUS.value === subsciption.sfid &&
      !profile.isMandatoryWorkshopAttended
    ) {
      return showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        className: "retreat-prerequisite-big meditation-digital-membership",
        title: "Retreat Prerequisite",
        closeModalAction: closeRetreatPrerequisiteWarning,
        footer: () => {
          return (
            <button
              className="btn-secondary v2"
              onClick={closeRetreatPrerequisiteWarning}
            >
              Discover SKY Breath Meditation
            </button>
          );
        },
        children: <RetreatPrerequisiteWarning />,
      });
    }
    const {
      contactPhone,
      contactAddress,
      contactState,
      contactZip,
      couponCode,
      firstName,
      lastName,
    } = values;

    try {
      setLoading(true);

      let tokenizeCC = null;
      if (!isRegisteredStripeCustomer && isCreditCardRequired !== false) {
        const cardElement = elements.getElement(CardElement);
        let createTokenRespone = await stripe.createToken(cardElement, {
          name: profile.name ? profile.name : firstName + " " + lastName,
        });
        let { error, token } = createTokenRespone;
        if (error) {
          throw error;
        }
        tokenizeCC = token;
      }

      let products = {
        productType: "subscription",
        productSfId: activeSubscription.sfid,
        ...extraProps,
      };

      if (offeringId) {
        products = { ...products, offeringId };
      }

      let payLoad = {
        shoppingRequest: {
          tokenizeCC,
          couponCode,

          contactAddress: {
            contactPhone,
            contactAddress,
            contactState,
            contactZip,
          },
          products,
        },
      };

      if (!authenticated) {
        payLoad = {
          ...payLoad,
          user: {
            firstName,
            lastName,
          },
        };
      }

      const {
        data,
        status,
        error: errorMessage,
        isError,
      } = await api.post({
        path: "createAndPayOrder",
        body: payLoad,
      });

      setLoading(false);

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }
      completeCheckoutCallback(data.orderId);
    } catch (ex) {
      console.error(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setLoading(false);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
    }
  };

  const applyDiscount = (discount) => {
    setDiscount(discount);
  };

  const logout = async (event) => {
    await Auth.signOut();
    router.push(
      `/login?next=${encodeURIComponent(location.pathname + location.search)}`,
    );
  };

  const toggleDetailMobileModal = () => {
    if (!showDetailMobileModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    setShowDetailMobileModal((showDetailMobileModal) => !showDetailMobileModal);
  };

  return (
    <Formik
      initialValues={{
        firstName: first_name || "",
        lastName: last_name || "",
        email: email || "",
        contactPhone: personMobilePhone || "",
        contactAddress: personMailingStreet || "",
        contactState: personMailingState || "",
        contactZip: personMailingPostalCode || "",
        couponCode: couponCode ? couponCode : "",
        ppaAgreement: false,
      }}
      validationSchema={Yup.object().shape({
        firstName: Yup.string().required("First Name is required"),
        lastName: Yup.string().required("Last Name is required"),
        contactPhone: Yup.string()
          .required("Phone is required")
          .matches(/^[0-9-()\s+]+$/, { message: "Phone is invalid" })
          .min(10, "Phone is invalid")
          .max(18, "Phone is invalid"),
        contactAddress: Yup.string().required("Address is required"),
        contactState: Yup.string().required("State is required"),
        contactZip: Yup.string()
          .required("Zip is required!")
          //.matches(/^[0-9]+$/, { message: 'Zip is invalid' })
          .min(2, "Zip is invalid")
          .max(10, "Zip is invalid"),
        ppaAgreement: Yup.boolean()
          .label("Terms")
          .test(
            "is-true",
            "Please check the box in order to continue.",
            (value) => value === true,
          ),
      })}
      onSubmit={async (values, { setSubmitting, isValid, errors }) => {
        await completeEnrollmentAction(values);
      }}
    >
      {(formikProps) => {
        const {
          values,
          touched,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
        } = formikProps;
        console.log(errors);
        return (
          <div className="row">
            {loading && <Loader />}
            <div className="col-xl-7 col-lg-6 col-12">
              <form className="order__form" onSubmit={handleSubmit}>
                <div className="details mb-4">
                  <h2 className="details__title">Account Details:</h2>
                  <p className="details__content">
                    This is not your account?{" "}
                    <a href="#" className="link" onClick={logout}>
                      Logout
                    </a>
                  </p>
                </div>
                <div className="order__card">
                  <UserInfoForm formikProps={formikProps} />
                </div>
                <div className="details mb-4 mt-5">
                  <h2 className="details__title">Billing Details:</h2>
                  <p className="details__content">
                    <img src="/img/ic-visa.svg" alt="visa" />
                    <img src="/img/ic-mc.svg" alt="mc" />
                    <img src="/img/ic-ae.svg" alt="ae" />
                  </p>
                </div>
                <div className="order__card">
                  <BillingInfoForm formikProps={formikProps} />
                  <DiscountCodeInput
                    placeholder="Discount Code"
                    formikProps={formikProps}
                    formikKey="couponCode"
                    product={activeSubscription.sfid}
                    applyDiscount={applyDiscount}
                  ></DiscountCodeInput>

                  {isCreditCardRequired !== false && (
                    <>
                      {!isRegisteredStripeCustomer && (
                        <div className="input-block card-element v2">
                          <CardElement options={createOptions} />
                        </div>
                      )}

                      {isRegisteredStripeCustomer && (
                        <div className="bank-card-info">
                          <input
                            id="card-number"
                            className="full-width"
                            type="text"
                            value={`**** **** **** ${cardLast4Digit}`}
                            placeholder="Card Number"
                          />
                          <input
                            id="mm-yy"
                            type="text"
                            placeholder="MM/YY"
                            value={`**/**`}
                          />
                          <input
                            id="cvc"
                            type="text"
                            placeholder="CVC"
                            value={`****`}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="agreement v2 mt-4 d-block d-lg-none">
                  <div className="agreement__group">
                    <input
                      type="checkbox"
                      className={classNames("custom-checkbox", {
                        error:
                          formikProps.errors.ppaAgreement &&
                          formikProps.touched.ppaAgreement,
                      })}
                      placeholder=" "
                      checked={formikProps.values.ppaAgreement}
                      onChange={formikProps.handleChange("ppaAgreement")}
                      value={formikProps.values.ppaAgreement}
                      name="ppaAgreement"
                    />
                    <label htmlFor="ppaAgreement"></label>
                    <p className="agreement__text">
                      I agree to the{" "}
                      <a href="/us-en/ts-cs" target="_blank">
                        Program Participant agreement including privacy and
                        cancellation policy.
                      </a>
                    </p>
                  </div>
                  {formikProps.errors.ppaAgreement &&
                    formikProps.touched.ppaAgreement && (
                      <div className="agreement__important agreement__important_desktop">
                        <img
                          className="agreement__important-icon"
                          src="/img/warning.svg"
                          alt="warning"
                        />
                        {formikProps.errors.ppaAgreement}
                      </div>
                    )}
                </div>
                <div className="order__complete">
                  <div className="order__security security">
                    <img src="/img/ic-lock.svg" alt="lock" />
                    <p className="security__info">
                      AES 256-B&T
                      <span>SSL Secured</span>
                    </p>
                  </div>
                  <button
                    className="btn btn-primary v2"
                    type="submit"
                    disabled={loading}
                  >
                    Complete Checkout
                  </button>
                </div>
              </form>
            </div>
            <div className="col-xl-4 col-lg-5 col-12 mt-0 mt-6 p-0 offset-lg-1">
              <div className="reciept d-none d-lg-block">
                <div className="reciept__header">
                  <p className="reciept__item_main">Enroll</p>
                  <ul className="reciept__item_list">
                    <li>
                      <span>{subsciption.name}</span>
                      <span>${activeSubscription.price}/mo</span>
                    </li>
                  </ul>
                </div>

                {subsciption.description && (
                  <div
                    className="reciept__details reciept__details_v2 subsciption-description"
                    dangerouslySetInnerHTML={{
                      __html: subsciption.description,
                    }}
                  ></div>
                )}

                {subsciption.condition && (
                  <div
                    className="reciept__more"
                    dangerouslySetInnerHTML={{ __html: subsciption.condition }}
                  ></div>
                )}
              </div>
              <div className="agreement v2 mt-4 d-none d-lg-block">
                <div className="agreement__group">
                  <input
                    type="checkbox"
                    className={classNames("custom-checkbox", {
                      error:
                        formikProps.errors.ppaAgreement &&
                        formikProps.touched.ppaAgreement,
                    })}
                    placeholder=" "
                    checked={formikProps.values.ppaAgreement}
                    onChange={formikProps.handleChange("ppaAgreement")}
                    value={formikProps.values.ppaAgreement}
                    name="ppaAgreement"
                  />
                  <label htmlFor="ppaAgreement"></label>
                  <p className="agreement__text">
                    I agree to the{" "}
                    <a href="/us-en/ts-cs" target="_blank">
                      Program Participant agreement including privacy and
                      cancellation policy.
                    </a>
                  </p>
                </div>
                {formikProps.errors.ppaAgreement &&
                  formikProps.touched.ppaAgreement && (
                    <div className="agreement__important agreement__important_desktop">
                      <img
                        className="agreement__important-icon"
                        src="/img/warning.svg"
                        alt="warning"
                      />
                      {formikProps.errors.ppaAgreement}
                    </div>
                  )}
              </div>
            </div>

            <div className="course-popup d-lg-none d-block tw-z-50">
              <div className="course-card">
                <div className="course-card__info">
                  <div className="course-card__info-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="course-card__date"></p>
                      <button
                        id="course-details"
                        className="link"
                        onClick={toggleDetailMobileModal}
                      >
                        See details
                      </button>
                    </div>
                    <h3 className="course-card__course-name">
                      {subsciption.name}
                    </h3>
                    <div className="d-flex align-items-center">
                      <h6 className="price">${activeSubscription.price}/mo</h6>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={classNames("mobile-modal v3", {
                  active: showDetailMobileModal,
                  show: showDetailMobileModal,
                })}
              >
                <div className="mobile-modal__header mobile-modal__header_v2">
                  <div
                    className="close-modal"
                    onClick={toggleDetailMobileModal}
                  >
                    <div className="close-line"></div>
                    <div className="close-line"></div>
                  </div>
                  <h1 className="course-name">Enroll</h1>
                  <h6 className="new-price d-sm-block d-flex justify-content-between">
                    {subsciption.name}{" "}
                    <span>${activeSubscription.price}/mo</span>
                  </h6>
                </div>
                <div className="mobile-modal__body mobile-modal__body_v2">
                  {subsciption.description && (
                    <div
                      className="subsciption-description"
                      dangerouslySetInnerHTML={{
                        __html: subsciption.description,
                      }}
                    ></div>
                  )}

                  {subsciption.condition && (
                    <div
                      className="course-more"
                      dangerouslySetInnerHTML={{
                        __html: subsciption.condition,
                      }}
                    ></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};
