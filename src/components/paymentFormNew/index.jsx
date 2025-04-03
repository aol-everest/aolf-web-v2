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
import { pushRouteWithUTMQuery } from '@service';
import {
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
import React from 'react';
import {
  SSLSecuredIcon,
  TrustScore,
  FeaturesList,
  PayPalSection,
  StripeCardSection,
  DetailsSection,
  AddonProduct,
} from './components';

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
  const [currentFormValues, setCurrentFormValues] = useState({});
  const [isProgramQuestionnaireSubmitted, setIsProgramQuestionnaireSubmitted] =
    useState(false);
  const router = useRouter();
  const { signOut } = passwordLess;

  useEffect(() => {
    if (isProgramQuestionnaireSubmitted) {
      completeEnrollmentAction(currentFormValues);
    }
  }, [isProgramQuestionnaireSubmitted]);

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
    values: currentFormValues,
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
    setIsProgramQuestionnaireSubmitted(true);
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
        message: 'Please select a payment method',
      });
      return false;
    }

    if (paymentMode === PAYMENT_MODES.STRIPE_PAYMENT_MODE) {
      if (!stripe || !elements) {
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          message: 'Payment system is not ready. Please try again.',
        });
        return false;
      }
    }

    return true;
  };

  const handleFormSubmit = async () => {
    if (formRef.current) {
      const { values, validateForm } = formRef.current;

      // Touch all fields dynamically from form values
      const fields = Object.keys(values);

      // Set all fields as touched
      await Promise.all(
        fields.map((field) =>
          formRef.current.setFieldTouched(field, true, false),
        ),
      );

      const errors = await validateForm(values);

      if (Object.keys(errors).length > 0) {
        const errorFields = Object.keys(errors);
        console.log('errorFields', errorFields);
        showAlert(ALERT_TYPES.INLINE_ERROR_ALERT, {
          children: (
            <div>
              <p className="tw-text-sm tw-font-medium tw-mb-1">
                Please fix the following errors:
              </p>
              <ul className="tw-space-y-0.5">
                {errorFields.map((field, index) => (
                  <li
                    key={index}
                    className="tw-text-xs tw-text-gray-600 tw-flex tw-items-start"
                  >
                    <span className="tw-text-red-400 tw-mr-1.5 tw-mt-0.5">
                      •
                    </span>
                    {errors[field]}
                  </li>
                ))}
              </ul>
            </div>
          ),
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
      if (programQuestionnaire.length > 0 && !isProgramQuestionnaireSubmitted) {
        setShowProgramQuestionnaireForm(true);
      } else {
        await completeEnrollmentAction(values);
      }
    } catch (error) {
      console.error('Pre-enrollment validation failed:', error);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        message: 'Failed to process enrollment.',
        description: error?.message || 'Please try again.',
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
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        message: 'Payment failed.',
        description: error?.message || 'Please try again.',
      });
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
        message: 'Failed to update product selection.',
        description: error?.message || 'Please try again.',
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
      ? Yup.object().nullable().required('Expense Type is required!')
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

    // Update current form values for price calculation
    setCurrentFormValues(values);
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
          CME: cmeAddOn ? true : false,
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
          shouldTokenize:
            !isLoggedUser || isChangingCard || paymentMethod.type !== 'card',
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

                            {cmeAddOn && (
                              <div className="form-inputs checkout-fields">
                                <h2 className="tw-w-full tw-text-2xl tw-mb-4 tw-line-height-10 tw-mt-3">
                                  Addon Information
                                </h2>
                                <AddonProduct
                                  addOnProducts={addOnProducts}
                                  formikProps={formikProps}
                                  cmeAddOn={cmeAddOn}
                                />
                              </div>
                            )}
                          </form>
                        </div>
                      </div>
                      <div className="section-box">
                        {isPaymentRequired && (
                          <>
                            <h2 className="section__title d-flex">
                              Pay with
                              <SSLSecuredIcon />
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
                            <StripeCardSection
                              isStripeIntentPayment={isStripeIntentPayment}
                              paymentElementOptions={paymentElementOptions}
                              cardLast4Digit={cardLast4Digit}
                              isChangingCard={isChangingCard}
                              toggleCardChangeDetail={toggleCardChangeDetail}
                              createOptions={createOptions}
                            />
                          )}
                        {formikProps.values.paymentMode ===
                          PAYMENT_MODES.PAYPAL_PAYMENT_MODE &&
                          isPaymentRequired && (
                            <PayPalSection
                              formikProps={formikProps}
                              createPaypalOrder={createPaypalOrder}
                              handlePaypalPayment={handlePaypalPayment}
                            />
                          )}
                        <TrustScore />
                      </div>

                      <div className="section-box features-desktop">
                        <div className="section__body">
                          <FeaturesList />
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
                                <s className="tw-text-gray-400 tw-mr-1">
                                  ${delfee.toFixed(2)}
                                </s>
                              )}{' '}
                              ${finalPrice.toFixed(2)}
                              <div className="tw-text-sm tw-font-normal">
                                {discountAmount > 0 && (
                                  <span className="discount-amount">
                                    (You save ${discountAmount.toFixed(2)} on
                                    course fee)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DetailsSection
                          mode={mode}
                          workshop={workshop}
                          eventStartDate={eventStartDate}
                          eventEndDate={eventEndDate}
                          timings={timings}
                          primaryTeacherName={primaryTeacherName}
                          coTeacher1Name={coTeacher1Name}
                          coTeacher2Name={coTeacher2Name}
                          contactName={contactName}
                          contactEmail={contactEmail}
                          phone1={phone1}
                          phone2={phone2}
                        />
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
                          <FeaturesList className="row mx-n2" />
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
