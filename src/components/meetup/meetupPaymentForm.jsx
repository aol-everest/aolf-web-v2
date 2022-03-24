/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { isEmpty } from "@utils";
import { PayPalButton } from "react-paypal-button-v2";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  BillingInfoForm,
  PayWith,
  UserInfoForm,
  MobileCourseOptions,
  AgreementForm,
  MobileCourseDetails,
  DiscountCodeInput,
} from "@components/checkout";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import NumberFormat from "react-number-format";
import { ABBRS } from "@constants";
import { tConvert } from "@utils";
import Image from "next/image";

import { priceCalculation } from "@utils";
import { useQueryString } from "@hooks";
import {
  PAYMENT_MODES,
  PAYMENT_TYPES,
  ALERT_TYPES,
  MODAL_TYPES,
  MEMBERSHIP_TYPES,
} from "@constants";
import { useGlobalAlertContext, useGlobalModalContext } from "@contexts";
import { Loader } from "@components";
import { api } from "@utils";

dayjs.extend(utc);

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

export const MeetupPaymentForm = ({
  meetup = {},
  profile = {},
  enrollmentCompletionAction = () => {},
}) => {
  // const {
  //   loading,
  //   errorMessage,
  //   showError,
  //   discount,
  //   changingCard,
  //   priceType,
  // } = this.state;
  // const { isCreditCardRequired } = discount || {};

  const { showAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [priceType, setPriceType] = useState("");
  const [discount] = useQueryString("discountCode");
  const [discountResponse, setDiscountResponse] = useState(null);
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

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
  };

  const openSubscriptionPaywallPage = (id) => (e) => {
    if (e) e.preventDefault();
    router.push({
      pathname: `/us-en/membership/${id}`,
      query: {
        cid: meetup.sfid,
        page: "checkout",
      },
    });
  };

  const toggleCardChangeDetail = (e) => {
    if (e) e.preventDefault();
    setIsChangingCard((isChangingCard) => !isChangingCard);
  };

  const paypalBuyAcknowledgement = async () => {};

  const completeEnrollmentAction = async (values) => {
    if (loading) {
      return null;
    }

    const {
      sfid: productId,
      isCCNotRequired,
      availableTimings,
      isGenericWorkshop,
      addOnProducts,
    } = meetup;

    const { isCreditCardRequired } = discountResponse || {};
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
    } = values;

    if (paymentMode !== PAYMENT_MODES.STRIPE_PAYMENT_MODE && !isCCNotRequired) {
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
      setLoading(true);

      let tokenizeCC = null;
      if (
        !isCCNotRequired &&
        (!isRegisteredStripeCustomer || isChangingCard) &&
        isCreditCardRequired !== false
      ) {
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
      let addOnProductsList = addOnProducts
        ? addOnProducts.map(({ productSfid }) => productSfid)
        : [];

      let AddOnProductIds = [...addOnProductsList];

      AddOnProductIds = AddOnProductIds.filter((AddOn) => AddOn !== null);
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
          products: {
            productType: "meetup",
            productSfId: productId,
            AddOnProductIds: AddOnProductIds,
          },
          complianceQuestionnaire,
          isInstalmentOpted: false,
        },
      };

      if (isChangingCard) {
        payLoad = {
          ...payLoad,
          shoppingRequest: {
            ...payLoad.shoppingRequest,
            doNotStoreCC: true,
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
      } else if (data) {
        enrollmentCompletionAction(data);
      }
      /*const { trackingActions } = this.props;
      trackingActions.paymentConfirmation(
        { ...product, ...data },
        type,
        couponCode || ''
      );*/
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

  const {
    id: productId,
    premiumRate = {},
    notes,
    isCorporateEvent,
    otherPaymentOptions,
    groupedAddOnProducts,
    addOnProducts = [],
    complianceQuestionnaire,
    eventStartDate,
    eventEndDate,
    meetupStartDateTime,
    meetupStartTime,
    email: contactEmail,
    phone1,
    phone2,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    meetupTitle,
    productTypeId,
    description,
    isCCNotRequired,
    contactPersonName1,
    listPrice,
    unitPrice,
    eventTimeZone,
    memberPrice,
    meetupStartDate,
    primaryTeacherMobilePhone,
    primaryTeacherPhone,
    primaryTeacherEmail,
    mode,
  } = meetup;

  const { subscriptions = [] } = profile;

  const userSubscriptions =
    subscriptions &&
    subscriptions.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.subscriptionMasterSfid]: currentValue,
      };
    }, {});

  const isDigitalMember =
    !!userSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value];

  const { fee, delfee, offering } = priceCalculation({
    meetup,
    discountResponse,
  });

  const isRegularPrice = priceType === null || priceType === "regular";

  const toggleDetailMobileModal = () => {
    showModal(MODAL_TYPES.EMPTY_MODAL, {
      children: (handleModalToggle) => {
        return (
          <MobileCourseDetails
            workshop={meetup}
            closeDetailAction={handleModalToggle}
            userSubscriptions={userSubscriptions}
            price={{ fee, delfee, offering, isRegularPrice }}
            openSubscriptionPaywallPage={openSubscriptionPaywallPage}
          />
        );
      },
    });
  };

  const {
    first_name,
    last_name,
    email,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
    isRegisteredStripeCustomer,
    cardLast4Digit,
  } = profile;
  const questionnaire = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const expenseAddOn = addOnProducts.find((product) => product.isExpenseAddOn);
  const day = meetupStartDateTime && meetupStartDateTime.split(",")[0];

  const hasGroupedAddOnProducts =
    groupedAddOnProducts &&
    !isEmpty(groupedAddOnProducts) &&
    "Residential Add On" in groupedAddOnProducts &&
    groupedAddOnProducts["Residential Add On"].length > 0;

  // const residentialAddOnRequired =
  //   hasGroupedAddOnProducts &&
  //   groupedAddOnProducts["Residential Add On"].some(
  //     (residentialAddOn) => residentialAddOn.isAddOnSelectionRequired,
  //   );

  // const isAccommodationRequired =
  //   hasGroupedAddOnProducts && residentialAddOnRequired;

  // const isCourseOptionRequired =
  //   hasGroupedAddOnProducts || addOnProducts.length > 0;

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
        couponCode: discount ? discount : "",
        questionnaire: questionnaire,
        ppaAgreement: false,
        paymentOption: PAYMENT_TYPES.FULL,
        paymentMode:
          otherPaymentOptions && otherPaymentOptions.indexOf("Paypal") > -1
            ? ""
            : PAYMENT_MODES.STRIPE_PAYMENT_MODE,
        accommodation: null,
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
        accommodation: Yup.mixed().notRequired(),
        paymentMode: Yup.string().required("Payment mode is required!"),
      })}
      onSubmit={async (values, { setSubmitting, isValid, errors }) => {
        await completeEnrollmentAction(values);
      }}
    >
      {(formikProps) => {
        const { values, handleSubmit } = formikProps;

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
            {loading && <Loader />}
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
                  <DiscountCodeInput
                    placeholder="Discount Code"
                    formikProps={formikProps}
                    formikKey="couponCode"
                    product={productId}
                    applyDiscount={applyDiscount}
                    addOnProducts={addOnProducts}
                    productType="meetup"
                  ></DiscountCodeInput>
                  {/* <input
                    id="discount-code"
                    type="text"
                    placeholder="Discount Code"
                  /> */}
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
                            <CardElement options={createOptions} />
                          </div>
                        )}

                        {isRegisteredStripeCustomer && !isChangingCard && (
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
                              <a href="#" onClick={toggleCardChangeDetail}>
                                Would you like to use a different credit card?
                              </a>
                            </div>
                          </>
                        )}

                        {isRegisteredStripeCustomer && isChangingCard && (
                          <>
                            <div className="card-element">
                              <CardElement options={createOptions} />
                            </div>
                            <div className="change-cc-detail-link">
                              <a href="#" onClick={toggleCardChangeDetail}>
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
                      className="order__card__payment-method paypal-info tw-w-[150px]"
                      data-method="paypal"
                    >
                      <div className="paypal-info__sign-in tw-relative tw-z-0">
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

                  <MobileCourseOptions
                    expenseAddOn={expenseAddOn}
                    isOfflineExpense={isOfflineExpense}
                    workshop={meetup}
                    fee={fee}
                    delfee={fee}
                    formikProps={formikProps}
                    userSubscriptions={userSubscriptions}
                    handlePriceTypeChange={handlePriceTypeChange}
                    openSubscriptionPaywallPage={openSubscriptionPaywallPage}
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
                  <button className="btn-primary" type="submit">
                    RSVP
                  </button>
                </div>
              </form>
            </div>
            <div className="col-xl-4 col-lg-5 col-12 mt-0 mt-6 p-0 offset-lg-1">
              <div className="reciept d-none d-lg-block">
                <div className="reciept__header">
                  <p className="reciept__item reciept__item_main">
                    <span>
                      <img src="/img/ic-timer.svg" alt="timer" />
                      RSVP:
                    </span>
                  </p>
                  {!isDigitalMember && (
                    <ul className="reciept__item_list">
                      <li>
                        <span>Regular rate:</span>
                        {unitPrice !== listPrice && (
                          <span>
                            <span className="discount">${listPrice}</span> $
                            {unitPrice}
                          </span>
                        )}
                        {unitPrice === listPrice && <span>${unitPrice}</span>}
                      </li>
                      <li>
                        <span>Digital Member rate:</span>
                        {memberPrice !== listPrice && (
                          <span>
                            <span className="discount">${listPrice}</span> $
                            {memberPrice}
                          </span>
                        )}
                        {memberPrice === listPrice && (
                          <span>${memberPrice}</span>
                        )}
                      </li>

                      <li className="btn-item">
                        <button
                          className="btn-outline"
                          onClick={openSubscriptionPaywallPage(
                            MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value,
                          )}
                        >
                          Join Digital Membership
                        </button>
                      </li>
                    </ul>
                  )}

                  {isDigitalMember && (
                    <ul className="reciept__item_list">
                      <li>
                        <span>Digital Member rate:</span>
                        {memberPrice !== listPrice && (
                          <span>
                            <span className="discount">${listPrice}</span> $
                            {memberPrice}
                          </span>
                        )}
                        {memberPrice === listPrice && (
                          <span>${memberPrice}</span>
                        )}
                      </li>
                    </ul>
                  )}
                </div>
                <div className="reciept__details">
                  <div className="course">
                    <div className="course__photo tw-max-w-[98px] tw-h-[98px] tw-relative">
                      <Image
                        src="/img/course-card-1.png"
                        alt="course-photo"
                        layout="fill"
                      />
                    </div>
                    <div className="course__info info tw-max-w-[190px]">
                      <ul className="info__list">
                        <h2 className="info__title">Your meetup:</h2>
                        {meetupStartDate && dayjs.utc(meetupStartDate) && (
                          <li>{`${dayjs
                            .utc(meetupStartDate)
                            .format("MMMM DD")}, ${dayjs
                            .utc(meetupStartDate)
                            .format("YYYY")}`}</li>
                        )}
                        {!dayjs
                          .utc(eventStartDate)
                          .isSame(dayjs.utc(eventEndDate), "month") && (
                          <li>{`${dayjs
                            .utc(eventStartDate)
                            .format("MMMM DD")}-${dayjs
                            .utc(eventEndDate)
                            .format("MMMM DD, YYYY")}`}</li>
                        )}
                      </ul>
                      <ul className="info__list mt-3">
                        <h2 className="info__title">Timings:</h2>
                        <li>
                          {`${day}: ${tConvert(meetupStartTime)} ${
                            ABBRS[eventTimeZone]
                          }`}
                        </li>
                      </ul>

                      <ul className="info__list mt-3">
                        <h2 className="info__title">Instructor(s):</h2>
                        {primaryTeacherName && (
                          <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                            {primaryTeacherName}
                          </li>
                        )}
                        {coTeacher1Name && (
                          <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                            {coTeacher1Name}
                          </li>
                        )}
                        {coTeacher2Name && (
                          <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                            {coTeacher2Name}
                          </li>
                        )}
                      </ul>
                      <ul className="info__list mt-3">
                        <h2 className="info__title">Contact details:</h2>
                        <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                          <a href={`tel:${phone1}`}>
                            <NumberFormat
                              value={phone1}
                              displayType={"text"}
                              format="+1 (###) ###-####"
                            ></NumberFormat>
                          </a>
                        </li>
                        {phone2 && (
                          <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                            <a href={`tel:${phone2}`}>
                              <NumberFormat
                                value={phone2}
                                displayType={"text"}
                                format="+1 (###) ###-####"
                              ></NumberFormat>
                            </a>
                          </li>
                        )}
                        <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                          <a href={`mailto:${email}`}>{email}</a>
                        </li>
                      </ul>
                      <ul className="info__list mt-3">
                        <h2 className="info__title">Instructor(s):</h2>
                        {primaryTeacherName && <li>{primaryTeacherName}</li>}
                        {coTeacher1Name && <li>{coTeacher1Name}</li>}
                        {coTeacher2Name && <li>{coTeacher2Name}</li>}
                      </ul>
                      <ul className="info__list mt-3">
                        <h2 className="info__title">Contact details:</h2>
                        <li>
                          <a href={`tel:${primaryTeacherMobilePhone}`}>
                            <NumberFormat
                              value={primaryTeacherMobilePhone}
                              displayType={"text"}
                              format="+1 (###) ###-####"
                            ></NumberFormat>
                          </a>
                        </li>
                        {primaryTeacherPhone && (
                          <li>
                            <a href={`tel:${primaryTeacherPhone}`}>
                              <NumberFormat
                                value={primaryTeacherPhone}
                                displayType={"text"}
                                format="+1 (###) ###-####"
                              ></NumberFormat>
                            </a>
                          </li>
                        )}
                        {/* <li>{contactPersonName1}</li> */}
                        <li className="meetup-emial">
                          <a href={`mailto:${primaryTeacherEmail}`}>
                            {primaryTeacherEmail}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
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
            <div className="course-popup d-lg-none d-block">
              <div className="course-card">
                <div className="course-card__info">
                  <div className="course-card__info-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="course-card__date">May 5-7, 2020</p>
                      <button
                        id="course-details"
                        className="link"
                        onClick={toggleDetailMobileModal}
                      >
                        See details
                      </button>
                    </div>
                    <h3 className="course-card__course-name">
                      SKY Breath Meditation
                    </h3>
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
