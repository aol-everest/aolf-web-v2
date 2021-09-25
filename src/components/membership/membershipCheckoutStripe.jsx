import React, { useState } from "react";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import classNames from "classnames";
import { useRouter } from "next/router";
import renderHTML from "react-render-html";
import { StyledInput } from "@components/paymentForm/StyledInput";
import { DiscountCodeInput } from "@components/paymentForm/DiscountCodeInput";
import { BillingInfoForm } from "@components/paymentForm/BillingInfoForm";
import { UserInfoForm } from "@components/paymentForm/UserInfoForm";
import { api } from "@utils";
import { Loader } from "@components";
import { useGlobalAlertContext } from "@contexts";
import { ALERT_TYPES, MEMBERSHIP_TYPES } from "@constants";

const createOptions = (fontSize, padding) => {
  return {
    style: {
      base: {
        fontSize: "16px",
        lineHeight: 2,
        fontWeight: 400,
        fontStyle: "normal",
        color: "#303650",
        letterSpacing: "0.025em",
        fontFamily: "Work Sans, sans-serif",
        "::placeholder": {
          color: "#9598a6",
          fontFamily: "Work Sans, sans-serif",
          fontSize: "16px",
        },
        ...(padding ? { padding } : {}),
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };
};

export const MembershipCheckoutStripe = ({
  offeringId,
  subsciption,
  activeSubscription,
  couponCode,
  profile,
  token,
}) => {
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(null);
  const [showDetailMobileModal, setShowDetailMobileModal] = useState(false);
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();

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
    userSubscriptions.hasOwnProperty(MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value)
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

      const {
        data,
        status,
        error: errorMessage,
        isError,
      } = await api.post({
        token,
        path: "createAndPayOrder",
        body: payLoad,
      });

      setLoading(false);

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      } else if (data && data.orderId) {
        router.push({
          pathname: `/membership/thank-you/${data.orderId}`,
          query: {
            courseType: "SKY_BREATH_MEDITATION",
            sid: activeSubscription.sfid,
          },
        });
      }
    } catch (ex) {
      console.error(ex);
      setLoading(false);
      showAlert(ALERT_TYPES.ERROR_ALERT, { children: ex.message });
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
          <div class="row">
            {loading && <Loader />}
            <div class="col-xl-7 col-lg-6 col-12">
              <form class="order__form" onSubmit={handleSubmit}>
                <div class="details mb-4">
                  <h2 class="details__title">Account Details:</h2>
                  <p class="details__content">
                    This is not your account?{" "}
                    <a href="#" className="link" onClick={logout}>
                      Logout
                    </a>
                  </p>
                </div>
                <div class="order__card">
                  <UserInfoForm formikProps={formikProps} />
                </div>
                <div class="details mb-4 mt-5">
                  <h2 class="details__title">Billing Details:</h2>
                  <p class="details__content">
                    <img src="/img/ic-visa.svg" alt="visa" />
                    <img src="/img/ic-mc.svg" alt="mc" />
                    <img src="/img/ic-ae.svg" alt="ae" />
                  </p>
                </div>
                <div class="order__card">
                  <BillingInfoForm formikProps={formikProps} />
                  <DiscountCodeInput
                    placeholder="Discount Code"
                    formikProps={formikProps}
                    formikKey="couponCode"
                    product={activeSubscription.sfid}
                    token={token}
                    applyDiscount={applyDiscount}
                  ></DiscountCodeInput>

                  {isCreditCardRequired !== false && (
                    <>
                      {!isRegisteredStripeCustomer && (
                        <div className="input-block card-element v2">
                          <CardElement
                            {...createOptions(this.props.fontSize)}
                          />
                        </div>
                      )}

                      {isRegisteredStripeCustomer && (
                        <div class="bank-card-info">
                          <input
                            id="card-number"
                            class="full-width"
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
                <div class="agreement v2 mt-4 d-block d-lg-none">
                  <div class="agreement__group">
                    <input
                      type="checkbox"
                      class={classNames("custom-checkbox", {
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
                    <label for="ppaAgreement"></label>
                    <p class="agreement__text">
                      I agree to the{" "}
                      <a href="/us/ts-cs" target="_blank">
                        Program Participant agreement including privacy and
                        cancellation policy.
                      </a>
                    </p>
                  </div>
                  {formikProps.errors.ppaAgreement &&
                    formikProps.touched.ppaAgreement && (
                      <div class="agreement__important agreement__important_desktop">
                        <img
                          class="agreement__important-icon"
                          src="/img/warning.svg"
                          alt="warning"
                        />
                        {formikProps.errors.ppaAgreement}
                      </div>
                    )}
                </div>
                <div class="order__complete">
                  <div class="order__security security">
                    <img src="/img/ic-lock.svg" alt="lock" />
                    <p class="security__info">
                      AES 256-B&T
                      <span>SSL Secured</span>
                    </p>
                  </div>
                  <button class="btn btn-primary v2" type="submit">
                    {loading && (
                      <div className="loaded" style={{ padding: "0px 58px" }}>
                        <div className="loader">
                          <div className="loader-inner ball-clip-rotate">
                            <div />
                          </div>
                        </div>
                      </div>
                    )}
                    {!loading && `Complete Checkout`}
                  </button>
                </div>
              </form>
            </div>
            <div class="col-xl-4 col-lg-5 col-12 mt-0 mt-6 p-0 offset-lg-1">
              <div class="reciept d-none d-lg-block">
                <div class="reciept__header">
                  <p class="reciept__item_main">Enroll</p>
                  <ul class="reciept__item_list">
                    <li>
                      <span>{subsciption.name}</span>
                      <span>${activeSubscription.price}/mo</span>
                    </li>
                  </ul>
                </div>
                <div class="reciept__details reciept__details_v2 subsciption-description">
                  {subsciption.description &&
                    renderHTML(subsciption.description)}
                </div>
                {subsciption.condition && (
                  <div class="reciept__more">
                    {renderHTML(subsciption.condition)}
                  </div>
                )}
              </div>
              <div class="agreement v2 mt-4 d-none d-lg-block">
                <div class="agreement__group">
                  <input
                    type="checkbox"
                    class={classNames("custom-checkbox", {
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
                  <label for="ppaAgreement"></label>
                  <p class="agreement__text">
                    I agree to the{" "}
                    <a href="/us/ts-cs" target="_blank">
                      Program Participant agreement including privacy and
                      cancellation policy.
                    </a>
                  </p>
                </div>
                {formikProps.errors.ppaAgreement &&
                  formikProps.touched.ppaAgreement && (
                    <div class="agreement__important agreement__important_desktop">
                      <img
                        class="agreement__important-icon"
                        src="/img/warning.svg"
                        alt="warning"
                      />
                      {formikProps.errors.ppaAgreement}
                    </div>
                  )}
              </div>
            </div>

            <div class="course-popup d-lg-none d-block" style={{ zIndex: 99 }}>
              <div class="course-card">
                <div class="course-card__info">
                  <div class="course-card__info-wrapper">
                    <div class="d-flex justify-content-between align-items-center">
                      <p class="course-card__date"></p>
                      <button
                        id="course-details"
                        class="link"
                        onClick={toggleDetailMobileModal}
                      >
                        See details
                      </button>
                    </div>
                    <h3 class="course-card__course-name">{subsciption.name}</h3>
                    <div class="d-flex align-items-center">
                      <h6 class="price">${activeSubscription.price}/mo</h6>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class={classNames("mobile-modal v3", {
                  active: showDetailMobileModal,
                  show: showDetailMobileModal,
                })}
              >
                <div class="mobile-modal__header mobile-modal__header_v2">
                  <div class="close-modal" onClick={toggleDetailMobileModal}>
                    <div class="close-line"></div>
                    <div class="close-line"></div>
                  </div>
                  <h1 class="course-name">Enroll</h1>
                  <h6 class="new-price d-sm-block d-flex justify-content-between">
                    {subsciption.name}{" "}
                    <span>${activeSubscription.price}/mo</span>
                  </h6>
                </div>
                <div class="mobile-modal__body mobile-modal__body_v2">
                  <div class="subsciption-description">
                    {subsciption.description &&
                      renderHTML(subsciption.description)}
                  </div>
                  <div class="course-more">
                    {subsciption.condition && renderHTML(subsciption.condition)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};
