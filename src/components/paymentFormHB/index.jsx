/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  AgreementForm,
  AttendanceForm,
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
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Auth, isEmpty, phoneRegExp } from '@utils';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Yup from 'yup';
import {
  ALERT_TYPES,
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
import { api, priceCalculation } from '@utils';
import { filterAllowedParams } from '@utils/utmParam';

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

export const PaymentFormHB = ({
  workshop = {},
  enrollmentCompletionAction = () => {},
  handleCouseSelection = () => {},
  login = () => {},
  isLoggedUser = false,
}) => {
  const { showAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const stripe = useStripe();
  const { profile, passwordLess } = useAuth();
  const { signOut } = passwordLess;
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

  const { data: corporates } = useQuery({
    queryKey: 'corporates',
    queryFn: async () => {
      const response = await api.get({
        path: 'getCorporates',
      });
      return response;
    },
  });

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

  const logout = async (e) => {
    if (e) e.preventDefault();
    await signOut();
    router.push(
      `/us-en/signin?next=${encodeURIComponent(location.pathname + location.search)}`,
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
      contactTitle,
      contactHealthcareOrganisation,
      contactOtherHealthcareOrganization,
      contactDegree,
      claimingType,
      certificateOfAttendance,
      contactClaimingTypeOther,
      email,
    } = values;

    if (
      paymentMode !== PAYMENT_MODES.STRIPE_PAYMENT_MODE &&
      isPaymentRequired
    ) {
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
        (paymentMethod.type !== 'card' || isChangingCard)
      ) {
        const cardElement = elements.getElement(CardElement);
        let createTokenRespone = await stripe.createToken(cardElement, {
          name: profile.name ? profile.name : firstName + ' ' + lastName,
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
              const value = values[product.productName] || values['CME'];
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
            contactTitle,
            contactHealthcareOrganisation,
            contactOtherHealthcareOrganization,
            contactDegree,
            claimingType,
            certificateOfAttendance,
            contactClaimingTypeOther,
          },
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

  const cmeAddOn = addOnProducts.find(({ isCMEAddOn }) => isCMEAddOn === true);

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

  const toggleDetailMobileModal = (isRegularPrice) => (isRegularPrice) => {
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

  return (
    <>
      <Formik
        initialValues={{
          CME: cmeAddOn ? true : false,
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
          contactTitle: '',
          contactHealthcareOrganisation: '',
          contactOtherHealthcareOrganization: '',
          contactDegree: '',
          claimingType: '',
          certificateOfAttendance: '',
          contactClaimingTypeOther: '',
          cmeAgreeToShareData: true,
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().required('First Name is required'),
          lastName: Yup.string().required('Last Name is required'),
          contactPhone: Yup.string()
            .required('required')
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
          contactTitle: Yup.string().required('Title is required'),
          contactHealthcareOrganisation: Yup.string().required(
            'Healthcare Organization is required',
          ),
          contactOtherHealthcareOrganization: Yup.string()
            .ensure()
            .when('contactHealthcareOrganisation', {
              is: 'other',
              then: Yup.string().required(
                'Other Healthcare Organization is required',
              ),
            }),
          contactDegree: Yup.string().required(
            'Degree/Qualifications is required',
          ),
          claimingType: Yup.string().when('CME', {
            is: true,
            then: Yup.string().required('CE Claiming type is required'),
            otherwise: Yup.string().notRequired(),
          }),
          certificateOfAttendance: Yup.string().when('CME', {
            is: true,
            then: Yup.string().required(
              'I would like to get the following is required',
            ),
            otherwise: Yup.string().notRequired(),
          }),
          contactClaimingTypeOther: cmeAddOn
            ? Yup.string().when('claimingType', {
                is: (claimingType) => claimingType === 'Other',
                then: Yup.string().required('Other is required'),
              })
            : Yup.mixed().notRequired(),
          cmeAgreeToShareData: Yup.bool().when('CME', {
            is: true,
            then: Yup.bool().oneOf([true], 'Must be checked'),
            otherwise: Yup.bool().notRequired(),
          }),
        })}
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
                  (!isAddOnSelectionRequired &&
                    (values[productName] || values['CME'])) ||
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
              {loading && <div className="cover-spin"></div>}
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
                  <p className="tw-my-5 tw-ml-2 tw-text-[14px] tw-text-[#31364e]">
                    If claiming CME / CE credits, your name in the program
                    registration should exactly match your name.
                  </p>
                  <div className="order__card">
                    <UserInfoForm
                      formikProps={formikProps}
                      isHBCheckout
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
                    {/* <input
                    id="discount-code"
                    type="text"
                    placeholder="Discount Code"
                  /> */}
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
                      onAccommodationChange={handleAccommodationChange}
                      paymentOptionChange={handlePaymentOptionChange}
                      showCouponCodeField={showCouponCodeField}
                      isUsableCreditAvailable={isUsableCreditAvailable}
                      UpdatedFeeAfterCredits={UpdatedFeeAfterCredits}
                      isComboDetailAvailable={isComboDetailAvailable}
                      values={values}
                      onComboDetailChange={handleComboDetailChange}
                      isCourseOptionRequired={isCourseOptionRequired}
                      cmeAddOn={cmeAddOn}
                    />
                  </div>
                  <AttendanceForm
                    formikProps={formikProps}
                    corporates={corporates}
                  />
                  <AgreementForm
                    formikProps={formikProps}
                    complianceQuestionnaire={complianceQuestionnaire}
                    isCorporateEvent={isCorporateEvent}
                    screen="MOBILE"
                  />
                  <div className="order__complete tw-mb-10">
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
                    cmeAddOn={cmeAddOn}
                  />

                  <div className="reciept__agreement">
                    <AgreementForm
                      formikProps={formikProps}
                      complianceQuestionnaire={complianceQuestionnaire}
                      isCorporateEvent={isCorporateEvent}
                      screen="DESKTOP"
                    />
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
        ></ProgramQuestionnaire>
      )}
    </>
  );
};
