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

export const PaymentForm = ({
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
    timings,
    mode,
    locationProvince,
    locationStreet,
    locationCity,
    locationPostalCode,
    locationCountry,
    phone1,
    email: workshopEmail,
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
            <div className="row">
              {loading && <Loader />}

              <div
                id="second-step"
                className="scheduling-modal__template  second"
              >
                <div className="scheduling-modal__content-wrapper">
                  <h3>Checkout / Account Details</h3>

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
                    <ul className="scheduling-modal__content-wrapper-form-list">
                      <ScheduleInput
                        containerClass={`scheduling-modal__content-wrapper-form-list-row`}
                        formikProps={formikProps}
                        formikKey="firstName"
                        placeholder="First name"
                        tooltip="Enter given name"
                        label="First name"
                      ></ScheduleInput>

                      <ScheduleInput
                        containerClass={`scheduling-modal__content-wrapper-form-list-row`}
                        formikProps={formikProps}
                        formikKey="lastName"
                        label="Last name"
                        placeholder="Last name"
                      ></ScheduleInput>

                      <ScheduleInput
                        type="email"
                        placeholder="Email address"
                        containerClass={`scheduling-modal__content-wrapper-form-list-row`}
                        formikProps={formikProps}
                        formikKey="email"
                        label="Email address"
                        onCut={(event) => {
                          event.preventDefault();
                        }}
                        onCopy={(event) => {
                          event.preventDefault();
                        }}
                        onPaste={(event) => {
                          event.preventDefault();
                        }}
                      ></ScheduleInput>

                      <SchedulePhoneInput
                        containerClass={`scheduling-modal__content-wrapper-form-list-row`}
                        formikProps={formikProps}
                        formikKey="contactPhone"
                        label="Mobile Number"
                        placeholder="Mobile Number"
                        type="tel"
                      ></SchedulePhoneInput>
                    </ul>

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
                            <PaymentElement options={paymentElementOptions} />
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
                                  !(formikProps.isValid && formikProps.dirty)
                                }
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
                              debug: true,
                              currency: "USD",
                            }}
                            style={{
                              layout: "horizontal",
                              color: "blue",
                              shape: "pill",
                              height: 40,
                              tagline: false,
                              label: "pay",
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
                  </form>
                </div>

                <div className="scheduling-modal__total">
                  <div className="scheduling-modal__content-wrapper">
                    <div className="scheduling-modal__content-total">
                      <h5 className="scheduling-modal__content-total-title">
                        {title}
                      </h5>

                      <div className="scheduling-modal__content-total-dates">
                        {timings?.map((t) => {
                          return (
                            <>
                              <div
                                className="scheduling-modal__content-total-date"
                                key={t.sfid}
                              >
                                <span>
                                  {dayjs.utc(t.startDate).format('ddd, D')}
                                </span>
                                <span>
                                  {tConvert(t.startTime, true)} -{' '}
                                  {tConvert(t.endTime, true)}
                                </span>
                              </div>
                            </>
                          );
                        })}
                      </div>
                      {/* <hr />
                    <div className="scheduling-modal__content-total-instructors-wrapper">
                      <div className="scheduling-modal__content-total-instructors">
                        {" Instructor(s):"}
                      </div>
                      <ul className="scheduling-modal__content-total-instructors-list">
                        <li>{primaryTeacherName}</li>
                        <li>{coTeacher1Name}</li>
                      </ul>
                    </div> */}
                      <hr />
                      <div className="scheduling-modal__content-total-location show">
                        Location:
                        <p className="scheduling-modal__content-total-links">
                          {mode === COURSE_MODES.ONLINE.name ? (
                            mode
                          ) : (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${
                                locationStreet || ''
                              }, ${locationCity} ${locationProvince} ${locationPostalCode} ${locationCountry}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {`${locationStreet || ''} ${locationCity || ''},
                          ${locationProvince || ''} ${
                            locationPostalCode || ''
                          }`}
                            </a>
                          )}
                        </p>
                      </div>

                      <div className="scheduling-modal__content-total-contacts">
                        Contact details:
                        <p className="scheduling-modal__content-total-links">
                          <a href={`tel:${phone1}`}>{phone1}</a>
                          <a href={`mailto:${workshopEmail}`}>
                            {workshopEmail}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="scheduling-modal__coupon">
                      <ScheduleDiscountInput
                        formikProps={formikProps}
                        placeholder="Discount"
                        formikKey="couponCode"
                        product={productId}
                        applyDiscount={applyDiscount}
                        addOnProducts={addOnProducts}
                        containerClass={`tickets-modal__input-label tickets-modal__input-label--top`}
                        label="Discount Code"
                      ></ScheduleDiscountInput>
                    </div>

                    <p className="scheduling-modal__content-wrapper-form-checkbox">
                      <ScheduleAgreementForm
                        formikProps={formikProps}
                        complianceQuestionnaire={complianceQuestionnaire}
                        isCorporateEvent={false}
                        questionnaireArray={questionnaire}
                        screen="DESKTOP"
                      />
                    </p>

                    <hr />

                    <p className="scheduling-modal__content-total-footer">
                      <span>Limited Time Offer</span>
                      <span>${fee.toFixed(2) || '0'.toFixed(2)}</span>
                    </p>
                    <p className="scheduling-modal__content-total-footer">
                      <span>Regular Course Fee</span>
                      <span>
                        {discountResponse ||
                          (delfee && (
                            <span className="discount">
                              ${delfee.toFixed(2)}
                            </span>
                          ))}{' '}
                      </span>
                    </p>

                    <p className="scheduling-modal__content-total-contact">
                      For any health related questions, please contact the
                      health info desk at{' '}
                      <a href={`mailto:healthinfo@us.artofliving.org`}>
                        healthinfo@us.artofliving.org
                      </a>
                    </p>
                  </div>

                  <button
                    className="scheduling-modal__continue"
                    id="pay-button"
                    type="button"
                    disabled={loading}
                    form="my-form"
                    onClick={() => preEnrollValidation(values)}
                  >
                    pay
                  </button>
                </div>

                <section className="scheduling-modal__practices">
                  <div className="scheduling-modal__practice">
                    <svg
                      fill="none"
                      height="40"
                      viewBox="0 0 40 40"
                      width="40"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M32.2878 14.3226C33.038 14.3226 33.8411 13.5634 33.5781 12.7742C32.933 8.90322 30.3522 8 28.6749 8C27.6426 6.70967 26.4814 6.45161 25.7071 6.32257C24.1587 6.19355 22.9975 6.96774 22.2232 7.6129C21.32 7.2258 20.4169 7.09677 19.5136 7.09677C15.2555 7.09677 11.7717 10.5806 11.7717 14.8387C11.7717 18.7097 14.6104 21.8065 18.2232 22.4516V27.3549C18.2232 28.129 18.7394 28.6451 19.5136 28.6451C20.2877 28.6451 20.8039 28.129 20.8039 27.3549V22.4516C24.4169 21.8065 27.2555 18.5806 27.2555 14.8387C27.2555 14.5806 27.2555 14.3226 27.2555 14.3226H32.2878ZM20.8039 20V17.6774L21.8361 16.7742C22.3522 16.2581 22.4814 15.4839 21.9653 14.9677C21.7071 14.5806 21.191 14.4516 20.8039 14.5806V13.6774C20.8039 12.9032 20.2877 12.3871 19.5136 12.3871C18.7394 12.3871 18.2232 12.9032 18.2232 13.6774V17.0322V19.871C16.0297 19.3549 14.3522 17.2904 14.3522 14.8387C14.3522 12 16.6749 9.67741 19.5136 9.67741C22.3522 9.67741 24.6749 11.875 24.8039 14.8387C24.6749 17.4194 22.9975 19.3549 20.8039 20ZM24.6749 9.16129C24.933 9.03225 25.191 8.90322 25.5781 8.90322C26.0942 8.90322 26.4814 9.29032 26.9975 9.93549C27.2555 10.3226 27.7716 10.5806 28.2877 10.4516C28.4169 10.4516 29.8361 10.3226 30.6104 11.6129H26.4814C25.9653 10.7097 25.4491 9.93549 24.6749 9.16129Z"
                        fill="#FCA248"
                      />
                      <path
                        d="M22.0943 0C14.8684 0 8.41682 4.90322 6.48134 11.871L2.22327 19.7419C1.83618 20.5161 1.83618 21.4194 2.22327 22.0645C2.61037 22.8387 3.51359 23.2257 4.28779 23.2257H5.83618V28.5161C5.83618 31.4839 8.28779 33.9355 11.2555 33.9355H12.0297V38.7096C12.0297 39.4839 12.5459 40 13.32 40C14.0943 40 14.6104 39.4839 14.6104 38.7096V32.6451C14.6104 31.871 14.0943 31.3549 13.32 31.3549H11.2555C9.70714 31.3549 8.41682 30.0645 8.41682 28.5161V21.9355C8.41682 21.1613 7.90069 20.6451 7.12649 20.6451H4.54586L8.67488 12.9033C8.67488 12.7743 8.80392 12.7743 8.80392 12.6451C10.6104 6.70968 16.0298 2.58065 22.0943 2.58065C29.5781 2.58065 35.7716 8.64516 35.7716 16.2581C35.7716 19.3549 34.7394 22.1935 32.8039 24.6451C30.7394 27.2258 29.7071 29.6774 29.7071 32V38.7096C29.7071 39.4839 30.2233 40 30.9975 40C31.7716 40 32.2878 39.4839 32.2878 38.7096V32C32.2878 30.1935 33.062 28.3871 34.7394 26.1935C37.062 23.3549 38.2233 19.871 38.2233 16.2581C38.3523 7.22581 31.1265 0 22.0943 0Z"
                        fill="#FCA248"
                      />
                    </svg>
                    <div>
                      <h5>UNPARALLELED CONVENIENCE</h5>
                      <p>
                        Choose your schedule. Learn from the comfort of your own
                        home.
                      </p>
                    </div>
                  </div>

                  <div className="scheduling-modal__practice">
                    <svg
                      fill="none"
                      height="40"
                      viewBox="0 0 40 40"
                      width="40"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M20.6099 0C21.3002 0 21.8599 0.559644 21.8599 1.25V3.75C21.8599 4.44035 21.3002 5 20.6099 5C19.9195 5 19.3599 4.44035 19.3599 3.75V1.25C19.3599 0.559644 19.9195 0 20.6099 0ZM34.2415 5.58892C34.7463 6.05993 34.7736 6.8509 34.3026 7.35564L32.7889 8.9778C32.3179 9.48254 31.5269 9.5099 31.0223 9.03891C30.5175 8.56791 30.4901 7.77694 30.9611 7.2722L32.4747 5.65004C32.9457 5.1453 33.7368 5.11794 34.2415 5.58892ZM6.86876 5.619C7.35689 5.13081 8.14835 5.13077 8.63653 5.61891L10.2588 7.24108C10.747 7.72921 10.7471 8.52066 10.2589 9.00884C9.77079 9.49702 8.97934 9.49706 8.49116 9.00892L6.86885 7.38676C6.38066 6.89862 6.38062 6.10718 6.86876 5.619ZM20.6098 9.08539C14.9499 9.08539 10.3352 13.7 10.3352 19.3599C10.3352 20.6025 10.5136 21.7253 10.8911 22.7804C11.1237 23.4304 10.7853 24.1459 10.1353 24.3784C9.48529 24.611 8.76981 24.2726 8.53725 23.6226C8.05024 22.2615 7.83524 20.849 7.83524 19.3599C7.83524 12.3193 13.5691 6.58539 20.6098 6.58539C27.6504 6.58539 33.3843 12.3193 33.3843 19.3599C33.3843 20.7961 33.1395 22.1787 32.725 23.437C32.509 24.0927 31.8024 24.4491 31.1466 24.2331C30.491 24.0171 30.1345 23.3105 30.3505 22.6549C30.6872 21.6326 30.8842 20.5138 30.8842 19.3599C30.8842 13.7 26.2696 9.08539 20.6098 9.08539ZM15.5184 15.5185C15.5184 12.7114 17.8029 10.4269 20.61 10.4269C23.4174 10.4269 25.7014 12.7124 25.7014 15.5191C25.7014 17.0219 25.0468 18.3745 24.0079 19.3071C25.6431 19.8239 27.0844 20.9129 28.0148 22.3749L28.0284 22.3966L30.4588 26.395C30.4741 26.4204 30.4887 26.4464 30.5024 26.4729C30.5068 26.4781 30.5174 26.4897 30.5373 26.5068C30.581 26.5443 30.6474 26.5886 30.7335 26.6318C30.7575 26.6438 30.7811 26.6565 30.8044 26.6701L35.4987 29.4085C36.7827 30.1311 37.311 31.7949 36.6236 33.1695C36.2875 33.8419 35.7655 34.3204 35.1469 34.5788C35.2749 34.9745 35.3445 35.3937 35.3445 35.8249C35.3445 38.2155 33.2015 40.2207 30.64 39.8866L30.6382 39.8864L20.6882 38.574L10.7616 39.8821C8.12042 40.324 6.03225 38.1475 6.03225 35.8236C6.03225 35.4629 6.0809 35.1106 6.17175 34.7734C5.50999 34.5259 4.95015 34.0329 4.59625 33.3251C3.87753 31.8876 4.50584 30.3708 5.64809 29.6093C5.66886 29.5954 5.69005 29.5821 5.71163 29.5696L10.4155 26.8256C10.4387 26.8121 10.4623 26.7994 10.4863 26.7874C10.558 26.7515 10.597 26.7125 10.6329 26.6407C10.6483 26.61 10.6649 26.5799 10.6828 26.5505L13.1131 22.5522C14.0893 20.9486 15.5811 19.8577 17.3057 19.389C16.2125 18.4544 15.5184 17.0658 15.5184 15.5185ZM21.8995 21.4738L19.3521 21.6269C19.3272 21.6284 19.3021 21.6291 19.2771 21.6291C17.5801 21.6291 16.1116 22.4348 15.2494 23.8507M15.2494 23.8507L12.8422 27.8109C12.571 28.3279 12.1637 28.7334 11.6451 29.0026L7.01153 31.7056C6.894 31.7906 6.8326 31.8894 6.80826 31.9665C6.78574 32.0379 6.78546 32.1134 6.83231 32.207C6.89354 32.3295 6.95595 32.3821 6.99659 32.4071C7.03399 32.4301 7.08881 32.4518 7.17263 32.456C7.18784 32.4511 7.20979 32.4435 7.24645 32.4304C7.253 32.4281 7.26018 32.4255 7.26793 32.4227C7.29899 32.4116 7.33906 32.3973 7.38271 32.3821L12.6181 30.135C13.0941 29.915 13.4514 29.51 13.8126 28.846C13.9964 28.5084 14.1613 28.1425 14.3485 27.7256L14.3547 27.7116C14.533 27.3149 14.7338 26.8679 14.967 26.443C15.2415 25.9425 15.8203 25.6916 16.3731 25.8334C16.9261 25.9751 17.3129 26.4734 17.3129 27.0443V31.5849L23.907 31.5836V27.0443C23.907 26.48 24.285 25.9858 24.8295 25.8379C25.374 25.69 25.95 25.9254 26.2354 26.4121C26.4815 26.8319 26.6945 27.2817 26.8836 27.6844C26.8956 27.71 26.9076 27.7354 26.9194 27.7606C27.102 28.1497 27.2657 28.4986 27.4464 28.8263C27.8271 29.517 28.1854 29.9241 28.6205 30.1297L33.8553 32.2347C33.9031 32.254 33.9499 32.2762 33.995 32.3013C34.0015 32.3013 34.0085 32.3013 34.016 32.3013C34.1177 32.3013 34.1814 32.2773 34.2232 32.2515C34.2639 32.2265 34.3264 32.1739 34.3875 32.0515C34.4313 31.9641 34.4377 31.8665 34.4089 31.7727C34.3786 31.6744 34.3203 31.6136 34.2714 31.5865L34.2486 31.5735L29.576 28.8479C29.1701 28.639 28.6256 28.267 28.3008 27.6577L25.8991 23.7069C25.031 22.3504 23.4846 21.4864 21.8995 21.4738M20.6884 34.0849L10.1046 34.1729C9.3273 34.1729 8.53225 34.9239 8.53225 35.8236C8.53225 36.7844 9.40866 37.58 10.3608 37.4144C10.3777 37.4115 10.3946 37.4089 10.4116 37.4066L20.525 36.0739C20.6335 36.0596 20.7434 36.0596 20.8517 36.0739L30.9634 37.4076C30.9639 37.4077 30.9644 37.4077 30.9649 37.4079C32.009 37.5431 32.8445 36.7265 32.8445 35.8249C32.8445 34.9251 32.0494 34.1741 31.2721 34.1741H31.2616L20.6884 34.0849ZM26.407 31.633L26.4487 31.6334C26.4347 31.6202 26.4209 31.607 26.407 31.5938V31.633ZM20.61 12.927C19.1835 12.927 18.0184 14.092 18.0184 15.5185C18.0184 16.9449 19.1835 18.11 20.61 18.11C22.0366 18.11 23.2014 16.9452 23.2014 15.5191C23.2014 14.0924 22.036 12.927 20.61 12.927ZM39.8909 19.2407C39.9135 19.9306 39.3725 20.5084 38.6825 20.531L36.2909 20.6092C35.601 20.6319 35.0233 20.0909 35.0006 19.4009C34.9781 18.7109 35.5191 18.1332 36.2091 18.1106L38.6006 18.0322C39.2906 18.0096 39.8684 18.5508 39.8909 19.2407ZM1.24985 19.2816C1.24985 18.5912 1.80949 18.0316 2.49985 18.0316H5C5.69035 18.0316 6.25 18.5912 6.25 19.2816C6.25 19.972 5.69035 20.5316 5 20.5316H2.49985C1.80949 20.5316 1.24985 19.972 1.24985 19.2816Z"
                        fill="#FCA248"
                        fillRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h5>EXPERIENCED FACILITATORS</h5>
                      <p>
                        Real-time interaction with highly trained instructors
                        (minimum of 500+ training hours)
                      </p>
                    </div>
                  </div>
                  <div className="scheduling-modal__practice">
                    <svg
                      fill="none"
                      height="40"
                      viewBox="0 0 40 40"
                      width="40"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M27.2969 31.127C27.0469 30.627 26.5469 30.127 25.9219 30.002L23.0469 29.627L21.6719 27.002C21.2969 26.377 20.6719 26.127 20.0469 26.127C19.4219 26.127 18.7969 26.502 18.4219 27.127L17.0469 29.752L14.2969 30.002C13.5469 30.002 13.0469 30.502 12.7969 31.127C12.5469 31.752 12.7969 32.502 13.2969 33.002L15.4219 35.002L14.9219 37.877C14.7969 38.627 15.1719 39.252 15.6719 39.627C16.1719 40.002 16.9219 40.127 17.5469 39.752L20.1719 38.502L22.6719 39.752C23.4219 40.127 24.1719 40.002 24.5469 39.627C25.0469 39.252 25.4219 38.627 25.2969 37.877L24.7969 35.002L26.9219 33.002C27.4219 32.502 27.5469 31.752 27.2969 31.127ZM22.7969 33.502C22.2969 34.002 22.2969 34.627 22.2969 34.877C22.2969 35.002 22.2969 35.002 22.2969 35.127L22.6719 37.002L21.0469 36.127C20.5469 35.877 19.9219 35.877 19.4219 36.127L17.5469 36.877L17.9219 35.002C17.9219 34.877 17.9219 34.877 17.9219 34.752C17.9219 34.502 17.9219 33.877 17.4219 33.377L16.1719 32.127L17.9219 31.877C18.2969 31.877 18.6719 31.627 18.7969 31.502C19.0469 31.377 19.1719 31.127 19.2969 30.877L20.1719 29.252L21.0469 30.877C21.2969 31.377 21.7969 31.627 21.9219 31.752C22.0469 31.752 22.1719 31.877 22.2969 31.877L24.0469 32.127L22.7969 33.502ZM38.7969 25.502C38.6719 25.002 38.2969 24.752 37.7969 24.627L35.1719 24.252L34.0469 21.877C33.7969 21.502 33.4219 21.127 32.9219 21.127C32.4219 21.127 32.0469 21.377 31.7969 21.877L30.6719 24.252L28.1719 24.627C27.6719 24.752 27.2969 25.002 27.1719 25.502C27.0469 26.002 27.1719 26.502 27.5469 26.752L29.4219 28.502L29.0469 31.002C28.9219 31.502 29.1719 32.002 29.5469 32.252C29.9219 32.502 30.4219 32.627 30.9219 32.377L33.1719 31.127L35.4219 32.377C35.7969 32.627 36.4219 32.502 36.7969 32.252C37.1719 32.002 37.4219 31.502 37.2969 31.002L36.9219 28.502L38.7969 26.752C38.7969 26.502 38.9219 26.002 38.7969 25.502ZM34.4219 27.127C34.0469 27.377 33.9219 27.877 34.0469 28.252L34.1719 28.877L33.5469 28.627C33.1719 28.377 32.7969 28.377 32.4219 28.627L31.7969 28.877L31.9219 28.252C32.0469 27.877 31.9219 27.377 31.5469 27.127L31.0469 26.627L31.6719 26.502C32.0469 26.502 32.4219 26.127 32.6719 25.877L32.9219 25.252L33.1719 25.877C33.2969 26.252 33.6719 26.502 34.1719 26.502L34.7969 26.627L34.4219 27.127ZM12.9219 25.502C12.7969 25.002 12.4219 24.752 11.9219 24.627L9.29689 24.252L8.17189 21.877C8.04689 21.502 7.54689 21.252 7.17189 21.252C6.67189 21.252 6.29689 21.502 6.04689 22.002L4.92189 24.377L2.42189 24.752C1.92189 24.752 1.54689 25.002 1.29689 25.502C1.17189 26.002 1.29689 26.502 1.67189 26.752L3.54689 28.502L3.04689 31.002C2.92189 31.502 3.17189 32.002 3.54689 32.252C3.92189 32.502 4.42189 32.627 4.92189 32.377L7.17189 31.127L9.42189 32.377C9.79689 32.627 10.2969 32.502 10.7969 32.252C11.1719 32.002 11.4219 31.502 11.2969 31.002L10.9219 28.502L12.7969 26.752C13.0469 26.502 13.1719 26.002 12.9219 25.502ZM8.54689 27.127C8.17189 27.377 8.04689 27.877 8.17189 28.252L8.29689 28.877L7.67189 28.627C7.29689 28.377 6.92189 28.377 6.54689 28.627L5.92189 28.877L6.04689 28.252C6.17189 27.877 6.04689 27.377 5.67189 27.127L5.17189 26.627L5.79689 26.502C6.17189 26.502 6.54689 26.127 6.79689 25.877L7.04689 25.252L7.29689 25.877C7.42189 26.252 7.79689 26.502 8.29689 26.502L8.92189 26.627L8.54689 27.127ZM19.9219 0.00204402C13.1719 0.00204402 7.67189 5.50205 7.67189 12.252C7.67189 15.627 9.04689 18.627 11.2969 20.877C13.5469 23.127 16.6719 24.502 20.0469 24.502C23.4219 24.502 26.6719 23.127 28.7969 20.877C31.0469 18.627 32.2969 15.627 32.2969 12.252C32.4219 5.50205 26.9219 -0.122956 19.9219 0.00204402ZM20.0469 22.127C17.7969 22.127 15.7969 21.377 14.0469 20.127C15.6719 18.877 17.7969 18.252 20.0469 18.252C22.2969 18.252 24.4219 19.002 26.0469 20.127C24.2969 21.377 22.2969 22.127 20.0469 22.127ZM16.4219 10.377C16.4219 8.37705 18.0469 6.75205 20.0469 6.75205C22.0469 6.75205 23.6719 8.37705 23.6719 10.377C23.6719 12.377 22.0469 14.002 20.0469 14.002C18.0469 14.002 16.4219 12.377 16.4219 10.377ZM27.7969 18.252C26.2969 17.127 24.5469 16.252 22.5469 15.877C24.6719 14.877 26.1719 12.752 26.1719 10.2521C26.1719 6.87705 23.4219 4.12705 20.0469 4.12705C16.6719 4.12705 13.9219 6.87705 13.9219 10.2521C13.9219 12.752 15.4219 14.877 17.4219 15.752C15.4219 16.127 13.6719 17.002 12.0469 18.127C10.7969 16.502 9.92189 14.377 9.92189 12.1271C9.92189 6.75205 14.2969 2.37705 19.6719 2.37705C25.2969 2.37705 29.5469 6.75205 29.5469 12.1271C29.9219 14.627 29.0469 16.627 27.7969 18.252Z"
                        fill="#FCA248"
                      />
                    </svg>
                    <div>
                      <h5>UPLIFTING COMMUNITY</h5>
                      <p>
                        Form deep, authentic connections and community with your
                        fellow participants.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div
                id="second-step"
                className="scheduling-modal__template second"
              >
                <div className="scheduling-modal__content-wrapper">
                  <form className="order__form" onSubmit={handleSubmit}>
                    <div className="order__card">
                      <MobileCourseOptions
                        expenseAddOn={expenseAddOn}
                        isOfflineExpense={isOfflineExpense}
                        workshop={workshop}
                        fee={fee}
                        delfee={delfee}
                        formikProps={formikProps}
                        userSubscriptions={userSubscriptions}
                        openSubscriptionPaywallPage={
                          openSubscriptionPaywallPage
                        }
                        hasGroupedAddOnProducts={hasGroupedAddOnProducts}
                        totalFee={totalFee}
                        paymentOptionChange={handlePaymentOptionChange}
                        showCouponCodeField={showCouponCodeField}
                        isUsableCreditAvailable={isUsableCreditAvailable}
                        UpdatedFeeAfterCredits={UpdatedFeeAfterCredits}
                        isComboDetailAvailable={isComboDetailAvailable}
                        values={values}
                        onAccommodationChange={handleAccommodationChange}
                        onComboDetailChange={handleComboDetailChange}
                        isCourseOptionRequired={isCourseOptionRequired}
                      />
                    </div>
                  </form>
                </div>
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
