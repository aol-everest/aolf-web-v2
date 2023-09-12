import React, { useState } from "react";
import {
  useStripe,
  useElements,
  ExpressCheckoutElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ScheduleAgreementForm } from "@components/scheduleAgreementForm";
import { Formik } from "formik";
import * as Yup from "yup";
import { api, priceCalculation } from "@utils";
import { useGlobalAlertContext } from "@contexts";
import { ALERT_TYPES } from "@constants";
import queryString from "query-string";
import { filterAllowedParams, removeNull } from "@utils/utmParam";
import { useRouter } from "next/router";
import Style from "./StripeExpressCheckoutElement.module.scss";

export const StripeExpressCheckoutElement = ({ workshop }) => {
  const stripePromise = loadStripe(workshop.publishableKey);
  const { fee } = priceCalculation({
    workshop,
  });
  const elementsOptions = {
    mode: "payment",
    amount: fee * 100,
    currency: "usd",
    appearance: {
      theme: "stripe",
      variables: {
        borderRadius: "36px",
      },
    },
  };
  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutPage workshop={workshop} />
    </Elements>
  );
};

const options = {
  buttonType: {
    applePay: "buy",
    googlePay: "buy",
  },
  wallets: {
    applePay: "always",
    googlePay: "always",
  },
  paymentMethodOrder: ["apple_pay", "google_pay"],
};

const CheckoutPage = ({ workshop }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlertContext();

  const onConfirm = async (event) => {
    if (loading) {
      return null;
    }
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }
    try {
      // Create the PaymentIntent and obtain clientSecret
      let filteredParams = {
        ctype: workshop.productTypeId,
        ...router.query,
      };
      filteredParams = removeNull(filteredParams);

      const {
        stripeIntentObj,
        status,
        data,
        error: errorMessage,
        isError,
      } = await api.post({
        path: "createIntentForExpressCheckout",
        body: {
          workshopId: workshop.id,
          utmParams: filteredParams,
        },
        isUnauthorized: true,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      const returnUrl = `${
        window.location.origin
      }/us-en/course/scheduling/thankyou/${workshop.id}?${queryString.stringify(
        filteredParams,
      )}`;

      // Confirm the PaymentIntent using the details collected by the Express Checkout Element
      const { error } = await stripe.confirmPayment({
        // `elements` instance used to create the Express Checkout Element
        elements,
        // `clientSecret` from the created PaymentIntent
        clientSecret: stripeIntentObj.client_secret,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (error) {
        throw new Error(error.message);
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

  const questionnaireArray = workshop.complianceQuestionnaire
    ? workshop.complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const onClick = ({ resolve }) => {
    const options = {
      emailRequired: true,
      phoneNumberRequired: true,
      billingAddressRequired: true,
    };
    resolve(options);
  };

  return (
    <div>
      <Formik
        enableReinitialize
        initialValues={{
          questionnaire: questionnaireArray,
          ppaAgreement: false,
        }}
        validationSchema={Yup.object().shape({
          ppaAgreement: Yup.boolean()
            .label("Terms")
            .test(
              "is-true",
              "Please check the box in order to continue.",
              (value) => value === true,
            ),
        })}
        onSubmit={() => {}}
      >
        {(formikProps) => {
          const hidePayMessage =
            formikProps?.values?.ppaAgreement &&
            formikProps?.values?.questionnaire?.some((item) => item.value);
          return (
            <>
              <div className="scheduling-modal__content-wrapper">
                <p className="scheduling-modal__content-wrapper-form-checkbox">
                  <ScheduleAgreementForm
                    formikProps={formikProps}
                    complianceQuestionnaire={workshop.complianceQuestionnaire}
                    isCorporateEvent={false}
                    questionnaireArray={questionnaireArray}
                    screen="DESKTOP"
                  />
                </p>
              </div>

              {!hidePayMessage && (
                <div className={Style.pay_message}>
                  *To proceed using Apple or Google Pay, kindly acknowledge the
                  agreements above.
                </div>
              )}

              <div className="tw-relative">
                <div
                  className={
                    !formikProps.isValid || !formikProps.dirty
                      ? Style.express_checkout_block
                      : ""
                  }
                ></div>
                <ExpressCheckoutElement
                  options={options}
                  onConfirm={onConfirm}
                  onClick={onClick}
                />
              </div>
            </>
          );
        }}
      </Formik>
    </div>
  );
};
