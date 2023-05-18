/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import classNames from "classnames";
import { useRouter } from "next/router";
import { isEmpty, Auth } from "@utils";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  BillingInfoForm,
  PayWith,
  UserInfoForm,
  MobileCourseOptions,
  AgreementForm,
  MobileCourseDetails,
  DiscountCodeInput,
  CourseDetailsCard,
  PreCostDetailsCard,
  PostCostDetailsCard,
  ProgramQuestionnaire,
  MobileBottomBar,
} from "@components/checkout";
import "yup-phone";
import { priceCalculation } from "@utils";
import { useQueryString } from "@hooks";
import {
  PAYMENT_MODES,
  PAYMENT_TYPES,
  ALERT_TYPES,
  MODAL_TYPES,
} from "@constants";
import {
  useGlobalAlertContext,
  useGlobalModalContext,
  useAuth,
} from "@contexts";
import { Loader } from "@components";
import { api } from "@utils";
import { pushRouteWithUTMQuery } from "@service";
import { filterAllowedParams } from "@utils/utmParam";

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

export const PaymentForm = ({
  workshop = {},
  profile = {},
  enrollmentCompletionAction = () => {},
  handleCouseSelection = () => {},
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
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [discount] = useQueryString("discountCode");
  const [discountResponse, setDiscountResponse] = useState(null);
  const [showCouponCodeField, setShowCouponCodeField] = useState(true);
  const [enrollFormValues, setEnrollFormValues] = useState(null);
  const [showProgramQuestionnaireForm, setShowProgramQuestionnaireForm] =
    useState(false);
  const [programQuestionnaireResult, setProgramQuestionnaireResult] =
    useState(null);

  const router = useRouter();

  useEffect(() => {
    if (programQuestionnaireResult?.length > 0) {
      if (enrollFormValues.paymentMode === PAYMENT_MODES.STRIPE_PAYMENT_MODE) {
        completeEnrollmentAction(enrollFormValues);
      }
      // else if (
      //   enrollFormValues.paymentMode === PAYMENT_MODES.PAYPAL_PAYMENT_MODE
      // ) {
      //   this.state.paypalPromise();
      // }
    }
  }, [programQuestionnaireResult]);

  const logout = async (event) => {
    await Auth.logout();
    setUser(null);
    pushRouteWithUTMQuery(
      router,
      `/login?next=${encodeURIComponent(location.pathname + location.search)}`,
    );
  };

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
  };

  const openSubscriptionPaywallPage = (id) => (e) => {
    if (e) e.preventDefault();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/membership/${id}`,
      query: {
        cid: workshop.id,
        page: "checkout",
      },
    });
  };

  const toggleCardChangeDetail = (e) => {
    if (e) e.preventDefault();
    setIsChangingCard((isChangingCard) => !isChangingCard);
  };

  const submitProgramQuestionnaire = async (programQuestionnaireResult) => {
    setProgramQuestionnaireResult(programQuestionnaireResult);
    setShowProgramQuestionnaireForm(false);
  };

  const closeModalProgramQuestionnaireAction = () => {
    setShowProgramQuestionnaireForm(
      (showProgramQuestionnaireForm) => !showProgramQuestionnaireForm,
    );
    // if (this.state.paypalPromiseReject) {
    //   this.state.paypalPromiseReject();
    // }
  };

  const preEnrollValidation = async (values) => {
    const { programQuestionnaire = [] } = workshop;
    if (programQuestionnaire.length > 0) {
      setEnrollFormValues(values);
      setShowProgramQuestionnaireForm(true);
    } else {
      await completeEnrollmentAction(values);
    }
  };

  const paypalBuyAcknowledgement = async (paypalData) => {
    setLoading(true);
    const {
      data,
      status,
      error: errorMessage,
      isError,
    } = await api.post({
      path: "paypalBuyAcknowledgement",
      body: { orderID: paypalData.orderID },
    });

    setLoading(false);
    if (status === 400 || isError) {
      throw new Error(errorMessage);
    } else if (data) {
      enrollmentCompletionAction(data);
    }
  };

  const createPaypalOrder = async (values) => {
    if (loading) {
      return null;
    }
    const {
      id: productId,
      isCCNotRequired,
      availableTimings,
      isGenericWorkshop,
      addOnProducts,
    } = workshop;

    const {
      questionnaire,
      contactPhone,
      contactAddress,
      contactCity,
      contactState,
      contactZip,
      couponCode,
      firstName,
      lastName,
      paymentOption,
      paymentMode,
      accommodation,
    } = values;

    if (paymentMode !== PAYMENT_MODES.PAYPAL_PAYMENT_MODE) {
      return null;
    }

    const complianceQuestionnaire = questionnaire.reduce(
      (res, current) => ({
        ...res,
        [current.key]: current.value ? "Yes" : "No",
      }),
      {},
    );

    try {
      setLoading(true);

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
            productType: "workshop",
            productSfId: productId,
            AddOnProductIds: AddOnProductIds,
          }
        : {
            productType: "bundle",
            productSfId: values.comboDetailId,
            childProduct: {
              productType: "workshop",
              productSfId: productId,
              AddOnProductIds: AddOnProductIds,
              complianceQuestionnaire,
            },
          };

      let payLoad = {
        shoppingRequest: {
          couponCode: showCouponCodeField ? couponCode : "",
          contactAddress: {
            contactPhone,
            contactAddress,
            contactCity,
            contactState,
            contactZip,
          },
          billingAddress: {
            billingPhone: contactPhone,
            billingAddress: contactAddress,
            billingCity: contactCity,
            billingState: contactState,
            billingZip: contactZip,
          },
          products,
          complianceQuestionnaire,
          programQuestionnaireResult,
          isInstalmentOpted: paymentOption === PAYMENT_TYPES.LATER,
          isPaypalPayment: true,
        },
        utm: filterAllowedParams(router.query),
      };

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

      //token.saveCardForFuture = true;
      const {
        paypalObj,
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
      if (paypalObj) {
        return paypalObj.id;
      }
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

  const completeEnrollmentAction = async (values) => {
    if (loading) {
      return null;
    }

    const {
      id: productId,
      isCCNotRequired,
      availableTimings,
      isGenericWorkshop,
      addOnProducts,
      paymentMethod = {},
    } = workshop;

    const { isCreditCardRequired } = discountResponse || {};
    const {
      questionnaire,
      contactPhone,
      contactAddress,
      contactCity,
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

    try {
      setLoading(true);

      let tokenizeCC = null;
      if (
        !isCCNotRequired &&
        (paymentMethod.type !== "card" || isChangingCard) &&
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
            productType: "workshop",
            productSfId: productId,
            AddOnProductIds: AddOnProductIds,
          }
        : {
            productType: "bundle",
            productSfId: values.comboDetailId,
            childProduct: {
              productType: "workshop",
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
            contactCity,
            contactState,
            contactZip,
          },
          billingAddress: {
            billingPhone: contactPhone,
            billingAddress: contactAddress,
            billingCity: contactCity,
            billingState: contactState,
            billingZip: contactZip,
          },
          products,
          complianceQuestionnaire,
          programQuestionnaireResult,
          isInstalmentOpted: paymentOption === PAYMENT_TYPES.LATER,
        },
        utm: filterAllowedParams(router.query),
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

      // if (!token) {
      //   payLoad = {
      //     ...payLoad,
      //     user: {
      //       firstName,
      //       lastName,
      //     },
      //   };
      // }
      //token.saveCardForFuture = true;

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
    availableBundles,
    usableCredit,
    programQuestionnaire,
    title,
    productTypeId,
    isCCNotRequired,
    paymentMethod = {},
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
    discount: discountResponse,
  });

  const { isCreditCardRequired } = discountResponse || {};

  const {
    first_name,
    last_name,
    email,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
    personMailingCity,
  } = profile;

  const { cardLast4Digit = null } = paymentMethod;

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

  const isComboDetailAvailable = availableBundles?.length > 0;

  const isUsableCreditAvailable = usableCredit && !isEmpty(usableCredit);

  let UpdatedFeeAfterCredits;
  if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === "Quantity" &&
    usableCredit.availableCredit === 1
  ) {
    UpdatedFeeAfterCredits = 0;
  } else if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === "Amount"
  ) {
    if (usableCredit.availableCredit > fee) {
      UpdatedFeeAfterCredits = 0;
    } else {
      UpdatedFeeAfterCredits = fee - usableCredit.availableCredit;
    }
  }

  const toggleDetailMobileModal = (isRegularPrice) => () => {
    showModal(MODAL_TYPES.EMPTY_MODAL, {
      children: (handleModalToggle) => {
        return (
          <MobileCourseDetails
            workshop={workshop}
            closeDetailAction={handleModalToggle}
            userSubscriptions={userSubscriptions}
            price={{ fee, delfee, offering, isRegularPrice }}
            openSubscriptionPaywallPage={openSubscriptionPaywallPage}
            isUsableCreditAvailable={isUsableCreditAvailable}
            discount={discountResponse}
            isComboDetailAvailable={isComboDetailAvailable}
          />
        );
      },
    });
  };

  const handleComboDetailChange = (formikProps, comboDetailProductSfid) => {
    formikProps.setFieldValue("comboDetailId", comboDetailProductSfid);
    handleCouseSelection(comboDetailProductSfid);
    const { isInstalmentAllowed, id } = workshop;
    if (isInstalmentAllowed && id === comboDetailProductSfid) {
      setShowCouponCodeField(true);
    } else {
      setShowCouponCodeField(false);
      formikProps.setFieldValue("paymentOption", PAYMENT_TYPES.FULL);
    }

    // Added logic to remove paypal option for bundle
    if (id !== comboDetailProductSfid) {
      const selectedBundle = availableBundles?.find(
        (bundle) => bundle.comboProductSfid === comboDetailProductSfid,
      );

      const isBundlePaypalAvailable = selectedBundle
        ? selectedBundle.otherPaymentOptionAvailable?.indexOf("Paypal") > -1
        : false;

      if (!isBundlePaypalAvailable) {
        formikProps.setFieldValue(
          "paymentMode",
          PAYMENT_MODES.STRIPE_PAYMENT_MODE,
        );
      }
    }
  };

  const handlePaymentOptionChange = (formikProps, paymentOption) => {
    formikProps.setFieldValue("paymentOption", paymentOption);
    if (paymentOption === PAYMENT_TYPES.LATER) {
      formikProps.setFieldValue(
        "paymentMode",
        PAYMENT_MODES.STRIPE_PAYMENT_MODE,
      );
    }
  };

  const handleAccommodationChange = (formikProps, value) => {
    formikProps.setFieldValue("accommodation", value);
  };

  const toggleCouponCodeFieldAction = (e) => {
    if (e) e.preventDefault();
    setShowCouponCodeField((showCouponCodeField) => !showCouponCodeField);
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    contactPhone: Yup.string()
      .label("Phone")
      .required("Phone is required")
      .phone(null, false, "Phone is invalid")
      .nullable(),
    contactAddress: Yup.string().required("Address is required"),
    contactCity: Yup.string().required("City is required"),
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
    accommodation: isAccommodationRequired
      ? Yup.object().required("Room & Board is required!")
      : Yup.mixed().notRequired(),
    paymentMode: isCCNotRequired
      ? Yup.mixed().notRequired()
      : Yup.string().required("Payment mode is required!"),
  });
  return (
    <>
      <Formik
        initialValues={{
          firstName: first_name || "",
          lastName: last_name || "",
          email: email || "",
          contactPhone: personMobilePhone || "",
          contactAddress: personMailingStreet || "",
          contactCity: personMailingCity || "",
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
          priceType: "regular",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, isValid, errors }) => {
          await preEnrollValidation(values);
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
          const isRegularPrice =
            values.priceType === null || values.priceType === "regular";
          const courseFee = isRegularPrice ? fee : premiumRate.unitPrice;

          const totalFee =
            (isUsableCreditAvailable && usableCredit.creditMeasureUnit
              ? UpdatedFeeAfterCredits
              : courseFee) +
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

          const selectedBundle = availableBundles?.find(
            (bundle) => bundle.comboProductSfid === values.comboDetailId,
          );

          const isBundlePaypalAvailable = selectedBundle
            ? selectedBundle.otherPaymentOptionAvailable?.indexOf("Paypal") > -1
            : false;

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
                    ></DiscountCodeInput>
                    {/* <input
                    id="discount-code"
                    type="text"
                    placeholder="Discount Code"
                  /> */}
                    {!isCCNotRequired && isCreditCardRequired !== false && (
                      <PayWith
                        formikProps={formikProps}
                        otherPaymentOptions={otherPaymentOptions}
                        isBundlePaypalAvailable={isBundlePaypalAvailable}
                        isBundleSelected={selectedBundle}
                      />
                    )}

                    {formikProps.values.paymentMode ===
                      PAYMENT_MODES.STRIPE_PAYMENT_MODE && (
                      <div
                        className="order__card__payment-method"
                        data-method="card"
                      >
                        <>
                          {!cardLast4Digit &&
                            !isCCNotRequired &&
                            isCreditCardRequired !== false && (
                              <div className="card-element">
                                <CardElement options={createOptions} />
                              </div>
                            )}

                          {cardLast4Digit &&
                            !isChangingCard &&
                            !isCCNotRequired &&
                            isCreditCardRequired !== false && (
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
                                    Would you like to use a different credit
                                    card?
                                  </a>
                                </div>
                              </>
                            )}

                          {cardLast4Digit && isChangingCard && (
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
                        className="order__card__payment-method paypal-info !tw-w-[150px]"
                        data-method="paypal"
                      >
                        <div className="paypal-info__sign-in tw-relative tw-z-0">
                          <PayPalScriptProvider
                            options={{
                              "client-id":
                                process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                              debug: true,
                              currency: "USD",
                            }}
                          >
                            <PayPalButtons
                              style={{
                                layout: "horizontal",
                                color: "blue",
                                shape: "pill",
                                height: 40,
                                tagline: false,
                                label: "pay",
                              }}
                              onClick={async (data, actions) => {
                                const formErrors =
                                  await formikProps.validateForm();

                                formikProps.setTouched({
                                  ...formikProps.touched,
                                  ...formikProps.errors,
                                });
                                if (JSON.stringify(formErrors) !== "{}") {
                                  return false;
                                }
                              }}
                              createOrder={async (data, actions) => {
                                return await createPaypalOrder(
                                  formikProps.values,
                                );
                              }}
                              onApprove={paypalBuyAcknowledgement}
                            />
                          </PayPalScriptProvider>
                          {/* <PayPalButton
                            options={{
                              clientId:
                                process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
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
                              return await createPaypalOrder(
                                formikProps.values,
                              );
                            }}
                            onApprove={paypalBuyAcknowledgement}
                          /> */}
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
                      workshop={workshop}
                      fee={fee}
                      delfee={delfee}
                      formikProps={formikProps}
                      userSubscriptions={userSubscriptions}
                      openSubscriptionPaywallPage={openSubscriptionPaywallPage}
                      hasGroupedAddOnProducts={hasGroupedAddOnProducts}
                      totalFee={totalFee}
                      paymentOptionChange={handlePaymentOptionChange}
                      showCouponCodeField={showCouponCodeField}
                      isUsableCreditAvailable={isUsableCreditAvailable}
                      UpdatedFeeAfterCredits={UpdatedFeeAfterCredits}
                      isComboDetailAvailable={isComboDetailAvailable}
                      values={values}
                      onComboDetailChange={handleComboDetailChange}
                      isCourseOptionRequired={isCourseOptionRequired}
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
                    {formikProps.values.paymentMode !==
                      PAYMENT_MODES.PAYPAL_PAYMENT_MODE && (
                      <button className="btn-primary">Complete Checkout</button>
                    )}
                  </div>
                </form>
              </div>
              <div className="col-xl-4 col-lg-5 col-12 mt-0 mt-6 p-0 offset-xl-1">
                <div className="reciept d-none d-lg-block">
                  <PreCostDetailsCard
                    workshop={workshop}
                    userSubscriptions={userSubscriptions}
                    formikProps={formikProps}
                    fee={fee}
                    delfee={delfee}
                    offering={offering}
                    showCouponCodeField={showCouponCodeField}
                    hasGroupedAddOnProducts={hasGroupedAddOnProducts}
                    openSubscriptionPaywallPage={openSubscriptionPaywallPage}
                    isComboDetailAvailable={isComboDetailAvailable}
                    isCourseOptionRequired={isCourseOptionRequired}
                    isUsableCreditAvailable={isUsableCreditAvailable}
                    UpdatedFeeAfterCredits={UpdatedFeeAfterCredits}
                    values={values}
                    onComboDetailChange={handleComboDetailChange}
                    paymentOptionChange={handlePaymentOptionChange}
                    discount={discountResponse}
                  />
                  <CourseDetailsCard workshop={workshop} />
                  <PostCostDetailsCard
                    workshop={workshop}
                    userSubscriptions={userSubscriptions}
                    formikProps={formikProps}
                    fee={fee}
                    delfee={delfee}
                    offering={offering}
                    showCouponCodeField={true}
                    hasGroupedAddOnProducts={hasGroupedAddOnProducts}
                    openSubscriptionPaywallPage={openSubscriptionPaywallPage}
                    isComboDetailAvailable={isComboDetailAvailable}
                    isCourseOptionRequired={isCourseOptionRequired}
                    isUsableCreditAvailable={isUsableCreditAvailable}
                    UpdatedFeeAfterCredits={UpdatedFeeAfterCredits}
                    totalFee={totalFee}
                    onAccommodationChange={handleAccommodationChange}
                    discount={discountResponse}
                  />

                  {/* <div className="reciept__payment">
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
                </div> */}
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
              <MobileBottomBar
                workshop={workshop}
                toggleDetailMobileModal={toggleDetailMobileModal(
                  isRegularPrice,
                )}
              />
            </div>
          );
        }}
      </Formik>
      {showProgramQuestionnaireForm && (
        <ProgramQuestionnaire
          programName={title}
          questions={programQuestionnaire}
          submitResult={submitProgramQuestionnaire}
          closeModalAction={closeModalProgramQuestionnaireAction}
          productTypeId={productTypeId}
        ></ProgramQuestionnaire>
      )}
    </>
  );
};
