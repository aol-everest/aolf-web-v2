/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Loader } from '@components';
import {
  AgreementForm,
  BillingInfoForm,
  CourseDetailsCard,
  DiscountCodeInput,
  MobileBottomBar,
  MobileCourseDetails,
  MobileCourseOptions,
  PayWith,
  PostCostDetailsCard,
  PreCostDetailsCard,
  ProgramQuestionnaire,
  UserInfoForm,
} from '@components/checkout';
import { ScheduleInput } from '@components/scheduleInput';
import { SchedulePhoneInput } from '@components/schedulingPhoneInput';
import {
  ABBRS,
  ALERT_TYPES,
  COURSE_MODES,
  MODAL_TYPES,
  PAYMENT_MODES,
  PAYMENT_TYPES,
} from '@constants';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalModalContext,
} from '@contexts';
import { useQueryString } from '@hooks';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { pushRouteWithUTMQuery } from '@service';
import {
  CardElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  Auth,
  api,
  isEmpty,
  priceCalculation,
  phoneRegExp,
  tConvert,
} from '@utils';
import { filterAllowedParams, removeNull } from '@utils/utmParam';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { ScheduleDiscountInput } from '@components/scheduleDiscountInput';
import { ScheduleAgreementForm } from '@components/scheduleAgreementForm';
import { PayWithUpdated } from '@components/checkout/PayWithUpdated';
import { UserInfoFormNewCheckout } from '@components/checkout/UserInfoFormNewCheckout';

var advancedFormat = require('dayjs/plugin/advancedFormat');
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
}) => {
  const { showAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const stripe = useStripe();
  const elements = useElements();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [discount] = useQueryString('discountCode');
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
        page: 'checkout',
      },
    });
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
    isCCNotRequired,
    paymentMethod = {},
    locationProvince,
    locationStreet,
    locationCity,
    locationPostalCode,
    locationCountry,
    email: workshopEmail,
    eventStartDate,
    eventEndDate,
    phone1,
    phone2,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    productTypeId,
    mode,
    isGenericWorkshop,
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

  const isPaymentRequired = fee !== 0 ? true : !isCCNotRequired;

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

  const isUsableCreditAvailable = usableCredit && !isEmpty(usableCredit);

  let UpdatedFeeAfterCredits;
  if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === 'Quantity' &&
    usableCredit.availableCredit === 1
  ) {
    UpdatedFeeAfterCredits = 0;
  } else if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === 'Amount'
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
    formikProps.setFieldValue('comboDetailId', comboDetailProductSfid);
    handleCouseSelection(comboDetailProductSfid);
    const { isInstalmentAllowed, id } = workshop;
    if (isInstalmentAllowed && id === comboDetailProductSfid) {
      setShowCouponCodeField(true);
    } else {
      setShowCouponCodeField(false);
      formikProps.setFieldValue('paymentOption', PAYMENT_TYPES.FULL);
    }

    // Added logic to remove paypal option for bundle
    if (id !== comboDetailProductSfid) {
      const selectedBundle = availableBundles?.find(
        (bundle) => bundle.comboProductSfid === comboDetailProductSfid,
      );

      const isBundlePaypalAvailable = selectedBundle
        ? selectedBundle.otherPaymentOptionAvailable?.indexOf('Paypal') > -1
        : false;

      if (!isBundlePaypalAvailable) {
        formikProps.setFieldValue(
          'paymentMode',
          PAYMENT_MODES.STRIPE_PAYMENT_MODE,
        );
      }
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

  const toggleCouponCodeFieldAction = (e) => {
    if (e) e.preventDefault();
    setShowCouponCodeField((showCouponCodeField) => !showCouponCodeField);
  };

  const paypalBuyAcknowledgement = async (paypalData) => {
    setLoading(true);
    const {
      data,
      status,
      error: errorMessage,
      isError,
    } = await api.post({
      path: 'paypalBuyAcknowledgement',
      body: { orderID: paypalData.orderID },
    });

    setLoading(false);
    if (status === 400 || isError) {
      throw new Error(errorMessage);
    } else if (data) {
      enrollmentCompletionAction(data);
    }
    return true;
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email(),
    contactPhone: Yup.string()
      .required('Phone number required')
      .matches(phoneRegExp, 'Phone number is not valid'),
    contactAddress: Yup.string().required('Address is required'),
    contactCity: Yup.string().required('City is required'),
    contactState: Yup.string().required('State is required'),
    contactZip: Yup.string()
      .required('Zip is required!')
      //.matches(/^[0-9]+$/, { message: 'Zip is invalid' })
      .min(2, 'Zip is invalid')
      .max(10, 'Zip is invalid'),
    ppaAgreement: Yup.boolean()
      .label('Terms')
      .test(
        'is-true',
        'Please check the box in order to continue.',
        (value) => value === true,
      ),
    accommodation: isAccommodationRequired
      ? Yup.object().required('Room & Board is required!')
      : Yup.mixed().notRequired(),
    paymentMode: !isPaymentRequired
      ? Yup.mixed().notRequired()
      : Yup.string().required('Payment mode is required!'),
  });

  const paymentElementOptions = {
    layout: {
      type: 'accordion',
      defaultCollapsed: false,
      radios: true,
      spacedAccordionItems: false,
    },
    defaultValues: {
      billingDetails: {
        email: email || '',
        name: (first_name || '') + (last_name || ''),
        phone: personMobilePhone || '',
      },
    },
  };

  const formikOnChange = (values) => {
    if (!stripe || !elements || !isStripeIntentPayment) {
      return;
    }
    let finalPrice = fee;
    if (values.comboDetailId && values.comboDetailId !== workshop.id) {
      const selectedBundle = workshop.availableBundles.find(
        (b) => b.comboProductSfid === values.comboDetailId,
      );
      if (selectedBundle) {
        finalPrice = selectedBundle.comboUnitPrice;
      }
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
  return (
    <main class="checkout-aol">
      <Formik
        initialValues={{
          firstName: first_name || '',
          lastName: last_name || '',
          email: email || '',
          contactPhone: personMobilePhone || '',
          contactAddress: personMailingStreet || '',
          contactCity: personMailingCity || '',
          contactState: personMailingState || '',
          contactZip: personMailingPostalCode || '',
          couponCode: discount ? discount : '',
          questionnaire: questionnaire,
          ppaAgreement: false,
          paymentOption: PAYMENT_TYPES.FULL,
          paymentMode:
            otherPaymentOptions && otherPaymentOptions.indexOf('Paypal') >= 0
              ? ''
              : PAYMENT_MODES.STRIPE_PAYMENT_MODE,
          accommodation: null,
          priceType: 'regular',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          await preEnrollValidation(values);
        }}
      >
        {(formikProps) => {
          const { values, handleSubmit } = formikProps;
          formikOnChange(values);
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
            values.priceType === null || values.priceType === 'regular';
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
            isOfflineExpense = expenseAddOn.paymentMode === 'In Person';
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
            ? selectedBundle.otherPaymentOptionAvailable?.indexOf('Paypal') > -1
            : false;
          return (
            <section>
              <div class="container">
                <div class="row">
                  <div class="col-12 col-lg-7">
                    <div class="section--title">
                      <h1 class="page-title">{title}</h1>
                    </div>
                    <div class="section-box">
                      <h2 class="section__title">Account Details</h2>
                      <div class="section__body">
                        {isLoggedUser && (
                          <p className="details__content">
                            This is not your account?{' '}
                            <a href="#" className="link" onClick={logout}>
                              Logout
                            </a>
                          </p>
                        )}
                        {!isLoggedUser && (
                          <p>
                            Already have an Account?{' '}
                            <a href="#" className="link" onClick={login}>
                              Login
                            </a>
                          </p>
                        )}

                        <form id="my-form">
                          <div class="row pt-3 mx-n2">
                            <UserInfoFormNewCheckout
                              formikProps={formikProps}
                              isLoggedUser={isLoggedUser}
                            />
                          </div>
                        </form>
                      </div>
                    </div>
                    <div class="section-box">
                      <h2 class="section__title">Pay with</h2>
                      <div class="section__body">
                        {isPaymentRequired && (
                          <PayWithUpdated
                            formikProps={formikProps}
                            otherPaymentOptions={otherPaymentOptions}
                            isBundlePaypalAvailable={isBundlePaypalAvailable}
                            isBundleSelected={selectedBundle}
                          />
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
                                    onApprove={paypalBuyAcknowledgement}
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
                      </div>
                    </div>
                    <div class="section-box features-desktop">
                      <div class="section__body">
                        <div class="features row mx-n2">
                          <div class="col-12 col-lg-6 px-2">
                            <div class="feature__box">
                              <div class="feature__title">
                                <img
                                  src="/img/inner-peace-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Evidence-Based Practice
                              </div>
                              <div class="feature__content">
                                Scientifically proven to reduce stress, anxiety,
                                and improve sleep through hundreds of scientific
                                studies.
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6 px-2">
                            <div class="feature__box">
                              <div class="feature__title">
                                <img
                                  src="/img/calm-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Authentic Meditation Practice
                              </div>
                              <div class="feature__content">
                                Drawing from Vedic principles of meditation, SKY
                                offers an authentic and deeply profound
                                experience, effortlessly allowing anyone to
                                connect with the depth of their being.
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6 px-2">
                            <div class="feature__box">
                              <div class="feature__title">
                                <img
                                  src="/img/spirituality-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Certified SKY Instructors
                              </div>
                              <div class="feature__content">
                                Learn from the best! Our SKY instructors are
                                certified and go through over 500 hours of
                                training to provide you with an interactive and
                                enriching learning experience.
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6 px-2">
                            <div class="feature__box">
                              <div class="feature__title">
                                <img
                                  src="/img/experience-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Millions of Lives Touched
                              </div>
                              <div class="feature__content">
                                Join a community of over 500 million people
                                whose lives have been positively transformed
                                through SKY Breath Meditation and other events.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-lg-5">
                    <div class="checkout-sidebar">
                      <div class="offer-box">
                        <h2 class="title">
                          <span class="icon-wrap">
                            <img
                              src="/img/stars-02.svg"
                              width="20"
                              height="20"
                              alt=""
                            />
                          </span>
                          Limited time offer:
                        </h2>
                        <div class="form-item radio">
                          <input type="radio" id="regular" name="offer" />
                          <label for="regular">
                            <span class="radio-text">Regular rate</span>
                            <span class="radio-value">
                              <s>$550</s>$450
                            </span>
                          </label>
                        </div>
                        <div class="form-item radio">
                          <input type="radio" id="premium" name="offer" />
                          <label for="premium">
                            <span class="radio-text">Premium rate</span>
                            <span class="radio-value">
                              <s>$550</s>$50
                            </span>
                          </label>
                        </div>
                        <div class="note">
                          Note: $295 discount when you choose the special offer.
                          Separately, course fees would be $790
                        </div>
                      </div>
                      <div class="room-board-pricing">
                        <div class="form-item">
                          <label for="phone">Room & Board</label>
                          <select placeholder="Select room & board">
                            <option>Dorm Style - Women $350</option>
                            <option>Dorm Style - Men $350</option>
                            <option>Self Arranged Accomodation $250</option>
                          </select>
                        </div>
                        <div class="total">
                          <div class="label">Total:</div>
                          <div class="value">$450</div>
                        </div>
                      </div>
                      <div class="section-box checkout-details">
                        <h2 class="section__title">Details:</h2>
                        <div class="section__body">
                          <div class="detail-item row">
                            <div class="label col-5">
                              {/* <svg class="detailsIcon icon-calendar">
                          <use xlink:href="#icon-clock"></use>
                        </svg>{' '} */}
                              Date:
                            </div>
                            <div class="value col-7">
                              {dayjs
                                .utc(eventStartDate)
                                .isSame(dayjs.utc(eventEndDate), 'month') &&
                                `${dayjs
                                  .utc(eventStartDate)
                                  .format('MMMM DD')}-${dayjs
                                  .utc(eventEndDate)
                                  .format('DD, YYYY')}`}
                            </div>
                          </div>
                          <div class="detail-item row">
                            <div class="label col-5">
                              {/* <svg class="detailsIcon icon-calendar">
                          <use xlink:href="#icon-calendar"></use>
                        </svg>{' '} */}
                              Timing:
                            </div>
                            <div class="value col-7">
                              {timings &&
                                timings.map((time) => {
                                  return (
                                    <div key={time.startDate}>
                                      {dayjs.utc(time.startDate).format('dd')}:{' '}
                                      {tConvert(time.startTime)}-
                                      {tConvert(time.endTime)}{' '}
                                      {ABBRS[time.timeZone]}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                          <div class="detail-item row">
                            <div class="label col-5">
                              {/* <svg class="detailsIcon icon-calendar">
                          <use xlink:href="#icon-profile"></use>
                        </svg>{' '} */}
                              Instructor(s):
                            </div>
                            <div class="value col-7">
                              {primaryTeacherName && primaryTeacherName}
                              <br />
                              {coTeacher1Name && coTeacher1Name}
                              {coTeacher2Name && coTeacher2Name}
                            </div>
                          </div>
                          <div class="detail-item row">
                            <div class="label col-5">
                              {/* <svg class="detailsIcon icon-calendar">
                          <use xlink:href="#icon-location"></use>
                        </svg>{' '} */}
                              Location:
                            </div>
                            <div class="value col-7">
                              {(mode === COURSE_MODES.IN_PERSON.name ||
                                mode ===
                                  COURSE_MODES.DESTINATION_RETREATS.name) && (
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
                                        workshop.locationStreet}
                                      {workshop.locationCity || ''}
                                      {', '}
                                      {workshop.locationProvince || ''}{' '}
                                      {workshop.locationPostalCode || ''}
                                    </a>
                                  )}
                                  {workshop.isLocationEmpty && (
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${
                                        workshop.streetAddress1 || ''
                                      },${workshop.streetAddress2 || ''} ${
                                        workshop.city
                                      } ${workshop.state} ${workshop.zip} ${
                                        workshop.country
                                      }`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {workshop.streetAddress1 &&
                                        workshop.streetAddress1}
                                      {workshop.streetAddress2 &&
                                        workshop.streetAddress2}
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
                          <div class="detail-item row">
                            <div class="label col-5">
                              {/* <svg class="detailsIcon icon-calendar">
                          <use xlink:href="#icon-call"></use>
                        </svg>{' '} */}
                              Contact details:
                            </div>
                            <div class="value col-7">
                              <a href={`tel:${phone1}`}>{phone1}</a>
                              <br />
                              {phone2 && <a href={`tel:${phone2}`}>{phone2}</a>}
                              <a href={`mailto:${email}`}>{workshopEmail}</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="section-box confirm-submit">
                        <div class="section__body">
                          <div class="form-item required">
                            <label for="discount">
                              Do you have a discount code?
                            </label>
                            <input
                              type="text"
                              name="discount"
                              placeholder="Add code"
                            />
                          </div>
                          <AgreementForm
                            formikProps={formikProps}
                            complianceQuestionnaire={complianceQuestionnaire}
                            isCorporateEvent={isCorporateEvent}
                            screen="DESKTOP"
                          />
                          <div class="note">
                            For any health related questions, please contact us
                            at{' '}
                            <a href="mailto:healthinfo@us.artofliving.org">
                              healthinfo@us.artofliving.org
                            </a>
                          </div>
                          <div class="form-item submit-item">
                            <input
                              type="submit"
                              class="submit-btn"
                              value="Confirm and pay"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="section-box features-mobile">
                      <div class="section__body">
                        <div class="features row mx-n2">
                          <div class="col-12 col-lg-6 px-2">
                            <div class="feature__box">
                              <div class="feature__title">
                                <img
                                  src="./img/inner-peace-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Evidence-Based Practice
                              </div>
                              <div class="feature__content">
                                Scientifically proven to reduce stress, anxiety,
                                and improve sleep through hundreds of scientific
                                studies.
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6 px-2">
                            <div class="feature__box">
                              <div class="feature__title">
                                <img
                                  src="./img/calm-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Authentic Meditation Practice
                              </div>
                              <div class="feature__content">
                                Drawing from Vedic principles of meditation, SKY
                                offers an authentic and deeply profound
                                experience, effortlessly allowing anyone to
                                connect with the depth of their being.
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6 px-2">
                            <div class="feature__box">
                              <div class="feature__title">
                                <img
                                  src="./img/spirituality-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Certified SKY Instructors
                              </div>
                              <div class="feature__content">
                                Learn from the best! Our SKY instructors are
                                certified and go through over 500 hours of
                                training to provide you with an interactive and
                                enriching learning experience.
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6 px-2">
                            <div class="feature__box">
                              <div class="feature__title">
                                <img
                                  src="./img/experience-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Millions of Lives Touched
                              </div>
                              <div class="feature__content">
                                Join a community of over 500 million people
                                whose lives have been positively transformed
                                through SKY Breath Meditation and other events.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }}
      </Formik>

      <div
        class="location-search modal fade bd-example-modal-lg"
        id="exampleModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>
                On which location would you prefer to schedule your courses?
              </p>
              <br></br>
              <div class="location-search-field">
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  placeholder="Filter by zip code or city"
                />
                <select name="miles" id="miles">
                  <option value="25miles">25 miles (40km)</option>
                  <option value="35miles">35 miles (50km)</option>
                  <option value="45miles">45 miles (60km)</option>
                  <option value="55miles">55 miles (70km)</option>
                </select>
              </div>

              <button
                type="button"
                data-dismiss="modal"
                class="btn btn-primary find-courses"
              >
                Find Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
