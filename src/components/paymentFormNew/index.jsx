/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  ProgramQuestionnaire,
  UserInfoFormNewCheckout,
} from '@components/checkout';
import dayjs from 'dayjs';
import {
  ABBRS,
  ALERT_TYPES,
  COURSE_MODES,
  PAYMENT_MODES,
  PAYMENT_TYPES,
} from '@constants';
import { useAuth, useGlobalAlertContext } from '@contexts';
import { useQueryString, usePayment } from '@hooks';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { pushRouteWithUTMQuery } from '@service';
import {
  CardElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Auth, api, isEmpty, phoneRegExp, tConvert } from '@utils';
import { filterAllowedParams } from '@utils/utmParam';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { DiscountInputNew } from '@components/discountInputNew';
import { ScheduleAgreementForm } from '@components/scheduleAgreementForm';
import { PayWithNewCheckout } from '@components/checkout/PayWithNewCheckout';
import CostDetailsCardNewCheckout from '@components/checkout/CostDetailsCardNewCheckout';
import { Loader } from '@components';
import { usePriceCalculation } from '@hooks';

const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const createOptions = {
  style: {
    base: {
      fontSize: '16px',
      lineHeight: 2,
      fontWeight: 200,
      fontStyle: 'normal',
      color: '#303650',
      fontFamily: 'Work Sans, sans-serif',
      '::placeholder': {
        color: '#9598a6',
        fontFamily: 'Work Sans, sans-serif',
        fontSize: '16px',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export const PaymentFormNew = ({
  isStripeIntentPayment = false,
  enrollmentCompletionLink,
  workshop = {},
  profile = {},
  enrollmentCompletionAction = () => {},
  handleCouseSelection = () => {},
  login = () => {},
  isLoggedUser = false,
  onValidateDiscount,
  isHBForm = false,
}) => {
  const formRef = useRef();
  const { showAlert } = useGlobalAlertContext();
  const stripe = useStripe();
  const elements = useElements();
  const { setUser, passwordLess } = useAuth();
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [discount] = useQueryString('discountCode');
  const [discountResponse, setDiscountResponse] = useState(null);
  const [showCouponCodeField, setShowCouponCodeField] = useState(true);
  const [showProgramQuestionnaireForm, setShowProgramQuestionnaireForm] =
    useState(false);
  const [programQuestionnaireResult, setProgramQuestionnaireResult] =
    useState(null);

  const router = useRouter();
  const { signOut } = passwordLess;

  const { loading, processPayment, handlePaypalPayment } = usePayment({
    stripe,
    elements,
    enrollmentCompletionAction,
    enrollmentCompletionLink,
  });

  const {
    basePrice: fee,
    displayPrice: delfee,
    total: finalPrice,
    isPaymentRequired,
    subtotal,
    discountAmount,
  } = usePriceCalculation({
    workshop,
    agreementCMEAccepted: false,
    premiumRate: workshop.premiumRate,
    addOnProducts: workshop.addOnProducts || [],
    hasGroupedAddOnProducts:
      workshop.groupedAddOnProducts &&
      !isEmpty(workshop.groupedAddOnProducts) &&
      'Residential Add On' in workshop.groupedAddOnProducts &&
      workshop.groupedAddOnProducts['Residential Add On'].length > 0,
    values: formRef.current?.values || {},
    discount: discountResponse,
    isCCNotRequired: workshop.isCCNotRequired,
  });

  const {
    id: productId,
    otherPaymentOptions,
    groupedAddOnProducts,
    addOnProducts = [],
    complianceQuestionnaire,
    availableBundles,
    programQuestionnaire,
    title,
    productTypeId,
    paymentMethod = {},
    phone1,
    eventEndDate,
    eventStartDate,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    mode,
    phone2,
    timings = [],
    email: contactEmail,
    contactName,
  } = workshop;

  const questionnaireArray = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: '',
      }))
    : [];

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

  const cmeAddOn = addOnProducts.find(({ isCMEAddOn }) => isCMEAddOn === true);

  const { cardLast4Digit = null } = paymentMethod;

  const hasGroupedAddOnProducts =
    groupedAddOnProducts &&
    !isEmpty(groupedAddOnProducts) &&
    'Residential Add On' in groupedAddOnProducts &&
    groupedAddOnProducts['Residential Add On'].length > 0;

  const residentialAddOnRequired =
    hasGroupedAddOnProducts &&
    groupedAddOnProducts['Residential Add On'].some(
      (residentialAddOn) => residentialAddOn.isAddOnSelectionRequired,
    );

  const isAccommodationRequired =
    hasGroupedAddOnProducts && residentialAddOnRequired;

  const isCourseOptionRequired =
    hasGroupedAddOnProducts || addOnProducts.length > 0;

  const isComboDetailAvailable = availableBundles?.length > 0;

  const validateDiscount = !(
    workshop?.afterCreditPrice === 0 || workshop?.unitPrice === 0
  );

  useEffect(() => {
    onValidateDiscount(validateDiscount);
  }, [validateDiscount, onValidateDiscount]);

  const logout = async (e) => {
    if (e) e.preventDefault();
    await signOut();
    pushRouteWithUTMQuery(
      router,
      `/us-en/signin?next=${encodeURIComponent(location.pathname + location.search)}`,
    );
  };

  const applyDiscount = (discount) => {
    console.log('discount', discount);
    setDiscountResponse(discount);
  };

  const openSubscriptionPaywallPage = (id) => (e) => {
    if (e) e.preventDefault();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/membership/${id}`,
      query: {
        cid: workshop.id,
        page: 'checkout',
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
  };

  const validatePaymentRequirements = (values) => {
    const { paymentMode } = values;

    if (!isPaymentRequired) {
      return true;
    }

    if (!paymentMode) {
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: 'Please select a payment method',
      });
      return false;
    }

    if (paymentMode === PAYMENT_MODES.STRIPE_PAYMENT_MODE) {
      if (!stripe || !elements) {
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: 'Payment system is not ready. Please try again.',
        });
        return false;
      }
    }

    return true;
  };

  const handleFormSubmit = async () => {
    if (formRef.current) {
      const { values, validateForm } = formRef.current;
      const errors = await validateForm(values);

      if (Object.keys(errors).length > 0) {
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: 'Please fill in all required fields correctly.',
        });
        return;
      }

      if (!validatePaymentRequirements(values)) {
        return;
      }

      formRef.current.submitForm();
    }
  };

  const preEnrollValidation = async (values) => {
    const { programQuestionnaire = [] } = workshop;

    try {
      if (programQuestionnaire.length > 0) {
        setShowProgramQuestionnaireForm(true);
      } else {
        await completeEnrollmentAction(values);
      }
    } catch (error) {
      console.error('Pre-enrollment validation failed:', error);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: 'Failed to process enrollment. Please try again.',
      });
    }
  };

  const completeEnrollmentAction = async (values) => {
    if (loading) return null;

    try {
      const paymentData = preparePaymentData(values);
      await processPayment(values, paymentData);
    } catch (error) {
      console.error('Payment failed:', error);
      // Error is already handled by the hook
    }
  };

  const createPaypalOrder = async (values) => {
    if (loading) return null;

    try {
      const paymentData = preparePaymentData(values);
      return await processPayment(values, paymentData);
    } catch (error) {
      console.error('PayPal order creation failed:', error);
      return null;
    }
  };

  const handleComboDetailChange = (formikProps, comboDetailProductSfid) => {
    try {
      formikProps.setFieldValue('comboDetailId', comboDetailProductSfid);
      handleCouseSelection(comboDetailProductSfid);

      const { isInstalmentAllowed, id } = workshop;
      const isMainProduct = id === comboDetailProductSfid;

      // Handle coupon code visibility
      if (isInstalmentAllowed && isMainProduct) {
        setShowCouponCodeField(true);
      } else {
        setShowCouponCodeField(false);
        formikProps.setFieldValue('paymentOption', PAYMENT_TYPES.FULL);
      }

      // Handle PayPal availability for bundles
      if (!isMainProduct) {
        const selectedBundle = availableBundles?.find(
          (bundle) => bundle.comboProductSfid === comboDetailProductSfid,
        );

        const isBundlePaypalAvailable =
          selectedBundle?.otherPaymentOptionAvailable?.includes('Paypal') ??
          false;

        if (!isBundlePaypalAvailable) {
          formikProps.setFieldValue(
            'paymentMode',
            PAYMENT_MODES.STRIPE_PAYMENT_MODE,
          );
        }
      }
    } catch (error) {
      console.error('Failed to handle combo detail change:', error);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: 'Failed to update product selection. Please try again.',
      });
    }
  };

  const handlePaymentOptionChange = (formikProps, paymentOption) => {
    formikProps.setFieldValue('paymentOption', paymentOption);
    if (paymentOption === PAYMENT_TYPES.LATER) {
      formikProps.setFieldValue(
        'paymentMode',
        PAYMENT_MODES.STRIPE_PAYMENT_MODE,
      );
    }
  };

  const handleAccommodationChange = (formikProps, value) => {
    formikProps.setFieldValue('accommodation', value);
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required('First Name is required')
      .matches(/\S/, 'String should not contain empty spaces'),
    lastName: Yup.string()
      .required('Last Name is required')
      .matches(/\S/, 'String should not contain empty spaces'),
    email: Yup.string()
      .required('Email is required')
      .matches(/\S/, 'String should not contain empty spaces')
      .email(),
    contactAddress: Yup.string()
      .required('Address is required')
      .matches(/\S/, 'String should not contain empty spaces'),
    contactCity: Yup.string()
      .required('City is required')
      .matches(/\S/, 'String should not contain empty spaces'),
    contactState: Yup.string()
      .required('State is required')
      .matches(/\S/, 'String should not contain empty spaces'),
    contactZip: Yup.string()
      .required('Zip is required!')
      .matches(/\S/, 'String should not contain empty spaces')
      .min(2, 'Zip is invalid')
      .max(10, 'Zip is invalid'),
    contactPhone: Yup.string()
      .required('Phone number required')
      .matches(phoneRegExp, 'Phone number is not valid'),
    ppaAgreement: Yup.boolean()
      .label('Terms')
      .test(
        'is-true',
        'Please check the box in order to continue.',
        (value) => value === true,
      ),
    accommodation: isAccommodationRequired
      ? Yup.object().required('Expense Type is required!')
      : Yup.mixed().notRequired(),
    paymentMode: !isPaymentRequired
      ? Yup.mixed().notRequired()
      : Yup.string().required('Payment mode is required!'),
    ...(isHBForm && {
      contactTitle: Yup.string()
        .trim()
        .min(2, 'Title must be at least 2 characters')
        .matches(
          /^[a-zA-Z\s.]+$/,
          'Title must contain only letters, spaces and periods',
        )
        .required('Title is required'),
      contactHealthcareOrganisation: Yup.string()
        .trim()
        .min(2, 'Organization name must be at least 2 characters')
        .required('Healthcare Organization is required'),
      contactOtherHealthcareOrganization: Yup.string()
        .trim()
        .ensure()
        .when('contactHealthcareOrganisation', {
          is: 'other',
          then: Yup.string()
            .min(2, 'Organization name must be at least 2 characters')
            .required('Please specify your healthcare organization'),
        }),
      contactDegree: Yup.string()
        .trim()
        .matches(
          /^[a-zA-Z\s.,]+$/,
          'Degree must contain only letters, spaces, periods and commas',
        )
        .min(2, 'Degree must be at least 2 characters')
        .required('Degree/Qualifications is required'),
      claimingType: Yup.string().when('CME', {
        is: true,
        then: Yup.string()
          .trim()
          .required('Please select your CE claiming type'),
        otherwise: Yup.string().notRequired(),
      }),
      certificateOfAttendance: Yup.string().when('CME', {
        is: true,
        then: Yup.string()
          .trim()
          .required('Please select your certificate preference'),
        otherwise: Yup.string().notRequired(),
      }),
      contactClaimingTypeOther: cmeAddOn
        ? Yup.string().when('claimingType', {
            is: (claimingType) => claimingType === 'Other',
            then: Yup.string()
              .trim()
              .min(2, 'Please provide a valid claiming type')
              .required('Please specify your claiming type'),
          })
        : Yup.mixed().notRequired(),
      cmeAgreeToShareData: Yup.bool().when('CME', {
        is: true,
        then: Yup.bool().oneOf(
          [true],
          'Please agree to share CME data to proceed',
        ),
        otherwise: Yup.bool().notRequired(),
      }),
    }),
  });

  const paymentElementOptions = {
    layout: {
      type: 'accordion',
      defaultCollapsed: true,
      radios: true,
      spacedAccordionItems: false,
    },
    defaultValues: {
      billingDetails: {
        email: profile.email || '',
        name: [profile.first_name, profile.last_name].filter(Boolean).join(' '),
        phone: profile.personMobilePhone || '',
      },
    },
  };

  const formikOnChange = (values) => {
    // Update Stripe elements if needed
    if (!stripe || !elements || !isStripeIntentPayment) {
      return;
    }

    if (finalPrice > 0) {
      elements.update({
        amount: finalPrice * 100,
      });
    }

    const paymentElement = elements.getElement(PaymentElement);
    if (paymentElement) {
      paymentElement.update({
        defaultValues: {
          billingDetails: {
            email: values.email,
            name: (values.firstName || '') + (values.lastName || ''),
            phone: values.contactPhone,
          },
        },
      });
    }
  };

  const preparePaymentData = (values) => {
    const {
      id: productId,
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
      accommodation,
      contactTitle,
      contactHealthcareOrganisation,
      contactOtherHealthcareOrganization,
      contactDegree,
      claimingType,
      certificateOfAttendance,
      contactClaimingTypeOther,
      email,
      paymentOption,
    } = values;

    const complianceQuestionnaire = questionnaire.reduce(
      (res, current) => ({
        ...res,
        [current.key]: current.value ? 'Yes' : 'No',
      }),
      {},
    );

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

    let AddOnProductIds = [selectedAddOn, ...addOnProductsList].filter(
      (AddOn) => AddOn !== null,
    );

    const isRegularOrder = !workshop.bundleInfo;

    const products = isRegularOrder
      ? {
          productType: 'workshop',
          productSfId: productId,
          AddOnProductIds,
        }
      : {
          productType: 'bundle',
          productSfId: workshop.bundleInfo.comboProductSfid,
          childProduct: {
            productType: 'workshop',
            productSfId: productId,
            AddOnProductIds,
            complianceQuestionnaire,
          },
        };

    let payLoad = {
      shoppingRequest: {
        couponCode: showCouponCodeField ? couponCode : '',
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
        ...(isHBForm && {
          attendee: {
            contactTitle,
            contactHealthcareOrganisation,
            contactOtherHealthcareOrganization,
            contactDegree,
            claimingType,
            certificateOfAttendance,
            contactClaimingTypeOther,
          },
        }),
        complianceQuestionnaire,
        programQuestionnaireResult,
        isInstalmentOpted: paymentOption === PAYMENT_TYPES.LATER,
        isStripeIntentPayment,
      },
      utm: filterAllowedParams(router.query),
    };

    if (!isLoggedUser) {
      payLoad = {
        ...payLoad,
        user: {
          lastName,
          firstName,
          email,
        },
      };
    }

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

    return payLoad;
  };

  const showPaymentOptions =
    otherPaymentOptions && otherPaymentOptions.indexOf('Paypal') > -1;

  return (
    <>
      {loading && <Loader />}
      <Formik
        initialValues={{
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          contactPhone: profile.personMobilePhone || '',
          contactAddress: profile.personMailingStreet || '',
          contactCity: profile.personMailingCity || '',
          contactState: profile.personMailingState || '',
          contactZip: profile.personMailingPostalCode || '',
          couponCode: discount || '',
          questionnaire: questionnaireArray,
          ppaAgreement: false,
          paymentOption: PAYMENT_TYPES.FULL,
          paymentMode: !otherPaymentOptions?.includes('Paypal')
            ? PAYMENT_MODES.STRIPE_PAYMENT_MODE
            : '',
          accommodation: null,
          priceType: 'regular',
        }}
        validationSchema={validationSchema}
        innerRef={formRef}
        onSubmit={preEnrollValidation}
      >
        {(formikProps) => {
          const { values } = formikProps;
          formikOnChange(values);

          return (
            <>
              <main className="checkout-aol">
                <section>
                  <div className="row">
                    <div className="col-12 col-lg-7">
                      <div className="section--title">
                        <h1 className="page-title">{title}</h1>
                        {workshop.isGenericWorkshop ? (
                          <div className="description">
                            Once you register, you will be contacted to schedule
                            your course date
                            <br />
                            <span>
                              SKY is offered every week of the year across time
                              zones.
                            </span>
                          </div>
                        ) : (
                          <div
                            className="description"
                            dangerouslySetInnerHTML={{
                              __html: workshop?.description,
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="section-box account-details">
                        <h2 className="section__title">Account Details</h2>
                        <div className="section__body">
                          {isLoggedUser && (
                            <p className="details__content">
                              This is not your account?{' '}
                              <a href="#" className="link" onClick={logout}>
                                Logout
                              </a>
                            </p>
                          )}
                          {!isLoggedUser && (
                            <p className="details__content">
                              Already have an Account?{' '}
                              <a href="#" className="link" onClick={login}>
                                Login
                              </a>
                            </p>
                          )}
                          <form id="my-form">
                            <UserInfoFormNewCheckout
                              formikProps={formikProps}
                              isLoggedUser={isLoggedUser}
                              isHBForm={isHBForm}
                            />
                          </form>
                        </div>
                      </div>
                      <div className="section-box">
                        {isPaymentRequired && (
                          <>
                            <h2 className="section__title d-flex">
                              Pay with
                              <span className="ssl-info">
                                <svg
                                  width="20"
                                  height="21"
                                  viewBox="0 0 20 21"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M15.4497 3.93312L10.8663 2.21646C10.3913 2.04146 9.61634 2.04146 9.14134 2.21646L4.55801 3.93312C3.67467 4.26645 2.95801 5.29979 2.95801 6.24145V12.9915C2.95801 13.6665 3.39967 14.5581 3.94134 14.9581L8.52467 18.3831C9.33301 18.9915 10.658 18.9915 11.4663 18.3831L16.0497 14.9581C16.5913 14.5498 17.033 13.6665 17.033 12.9915V6.24145C17.0413 5.29979 16.3247 4.26645 15.4497 3.93312ZM12.8997 8.59979L9.31634 12.1831C9.19134 12.3081 9.03301 12.3665 8.87467 12.3665C8.71634 12.3665 8.55801 12.3081 8.43301 12.1831L7.09967 10.8331C6.85801 10.5915 6.85801 10.1915 7.09967 9.94979C7.34134 9.70812 7.74134 9.70812 7.98301 9.94979L8.88301 10.8498L12.0247 7.70812C12.2663 7.46645 12.6663 7.46645 12.908 7.70812C13.1497 7.94979 13.1497 8.35812 12.8997 8.59979Z"
                                    fill="#31364E"
                                  />
                                </svg>
                                SSL Secured
                              </span>
                            </h2>
                            {showPaymentOptions && (
                              <PayWithNewCheckout
                                formikProps={formikProps}
                                otherPaymentOptions={otherPaymentOptions}
                                isBundlePaypalAvailable={
                                  otherPaymentOptions &&
                                  otherPaymentOptions.indexOf('Paypal') > -1
                                }
                                isBundleSelected={
                                  otherPaymentOptions &&
                                  otherPaymentOptions.indexOf('Paypal') > -1
                                }
                              />
                            )}
                          </>
                        )}
                        {formikProps.values.paymentMode ===
                          PAYMENT_MODES.STRIPE_PAYMENT_MODE &&
                          isPaymentRequired && (
                            <div
                              className="order__card__payment-method"
                              data-method="card"
                            >
                              {isStripeIntentPayment && (
                                <PaymentElement
                                  options={paymentElementOptions}
                                />
                              )}
                              {!isStripeIntentPayment && (
                                <>
                                  {!cardLast4Digit && (
                                    <div className="card-element">
                                      <CardElement options={createOptions} />
                                    </div>
                                  )}

                                  {cardLast4Digit && !isChangingCard && (
                                    <>
                                      <div className="bank-card-info">
                                        <div className="col-12 col-lg-6 pb-3 px-2">
                                          <div className="form-item required">
                                            <input
                                              id="card-number"
                                              type="text"
                                              value={`**** **** **** ${cardLast4Digit}`}
                                              placeholder="Card Number"
                                            />
                                          </div>
                                        </div>

                                        <div className="col-12 col-lg-3 pb-3 px-2">
                                          <div className="form-item required">
                                            <input
                                              id="mm-yy"
                                              type="text"
                                              placeholder="MM/YY"
                                              value={`**/**`}
                                            />
                                          </div>
                                        </div>
                                        <div className="col-12 col-lg-3 pb-3 px-2">
                                          <div className="form-item required">
                                            <input
                                              id="cvc"
                                              type="text"
                                              placeholder="CVC"
                                              value={`****`}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="change-cc-detail-link">
                                        <a
                                          href="#"
                                          onClick={toggleCardChangeDetail}
                                        >
                                          Would you like to use a different
                                          credit card?
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
                                        <a
                                          href="#"
                                          onClick={toggleCardChangeDetail}
                                        >
                                          Cancel
                                        </a>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        {formikProps.values.paymentMode ===
                          PAYMENT_MODES.PAYPAL_PAYMENT_MODE &&
                          isPaymentRequired && (
                            <div
                              className="order__card__payment-method paypal-info !tw-w-[150px]"
                              data-method="paypal"
                            >
                              <div className="paypal-info__sign-in tw-relative tw-z-0">
                                <PayPalScriptProvider
                                  options={{
                                    clientId:
                                      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                                    debug: true,
                                    currency: 'USD',
                                    intent: 'capture',
                                    components: 'buttons',
                                  }}
                                >
                                  <PayPalButtons
                                    style={{
                                      layout: 'horizontal',
                                      color: 'blue',
                                      shape: 'pill',
                                      height: 40,
                                      tagline: false,
                                      label: 'pay',
                                    }}
                                    fundingSource="paypal"
                                    forceReRender={[formikProps.values]}
                                    disabled={
                                      !(
                                        formikProps.isValid && formikProps.dirty
                                      )
                                    }
                                    createOrder={async (data, actions) => {
                                      return await createPaypalOrder(
                                        formikProps.values,
                                      );
                                    }}
                                    onApprove={handlePaypalPayment}
                                  />
                                </PayPalScriptProvider>
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
                        <div className="trust-score">
                          <div className="first-row">
                            Excellent
                            <img
                              src="/img/Trustpilo_stars-5.png"
                              alt="Trust Pilot"
                            />
                            <img
                              src="/img/TrustPilot-logo2x.webp"
                              alt="Trust Pilot"
                              width="90"
                            />
                          </div>
                          <div className="second-row">
                            TrustScore <strong>4.7</strong>
                          </div>
                        </div>
                      </div>

                      <div className="section-box features-desktop">
                        <div className="section__body">
                          <div className="features">
                            <div className="feature__box">
                              <div className="feature__title">
                                <img
                                  src="/img/inner-peace-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Evidence-Based Practice
                              </div>
                              <div className="feature__content">
                                Scientifically proven to reduce stress, anxiety,
                                and improve sleep through hundreds of scientific
                                studies.
                              </div>
                            </div>

                            <div className="feature__box">
                              <div className="feature__title">
                                <img
                                  src="/img/calm-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Authentic Meditation Practice
                              </div>
                              <div className="feature__content">
                                Drawing from Vedic principles of meditation, SKY
                                offers an authentic and deeply profound
                                experience, effortlessly allowing anyone to
                                connect with the depth of their being.
                              </div>
                            </div>

                            <div className="feature__box">
                              <div className="feature__title">
                                <img
                                  src="/img/spirituality-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Certified SKY Instructors
                              </div>
                              <div className="feature__content">
                                Learn from the best! Our SKY instructors are
                                certified and go through over 500 hours of
                                training to provide you with an interactive and
                                enriching learning experience.
                              </div>
                            </div>

                            <div className="feature__box">
                              <div className="feature__title">
                                <img
                                  src="/img/experience-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Millions of Lives Touched
                              </div>
                              <div className="feature__content">
                                Join a community of over 800 million people
                                whose lives have been positively transformed
                                through SKY Breath Meditation and other events.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-5">
                      <div className="checkout-sidebar">
                        <CostDetailsCardNewCheckout
                          workshop={workshop}
                          userSubscriptions={userSubscriptions}
                          formikProps={formikProps}
                          fee={fee}
                          delfee={delfee}
                          showCouponCodeField={showCouponCodeField}
                          hasGroupedAddOnProducts={hasGroupedAddOnProducts}
                          openSubscriptionPaywallPage={
                            openSubscriptionPaywallPage
                          }
                          isComboDetailAvailable={isComboDetailAvailable}
                          values={values}
                          onComboDetailChange={handleComboDetailChange}
                          paymentOptionChange={handlePaymentOptionChange}
                          discount={discountResponse}
                          onAccommodationChange={handleAccommodationChange}
                          subtotal={subtotal}
                          discountAmount={discountAmount}
                          finalPrice={finalPrice}
                        />

                        <div className="room-board-pricing">
                          <div className="total">
                            <div className="label">Total:</div>
                            <div className="value">
                              {discountResponse && delfee && (
                                <s>${delfee.toFixed(2)}</s>
                              )}{' '}
                              ${finalPrice.toFixed(2) || '0'.toFixed(2)}
                              {discountAmount > 0 && (
                                <span className="discount-amount">
                                  (You save ${discountAmount.toFixed(2)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="section-box checkout-details">
                          <h2 className="section__title">Details:</h2>
                          <div className="section__body">
                            <div className="detail-item row">
                              <div className="label col-5">
                                <svg
                                  className="detailsIcon icon-calendar"
                                  viewBox="0 0 34 32"
                                >
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="2.4"
                                    d="M29.556 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333c0-7.36 5.973-13.333 13.333-13.333s13.333 5.973 13.333 13.333z"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="2.4"
                                    d="M21.168 20.24l-4.133-2.467c-0.72-0.427-1.307-1.453-1.307-2.293v-5.467"
                                  ></path>
                                </svg>{' '}
                                Date:
                              </div>
                              <div className="value col-7">
                                {dayjs
                                  .utc(eventStartDate)
                                  .isSame(dayjs.utc(eventEndDate), 'month') &&
                                  `${dayjs
                                    .utc(eventStartDate)
                                    .format('MMMM DD')}-${dayjs
                                    .utc(eventEndDate)
                                    .format('DD, YYYY')}`}

                                {!dayjs
                                  .utc(eventStartDate)
                                  .isSame(dayjs.utc(eventEndDate), 'month') &&
                                  `${dayjs
                                    .utc(eventStartDate)
                                    .format('MMM DD')}-${dayjs
                                    .utc(eventEndDate)
                                    .format('MMM DD, YYYY')}`}
                              </div>
                            </div>
                            <div className="detail-item row">
                              <div className="label col-5">
                                <svg
                                  className="detailsIcon icon-calendar"
                                  viewBox="0 0 34 32"
                                >
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="10"
                                    strokeWidth="2.4"
                                    d="M10.889 2.667v4"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="10"
                                    strokeWidth="2.4"
                                    d="M21.555 2.667v4"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="10"
                                    strokeWidth="2.4"
                                    d="M4.889 12.12h22.667"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="10"
                                    strokeWidth="2.4"
                                    d="M28.222 11.333v11.333c0 4-2 6.667-6.667 6.667h-10.667c-4.667 0-6.667-2.667-6.667-6.667v-11.333c0-4 2-6.667 6.667-6.667h10.667c4.667 0 6.667 2.667 6.667 6.667z"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="3.2"
                                    d="M21.148 18.267h0.012"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="3.2"
                                    d="M21.148 22.267h0.012"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="3.2"
                                    d="M16.216 18.267h0.012"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="3.2"
                                    d="M16.216 22.267h0.012"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="3.2"
                                    d="M11.281 18.267h0.012"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="3.2"
                                    d="M11.281 22.267h0.012"
                                  ></path>
                                </svg>{' '}
                                Timing:
                              </div>
                              <div className="value col-7">
                                {timings &&
                                  timings.map((time) => {
                                    return (
                                      <div key={time.startDate}>
                                        {dayjs.utc(time.startDate).format('dd')}
                                        : {tConvert(time.startTime)}-
                                        {tConvert(time.endTime)}{' '}
                                        {ABBRS[time.timeZone]}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                            <div className="detail-item row">
                              <div className="label col-5">
                                <svg
                                  className="detailsIcon icon-calendar"
                                  viewBox="0 0 34 32"
                                >
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="2.4"
                                    d="M16.435 14.493c-0.133-0.013-0.293-0.013-0.44 0-3.173-0.107-5.693-2.707-5.693-5.907 0-3.267 2.64-5.92 5.92-5.92 3.267 0 5.92 2.653 5.92 5.92-0.013 3.2-2.533 5.8-5.707 5.907z"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeMiterlimit="4"
                                    strokeWidth="2.4"
                                    d="M9.768 19.413c-3.227 2.16-3.227 5.68 0 7.827 3.667 2.453 9.68 2.453 13.347 0 3.227-2.16 3.227-5.68 0-7.827-3.653-2.44-9.667-2.44-13.347 0z"
                                  ></path>
                                </svg>{' '}
                                Instructor(s):
                              </div>
                              <div className="value col-7">
                                {primaryTeacherName && primaryTeacherName}
                                <br />
                                {coTeacher1Name && coTeacher1Name}
                                <br />
                                {coTeacher2Name && coTeacher2Name}
                              </div>
                            </div>
                            <div className="detail-item row">
                              <div className="label col-5">
                                <svg
                                  className="detailsIcon icon-calendar"
                                  viewBox="0 0 34 32"
                                >
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="miter"
                                    strokeLinecap="butt"
                                    strokeMiterlimit="4"
                                    strokeWidth="2.4"
                                    d="M16.223 17.907c2.297 0 4.16-1.863 4.16-4.16s-1.863-4.16-4.16-4.16c-2.298 0-4.16 1.863-4.16 4.16s1.863 4.16 4.16 4.16z"
                                  ></path>
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="miter"
                                    strokeLinecap="butt"
                                    strokeMiterlimit="4"
                                    strokeWidth="2.4"
                                    d="M5.049 11.32c2.627-11.547 19.733-11.533 22.347 0.013 1.533 6.773-2.68 12.507-6.373 16.053-2.68 2.587-6.92 2.587-9.613 0-3.68-3.547-7.893-9.293-6.36-16.067z"
                                  ></path>
                                </svg>{' '}
                                Location:
                              </div>
                              <div className="value col-7">
                                {mode === COURSE_MODES.ONLINE.value
                                  ? mode
                                  : (mode === COURSE_MODES.IN_PERSON.value ||
                                      mode ===
                                        COURSE_MODES.DESTINATION_RETREATS
                                          .value) && (
                                      <>
                                        {!workshop.isLocationEmpty && (
                                          <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${
                                              workshop.locationStreet || ''
                                            }, ${workshop.locationCity} ${
                                              workshop.locationProvince
                                            } ${workshop.locationPostalCode} ${
                                              workshop.locationCountry
                                            }`}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            {workshop.locationStreet &&
                                              `${workshop.locationStreet}, `}
                                            {workshop.locationCity || ''}
                                            {', '}
                                            {workshop.locationProvince ||
                                              ''}{' '}
                                            {workshop.locationPostalCode || ''}
                                          </a>
                                        )}
                                        {workshop.isLocationEmpty && (
                                          <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${
                                              workshop.streetAddress1 || ''
                                            },${
                                              workshop.streetAddress2 || ''
                                            } ${workshop.city} ${
                                              workshop.state
                                            } ${workshop.zip} ${
                                              workshop.country
                                            }`}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            {workshop.streetAddress1 &&
                                              `${workshop.streetAddress1}, `}
                                            {workshop.streetAddress2 &&
                                              `${workshop.streetAddress2}, `}
                                            {workshop.city || ''}
                                            {', '}
                                            {workshop.state || ''}{' '}
                                            {workshop.zip || ''}
                                          </a>
                                        )}
                                      </>
                                    )}
                              </div>
                            </div>
                            <div className="detail-item row">
                              <div className="label col-5">
                                <svg
                                  className="detailsIcon icon-calendar"
                                  viewBox="0 0 34 32"
                                >
                                  <path
                                    fill="none"
                                    stroke="#9598a6"
                                    strokeLinejoin="miter"
                                    strokeLinecap="butt"
                                    strokeMiterlimit="10"
                                    strokeWidth="2.4"
                                    d="M29.516 24.44c0 0.48-0.107 0.973-0.333 1.453s-0.52 0.933-0.907 1.36c-0.653 0.72-1.373 1.24-2.187 1.573-0.8 0.333-1.667 0.507-2.6 0.507-1.36 0-2.813-0.32-4.347-0.973s-3.067-1.533-4.587-2.64c-1.533-1.12-2.987-2.36-4.373-3.733-1.373-1.387-2.613-2.84-3.72-4.36-1.093-1.52-1.973-3.040-2.613-4.547-0.64-1.52-0.96-2.973-0.96-4.36 0-0.907 0.16-1.773 0.48-2.573 0.32-0.813 0.827-1.56 1.533-2.227 0.853-0.84 1.787-1.253 2.773-1.253 0.373 0 0.747 0.080 1.080 0.24 0.347 0.16 0.653 0.4 0.893 0.747l3.093 4.36c0.24 0.333 0.413 0.64 0.533 0.933 0.12 0.28 0.187 0.56 0.187 0.813 0 0.32-0.093 0.64-0.28 0.947-0.173 0.307-0.427 0.627-0.747 0.947l-1.013 1.053c-0.147 0.147-0.213 0.32-0.213 0.533 0 0.107 0.013 0.2 0.040 0.307 0.040 0.107 0.080 0.187 0.107 0.267 0.24 0.44 0.653 1.013 1.24 1.707 0.6 0.693 1.24 1.4 1.933 2.107 0.72 0.707 1.413 1.36 2.12 1.96 0.693 0.587 1.267 0.987 1.72 1.227 0.067 0.027 0.147 0.067 0.24 0.107 0.107 0.040 0.213 0.053 0.333 0.053 0.227 0 0.4-0.080 0.547-0.227l1.013-1c0.333-0.333 0.653-0.587 0.96-0.747 0.307-0.187 0.613-0.28 0.947-0.28 0.253 0 0.52 0.053 0.813 0.173s0.6 0.293 0.933 0.52l4.413 3.133c0.347 0.24 0.587 0.52 0.733 0.853 0.133 0.333 0.213 0.667 0.213 1.040z"
                                  ></path>
                                </svg>{' '}
                                Contact details:
                              </div>
                              <div className="value col-7">
                                <span>{contactName}</span>
                                <br />
                                <a href={`tel:${phone1}`}>{phone1}</a>
                                <br />
                                {phone2 && (
                                  <a href={`tel:${phone2}`}>{phone2}</a>
                                )}
                                <a href={`mailto:${contactEmail}`}>
                                  {contactEmail}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="section-box confirm-submit">
                          <div className="section__body">
                            {validateDiscount && (
                              <div className="form-item required">
                                <DiscountInputNew
                                  formikProps={formikProps}
                                  placeholder="Discount"
                                  formikKey="couponCode"
                                  product={productId}
                                  applyDiscount={applyDiscount}
                                  addOnProducts={addOnProducts}
                                  containerClass={`tickets-modal__input-label tickets-modal__input-label--top`}
                                  label="Discount Code"
                                ></DiscountInputNew>
                              </div>
                            )}
                            <ScheduleAgreementForm
                              formikProps={formikProps}
                              complianceQuestionnaire={complianceQuestionnaire}
                              isCorporateEvent={false}
                              questionnaireArray={questionnaireArray}
                              screen="DESKTOP"
                            />

                            <div className="note">
                              For any health related questions, please contact
                              us at{' '}
                              <a href="mailto:healthinfo@us.artofliving.org">
                                healthinfo@us.artofliving.org
                              </a>
                            </div>
                            <div className="form-item submit-item">
                              <button
                                className="submit-btn"
                                id="pay-button"
                                type="button"
                                disabled={
                                  loading ||
                                  formikProps.values.priceType === 'premium' ||
                                  (formikProps.values.paymentMode ===
                                    PAYMENT_MODES.PAYPAL_PAYMENT_MODE &&
                                    isPaymentRequired)
                                }
                                form="my-form"
                                onClick={handleFormSubmit}
                              >
                                {loading ? 'Processing...' : 'Confirm and Pay'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="section-box features-mobile">
                        <div className="section__body">
                          <div className="features row mx-n2">
                            <div className="col-12 col-lg-6 px-2">
                              <div className="feature__box">
                                <div className="feature__title">
                                  <img
                                    src="/img/inner-peace-icon.svg"
                                    width="24"
                                    height="24"
                                    alt=""
                                  />
                                  Evidence-Based Practice
                                </div>
                                <div className="feature__content">
                                  Scientifically proven to reduce stress,
                                  anxiety, and improve sleep through hundreds of
                                  scientific studies.
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-lg-6 px-2">
                              <div className="feature__box">
                                <div className="feature__title">
                                  <img
                                    src="/img/calm-icon.svg"
                                    width="24"
                                    height="24"
                                    alt=""
                                  />
                                  Authentic Meditation Practice
                                </div>
                                <div className="feature__content">
                                  Drawing from Vedic principles of meditation,
                                  SKY offers an authentic and deeply profound
                                  experience, effortlessly allowing anyone to
                                  connect with the depth of their being.
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-lg-6 px-2">
                              <div className="feature__box">
                                <div className="feature__title">
                                  <img
                                    src="/img/spirituality-icon.svg"
                                    width="24"
                                    height="24"
                                    alt=""
                                  />
                                  Certified SKY Instructors
                                </div>
                                <div className="feature__content">
                                  Learn from the best! Our SKY instructors are
                                  certified and go through over 500 hours of
                                  training to provide you with an interactive
                                  and enriching learning experience.
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-lg-6 px-2">
                              <div className="feature__box">
                                <div className="feature__title">
                                  <img
                                    src="/img/experience-icon.svg"
                                    width="24"
                                    height="24"
                                    alt=""
                                  />
                                  Millions of Lives Touched
                                </div>
                                <div className="feature__content">
                                  Join a community of over 800 million people
                                  whose lives have been positively transformed
                                  through SKY Breath Meditation and other
                                  events.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </main>
            </>
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
        />
      )}
    </>
  );
};
