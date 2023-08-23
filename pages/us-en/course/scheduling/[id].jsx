import dayjs from "dayjs";
import { PageLoading } from "@components";
import { ALERT_TYPES } from "@constants";
import { useQueryString } from "@hooks";
import queryString from "query-string";
import { useGlobalAlertContext } from "@contexts";
import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { api, priceCalculation, tConvert } from "@utils";
import { Formik } from "formik";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import * as Yup from "yup";
import ErrorPage from "next/error";
import { useQuery } from "react-query";
import { filterAllowedParams, removeNull } from "@utils/utmParam";
import { ScheduleInput } from "@components/scheduleInput/ScheduleInput";
import { ScheduleDiscountInput } from "@components/scheduleDiscountInput/ScheduleDiscountInput";
import { ScheduleAgreementForm } from "@components/scheduleAgreementForm/ScheduleAgreementForm";
import { SchedulePhoneInput } from "@components/schedulingPhoneInput/SchedulingPhoneInput";

var advancedFormat = require("dayjs/plugin/advancedFormat");
dayjs.extend(advancedFormat);

const SchedulingPayment = () => {
  const router = useRouter();
  const [discount] = useQueryString("discountCode");
  const [discountResponse, setDiscountResponse] = useState(null);
  const { id: workshopId } = router.query;

  const {
    data: workshop,
    isLoading,
    isError,
    error,
  } = useQuery(
    "workshopDetail",
    async () => {
      const response = await api.get({
        path: "workshopDetail",
        param: {
          id: workshopId,
          rp: "checkout",
        },
        isUnauthorized: true,
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!workshopId,
    },
  );

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const { fee, delfee } = priceCalculation({
    workshop,
    discount: discountResponse,
  });

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
  };

  const elementsOptions = {
    mode: "payment",
    amount: 1099,
    currency: "usd",
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#0570de",
        colorBackground: "#ffffff",
        colorText: "#30313d",
        colorDanger: "#df1b41",
        fontFamily: '"Work Sans",Ideal Sans, system-ui, sans-serif',
        spacingUnit: "2px",
        borderRadius: "4px",
      },
      rules: {
        ".Block": {
          backgroundColor: "var(--colorBackground)",
          boxShadow: "none",
          padding: "12px",
        },
        ".Input": {
          padding: "14px",
          width: "100%",
          maxHeight: "48px",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.15)",
        },
        ".Input:disabled, .Input--invalid:disabled": {
          color: "lightgray",
        },
        ".Tab": {
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.15)",
          padding: "16px 24px",
          color: "#FCA248",
        },
        ".Tab:hover": {
          borderRadius: "16px",
          border: "1px solid #FF9E1B",
          padding: "16px 24px",
          color: "#FCA248",
          boxShadow: "none",
        },
        ".Tab--selected, .Tab--selected:focus, .Tab--selected:hover": {
          borderRadius: "16px",
          border: "1px solid #FF9E1B",
          padding: "16px 24px",
          color: "#FCA248",
          boxShadow: "none",
        },
        ".TabIcon--selected, .TabIcon--selected:focus, .TabIcon--selected:hover":
          {
            color: "#FCA248",
            fill: "#FCA248",
          },
        ".TabIcon, .TabIcon:hover": {
          color: "#FCA248",
          fill: "#FCA248",
        },
        ".Label": {
          opacity: "0",
        },
      },
    },
  };

  return (
    <>
      <header className="checkout-header">
        <img className="checkout-header__logo" src="/img/ic-logo.svg" alt="" />
      </header>

      <main className="main">
        <div className="scheduling-modal__step">
          <div id="modal-header" className="scheduling-modal__header">
            <svg
              fill="none"
              height="40"
              viewBox="0 0 40 40"
              width="40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.97338 37.5C6.97338 37.5 5.84838 37.125 5.09838 36.375C3.97338 35.5 3.34838 34.125 3.34838 32.75C3.34838 32.25 3.47338 31.75 3.59838 31.375C2.72338 31.125 2.09838 30.5 1.59838 29.625C0.848379 28.125 1.34838 26.375 2.72338 25.5C4.18413 24.6426 7.07961 22.925 8.29299 22.2048C8.6583 21.9879 8.9647 21.686 9.18735 21.3241L11.8484 17C13.0984 15 14.9734 13.625 17.2234 13.125C15.7234 12 14.7234 10.375 14.7234 8.375C14.7234 5.125 17.3484 2.5 20.5984 2.5C23.8484 2.5 26.4734 5.125 26.4734 8.375C26.4734 10.25 25.5984 12 24.0984 13C26.2234 13.5 28.0984 14.875 29.2234 16.75L32.0984 21.625C32.2234 21.75 32.2234 21.875 32.4734 22L38.2234 25.375C39.5984 26.125 40.2234 28 39.4734 29.5C39.0984 30.25 38.3484 30.875 37.5984 31.125C37.8484 31.625 37.8484 32.25 37.8484 32.75C37.8484 34.125 37.2234 35.375 36.2234 36.25C35.2234 37.125 33.8484 37.625 32.4734 37.375L20.4734 35.75L8.72338 37.375C8.47338 37.5 8.22338 37.5 7.97338 37.5ZM20.7234 30.5H7.97338C6.84838 30.5 5.84838 31.625 5.84838 32.75C5.84838 33.375 6.09838 34 6.59838 34.5C7.09838 34.875 7.72338 35 8.22338 35L20.4734 33.375C20.5984 33.375 20.7234 33.375 20.8484 33.375L32.9734 35C33.5984 35.125 34.2234 34.875 34.7234 34.5C35.2234 34.125 35.4734 33.5 35.4734 32.875C35.4734 31.75 34.4734 30.625 33.3484 30.625L20.7234 30.5ZM22.0984 15.25L19.0984 15.375C16.8484 15.375 15.0984 16.375 13.9734 18.125L11.0984 22.875C10.8484 23.375 10.3484 23.875 9.72338 24.25L4.09838 27.5C3.84838 27.625 3.59838 28 3.84838 28.375C3.97338 28.625 4.22338 28.875 4.47338 28.875H4.59838L4.84838 28.75L11.0984 26C12.0984 25.5 12.7234 24.375 13.3484 23C13.5984 22.5 13.8484 22 14.0984 21.5C14.3484 21 14.9734 20.75 15.4734 20.875C15.9734 21 16.4734 21.5 16.4734 22.125V27.875H20.7234H24.8484V22.125C24.8484 21.5 25.2234 21.125 25.7234 20.875C26.2234 20.75 26.8484 21 27.0984 21.5C27.3484 22 27.5984 22.5 27.9734 23.125C28.5984 24.375 29.0984 25.625 30.2234 26.125L36.4734 28.625C36.5984 28.625 36.5984 28.75 36.7234 28.75C36.7234 28.75 36.7234 28.75 36.8484 28.75C37.0984 28.75 37.3484 28.625 37.4734 28.25C37.5984 27.875 37.4734 27.5 37.2234 27.375L31.5984 24C30.9734 23.75 30.4734 23.25 30.2234 22.625L27.3484 17.875C26.0984 16.375 24.0984 15.25 22.0984 15.25ZM13.8484 27.125C13.5984 27.5 13.2234 27.75 12.8484 28H13.8484V27.125ZM27.3484 28H28.3484C27.9734 27.75 27.5984 27.375 27.3484 27V28ZM20.5984 5C18.7234 5 17.2234 6.5 17.2234 8.375C17.2234 10.25 18.7234 11.75 20.5984 11.75C22.4734 11.75 23.9734 10.25 23.9734 8.375C23.9734 6.5 22.4734 5 20.5984 5Z"
                fill="#FCA248"
              />
            </svg>
            <div className="scheduling-modal__header-text">
              <h3>{workshop?.title}</h3>
              <p>9 hours meditation course</p>
            </div>
          </div>

          <Elements stripe={stripePromise} options={elementsOptions}>
            <SchedulingPaymentForm
              workshop={workshop}
              applyDiscount={applyDiscount}
              discount={discount}
              discountResponse={discountResponse}
              fee={fee}
              delfee={delfee}
              router={router}
            />
          </Elements>
        </div>
      </main>
    </>
  );
};

const SchedulingPaymentForm = ({
  workshop,
  applyDiscount,
  discount,
  discountResponse,
  fee,
  delfee,
  router,
}) => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [mbsy_source] = useQueryString("mbsy_source", {
    defaultValue: null,
  });
  const [campaignid] = useQueryString("campaignid", {
    defaultValue: null,
  });
  const [mbsy] = useQueryString("mbsy", {
    defaultValue: null,
  });

  const { showAlert } = useGlobalAlertContext();

  const {
    complianceQuestionnaire,
    title,
    id: productId,
    addOnProducts,
    eventStartTime,
    eventEndTime,
    eventStartDate,
    eventEndDate,
    primaryTeacherName,
    coTeacher1Name,
    phone1,
    email,
    streetAddress1,
    streetAddress2,
    country,
    city,
  } = workshop;

  const questionnaireArray = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const completeEnrollmentAction = async (values) => {
    if (loading) {
      return null;
    }

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

    const {
      id: productId,
      addOnProducts,
      productTypeId,
      isCCNotRequired,
    } = workshop;

    const {
      questionnaire,
      firstName,
      lastName,
      email,
      couponCode,
      contactPhone,
    } = values;

    const complianceQuestionnaire = questionnaire.reduce(
      (res, current) => ({
        ...res,
        [current.key]: current.value ? "Yes" : "No",
      }),
      {},
    );

    try {
      setLoading(true);

      const selectedAddOn = null;

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
          couponCode: couponCode || "",
          contactAddress: {
            contactPhone,
          },
          billingAddress: {
            billingPhone: contactPhone,
          },
          products,
          complianceQuestionnaire,
          isInstalmentOpted: false,
          isStripeIntentPayment: true,
        },
        utm: filterAllowedParams(router.query),
      };

      if (isCCNotRequired) {
        payLoad.shoppingRequest.isStripeIntentPayment = false;
      }

      payLoad = {
        ...payLoad,
        user: {
          lastName: lastName,
          firstName: firstName,
          email: email,
        },
      };

      //token.saveCardForFuture = true;
      const {
        stripeIntentObj,
        status,
        data,
        error: errorMessage,
        isError,
      } = await api.post({
        path: "createAndPayOrder",
        body: payLoad,
        isUnauthorized: true,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      if (data && data.totalOrderAmount > 0) {
        let filteredParams = {
          ctype: productTypeId,
          page: "ty",
          type: `local${mbsy_source ? "&mbsy_source=" + mbsy_source : ""}`,
          campaignid,
          mbsy,
          ...filterAllowedParams(router.query),
        };
        filteredParams = removeNull(filteredParams);
        const returnUrl = `${window.location.origin}/us-en/course/thankyou/${
          data.attendeeId
        }?${queryString.stringify(filteredParams)}`;
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

  const formikOnChange = (values) => {
    if (!stripe || !elements) {
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
            name: (values.firstName || "") + (values.lastName || ""),
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
      {loading && <div className="cover-spin"></div>}
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          questionnaire: questionnaireArray,
          ppaAgreement: false,
          couponCode: discount ? discount : "",
          contactPhone: "",
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().required("First Name is required"),
          lastName: Yup.string().required("Last Name is required"),
          email: Yup.string()
            .email("Email is invalid!")
            .required("Email is required!"),
          contactPhone: Yup.string()
            .label("Phone")
            .required("Phone is required")
            .phone(null, false, "Phone is invalid")
            .nullable(),
          ppaAgreement: Yup.boolean()
            .label("Terms")
            .test(
              "is-true",
              "Please check the box in order to continue.",
              (value) => value === true,
            ),
        })}
        innerRef={formRef}
        onSubmit={async (values) => {
          await completeEnrollmentAction(values);
        }}
      >
        {(formikProps) => {
          const { values, handleSubmit } = formikProps;
          formikOnChange(values);
          return (
            <div
              id="second-step"
              className="scheduling-modal__template  second"
            >
              <div className="scheduling-modal__content-wrapper">
                <h3>Checkout / Account Details</h3>

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

                  <hr />

                  <h3>Pay with</h3>

                  <PaymentElement />
                </form>
              </div>

              <div className="scheduling-modal__total">
                <div className="scheduling-modal__content-wrapper">
                  <div className="scheduling-modal__content-total">
                    <h5 className="scheduling-modal__content-total-title">
                      {title}
                    </h5>
                    <div className="scheduling-modal__content-total-date-time">
                      <div className="scheduling-modal__content-ranges-text-with-clock">
                        Daily
                      </div>
                      <div className="scheduling-modal__content-total-time">
                        {tConvert(eventStartTime, true)} -{" "}
                        {tConvert(eventEndTime, true)}
                      </div>
                    </div>
                    <div className="scheduling-modal__content-total-dates">
                      <div className="scheduling-modal__content-total-date">
                        {dayjs.utc(eventStartDate).format("ddd, D")}
                      </div>
                      <div className="scheduling-modal__content-total-date">
                        {dayjs.utc(eventEndDate).format("ddd, D")}
                      </div>
                    </div>
                    <hr />
                    <div className="scheduling-modal__content-total-instructors-wrapper">
                      <div className="scheduling-modal__content-total-instructors">
                        {" Instructor(s):"}
                      </div>
                      <ul className="scheduling-modal__content-total-instructors-list">
                        <li>{primaryTeacherName}</li>
                        <li>{coTeacher1Name}</li>
                      </ul>
                    </div>
                    <hr />
                    <div className="scheduling-modal__content-total-location show">
                      Location:
                      <p className="scheduling-modal__content-total-links">
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          {`${streetAddress1 || ""} ${streetAddress2 || ""}
                          ${city || ""} ${country || ""}`}
                        </a>
                      </p>
                    </div>

                    <div className="scheduling-modal__content-total-contacts">
                      Contact details:
                      <p className="scheduling-modal__content-total-links">
                        <a href={`tel:${phone1}`}>{phone1}</a>
                        <a href={`mailto:${email}`}>{email}</a>
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
                      questionnaireArray={questionnaireArray}
                      screen="DESKTOP"
                    />
                  </p>

                  <hr />

                  <p className="scheduling-modal__content-total-footer">
                    <span>Total</span>
                    <span>
                      {discountResponse && delfee && (
                        <span className="discount">${delfee.toFixed(2)}</span>
                      )}{" "}
                      ${fee.toFixed(2) || "0".toFixed(2)}
                    </span>
                  </p>

                  <p className="scheduling-modal__content-total-contact">
                    For any health related questions, please contact the health
                    info desk at{" "}
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
                  onClick={handleFormSubmit}
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
                    <h5>Evidence-Based Practice</h5>
                    <p>
                      Scientifically proven to reduce stress, anxiety, and
                      improve sleep through hundreds of scientific studies.
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
                    <g clipPath="url(#clip0_23_1916)">
                      <path
                        clipRule="evenodd"
                        d="M19.3569 6.42814C19.7926 6.16665 20.3434 6.19507 20.75 6.5C21.264 6.88552 21.9395 7.42344 22.4981 7.98202C24.7455 10.2294 26.3558 13.0201 27.0413 15.9795C27.0801 16.098 27.1163 16.2136 27.1498 16.3273C29.8726 14.6243 33.08 13.6231 36.4978 13.5763L36.5149 13.576L36.5483 13.5761C37.2744 13.5761 37.9839 13.5761 38.8314 13.7174C39.3436 13.8028 39.7498 14.196 39.8515 14.7053C40.0004 15.4491 40.0001 16.2994 40 16.9969V17.0613C40 26.8161 31.99 34.8261 22.2351 34.8261H20.0001H17.7736C8.00598 34.9551 2.84977e-06 26.934 2.84977e-06 17.1854C2.84977e-06 17.1641 -1.62058e-06 17.1426 -6.09094e-06 17.121C-0.000151378 16.4235 -0.000328546 15.5733 0.148449 14.8294C0.250299 14.3201 0.656413 13.9269 1.16868 13.8415C2.01615 13.7003 2.72557 13.7003 3.4517 13.7004H3.4851C6.93709 13.7004 10.1469 14.6636 12.8619 16.3338C13.495 13.5564 14.8356 10.924 16.8861 8.72842C17.022 8.52159 17.17 8.37518 17.2376 8.30822C17.2436 8.30234 17.2489 8.29708 17.2535 8.29244C17.2759 8.27005 17.2916 8.25375 17.3023 8.24268C17.357 8.14748 17.4241 8.05982 17.5019 7.98202C17.5141 7.96972 17.5265 7.95733 17.539 7.94487C18.013 7.47063 18.6029 6.88055 19.3569 6.42814ZM15.0971 17.9626C17.2483 19.8038 18.9451 22.1503 20.0074 24.8191C21.0846 22.1389 22.8044 19.7815 24.9716 17.9266C24.8886 17.5164 24.7919 17.1366 24.6503 16.7115C24.6373 16.6726 24.6263 16.6333 24.6171 16.5933C24.0531 14.1113 22.6898 11.7091 20.7304 9.74978C20.5043 9.52369 20.2426 9.29203 19.9763 9.07117C19.7854 9.2398 19.5904 9.43014 19.3754 9.64428C19.2433 9.84053 19.1026 9.97967 19.0373 10.0444C19.0313 10.0503 19.0259 10.0556 19.0213 10.0602C18.9989 10.0826 18.9831 10.0989 18.9726 10.11C18.9233 10.1959 18.8638 10.2757 18.7954 10.3477C16.7494 12.5013 15.5154 15.1656 15.0971 17.9626ZM27.0608 19.4436C23.5268 22.242 21.25 26.5321 21.25 31.341V32.3261H22.2351C30.6093 32.3261 37.5 25.4355 37.5 17.0613C37.5 16.7024 37.499 16.3795 37.4886 16.0893C37.1948 16.0768 36.8856 16.0761 36.5236 16.0761C32.9973 16.1264 29.7398 17.3521 27.147 19.3759C27.1193 19.3996 27.0906 19.4223 27.0608 19.4436ZM18.75 31.341C18.75 22.973 11.9897 16.2004 3.4851 16.2004C3.11929 16.2004 2.80755 16.2009 2.51139 16.2135C2.50105 16.5036 2.5 16.8265 2.5 17.1854C2.5 25.563 9.39027 32.4408 17.7478 32.3263L17.7649 32.326L18.75 32.3261V31.341Z"
                        fill="#FCA248"
                        fillRule="evenodd"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_23_1916">
                        <rect fill="white" height="40" width="40" />
                      </clipPath>
                    </defs>
                  </svg>
                  <div>
                    <h5>Authentic Meditation Practice</h5>
                    <p>
                      Drawing from Vedic principles of meditation, SKY offers an
                      authentic and deeply profound experience, effortlessly
                      allowing anyone to connect with the depth of their being.
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
                    <h5>Certified SKY Instructors</h5>
                    <p>
                      Learn from the best! Our SKY instructors are certified and
                      go through over 500 hours of training to provide you with
                      an interactive and enriching learning experience.
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
                    <h5>Millions of Lives Touched</h5>
                    <p>
                      Join a community of over 500 million people whose lives
                      have been positively transformed through SKY Breath
                      Meditation and other events.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          );
        }}
      </Formik>
    </>
  );
};

SchedulingPayment.noHeader = true;
SchedulingPayment.hideFooter = true;

export default SchedulingPayment;
