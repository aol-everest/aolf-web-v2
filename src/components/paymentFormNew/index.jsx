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
  UserInfoFormNewCheckout,
} from '@components/checkout';
import dayjs from 'dayjs';
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
import { DiscountInputNew } from '@components/discountInputNew';
import { ScheduleAgreementForm } from '@components/scheduleAgreementForm';
import { useRef } from 'react';
import { PayWithNewCheckout } from '@components/checkout/PayWithNewCheckout';
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
  const formRef = useRef();
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

  const stripeConfirmPayment = async (values) => {
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }

    if (loading) {
      return null;
    }
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
      email,
    } = values;

    const complianceQuestionnaire = questionnaire.reduce(
      (res, current) => ({
        ...res,
        [current.key]: current.value ? 'Yes' : 'No',
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
            productType: 'workshop',
            productSfId: productId,
            AddOnProductIds: AddOnProductIds,
          }
        : {
            productType: 'bundle',
            productSfId: values.comboDetailId,
            childProduct: {
              productType: 'workshop',
              productSfId: productId,
              AddOnProductIds: AddOnProductIds,
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
          complianceQuestionnaire,
          programQuestionnaireResult,
          isInstalmentOpted: false,
          isStripeIntentPayment: true,
        },
        utm: filterAllowedParams(router.query),
      };

      if (!isPaymentRequired) {
        payLoad.shoppingRequest.isStripeIntentPayment = false;
      }
      if (!isLoggedUser) {
        payLoad = {
          ...payLoad,
          user: {
            lastName: lastName,
            firstName: firstName,
            email: email,
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

      //token.saveCardForFuture = true;
      const {
        stripeIntentObj,
        status,
        data,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'createAndPayOrder',
        body: payLoad,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      if (data && data.totalOrderAmount > 0) {
        const returnUrl = enrollmentCompletionLink(data);
        const result = await stripe.confirmPayment({
          //`Elements` instance that was used to create the Payment Element
          elements,
          clientSecret: stripeIntentObj.client_secret,
          confirmParams: {
            return_url: returnUrl,
          },
        });

        if (result.error) {
          // Show error to your customer (for example, payment details incomplete)
          throw new Error(result.error.message);
        }
      }
      if (data) {
        enrollmentCompletionAction(data);
      }
      setLoading(false);
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

  const createPaypalOrder = async (values) => {
    if (loading) {
      return null;
    }
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
      paymentOption,
      paymentMode,
      accommodation,
      email,
    } = values;

    if (paymentMode !== PAYMENT_MODES.PAYPAL_PAYMENT_MODE) {
      return null;
    }

    const complianceQuestionnaire = questionnaire.reduce(
      (res, current) => ({
        ...res,
        [current.key]: current.value ? 'Yes' : 'No',
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
            productType: 'workshop',
            productSfId: productId,
            AddOnProductIds: AddOnProductIds,
          }
        : {
            productType: 'bundle',
            productSfId: values.comboDetailId,
            childProduct: {
              productType: 'workshop',
              productSfId: productId,
              AddOnProductIds: AddOnProductIds,
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
          complianceQuestionnaire,
          programQuestionnaireResult,
          isInstalmentOpted: paymentOption === PAYMENT_TYPES.LATER,
          isPaypalPayment: true,
        },
        utm: filterAllowedParams(router.query),
      };

      if (!isLoggedUser) {
        payLoad = {
          ...payLoad,
          user: {
            lastName: lastName,
            firstName: firstName,
            email: email,
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

      //token.saveCardForFuture = true;
      const {
        paypalObj,
        status,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'createAndPayOrder',
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
      availableTimings,
      isGenericWorkshop,
      addOnProducts,
      paymentMethod = {},
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
      email,
    } = values;

    if (
      paymentMode !== PAYMENT_MODES.STRIPE_PAYMENT_MODE &&
      isPaymentRequired
    ) {
      return null;
    }

    if (isStripeIntentPayment) {
      await stripeConfirmPayment(values);
      return null;
    }

    const complianceQuestionnaire = questionnaire.reduce(
      (res, current) => ({
        ...res,
        [current.key]: current.value ? 'Yes' : 'No',
      }),
      {},
    );

    try {
      setLoading(true);

      let tokenizeCC = null;
      if (
        isPaymentRequired &&
        (paymentMethod.type !== 'card' || isChangingCard || !isLoggedUser)
      ) {
        const cardElement = elements.getElement(CardElement);
        let createTokenRespone = await stripe.createToken(cardElement, {
          name: profile?.name ? profile.name : firstName + ' ' + lastName,
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
            productType: 'workshop',
            productSfId: productId,
            AddOnProductIds: AddOnProductIds,
          }
        : {
            productType: 'bundle',
            productSfId: values.comboDetailId,
            childProduct: {
              productType: 'workshop',
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

      if (!isLoggedUser) {
        payLoad = {
          ...payLoad,
          user: {
            lastName: lastName,
            firstName: firstName,
            email: email,
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
        path: 'createAndPayOrder',
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
    phone1,
    eventEndDate,
    eventStartDate,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    mode,
    phone2,
    timings = [],
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
      ? Yup.object().required('Expense Type is required!')
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

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  return (
    <>
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
        innerRef={formRef}
        onSubmit={async (values, { setSubmitting, isValid, errors }) => {
          console.log('errors', errors);
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
            <>
              <main className="checkout-aol">
                <section>
                  <div className="container">
                    <div className="row">
                      <div className="col-12 col-lg-7">
                        <div className="section--title">
                          <h1 className="page-title">{title}</h1>
                          {workshop.isGenericWorkshop ? (
                            <div class="description">
                              Once you register, you will be contacted to
                              schedule your course date
                              <br />
                              <span>
                                SKY is offered every week of the year across
                                time zones.
                              </span>
                            </div>
                          ) : (
                            <div
                              class="description"
                              dangerouslySetInnerHTML={{
                                __html: workshop?.description,
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="section-box">
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
                              <div className="row pt-3 mx-n2">
                                <UserInfoFormNewCheckout
                                  formikProps={formikProps}
                                />
                              </div>
                            </form>
                          </div>
                        </div>
                        <div className="section-box">
                          <h2 class="section__title">Pay with</h2>
                          {isPaymentRequired && (
                            <PayWithNewCheckout
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
                                          <CardElement
                                            options={createOptions}
                                          />
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
                                        process.env
                                          .NEXT_PUBLIC_PAYPAL_CLIENT_ID,
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
                                          formikProps.isValid &&
                                          formikProps.dirty
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
                        <div className="section-box features-desktop">
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
                                    anxiety, and improve sleep through hundreds
                                    of scientific studies.
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
                                    Join a community of over 500 million people
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
                      <div className="col-12 col-lg-5">
                        <div className="checkout-sidebar">
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
                                <span class="radio-text">Regular Tuition</span>
                                <span class="radio-value">
                                  {delfee && <s>${delfee}</s>} ${fee}
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
                              Note: $295 discount when you choose the special
                              offer. Separately, course fees would be $790
                            </div>
                          </div>
                          <div className="room-board-pricing">
                            <div class="form-item">
                              <label for="phone">Room & Board</label>
                              <select placeholder="Select room & board">
                                <option>Dorm Style - Women $350</option>
                                <option>Dorm Style - Men $350</option>
                                <option>Self Arranged Accomodation $250</option>
                              </select>
                            </div>
                            <div className="total">
                              <div className="label">Total:</div>
                              <div className="value">
                                {' '}
                                {discountResponse && delfee && (
                                  <span className="discount">
                                    ${delfee.toFixed(2)}
                                  </span>
                                )}{' '}
                                ${fee.toFixed(2) || '0'.toFixed(2)}
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
                                  Contact Date:
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
                                          {dayjs
                                            .utc(time.startDate)
                                            .format('dd')}
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
                                  {mode === COURSE_MODES.ONLINE.name
                                    ? mode
                                    : (mode === COURSE_MODES.IN_PERSON.name ||
                                        mode ===
                                          COURSE_MODES.DESTINATION_RETREATS
                                            .name) && (
                                        <>
                                          {!workshop.isLocationEmpty && (
                                            <a
                                              href={`https://www.google.com/maps/search/?api=1&query=${
                                                workshop.locationStreet || ''
                                              }, ${workshop.locationCity} ${
                                                workshop.locationProvince
                                              } ${
                                                workshop.locationPostalCode
                                              } ${workshop.locationCountry}`}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              {workshop.locationStreet &&
                                                workshop.locationStreet}
                                              {workshop.locationCity || ''}
                                              {', '}
                                              {workshop.locationProvince ||
                                                ''}{' '}
                                              {workshop.locationPostalCode ||
                                                ''}
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
                                  <a href={`tel:${phone1}`}>{phone1}</a>
                                  <br />
                                  {phone2 && (
                                    <a href={`tel:${phone2}`}>{phone2}</a>
                                  )}
                                  <a href={`mailto:${email}`}>{email}</a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="section-box confirm-submit">
                            <div className="section__body">
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
                              <ScheduleAgreementForm
                                formikProps={formikProps}
                                complianceQuestionnaire={
                                  complianceQuestionnaire
                                }
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
                                  disabled={loading}
                                  form="my-form"
                                  onClick={handleFormSubmit}
                                >
                                  Confirm and Pay
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
                                    anxiety, and improve sleep through hundreds
                                    of scientific studies.
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
                                    Join a community of over 500 million people
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
        ></ProgramQuestionnaire>
      )}
    </>
  );
};
