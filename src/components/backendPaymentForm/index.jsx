/* eslint-disable jsx-a11y/anchor-is-valid */
import { Loader } from '@components';
import { DiscountCodeInput, Dropdown } from '@components/checkout';
import { ABBRS, ALERT_TYPES, MODAL_TYPES, US_STATES } from '@constants';
import { useGlobalAlertContext, useGlobalModalContext } from '@contexts';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { api, isEmpty, tConvert, phoneRegExp } from '@utils';
import classNames from 'classnames';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Field, Formik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import Style from './BackendPaymentForm.module.scss';
import { EmailField } from './EmailField';
import { PriceCalculationComponent } from './PriceCalculationComponent';
import { Radiobox } from './Radiobox';

dayjs.extend(isSameOrBefore);

const PARTIAL = 'partial';
const FULL = '';
const INSTALMENT = 'instalment';

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

export const BackendPaymentForm = ({
  useWorkshop = {},
  profile = {},
  coupon,
}) => {
  const [couponCode, setCouponCode] = useState(coupon);
  const [selectedComboBundle, setSelectedComboBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sameAsBillingCardDetail, setSameAsBillingCardDetail] = useState(true);
  const [showCouponCodeField, setShowCouponCodeField] = useState(true);
  const [discount, setDiscount] = useState(null);
  const [paymentMode, setPaymentMode] = useState(FULL);
  const [workshop, setWorkshop] = useState(useWorkshop);
  const [courseAddOnFee, setCourseAddOnFee] = useState(null);
  const [selectedComboCourseId, setSelectedComboCourseId] = useState(null);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState(null);
  const [selectedListPrice, setSelectedListPrice] = useState(null);
  let _cardElement;

  const { showAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const stripe = useStripe();
  const elements = useElements();

  const paymentOptionChangeAction = (mode) => {
    setPaymentMode(mode);
  };

  const applyDiscount = (discount) => {
    setDiscount(discount);
  };

  const selectPaymentPlan = (mode) => {
    setPaymentMode(mode);
  };

  const setFormInitialValues = () => {
    const secondPaymentDate = dayjs(
      workshop.remainPartialPaymentDateCap || workshop.eventStartDate,
    ).format('YYYY-MM-DD');
    return {
      firstName: '',
      lastName: '',
      email: '',
      confirmEmail: '',
      password: '',
      contactPhone: '',
      contactAddress: '',
      contactCity: '',
      contactState: '',
      contactZip: '',
      billingPhone: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      couponCode: couponCode ? couponCode : '',
      selectedPaymentOption: FULL,
      isChequePayment: false,
      isFirstChequePayment: false,
      isSecondChequePayment: false,
      chequeNumber: '',
      chequeRoutingNumber: '',
      firstChequeNumber: '',
      firstChequeRoutingNumber: '',
      secondChequeNumber: '',
      secondChequeRoutingNumber: '',
      secondPaymentDate,
      firstPaymentAmount: workshop.minimumPartialPayment || 0,
    };
  };

  const applyUser = ({ user, form }, workshop) => {
    if (user) {
      const {
        first_name,
        last_name,
        email,
        personMobilePhone,
        personMailingStreet,
        personMailingCity,
        personMailingState,
        personMailingPostalCode,
      } = user || {};
      const payload = setFormInitialValues();
      form.setValues({
        ...payload,
        firstName: first_name || '',
        lastName: last_name || '',
        email,
        contactPhone: personMobilePhone || '',
        contactAddress: personMailingStreet || '',
        contactCity: personMailingCity || '',
        contactState: personMailingState || '',
        contactZip: personMailingPostalCode || '',
        billingPhone: '',
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
      });
      if (!user) {
        _cardElement.clear();
        this.couponCodeInstance.refresh();
      }
    }
    setUser(user);
    if (workshop) {
      setWorkshop(workshop);
    }
  };

  const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      const intlCode = match[1] ? '+1 ' : '';
      return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
    }
    return phoneNumberString;
  };

  const sameAsBillingCardDetailAction = () => {
    setSameAsBillingCardDetail(
      (sameAsBillingCardDetail) => !sameAsBillingCardDetail,
    );
  };

  const onEnrollmentComplete = (
    data,
    selectedPaymentOption,
    handleModalToggle,
  ) => {
    return (
      <div className="alert__modal modal-window modal-window_no-log modal fixed-right fade active show">
        <div className=" modal-dialog modal-dialog-centered active">
          <div className="modal-content">
            <h2 className="modal-content-title">
              Enrollment Completed Successfully.
            </h2>
            {selectedPaymentOption === PARTIAL &&
              data.message !== null &&
              data.message}
            {selectedPaymentOption !== PARTIAL && (
              <div className="modal-content-text tw-text-left">
                An email notification will be sent to the participant with the
                following actions required:
                <ol className="pl-5 tw-list-decimal tw-space-y-3">
                  <li>
                    Participant will need to consent to the Program Participant
                    Agreement (PPA).
                  </li>
                  <li>
                    Participant will need to consent to the Health declaration
                    (displayed below).
                  </li>
                  <li>
                    If there is a pending payment, they will need to bring it
                    along with the registration confirmation at the start of the
                    program.
                  </li>
                </ol>
              </div>
            )}
            <p className="tw-flex tw-justify-center">
              <a
                href="#"
                className="btn btn-lg btn-primary tw-mt-6"
                onClick={handleModalToggle}
              >
                Close
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const completeEnrollmentAction = async (values, resetForm) => {
    const {
      availableTimings,
      isGenericWorkshop,
      id: productId,
      addOnProducts,
      product,
    } = workshop;

    const {
      selectedAddOn,
      contactPhone,
      contactAddress,
      contactCity,
      contactState,
      contactZip,
      billingPhone,
      billingAddress,
      billingCity,
      billingState,
      billingZip,
      couponCode,
      firstName,
      lastName,
      email,
      selectedPaymentOption,
      isChequePayment,
      isFirstChequePayment,
      isSecondChequePayment,
      chequeNumber,
      chequeRoutingNumber,
      firstChequeNumber,
      firstChequeRoutingNumber,
      secondChequeNumber,
      secondChequeRoutingNumber,
      secondPaymentDate,
      firstPaymentAmount,
      accommodation,
    } = values;

    if (!loading) {
      try {
        setLoading(true);
        let tokenizeCC = null;
        if (
          (selectedPaymentOption !== PARTIAL && !isChequePayment) ||
          (selectedPaymentOption === PARTIAL &&
            (!isFirstChequePayment || !isSecondChequePayment))
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
              },
            };

        let shoppingRequest = {
          contactAddress: {
            contactPhone,
            contactAddress,
            contactCity,
            contactState,
            contactZip,
          },
          billingAddress: {
            billingPhone:
              billingPhone || billingPhone.trim().length > 0
                ? billingPhone
                : contactPhone,
            billingAddress:
              billingAddress || billingAddress.trim().length > 0
                ? billingAddress
                : contactAddress,
            billingCity:
              billingCity || billingCity.trim().length > 0
                ? billingCity
                : contactCity,
            billingState:
              billingState || billingState.trim().length > 0
                ? billingState
                : contactState,
            billingZip:
              billingZip || billingZip.trim().length > 0
                ? billingZip
                : contactZip,
          },
          products,
        };

        // eslint-disable-next-line default-case
        switch (selectedPaymentOption) {
          case FULL:
            shoppingRequest = {
              ...shoppingRequest,
              couponCode: showCouponCodeField ? couponCode : '',
            };
            if (isChequePayment) {
              shoppingRequest = {
                ...shoppingRequest,
                isOneTimeChequePayment: true,
                oneTimeChequePaymentInformation: {
                  chequeNumber,
                  chequeRoutingNumber,
                },
              };
            } else {
              shoppingRequest = {
                ...shoppingRequest,
                tokenizeCC,
              };
            }
            break;
          case INSTALMENT:
            shoppingRequest = {
              ...shoppingRequest,
              isInstalmentOpted: true,
              tokenizeCC,
            };
            break;
          case PARTIAL:
            // eslint-disable-next-line no-case-declarations
            let partialPayment = {
              amountPayingNow: firstPaymentAmount,
              isCurrentAmountFromCheque: false,
              isRemainingAmountFromCheque: false,
              dateForRemainingAmount: secondPaymentDate,
            };
            if (isFirstChequePayment) {
              partialPayment = {
                ...partialPayment,
                isCurrentAmountFromCheque: true,
                currentAmountChequeInformation: {
                  chequeNumber: firstChequeNumber,
                  chequeRoutingNumber: firstChequeRoutingNumber,
                },
              };
            }
            if (isSecondChequePayment) {
              partialPayment = {
                ...partialPayment,
                isRemainingAmountFromCheque: true,
                remainingAmountChequeInformation: {
                  chequeNumber: secondChequeNumber,
                  chequeRoutingNumber: secondChequeRoutingNumber,
                },
              };
            }
            if (!isFirstChequePayment || !isSecondChequePayment) {
              shoppingRequest = {
                ...shoppingRequest,
                tokenizeCC,
              };
            }
            shoppingRequest = {
              ...shoppingRequest,
              couponCode,
              isPartialPayment: true,
              partialPayment,
            };
            break;
        }

        let payLoad = {
          isBackendRequest: true,
          shoppingRequest: {
            ...shoppingRequest,
          },
        };
        payLoad = {
          ...payLoad,
          user: {
            firstName,
            lastName,
            email,
          },
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
          setUser(null);
          showModal(MODAL_TYPES.EMPTY_MODAL, {
            title: 'Enrollment Completed Successfully.',
            children: (handleModalToggle) =>
              onEnrollmentComplete(
                data,
                selectedPaymentOption,
                handleModalToggle,
              ),
          });
        }

        // const { trackingActions } = this.props;
        // trackingActions.paymentConfirmation(
        //   { ...product, ...data },
        //   "workshop",
        //   couponCode || "",
        // );
        resetForm(setFormInitialValues());
      } catch (ex) {
        console.log(ex);
        const data = ex.response?.data;
        const { message, statusCode } = data || {};
        setLoading(false);
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: message ? `Error: ${message} (${statusCode})` : ex.message,
        });
      }
    }
  };

  const toggleCouponCodeFieldAction = (e) => {
    if (e) e.preventDefault();
    setShowCouponCodeField((showCouponCodeField) => !showCouponCodeField);
  };

  const updateCourseAddOnFee = (values) => {
    const { addOnProducts, groupedAddOnProducts } =
      useWorkshop || workshop || {};

    const expenseAddOn = addOnProducts.find(
      (product) => product.isExpenseAddOn,
    );

    const hasGroupedAddOnProducts =
      groupedAddOnProducts &&
      !isEmpty(groupedAddOnProducts) &&
      'Residential Add On' in groupedAddOnProducts &&
      groupedAddOnProducts['Residential Add On'].length > 0;

    const addOnFee = addOnProducts.reduce(
      (
        previousValue,
        { unitPrice, isAddOnSelectionRequired, productName, isExpenseAddOn },
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
      (values.accommodation?.isExpenseAddOn
        ? expenseAddOn?.unitPrice || 0
        : (values.accommodation?.unitPrice || 0) +
          (values.accommodation ? expenseAddOn?.unitPrice || 0 : 0)) + addOnFee;

    setCourseAddOnFee(totalFee);
  };

  const handleAccommodationChange = (formikProps, value) => {
    formikProps.setFieldValue('accommodation', value);
    const { values } = formikProps;
    values['accommodation'] = value;
    updateCourseAddOnFee(values);
  };

  const handleAddOnSelection = (formikProps, productName, value) => {
    formikProps.setFieldValue(productName, value);
    const { values } = formikProps;
    values[productName] = value;
    updateCourseAddOnFee(values);
  };

  const handleComboDetailChange = (
    formikProps,
    comboDetailProductSfid,
    selectedComboBundle,
  ) => {
    formikProps.setFieldValue('comboDetailId', comboDetailProductSfid);
    toggleCouponCodeFieldAction();
    const { values } = formikProps;
    if (comboDetailProductSfid === id) {
      setSelectedComboCourseId(null);
    } else {
      setSelectedComboCourseId(comboDetailProductSfid);
    }
    const updatedPartialPaymentValue =
      selectedComboBundle?.minimumPartialPaymentOnBundle ||
      useWorkshop?.minimumPartialPayment ||
      1;
    values['firstPaymentAmount'] = updatedPartialPaymentValue;
    setSelectedComboBundle(selectedComboBundle);
  };

  const {
    id,
    title,
    shortAddress,
    email,
    contactName,
    formattedStartDate,
    formattedEndDate,
    formattedStartDateOnly,
    formattedEndDateOnly,
    formattedWeekDay,
    formattedWeekEnd,
    courseId,
    phone1,
    primaryTeacherName,
    primaryTeacherPic,
    coTeacher1Name,
    coTeacher1Pic,
    coTeacher2Name,
    coTeacher2Pic,
    listPrice,
    unitPrice,
    savingFromOfferings,
    priceBookName,
    earlyBirdDays,
    isEarlyBirdAllowed,
    instalmentAmount,
    instalmentTenure,
    instalmentGap,
    instalmentGapUnit,
    earlyBirdEndDate,
    showPrice,
    earlyBirdFeeIncreasing,
    isGenericWorkshop,
    name,
    eventStartTime,
    eventEndTime,
    availableBundles,
    addOnProducts,
    usableCredit,
    eventStartDate,
    isPartialPaymentAllowed,
    minimumPartialPayment,
    groupedAddOnProducts,
    remainPartialPaymentDateCap,
    timings,
  } = workshop;

  const comboPrice = availableBundles?.find(
    (availableBundle) =>
      selectedComboCourseId === availableBundle.comboProductSfid,
  );

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
    if (usableCredit.availableCredit > unitPrice) {
      UpdatedFeeAfterCredits = 0;
    } else {
      UpdatedFeeAfterCredits = unitPrice - usableCredit.availableCredit;
    }
  }

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

  const isComboDetailAvailable = availableBundles?.length > 0;

  return (
    <>
      {loading && <Loader />}
      <div className="col-md-6 col-sm-6 col-xs-12 wlc_left_wrap">
        <div className="row">
          <div className="col-sm-12">
            <h2 className="title tw-text-5xl">{title}</h2>
            {!isGenericWorkshop && (
              <div className="row">
                <div className="col-sm-12 col-12 datetime-box">
                  <h6>Timings:</h6>
                  {timings &&
                    timings.map((time) => {
                      return (
                        <div key={time.startDate}>
                          {`${dayjs
                            .utc(time.startDate)
                            .format('dd')}: ${tConvert(
                            time.startTime,
                          )}-${tConvert(time.endTime)} ${ABBRS[time.timeZone]}`}
                        </div>
                      );
                    })}
                </div>
                {/* <div className="col-sm-6 col-12 datetime-box">
                  <h6>Time:</h6>
                  <div>Weekdays: {formattedWeekDay}</div>
                  <div>Weekend: {formattedWeekEnd}</div>
                </div> */}
              </div>
            )}
            {/* <p>Venue: {shortAddress}</p> */}
          </div>

          <div className="col-sm-12 workshopCourseBlk">
            <div className="row">
              <div className="col-sm-12 col-md-6 leftBlk">
                <p>Course ID: {name}</p>

                <PriceCalculationComponent
                  // groupedAddOnProductsFirst={groupedAddOnProductsFirst}
                  // addOnProductFirst={addOnProductFirst}
                  listPrice={listPrice}
                  unitPrice={unitPrice}
                  courseAddOnFee={courseAddOnFee}
                  savingFromOfferings={savingFromOfferings}
                  priceBookName={priceBookName}
                  earlyBirdDays={earlyBirdDays}
                  isEarlyBirdAllowed={isEarlyBirdAllowed}
                  selectedUnitPrice={selectedUnitPrice}
                  selectedListPrice={selectedListPrice}
                  discount={discount}
                  paymentMode={paymentMode}
                  instalmentAmount={instalmentAmount}
                  instalmentTenure={instalmentTenure}
                  instalmentGap={instalmentGap}
                  instalmentGapUnit={instalmentGapUnit}
                  earlyBirdEndDate={earlyBirdEndDate}
                  showPrice={showPrice}
                  comboPrice={comboPrice}
                />
                {earlyBirdFeeIncreasing && (
                  <p>
                    Register soon. Course fee will go up by $
                    {earlyBirdFeeIncreasing.increasingFee} on{' '}
                    {earlyBirdFeeIncreasing.increasingBy}
                  </p>
                )}
                {isUsableCreditAvailable && (
                  <p>
                    {usableCredit.message} ${UpdatedFeeAfterCredits}.
                  </p>
                )}
              </div>
              <div className="col-sm-12 col-md-6 rightBlk">
                <p>
                  Contact: {contactName},{' '}
                  <a href={`tel:${phone1}`}>{phone1},</a>
                </p>
                <p>
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              </div>
              {!isGenericWorkshop && (
                <div className="col-sm-12 teacherWrap extrMrg">
                  <span className="name">Teacher:</span>
                  <div className="row">
                    {primaryTeacherName && (
                      <div className="col-sm-12">
                        <img
                          className="img"
                          src={primaryTeacherPic || '/img/user.png'}
                        />
                        <a href="#" className="name">
                          {primaryTeacherName}
                        </a>
                      </div>
                    )}
                    {coTeacher1Name && (
                      <div className="col-sm-12">
                        {'  '}
                        <img
                          className="img"
                          src={coTeacher1Pic || '/img/user.png'}
                        />
                        <a href="#" className="name">
                          {coTeacher1Name}
                        </a>
                      </div>
                    )}
                    {coTeacher2Name && (
                      <div className="col-sm-12">
                        {'  '}
                        <img
                          className="img"
                          src={coTeacher2Pic || '/img/user.png'}
                        />
                        <a href="#" className="name">
                          {coTeacher2Name}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-sm-6 col-xs-12 form_right_wrap">
        <Formik
          enableReinitialize
          initialValues={setFormInitialValues()}
          validationSchema={Yup.object().shape({
            firstName: Yup.string().required('First Name is required!'),
            lastName: Yup.string().required('Last Name is required!'),
            email: Yup.string()
              .email('Email is invalid!')
              .required('Email is required!'),
            confirmEmail: Yup.string()
              .required('Confirm Email is required!')
              .oneOf([Yup.ref('email')], 'Emails must match'),
            contactPhone: Yup.string()
              .required('Phone number required')
              .matches(phoneRegExp, 'Phone number is not valid'),
            contactAddress: Yup.string().required('Address is required!'),
            contactCity: Yup.string().required('City is required!'),
            contactState: Yup.string().required('State is required!'),
            contactZip: Yup.string()
              .required('Zip is required!')
              //.matches(/^[0-9]+$/, { message: 'Zip is invalid!' })
              .min(2, 'Zip is invalid!')
              .max(10, 'Zip is invalid!'),
            billingZip: Yup.string()
              //.matches(/^[0-9]+$/, { message: 'Zip is invalid!' })
              .min(2, 'Zip is invalid!')
              .max(10, 'Zip is invalid!'),
            chequeNumber: Yup.string().when(
              ['isChequePayment', 'selectedPaymentOption'],
              {
                is: (isChequePayment, selectedPaymentOption) =>
                  isChequePayment && selectedPaymentOption !== PARTIAL,
                then: Yup.string().required('Check number is required!'),
              },
            ),
            chequeRoutingNumber: Yup.string().when(
              ['isChequePayment', 'selectedPaymentOption'],
              {
                is: (isChequePayment, selectedPaymentOption) =>
                  isChequePayment && selectedPaymentOption !== PARTIAL,
                then: Yup.string().required('Routing number is required!'),
              },
            ),
            firstChequeNumber: Yup.string().when(
              ['isFirstChequePayment', 'selectedPaymentOption'],
              {
                is: (isFirstChequePayment, selectedPaymentOption) =>
                  isFirstChequePayment && selectedPaymentOption === PARTIAL,
                then: Yup.string().required('Check number is required!'),
              },
            ),
            firstChequeRoutingNumber: Yup.string().when(
              ['isFirstChequePayment', 'selectedPaymentOption'],
              {
                is: (isFirstChequePayment, selectedPaymentOption) =>
                  isFirstChequePayment && selectedPaymentOption === PARTIAL,
                then: Yup.string().required('Routing number is required!'),
              },
            ),
            secondChequeNumber: Yup.string().when(
              ['isSecondChequePayment', 'selectedPaymentOption'],
              {
                is: (isSecondChequePayment, selectedPaymentOption) =>
                  isSecondChequePayment && selectedPaymentOption === PARTIAL,
                then: Yup.string().required('Check number is required!'),
              },
            ),
            secondChequeRoutingNumber: Yup.string().when(
              ['isSecondChequePayment', 'selectedPaymentOption'],
              {
                is: (isSecondChequePayment, selectedPaymentOption) =>
                  isSecondChequePayment && selectedPaymentOption === PARTIAL,
                then: Yup.string().required('Routing number is required!'),
              },
            ),
            secondPaymentDate: Yup.string().when(
              ['isSecondChequePayment', 'selectedPaymentOption'],
              {
                is: (isSecondChequePayment, selectedPaymentOption) => {
                  return (
                    !isSecondChequePayment && selectedPaymentOption === PARTIAL
                  );
                },
                then: Yup.string()
                  .required('Payment date is required!')
                  .test({
                    name: 'max',
                    exclusive: true,
                    params: { eventStartDate },
                    message: `Payment date must be on or before ${dayjs(
                      selectedComboBundle?.remainPartialPaymentDateCap ||
                        remainPartialPaymentDateCap ||
                        eventStartDate,
                    ).format('MM/DD/YYYY')}`,
                    test: (value) => {
                      return dayjs(value, [
                        'MM-DD-YYYY',
                        'YYYY-MM-DD',
                      ]).isSameOrBefore(
                        dayjs(
                          selectedComboBundle?.remainPartialPaymentDateCap ||
                            remainPartialPaymentDateCap ||
                            eventStartDate,
                        ),
                      );
                    },
                  })
                  .test({
                    name: 'min',
                    exclusive: true,
                    params: { eventStartDate },
                    message: `Payment date must be after today`,
                    test: (value) => {
                      return dayjs(value, ['MM-DD-YYYY', 'YYYY-MM-DD']).isAfter(
                        dayjs(new Date()),
                      );
                    },
                  }),
              },
            ),
            firstPaymentAmount: Yup.number().when('selectedPaymentOption', {
              is: (selectedPaymentOption) => {
                return selectedPaymentOption === PARTIAL;
              },
              then: Yup.number()
                .required('Amount is required!')
                .test({
                  name: 'min',
                  exclusive: true,
                  params: { eventStartDate },
                  message: `Amount should not be less then ${
                    selectedComboBundle?.minimumPartialPaymentOnBundle ||
                    minimumPartialPayment ||
                    1
                  }`,
                  test: (value) => {
                    return (
                      value >=
                      (selectedComboBundle?.minimumPartialPaymentOnBundle ||
                        minimumPartialPayment ||
                        1)
                    );
                  },
                }),
            }),
            accommodation: isAccommodationRequired
              ? Yup.object().required('Room & Board is required!')
              : Yup.mixed().notRequired(),
          })}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            await completeEnrollmentAction(values, resetForm);
          }}
        >
          {(formikProps) => {
            const {
              values,
              touched,
              errors,
              dirty,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
              handleReset,
              submitCount,
              isValid,
            } = formikProps;

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

            return (
              <form
                name="workshopEnroll"
                onSubmit={handleSubmit}
                className="workshopEnroll tw-bg-white tw-p-4 tw-shadow-lg"
              >
                <div className="row">
                  <div className="col-sm-12 heading_info">
                    <p>User Information:</p>
                  </div>
                  <div className="col-sm-6">
                    <div
                      className={classNames('input-group inputLabel_place', {
                        'text-input-error':
                          errors.firstName && touched.firstName,
                      })}
                    >
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        placeholder=" "
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.firstName}
                        name="firstName"
                        maxLength={80}
                      />
                      <label htmlFor="firstName">
                        {errors.firstName && touched.firstName
                          ? errors.firstName
                          : 'First Name'}
                      </label>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div
                      className={classNames('input-group inputLabel_place', {
                        'text-input-error': errors.lastName && touched.lastName,
                      })}
                    >
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        placeholder=" "
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.lastName}
                        name="lastName"
                        maxLength={80}
                      />
                      <label htmlFor="lastName">
                        {errors.lastName && touched.lastName
                          ? errors.lastName
                          : 'Last Name'}
                      </label>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <Field name="email">
                      {({ field, form }) => (
                        <EmailField
                          name="email"
                          field={field}
                          form={form}
                          productId={workshop.sfid}
                          parentClassName="aol_intGroup"
                          placeholder="Email"
                          applyUser={applyUser}
                          user={user}
                          withLabel={true}
                          disabled={loading}
                        />
                      )}
                    </Field>
                  </div>
                  <div className="col-sm-12">
                    <div
                      className={classNames('input-group aol_intGroup', {
                        'text-input-error':
                          errors.confirmEmail && touched.confirmEmail,
                      })}
                    >
                      <input
                        type="email"
                        id="confirmEmail"
                        placeholder="Confirm Email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.confirmEmail}
                        name="confirmEmail"
                        onCut={(event) => {
                          event.preventDefault();
                        }}
                        onCopy={(event) => {
                          event.preventDefault();
                        }}
                        onPaste={(event) => {
                          event.preventDefault();
                        }}
                      />
                      <label htmlFor="confirmEmail">
                        {errors.confirmEmail && touched.confirmEmail
                          ? errors.confirmEmail
                          : 'Confirm Email'}
                      </label>
                    </div>

                    {/*<div
                    className={classNames('input-group inputLabel_place', {
                      'text-input-error': errors.email && touched.email
                    })}
                  >
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder=" "
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                      name="email"
                    />
                    <label htmlFor="email">
                      {errors.email && touched.email ? errors.email : 'Email'}
                    </label>
                  </div>*/}
                  </div>

                  {isComboDetailAvailable && (
                    <>
                      <div className="col-sm-12 heading_info">
                        <p>Course Options:</p>
                      </div>
                      <div className="reciept__payment reciept__header mt-4 ml-4">
                        <div className="reciept__payment-option">
                          <input
                            className="custom-radio"
                            type="radio"
                            name="payment"
                            id={id}
                            checked={
                              values.comboDetailId
                                ? values.comboDetailId === id
                                : true
                            }
                            onChange={() =>
                              handleComboDetailChange(formikProps, id, null)
                            }
                          />
                          <label htmlFor="payment-lg-meditation">
                            <span>{title}: </span>
                            <span>${unitPrice}</span>
                          </label>
                        </div>
                        {availableBundles.map((availableBundle) => {
                          const isChecked =
                            values.comboDetailId ===
                            availableBundle.comboProductSfid;
                          return (
                            <>
                              <div className="reciept__payment-option reciept__payment-option_special-offer">
                                <span
                                  className={classNames(Style.special_offer)}
                                >
                                  Special Offer
                                </span>
                                <input
                                  className="custom-radio"
                                  type="radio"
                                  name="payment"
                                  id={availableBundle.comboProductSfid}
                                  checked={isChecked}
                                  onChange={() =>
                                    handleComboDetailChange(
                                      formikProps,
                                      availableBundle.comboProductSfid,
                                      availableBundle,
                                    )
                                  }
                                />
                                <label htmlFor="payment-lg-retreat">
                                  <span>{availableBundle.comboName}: </span>
                                  <span>${availableBundle.comboUnitPrice}</span>
                                </label>
                              </div>
                              <div className="reciept__payment-tooltip">
                                {availableBundle.comboDescription || ''}
                              </div>
                            </>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {groupedAddOnProducts && !isEmpty(groupedAddOnProducts) && (
                    <>
                      <div className="col-sm-12 heading_info">
                        <p>Addon Information:</p>
                      </div>
                      <ul className="reciept__payment_list mt-3">
                        {addOnProducts.map((product) => {
                          if (
                            !product.isExpenseAddOn ||
                            (product.isExpenseAddOn && !hasGroupedAddOnProducts)
                          ) {
                            const isChecked = product.isAddOnSelectionRequired
                              ? true
                              : values[product.productName];

                            return (
                              <li key={product.productSfid}>
                                <span>
                                  {!product.isAddOnSelectionRequired && (
                                    <input
                                      type="checkbox"
                                      className="custom-checkbox"
                                      placeholder=" "
                                      checked={isChecked}
                                      onClick={(e) =>
                                        handleAddOnSelection(
                                          formikProps,
                                          product.productName,
                                          e.target.checked,
                                        )
                                      }
                                      value={product.productName}
                                      name={product.productName}
                                      id={product.productSfid}
                                      disabled={
                                        product.isAddOnSelectionRequired
                                      }
                                    />
                                  )}
                                  <label htmlFor={product.productSfid}></label>
                                  <span className="ml-2">
                                    {product.productName}:
                                  </span>
                                </span>
                                <span className="ml-2">
                                  ${product.unitPrice}
                                </span>
                              </li>
                            );
                          }
                        })}
                      </ul>
                      {/* <div className="col-sm-12">
                      <h6
                        style={{ padding: '10px 0px' }}
                        className={classNames({
                          'group-error': errors.selectedAddOn,
                        })}
                      >
                        <i className="fas fa-cart-plus" /> Accommodation :
                      </h6>
                      {groupedAddOnProducts.map(this.groupAddOnSelectItem)}
                    </div> */}
                      {hasGroupedAddOnProducts && (
                        <div className="col-sm-12">
                          <h6
                            className={classNames('tw-px-[10px] tw-py-0', {
                              'group-error': errors.selectedAddOn,
                            })}
                          >
                            <i className="fas fa-cart-plus" /> Room &amp; Board{' '}
                            {isOfflineExpense && '*'}
                          </h6>
                          <div
                            className={classNames(
                              'select-room select-room_rounded',
                              {
                                'no-valid':
                                  errors.accommodation && touched.accommodation,
                              },
                            )}
                          >
                            <div tabIndex="1" className="select-room__current">
                              <span className="select-room__placeholder">
                                Select Room &amp; Board
                              </span>
                              {groupedAddOnProducts['Residential Add On'].map(
                                (residentialAddOn) => {
                                  return (
                                    <div
                                      className="select-room__value"
                                      key={residentialAddOn.productSfid}
                                    >
                                      <input
                                        type="radio"
                                        id={residentialAddOn.productSfid}
                                        value={residentialAddOn.unitPrice}
                                        name="room-lg"
                                        className="select-room__input"
                                      />
                                      <span className="select-room__input-text">
                                        {residentialAddOn.productName}{' '}
                                        <span className="price">
                                          $
                                          {residentialAddOn.unitPrice +
                                            (expenseAddOn?.unitPrice || 0)}
                                        </span>
                                      </span>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                            <ul className="select-room__list">
                              {groupedAddOnProducts['Residential Add On'].map(
                                (residentialAddOn) => {
                                  return (
                                    <li
                                      key={residentialAddOn.productSfid}
                                      onClick={() =>
                                        handleAccommodationChange(
                                          formikProps,
                                          residentialAddOn,
                                        )
                                      }
                                      className={
                                        residentialAddOn.isFull &&
                                        'tw-pointer-events-none tw-opacity-60'
                                      }
                                    >
                                      <label
                                        htmlFor={residentialAddOn.productSfid}
                                        aria-hidden="aria-hidden"
                                        data-value={residentialAddOn.unitPrice}
                                        className="select-room__option"
                                      >
                                        <span>
                                          {residentialAddOn.productName}
                                        </span>
                                        {residentialAddOn.isFull && (
                                          <span className="tw-dark:bg-gray-700 tw-dark:text-gray-500 tw-rounded tw-bg-gray-100 tw-px-2.5 tw-py-0.5 tw-text-xs tw-text-gray-800">
                                            Full
                                          </span>
                                        )}
                                        <span className="price">
                                          $
                                          {residentialAddOn.unitPrice +
                                            (expenseAddOn?.unitPrice || 0)}
                                        </span>
                                      </label>
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          </div>
                          {isOfflineExpense && (
                            <div className="reciept__payment-tooltip reciept__payment-tooltip_small mt-2">
                              * Expences to be collected offline
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="col-sm-12 heading_info">
                    <p>Contact Information:</p>
                  </div>
                  <div className="col-sm-6">
                    <div
                      className={classNames('input-group inputLabel_place', {
                        'text-input-error':
                          errors.contactPhone && touched.contactPhone,
                      })}
                    >
                      <input
                        type="text"
                        id="contactPhone"
                        className="form-control"
                        placeholder=" "
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={formatPhoneNumber(values.contactPhone)}
                        name="contactPhone"
                        disabled={loading}
                        maxLength={14}
                      />
                      <label htmlFor="contactPhone">
                        {errors.contactPhone && touched.contactPhone
                          ? errors.contactPhone
                          : 'Phone'}
                      </label>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div
                      className={classNames('input-group inputLabel_place', {
                        'text-input-error':
                          errors.contactAddress && touched.contactAddress,
                      })}
                    >
                      <input
                        type="text"
                        className="form-control"
                        id="contactAddress"
                        placeholder=" "
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.contactAddress}
                        name="contactAddress"
                        disabled={loading}
                      />
                      <label htmlFor="contactAddress">
                        {errors.contactAddress && touched.contactAddress
                          ? errors.contactAddress
                          : 'Address'}
                      </label>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div
                      className={classNames('input-group inputLabel_place', {
                        'text-input-error':
                          errors.contactCity && touched.contactCity,
                      })}
                    >
                      <input
                        type="text"
                        className="form-control"
                        id="contactCity"
                        placeholder=" "
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.contactCity}
                        name="contactCity"
                        disabled={loading}
                      />
                      <label htmlFor="contactCity">
                        {errors.contactCity && touched.contactCity
                          ? errors.contactCity
                          : 'City'}
                      </label>
                    </div>
                  </div>

                  <div className="col-sm-6!">
                    <Field name="contactState">
                      {({ field, form }) => {
                        return (
                          <div
                            className={classNames('tw-mt-[32px]', {
                              'text-input-error':
                                errors.contactState && touched.contactState,
                            })}
                          >
                            <Dropdown
                              formikProps={formikProps}
                              formikKey="contactState"
                              options={US_STATES}
                              fullWidth
                            ></Dropdown>
                          </div>
                        );
                      }}
                    </Field>
                  </div>

                  <div className="col-sm-6">
                    <div
                      className={classNames('input-group inputLabel_place', {
                        'text-input-error':
                          errors.contactZip && touched.contactZip,
                      })}
                    >
                      <input
                        type="text"
                        className="form-control"
                        id="contactZip"
                        placeholder=" "
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.contactZip}
                        name="contactZip"
                        disabled={loading}
                      />
                      <label htmlFor="contactZip">
                        {errors.contactZip && touched.contactZip
                          ? errors.contactZip
                          : 'Zip Code'}
                      </label>
                    </div>
                  </div>
                  <div className="col-sm-12 heading_info">
                    <p>Billing Information:</p>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-check custom_check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value=""
                        id="SameAsBilling"
                        checked={sameAsBillingCardDetail}
                        onChange={sameAsBillingCardDetailAction}
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="SameAsBilling"
                      >
                        Same as Contact Details
                      </label>
                    </div>
                  </div>
                  {values.selectedPaymentOption !== INSTALMENT && (
                    <div className="col-sm-12 tw-mt-6">
                      {showCouponCodeField && (
                        <DiscountCodeInput
                          placeholder="Discount Code"
                          formikProps={formikProps}
                          formikKey="couponCode"
                          product={workshop.sfid}
                          applyDiscount={applyDiscount}
                          addOnProducts={addOnProducts}
                          userId={user?.id}
                          isBackendRequest
                        ></DiscountCodeInput>
                      )}
                    </div>
                  )}

                  {!sameAsBillingCardDetail && (
                    <>
                      <div className="col-sm-6">
                        <div
                          className={classNames(
                            'input-group inputLabel_place',
                            {
                              'text-input-error':
                                errors.billingPhone && touched.billingPhone,
                            },
                          )}
                        >
                          <input
                            type="text"
                            className="form-control"
                            id="billingPhone"
                            placeholder=" "
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="billingPhone"
                            value={formatPhoneNumber(values.billingPhone)}
                            disabled={loading}
                          />
                          <label htmlFor="billingPhone">
                            {errors.billingPhone && touched.billingPhone
                              ? errors.billingPhone
                              : 'Phone'}
                          </label>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div
                          className={classNames(
                            'input-group inputLabel_place',
                            {
                              'text-input-error':
                                errors.billingAddress && touched.billingAddress,
                            },
                          )}
                        >
                          <input
                            type="text"
                            className="form-control"
                            id="billingAddress"
                            placeholder=" "
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.billingAddress}
                            name="billingAddress"
                            disabled={loading}
                          />
                          <label htmlFor="billingAddress">
                            {errors.billingAddress && touched.billingAddress
                              ? errors.billingAddress
                              : 'Address'}
                          </label>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div
                          className={classNames(
                            'input-group inputLabel_place',
                            {
                              'text-input-error':
                                errors.billingCity && touched.billingCity,
                            },
                          )}
                        >
                          <input
                            type="text"
                            className="form-control"
                            id="billingCity"
                            placeholder=" "
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.billingCity}
                            name="billingCity"
                            disabled={loading}
                          />
                          <label htmlFor="billingCity">
                            {errors.billingCity && touched.billingCity
                              ? errors.billingCity
                              : 'City'}
                          </label>
                        </div>
                      </div>

                      <div className="col-sm-6!">
                        <Field name="billingState">
                          {({ field, form }) => {
                            return (
                              <div
                                className={classNames('tw-mt-[32px]', {
                                  'text-input-error tw-mt-20':
                                    errors.billingState && touched.billingState,
                                })}
                              >
                                <Dropdown
                                  formikProps={formikProps}
                                  formikKey="billingState"
                                  options={US_STATES}
                                  fullWidth
                                  valuePrefix="bs"
                                ></Dropdown>
                              </div>
                            );
                          }}
                        </Field>
                      </div>

                      <div className="col-sm-6">
                        <div
                          className={classNames(
                            'input-group inputLabel_place',
                            {
                              'text-input-error':
                                errors.billingZip && touched.billingZip,
                            },
                          )}
                        >
                          <input
                            type="text"
                            className="form-control"
                            id="billingZip"
                            placeholder=" "
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.billingZip}
                            name="billingZip"
                            disabled={loading}
                          />
                          <label htmlFor="billingZip">
                            {errors.billingZip && touched.billingZip
                              ? errors.billingZip
                              : 'Zip Code'}
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="col-sm-12 heading_info">
                    <p>Payment Options:</p>
                  </div>

                  <div className="col-sm-12">
                    <p>
                      <Radiobox
                        name="selectedPaymentOption"
                        group={'selectedPaymentOption'}
                        value={FULL}
                        dtype={1}
                        action={paymentOptionChangeAction}
                        label={`Full Payment`}
                      />
                    </p>
                    {workshop.isInstalmentAllowed && showCouponCodeField && (
                      <p>
                        <Radiobox
                          name="selectedPaymentOption"
                          group={'selectedPaymentOption'}
                          value={INSTALMENT}
                          dtype={1}
                          action={paymentOptionChangeAction}
                          label={`${workshop.instalmentTenure} Installment of $${workshop.instalmentAmount} every ${workshop.instalmentGap} ${workshop.instalmentGapUnit}(s)`}
                        />
                      </p>
                    )}
                    {isPartialPaymentAllowed && !selectedComboBundle && (
                      <p>
                        <Radiobox
                          name="selectedPaymentOption"
                          group={'selectedPaymentOption'}
                          value={PARTIAL}
                          dtype={1}
                          action={paymentOptionChangeAction}
                          label={`Partial Payment`}
                        />
                      </p>
                    )}
                    {selectedComboBundle &&
                      selectedComboBundle.isPartialPaymentAllowedOnBundle && (
                        <p>
                          <Radiobox
                            name="selectedPaymentOption"
                            group={'selectedPaymentOption'}
                            value={PARTIAL}
                            dtype={1}
                            action={paymentOptionChangeAction}
                            label={`Partial Payment`}
                          />
                        </p>
                      )}
                  </div>
                  <div className="col-sm-12 heading_info">
                    <p>Payment Type:</p>
                  </div>

                  {values.selectedPaymentOption === FULL && (
                    <>
                      <div className="col-sm-12">
                        <div className="form-check custom_check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id="isChequePayment"
                            name="isChequePayment"
                            onChange={handleChange}
                            checked={values.isChequePayment}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isChequePayment"
                          >
                            Payment by check?
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  {values.selectedPaymentOption !== PARTIAL && (
                    <>
                      {(!values.isChequePayment ||
                        values.selectedPaymentOption === INSTALMENT) && (
                        <div className="col-sm-12">
                          <div className="card-element-box">
                            <CardElement
                              onReady={(c) => (_cardElement = c)}
                              options={createOptions}
                            />
                          </div>
                        </div>
                      )}
                      {values.isChequePayment &&
                        values.selectedPaymentOption !== INSTALMENT && (
                          <>
                            <div className="col-sm-6">
                              <div
                                className={classNames(
                                  'input-group inputLabel_place',
                                  {
                                    'text-input-error':
                                      errors.chequeNumber &&
                                      touched.chequeNumber,
                                  },
                                )}
                              >
                                <input
                                  type="text"
                                  className="form-control"
                                  id="chequeNumber"
                                  placeholder=" "
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.chequeNumber}
                                  name="chequeNumber"
                                  disabled={loading}
                                />
                                <label htmlFor="chequeNumber">
                                  {errors.chequeNumber && touched.chequeNumber
                                    ? errors.chequeNumber
                                    : 'Check Number'}
                                </label>
                              </div>
                            </div>

                            <div className="col-sm-6">
                              <div
                                className={classNames(
                                  'input-group inputLabel_place',
                                  {
                                    'text-input-error':
                                      errors.chequeRoutingNumber &&
                                      touched.chequeRoutingNumber,
                                  },
                                )}
                              >
                                <input
                                  type="text"
                                  className="form-control"
                                  id="chequeRoutingNumber"
                                  placeholder=" "
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.chequeRoutingNumber}
                                  name="chequeRoutingNumber"
                                  disabled={loading}
                                />
                                <label htmlFor="chequeRoutingNumber">
                                  {errors.chequeRoutingNumber &&
                                  touched.chequeRoutingNumber
                                    ? errors.chequeRoutingNumber
                                    : 'Check Routing Number'}
                                </label>
                              </div>
                            </div>
                          </>
                        )}
                    </>
                  )}

                  {values.selectedPaymentOption === PARTIAL && (
                    <>
                      {(!values.isFirstChequePayment ||
                        !values.isSecondChequePayment) && (
                        <div className="col-sm-12">
                          <div className="card-element-box">
                            <CardElement options={createOptions} />
                          </div>
                        </div>
                      )}
                      <div className="col-sm-6 heading_info">
                        <p>First Payment:</p>
                      </div>
                      {false && (
                        <div className="col-sm-6">
                          <div className="form-check custom_check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              value=""
                              id="isFirstChequePayment"
                              name="isFirstChequePayment"
                              onChange={handleChange}
                              checked={values.isFirstChequePayment}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="isFirstChequePayment"
                            >
                              First Payment by cheque?
                            </label>
                          </div>
                        </div>
                      )}
                      <div className="col-sm-12">
                        <div
                          className={classNames(
                            'input-group inputLabel_place',
                            {
                              'text-input-error':
                                errors.firstPaymentAmount &&
                                touched.firstPaymentAmount,
                            },
                          )}
                        >
                          <input
                            type="number"
                            className="form-control"
                            id="firstPaymentAmount"
                            placeholder=" "
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.firstPaymentAmount}
                            name="firstPaymentAmount"
                            disabled={loading}
                            min={
                              selectedComboBundle?.minimumPartialPaymentOnBundle ||
                              workshop.minimumPartialPayment
                            }
                          />
                          <label htmlFor="firstPaymentAmount">
                            {errors.firstPaymentAmount &&
                            touched.firstPaymentAmount
                              ? errors.firstPaymentAmount
                              : 'First Payment Amount'}
                          </label>
                        </div>
                      </div>
                      {values.isFirstChequePayment && (
                        <>
                          <div className="col-sm-6">
                            <div
                              className={classNames(
                                'input-group inputLabel_place',
                                {
                                  'text-input-error':
                                    errors.firstChequeNumber &&
                                    touched.firstChequeNumber,
                                },
                              )}
                            >
                              <input
                                type="text"
                                className="form-control"
                                id="firstChequeNumber"
                                placeholder=" "
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.firstChequeNumber}
                                name="firstChequeNumber"
                                disabled={loading}
                              />
                              <label htmlFor="firstChequeNumber">
                                {errors.firstChequeNumber &&
                                touched.firstChequeNumber
                                  ? errors.firstChequeNumber
                                  : 'Check Number'}
                              </label>
                            </div>
                          </div>

                          <div className="col-sm-6">
                            <div
                              className={classNames(
                                'input-group inputLabel_place',
                                {
                                  'text-input-error':
                                    errors.firstChequeRoutingNumber &&
                                    touched.firstChequeRoutingNumber,
                                },
                              )}
                            >
                              <input
                                type="text"
                                className="form-control"
                                id="firstChequeRoutingNumber"
                                placeholder=" "
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.firstChequeRoutingNumber}
                                name="firstChequeRoutingNumber"
                                disabled={loading}
                              />
                              <label htmlFor="firstChequeRoutingNumber">
                                {errors.firstChequeRoutingNumber &&
                                touched.firstChequeRoutingNumber
                                  ? errors.firstChequeRoutingNumber
                                  : 'Check Routing Number'}
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="col-sm-6 heading_info">
                        <p>Second Payment:</p>
                      </div>
                      {false && (
                        <div className="col-sm-6">
                          <div className="form-check custom_check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              value=""
                              id="isSecondChequePayment"
                              name="isSecondChequePayment"
                              onChange={handleChange}
                              checked={values.isSecondChequePayment}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="isSecondChequePayment"
                            >
                              Second Payment by check?
                            </label>
                          </div>
                        </div>
                      )}
                      {!values.isSecondChequePayment && (
                        <div className="col-sm-12">
                          <div
                            className={classNames(
                              'input-group inputLabel_place',
                              {
                                'text-input-error':
                                  errors.secondPaymentDate &&
                                  touched.secondPaymentDate,
                              },
                            )}
                          >
                            <input
                              type="date"
                              className="form-control"
                              id="secondPaymentDate"
                              placeholder=" "
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.secondPaymentDate}
                              name="secondPaymentDate"
                              min={new Date().toISOString().split('T')[0]}
                              max={
                                new Date(
                                  selectedComboBundle?.remainPartialPaymentDateCap ||
                                    remainPartialPaymentDateCap ||
                                    eventStartDate,
                                )
                                  .toISOString()
                                  .split('T')[0]
                              }
                              disabled={loading}
                            />
                            <label htmlFor="secondPaymentDate">
                              {errors.secondPaymentDate &&
                              touched.secondPaymentDate
                                ? errors.secondPaymentDate
                                : 'Payment Date'}
                            </label>
                          </div>
                        </div>
                      )}
                      {values.isSecondChequePayment && (
                        <>
                          <div className="col-sm-6">
                            <div
                              className={classNames(
                                'input-group inputLabel_place',
                                {
                                  'text-input-error':
                                    errors.secondChequeNumber &&
                                    touched.secondChequeNumber,
                                },
                              )}
                            >
                              <input
                                type="text"
                                className="form-control"
                                id="secondChequeNumber"
                                placeholder=" "
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.secondChequeNumber}
                                name="secondChequeNumber"
                                disabled={loading}
                              />
                              <label htmlFor="secondChequeNumber">
                                {errors.secondChequeNumber &&
                                touched.secondChequeNumber
                                  ? errors.secondChequeNumber
                                  : 'Check Number'}
                              </label>
                            </div>
                          </div>

                          <div className="col-sm-6">
                            <div
                              className={classNames(
                                'input-group inputLabel_place',
                                {
                                  'text-input-error':
                                    errors.secondChequeRoutingNumber &&
                                    touched.secondChequeRoutingNumber,
                                },
                              )}
                            >
                              <input
                                type="text"
                                className="form-control"
                                id="secondChequeRoutingNumber"
                                placeholder=" "
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.secondChequeRoutingNumber}
                                name="secondChequeRoutingNumber"
                                disabled={loading}
                              />
                              <label htmlFor="secondChequeRoutingNumber">
                                {errors.secondChequeRoutingNumber &&
                                touched.secondChequeRoutingNumber
                                  ? errors.secondChequeRoutingNumber
                                  : 'Check Routing Number'}
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div className="col-sm-12 complete_subs">
                    <button type="submit" className="btn btn-color">
                      {loading && (
                        <div className="loaded">
                          <div className="loader">
                            <div className="loader-inner ball-clip-rotate">
                              <div />
                            </div>
                          </div>
                        </div>
                      )}
                      {!loading && `Complete Enrollment`}
                    </button>
                  </div>

                  {Object.values(errors).length > 0 && (
                    <div className="col-sm-12">
                      <div className="col-sm-12">
                        <b>Errors:</b>
                      </div>
                      <div className="col-sm-12">
                        <ul>
                          {Object.values(errors).map((msg) => (
                            <>
                              <li>{msg}</li>
                            </>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </>
  );
};
