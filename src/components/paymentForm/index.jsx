import React, { useState } from "react";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import classNames from "classnames";
import renderHTML from "react-render-html";
import { Auth } from "aws-amplify";
import moment from "moment";
import NumberFormat from "react-number-format";
import { useRouter } from "next/router";
import { isEmpty } from "lodash";
import { PayPalButton } from "react-paypal-button-v2";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { UserInfoForm } from "./UserInfoForm";
import { BillingInfoForm } from "./BillingInfoForm";
import { PayWith } from "./PayWith";
import { CourseOptions } from "./CourseOptions";
import { AgreementForm } from "./AgreementForm";
import { priceCalculation } from "@utils";
import { useQueryString } from "@hooks";
import { PAYMENT_MODES, PAYMENT_TYPES } from "@constants";
import { CourseDetailsCard } from "./CourseDetailsCard";

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

export const PaymentForm = ({ workshop = {}, profile = {} }) => {
  // const {
  //   loading,
  //   errorMessage,
  //   showError,
  //   discount,
  //   changingCard,
  //   priceType,
  // } = this.state;
  // const { isCreditCardRequired } = discount || {};

  const stripe = useStripe();
  const elements = useElements();
  const [priceType, setPriceType] = useState("");
  const [discount, setDiscount] = useQueryString("discountCode");
  const router = useRouter();

  const handlePriceTypeChange = (event) => {
    setPriceType({ priceType: event.currentTarget.value });
  };

  const logout = async (event) => {
    await Auth.signOut();
    router.push(
      `/login?next=${encodeURIComponent(location.pathname + location.search)}`,
    );
  };

  const paypalBuyAcknowledgement = async () => {};

  const completeEnrollmentAction = async (values) => {
    if (loading) {
      return null;
    }

    const {
      isCCNotRequired,
      availableTimings,
      isGenericWorkshop,
      addOnProducts,
    } = workshop;

    const { isCreditCardRequired } = this.state.discount || {};

    const { formValues } = this.state;
    if (!formValues && !values) {
      return this.setState({
        loading: false,
        errorMessage: "Form is invalid.",
        showError: true,
      });
    }
    const {
      questionnaire,
      contactPhone,
      contactAddress,
      contactState,
      contactZip,
      couponCode,
      firstName,
      lastName,
      paymentOption,
      paymentMode,
      accommodation,
    } = values || formValues;

    if (paymentMode !== STRIPE_PAYMENT_MODE && !isCCNotRequired) {
      return null;
    }

    const complianceQuestionnaire = questionnaire.reduce(
      (res, current) => ({
        ...res,
        [current.key]: current.value ? "Yes" : "No",
      }),
      {},
    );

    const { isRegisteredStripeCustomer } = profile || {};

    try {
      this.setState({ loading: true });

      let tokenizeCC = null;
      if (
        !isCCNotRequired &&
        (!isRegisteredStripeCustomer || changingCard) &&
        isCreditCardRequired !== false
      ) {
        let createTokenRespone = await this.props.stripe.createToken({
          name: profile.name ? profile.name : firstName + " " + lastName,
        });
        let { error, token } = createTokenRespone;
        if (error) {
          throw error;
        }
        tokenizeCC = token;
      }

      const selectedAddOn = accommodation?.isExpenseAddOn
        ? null
        : accommodation?.productSfid || null;

      let addOnProductsList = addOnProducts
        ? addOnProducts.map((product) => {
            if (!product.isAddOnSelectionRequired) {
              const value = values[product.productName];
              if (value) {
                return product.productSfid;
              } else {
                return null;
              }
            }
            return product.productSfid;
          })
        : [];

      let AddOnProductIds = [selectedAddOn, ...addOnProductsList];

      AddOnProductIds = AddOnProductIds.filter((AddOn) => AddOn !== null);

      const isRegularOrder = values.comboDetailId
        ? values.comboDetailId === productId
        : true;

      const products = isRegularOrder
        ? {
            productType: type,
            productSfId: productId,
            AddOnProductIds: AddOnProductIds,
          }
        : {
            productType: "bundle",
            productSfId: values.comboDetailId,
            childProduct: {
              productType: type,
              productSfId: productId,
              AddOnProductIds: AddOnProductIds,
              complianceQuestionnaire,
            },
          };

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
          billingAddress: {
            billingPhone: contactPhone,
            billingAddress: contactAddress,
            billingState: contactState,
            billingZip: contactZip,
          },
          products,
          complianceQuestionnaire,
          isInstalmentOpted: paymentOption === LATER,
        },
      };

      if (changingCard) {
        payLoad = {
          ...payLoad,
          shoppingRequest: {
            ...payLoad.shoppingRequest,
            doNotStoreCC: true,
          },
        };
      }

      if (isGenericWorkshop) {
        const timeSlot =
          availableTimings &&
          Object.values(availableTimings)[0] &&
          Object.values(Object.values(availableTimings)[0])[0][0]
            .genericWorkshopSlotSfid;
        payLoad = {
          ...payLoad,
          shoppingRequest: {
            ...payLoad.shoppingRequest,
            genericWorkshopSlotSfid: timeSlot,
          },
        };
      }

      if (!isLoggedIn) {
        payLoad = {
          ...payLoad,
          user: {
            firstName,
            lastName,
          },
        };
      }
      //token.saveCardForFuture = true;
      let results = await secure_fetch(`${API.REST.CREATE_AND_PAY_ORDER}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        accessToken,
        body: JSON.stringify(payLoad),
      });
      if (!results.ok) {
        throw new Error(results.statusText);
      }
      this.setState({ loading: false });
      const {
        data,
        status,
        error: errorMessage,
        isError,
      } = await results.json();

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      } else if (data) {
        showEnrollmentCompletionAction(data);
      }
      /*const { trackingActions } = this.props;
      trackingActions.paymentConfirmation(
        { ...product, ...data },
        type,
        couponCode || ''
      );*/
    } catch (ex) {
      console.log(ex);
      this.setState({
        loading: false,
        errorMessage: ex.message,
        showError: true,
      });
    }
  };

  const {
    eventStartDate,
    eventEndDate,
    email: contactEmail,
    phone1,
    phone2,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    title,
    premiumRate = {},
    mode,
    earlyBirdFeeIncreasing,
    productTypeId,
    notes,
    description,
    isEarlyBirdAllowed,
    isCCNotRequired,
    isGenericWorkshop,
    streetAddress1,
    streetAddress2,
    state,
    city,
    country,
    isCorporateEvent,
    isInstalmentAllowed,
    instalmentTenure,
    instalmentGapUnit,
    instalmentGap,
    instalmentAmount,
    otherPaymentOptions,
    groupedAddOnProducts,
    addOnProducts = [],
    complianceQuestionnaire,
  } = workshop;

  const { subscriptions = [] } = profile;

  const userSubscriptions = subscriptions.reduce(
    (accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.subscriptionMasterSfid]: currentValue,
      };
    },
    {},
  );

  const { fee, delfee, offering } = priceCalculation({
    workshop,
    discount,
  });

  const isRegularPrice = priceType === null || priceType === "regular";

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
  } = profile;
  const questionnaire = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const expenseAddOn = addOnProducts.find((product) => product.isExpenseAddOn);

  const hasGroupedAddOnProducts =
    groupedAddOnProducts &&
    !isEmpty(groupedAddOnProducts) &&
    "Residential Add On" in groupedAddOnProducts &&
    groupedAddOnProducts["Residential Add On"].length > 0;

  const residentialAddOnRequired =
    hasGroupedAddOnProducts &&
    groupedAddOnProducts["Residential Add On"].some(
      (residentialAddOn) => residentialAddOn.isAddOnSelectionRequired,
    );

  const isAccommodationRequired =
    hasGroupedAddOnProducts && residentialAddOnRequired;

  const isCourseOptionRequired =
    hasGroupedAddOnProducts || addOnProducts.length > 0;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        firstName: first_name || "",
        lastName: last_name || "",
        email: email || "",
        contactPhone: personMobilePhone || "",
        contactAddress: personMailingStreet || "",
        contactState: personMailingState || "",
        contactZip: personMailingPostalCode || "",
        // couponCode: couponCode ? couponCode : "",
        questionnaire: questionnaire,
        ppaAgreement: false,
        paymentOption: PAYMENT_TYPES.FULL,
        paymentMode: null,
        accommodation: null,
      }}
      validationSchema={Yup.object().shape({
        firstName: Yup.string().when("isLoggedIn", {
          is: false,
          then: Yup.string().required("First Name is required"),
        }),
        lastName: Yup.string().when("isLoggedIn", {
          is: false,
          then: Yup.string().required("Last Name is required"),
        }),
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
        accommodation: false
          ? Yup.object().required("ERROR!")
          : Yup.mixed().notRequired(),
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

        const addOnFee = addOnProducts.reduce(
          (
            previousValue,
            {
              unitPrice,
              isAddOnSelectionRequired,
              productName,
              isExpenseAddOn,
            },
          ) => {
            if (!isExpenseAddOn) {
              if (
                (!isAddOnSelectionRequired && values[productName]) ||
                isAddOnSelectionRequired
              ) {
                return previousValue + unitPrice;
              } else {
                return previousValue;
              }
            } else if (isExpenseAddOn && !hasGroupedAddOnProducts) {
              if (
                (!isAddOnSelectionRequired && values[productName]) ||
                isAddOnSelectionRequired
              ) {
                return previousValue + unitPrice;
              }
              return previousValue;
            } else {
              return previousValue;
            }
          },
          0,
        );

        const totalFee =
          (isRegularPrice ? fee : premiumRate.unitPrice) +
          (values.accommodation?.isExpenseAddOn
            ? expenseAddOn?.unitPrice || 0
            : (values.accommodation?.unitPrice || 0) +
              (values.accommodation ? expenseAddOn?.unitPrice || 0 : 0)) +
          addOnFee;

        let isOfflineExpense;
        if (hasGroupedAddOnProducts && expenseAddOn) {
          isOfflineExpense = expenseAddOn.paymentMode === "In Person";
        } else if (expenseAddOn && !expenseAddOn.isAddOnSelectionRequired) {
          isOfflineExpense = values[expenseAddOn.productName] || false;
        } else if (!expenseAddOn) {
          isOfflineExpense = false;
        } else {
          isOfflineExpense = true;
        }

        return (
          <div className="row">
            <div className="col-lg-7 col-12">
              <form className="order__form" onSubmit={handleSubmit}>
                <div className="details">
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
                <div className="details mt-5">
                  <h2 className="details__title">Billing Details:</h2>
                  <p className="details__content">
                    <img src="/img/ic-visa.svg" alt="visa" />
                    <img src="/img/ic-mc.svg" alt="mc" />
                    <img src="/img/ic-ae.svg" alt="ae" />
                  </p>
                </div>
                <div className="order__card">
                  <BillingInfoForm formikProps={formikProps} />
                  <input
                    id="discount-code"
                    type="text"
                    placeholder="Discount Code"
                  />
                  <PayWith
                    formikProps={formikProps}
                    otherPaymentOptions={otherPaymentOptions}
                  />

                  {formikProps.values.paymentMode ===
                    PAYMENT_MODES.STRIPE_PAYMENT_MODE && (
                    <div
                      className="order__card__payment-method"
                      data-method="card"
                    >
                      <>
                        {!isRegisteredStripeCustomer && (
                          <div className="card-element">
                            <CardElement />
                          </div>
                        )}

                        {isRegisteredStripeCustomer && !changingCard && (
                          <>
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
                            <div className="change-cc-detail-link">
                              <a href="#" onClick={this.toggleCardChangeDetail}>
                                Would you like to use a different credit card?
                              </a>
                            </div>
                          </>
                        )}

                        {isRegisteredStripeCustomer && changingCard && (
                          <>
                            <div className="card-element v2">
                              <CardElement {...createOptions()} />
                            </div>
                            <div className="change-cc-detail-link">
                              <a href="#" onClick={this.toggleCardChangeDetail}>
                                Cancel
                              </a>
                            </div>
                          </>
                        )}
                      </>
                    </div>
                  )}
                  {formikProps.values.paymentMode ===
                    PAYMENT_MODES.PAYPAL_PAYMENT_MODE && (
                    <div
                      className="order__card__payment-method paypal-info"
                      style={{ width: "150px" }}
                      data-method="paypal"
                    >
                      <div
                        className="paypal-info__sign-in"
                        style={{ position: "relative", zIndex: 0 }}
                      >
                        <PayPalButton
                          options={{
                            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                          }}
                          style={{
                            layout: "horizontal",
                            color: "blue",
                            shape: "pill",
                            height: 40,
                            tagline: false,
                            label: "pay",
                          }}
                          onClick={async (data, actions) => {
                            await formikProps.validateForm();
                            formikProps.setTouched({
                              ...formikProps.touched,
                              ...formikProps.errors,
                            });
                            if (!formikProps.isValid) {
                              return false;
                            }
                          }}
                          createOrder={async (data, actions) => {
                            return await this.createPaypalOrder(
                              formikProps.values,
                            );
                          }}
                          onApprove={paypalBuyAcknowledgement}
                        />
                      </div>
                      <div className="paypal-info__sign-out d-none">
                        <button
                          type="button"
                          className="paypal-info__link sign-out-paypal"
                        >
                          Log out from Paypal
                        </button>
                      </div>
                    </div>
                  )}

                  <CourseOptions
                    workshop={workshop}
                    fee={fee}
                    delfee={fee}
                    userSubscriptions={userSubscriptions}
                    handlePriceTypeChange={handlePriceTypeChange}
                    // openSubscriptionPaywallPage={openSubscriptionPaywallPage}
                    hasGroupedAddOnProducts={hasGroupedAddOnProducts}
                    totalFee={totalFee}
                  />
                </div>
                <AgreementForm
                  formikProps={formikProps}
                  complianceQuestionnaire={complianceQuestionnaire}
                  isCorporateEvent={isCorporateEvent}
                  screen="MOBILE"
                />
                <div className="order__complete">
                  <div className="order__security security">
                    <img src="/img/ic-lock.svg" alt="lock" />
                    <p className="security__info">
                      AES 256-B&T
                      <span>SSL Secured</span>
                    </p>
                  </div>
                  <button id="test-modal" className="btn-primary">
                    Complete Checkout
                  </button>
                </div>
              </form>
            </div>
            <div className="col-xl-4 col-lg-5 col-12 mt-0 mt-6 p-0 offset-xl-1">
              <div className="reciept d-none d-lg-block">
                <CourseDetailsCard workshop={workshop} />

                <div className="reciept__payment">
                  <h6 className="reciept__payment__title">Course Options</h6>
                  <div>
                    <div className="reciept__payment-option">
                      <input
                        className="custom-radio"
                        type="radio"
                        name="payment-type"
                        id="payment-lg-regular"
                        value="regular"
                        checked
                      />
                      <label htmlFor="payment-lg-regular">
                        <span>Regular rate</span>
                        <span>
                          <span className="discount">$550</span> $450
                        </span>
                      </label>
                    </div>
                    <div className="reciept__payment-option">
                      <input
                        className="custom-radio"
                        type="radio"
                        name="payment-type"
                        id="payment-lg-premium"
                        value="premium"
                      />
                      <label htmlFor="payment-lg-premium">
                        <span>Premium/Journey+ rate:</span>
                        <span>
                          <span className="discount">$150</span> $50
                        </span>
                      </label>
                    </div>
                    <button type="button" className="btn-outline w-100">
                      Join Journey+
                    </button>
                  </div>
                  <h6 className="reciept__payment__title mt-4">
                    Room & Board *
                  </h6>
                  <div className="select-box select-box_rounded">
                    <div tabIndex="1" className="select-box__current">
                      <span className="select-box__placeholder">
                        Select Room & Board
                      </span>
                      <div className="select-box__value">
                        <input
                          type="radio"
                          id="room-lg-1"
                          value="1"
                          name="room-lg"
                          className="select-box__input"
                        />
                        <span className="select-box__input-text">
                          Room 1 <span className="price">$100</span>
                        </span>
                      </div>
                      <div className="select-box__value">
                        <input
                          type="radio"
                          id="room-lg-2"
                          value="2"
                          name="room-lg"
                          className="select-box__input"
                        />
                        <span className="select-box__input-text">
                          Room 2 <span className="price">$150</span>
                        </span>
                      </div>
                      <div className="select-box__value">
                        <input
                          type="radio"
                          id="room-lg-3"
                          value="3"
                          name="room-lg"
                          className="select-box__input"
                        />
                        <span className="select-box__input-text">
                          Room 3 <span className="price">$200</span>
                        </span>
                      </div>
                    </div>
                    <ul className="select-box__list">
                      <li>
                        <label
                          htmlFor="room-lg-1"
                          aria-hidden="aria-hidden"
                          data-value="1"
                          className="select-box__option"
                        >
                          <span>Room 1</span>
                          <span className="price">$100</span>
                        </label>
                      </li>
                      <li>
                        <label
                          htmlFor="room-lg-2"
                          aria-hidden="aria-hidden"
                          data-value="2"
                          className="select-box__option"
                        >
                          <span>Room 2</span>
                          <span className="price">$150</span>
                        </label>
                      </li>
                      <li>
                        <label
                          htmlFor="room-lg-3"
                          aria-hidden="aria-hidden"
                          data-value="3"
                          className="select-box__option"
                        >
                          <span>Room 3</span>
                          <span className="price">$200</span>
                        </label>
                      </li>
                    </ul>
                  </div>
                  {notes && (
                    <div className="reciept__payment-tooltip reciept__payment-tooltip_small">
                      Additional Notes: {renderHTML(notes)}
                    </div>
                  )}
                </div>
                <div className="reciept__total">
                  <span>Total</span>
                  <span>$750</span>
                </div>
                <div className="reciept__agreement">
                  <AgreementForm
                    formikProps={formikProps}
                    complianceQuestionnaire={complianceQuestionnaire}
                    isCorporateEvent={isCorporateEvent}
                    screen="DESKTOP"
                  />
                  {/* <div className="agreement">
                    <div className="agreement__group agreement__group_important agreement__group_important_desktop">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="program"
                        id="program"
                      />
                      <label htmlFor="program"></label>
                      <p className="agreement__text">
                        I agree to the
                        <a href="#">
                          Program Participant agreement including privacy and
                          cancellation policy.
                        </a>
                      </p>
                    </div>
                    <div className="agreement__important agreement__important_desktop">
                      <img
                        className="agreement__important-icon"
                        src="/img/warning.svg"
                        alt="warning"
                      />
                      Please check the box in order to continue
                    </div>
                  </div>
                  <div className="health-confirmation">
                    <div className="health-confirmation__group health-confirmation__group_important health-confirmation__group_important_desktop">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="health-confirmation"
                        id="health-confirmation"
                      />
                      <label htmlFor="health-confirmation"></label>
                      <p className="health-confirmation__text">
                        I represent that I am in good health, and I will inform
                        the health info desk of any limiting health conditions
                        before the course begins.
                        <br />
                        <br />
                        For any health related questions, please contact us at{" "}
                        <a href="mailto:healthinfo@us.artofliving.org">
                          healthinfo@us.artofliving.org
                        </a>
                      </p>
                    </div>
                    <div className="health-confirmation__important health-confirmation__important_desktop">
                      <img
                        className="health-confirmation__important-icon"
                        src="/img/warning.svg"
                        alt="warning"
                      />
                      Please check the box in order to continue
                    </div>
                  </div>*/}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};
