/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  AgreementForm,
  BillingInfoForm,
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
import { orgConfig } from '@org';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import {
  CardElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Auth, isEmpty, phoneRegExp } from '@utils';
import { filterAllowedParams, removeNull } from '@utils/utmParam';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import { Loader } from '@components';
import {
  ABBRS,
  COURSE_MODES,
  ALERT_TYPES,
  COURSE_TYPES,
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
import { pushRouteWithUTMQuery } from '@service';
import { api, priceCalculation, tConvert } from '@utils';
import Style from './PaymentFormGeneric.module.scss';
import { AttendanceFormIAHV } from '@components/checkout/AttendanceFormIAHV';
import { useQuery } from 'react-query';

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

export const PaymentFormGeneric = ({
  isStripeIntentPayment = false,
  workshop = {},
  profile = {},
  enrollmentCompletionLink,
  enrollmentCompletionAction = () => {},
  handleCouseSelection = () => {},
  login = () => {},
  isLoggedUser = false,
}) => {
  const { showAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const stripe = useStripe();
  const { setUser } = useAuth();
  const elements = useElements();
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

  const { data: corporates } = useQuery(
    'corporates',
    async () => {
      const response = await api.get({
        path: 'getCorporates',
      });
      return response;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

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
      paymentOption,
      paymentMode,
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

  const preEnrollValidation = async (values) => {
    const { programQuestionnaire = [] } = workshop;
    if (programQuestionnaire.length > 0) {
      setEnrollFormValues(values);
      setShowProgramQuestionnaireForm(true);
    } else {
      await completeEnrollmentAction(values);
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
      contactHealthcareOrganisation,
      contactOtherHealthcareOrganization,
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
          attendee: {
            contactHealthcareOrganisation,
            contactOtherHealthcareOrganization,
          },
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
    formattedStartDateOnly,
    formattedEndDateOnly,
    timings,
    primaryTeacherName,
    primaryTeacherPic,
    coTeacher1Name,
    coTeacher1Pic,
    coTeacher2Name,
    coTeacher2Pic,
    contactName,
    phone1,
    description,
    isCCNotRequired,
    email: contactEmail,
    paymentMethod = {},
    productTypeId,
    mode,
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

  const isMeditationDeluxe =
    COURSE_TYPES.MEDITATION_DELUXE_COURSE.value === productTypeId;
  const gatewayToInfinity =
    COURSE_TYPES.GATEWAY_TO_INFINITY_COURSE.value === productTypeId;

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
    const { isInstalmentAllowed, id } = workshop;
    handleCouseSelection(comboDetailProductSfid);
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

  const paymentElementOptions = {
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

  const isIahv = orgConfig.name === 'IAHV';

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
            otherPaymentOptions && otherPaymentOptions.indexOf('Paypal') > -1
              ? ''
              : PAYMENT_MODES.STRIPE_PAYMENT_MODE,
          accommodation: null,
          priceType: 'regular',
          contactHealthcareOrganisation: '',
          contactOtherHealthcareOrganization: '',
        }}
        validationSchema={Yup.object().shape({
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
          contactHealthcareOrganisation: isIahv
            ? Yup.string().required('Healthcare Organization is required')
            : Yup.string().notRequired(),
          contactOtherHealthcareOrganization: isIahv
            ? Yup.string()
                .ensure()
                .when('contactHealthcareOrganisation', {
                  is: 'other',
                  then: Yup.string().required(
                    'Other Healthcare Organization is required',
                  ),
                })
            : Yup.string().notRequired(),
        })}
        onSubmit={async (values, { setSubmitting, isValid, errors }) => {
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
              <div className="col-lg-7 col-12">
                <form className="order__form" onSubmit={handleSubmit}>
                  <div className="details">
                    <h2 className="details__title">Account Details:</h2>
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
                  </div>
                  <div className="order__card">
                    <UserInfoForm
                      formikProps={formikProps}
                      isLoggedUser={isLoggedUser}
                    />
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

                    {isIahv && (
                      <AttendanceFormIAHV
                        formikProps={formikProps}
                        corporates={corporates}
                      />
                    )}

                    {isPaymentRequired && (
                      <PayWith
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
                          className="order__card__payment-method paypal-info tw-w-[150px]"
                          data-method="paypal"
                        >
                          <div className="paypal-info__sign-in tw-relative tw-z-0">
                            <PayPalScriptProvider
                              options={{
                                clientId:
                                  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                                debug: true,
                                currency: 'USD',
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
                      onAccommodationChange={handleAccommodationChange}
                    />
                  </div>
                  <AgreementForm
                    formikProps={formikProps}
                    complianceQuestionnaire={complianceQuestionnaire}
                    isCorporateEvent={isCorporateEvent}
                    screen="MOBILE"
                  />
                  <div className="reciept__agreement">
                    <AgreementForm
                      formikProps={formikProps}
                      complianceQuestionnaire={complianceQuestionnaire}
                      isCorporateEvent={isCorporateEvent}
                      screen="DESKTOP"
                    />
                  </div>
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
              <div className="col-xl-4 col-lg-5 col-12 mt-0 mt-6 p-0 offset-xl-1 tw-mb-2">
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
                    discount={discountResponse}
                  />
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
                {!isMeditationDeluxe && !gatewayToInfinity && (
                  <div className={classNames(Style.aol_allModal)}>
                    <div className={classNames(Style.modal_content)}>
                      <div
                        className={classNames(Style.modal_body)}
                        id="workshopsDetailsModal"
                      >
                        <div
                          className={classNames(
                            Style.sessionDetails_ModalBody,
                            Style.workshop,
                          )}
                        >
                          {/* <h2 className={classNames(Style.title)}>{title}</h2> */}
                          <div className="row tw-pl-3 tw-pr-3">
                            <div
                              className={classNames(
                                'col-12',
                                Style.datetime_box,
                              )}
                            >
                              <h6>Date:</h6>
                              <div>Start: {formattedStartDateOnly}</div>
                              <div>End: {formattedEndDateOnly}</div>
                            </div>
                            <div
                              className={classNames(
                                'col-12',
                                Style.datetime_box,
                              )}
                            >
                              <h6>Time:</h6>
                              {timings &&
                                timings.map((time, index) => {
                                  return (
                                    <div key={index}>
                                      {`${dayjs
                                        .utc(time.startDate)
                                        .format('dd')}: ${tConvert(
                                        time.startTime,
                                      )}-${tConvert(time.endTime)} ${
                                        ABBRS[time.timeZone]
                                      }`}
                                    </div>
                                  );
                                })}
                            </div>
                            <div
                              className={classNames(
                                'col-12',
                                Style.datetime_box,
                              )}
                            >
                              <h6>Location:</h6>
                              {(mode === COURSE_MODES.IN_PERSON.name ||
                                mode ===
                                  COURSE_MODES.DESTINATION_RETREATS.name) && (
                                <>
                                  {!workshop.isLocationEmpty && (
                                    <ul>
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
                                        {workshop.locationStreet && (
                                          <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                                            {workshop.locationStreet}
                                          </li>
                                        )}
                                        <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                                          {workshop.locationCity || ''}
                                          {', '}
                                          {workshop.locationProvince || ''}{' '}
                                          {workshop.locationPostalCode || ''}
                                        </li>
                                      </a>
                                    </ul>
                                  )}
                                  {workshop.isLocationEmpty && (
                                    <ul>
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
                                        {workshop.streetAddress1 && (
                                          <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                                            {workshop.streetAddress1}
                                          </li>
                                        )}
                                        {workshop.streetAddress2 && (
                                          <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                                            {workshop.streetAddress2}
                                          </li>
                                        )}
                                        <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                                          {workshop.city || ''}
                                          {', '}
                                          {workshop.state || ''}{' '}
                                          {workshop.zip || ''}
                                        </li>
                                      </a>
                                    </ul>
                                  )}
                                </>
                              )}

                              {mode === COURSE_MODES.ONLINE.name && (
                                <>
                                  {!workshop.isLocationEmpty && (
                                    <ul>
                                      <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                                        {mode}
                                      </li>
                                    </ul>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <div
                            className={classNames('col-12', Style.datetime_box)}
                          >
                            <h6>Teacher:</h6>
                            {primaryTeacherName && (
                              <div>
                                <img
                                  className={classNames(
                                    Style.img,
                                    'rounded-circle',
                                  )}
                                  src={primaryTeacherPic || '/img/user.png'}
                                />
                                {primaryTeacherName}
                              </div>
                            )}
                            {coTeacher1Name && (
                              <div>
                                <img
                                  className={classNames(
                                    Style.img,
                                    'rounded-circle',
                                  )}
                                  src={coTeacher1Pic || '/img/user.png'}
                                />
                                {coTeacher1Name}
                              </div>
                            )}
                            {coTeacher2Name && (
                              <div>
                                <img
                                  className={classNames(
                                    Style.img,
                                    'rounded-circle',
                                  )}
                                  src={coTeacher2Pic || '/img/user.png'}
                                />
                                {coTeacher2Name}
                              </div>
                            )}
                          </div>
                          <div
                            className={classNames('col-12', Style.datetime_box)}
                          >
                            <h6>Contact:</h6>
                            {contactName && (
                              <div>
                                {contactName},{' '}
                                <div>
                                  <a href={`tel:${phone1}`}>{phone1}</a>
                                </div>
                                <div>
                                  <a href={`mailto:${contactEmail}`}>
                                    {contactEmail}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {(description || notes) && (
                <div className="fullBlk tw-mt-10">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: description,
                    }}
                  />
                  <div
                    className="tw-mt-2"
                    dangerouslySetInnerHTML={{
                      __html: notes,
                    }}
                  />
                </div>
              )}
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
        ></ProgramQuestionnaire>
      )}
    </>
  );
};
