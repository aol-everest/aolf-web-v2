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
import { api } from "@utils";
import { useGlobalAlertContext } from "@contexts";
import { ALERT_TYPES } from "@constants";
import queryString from "query-string";
import { filterAllowedParams, removeNull } from "@utils/utmParam";
import { useRouter } from "next/router";
import Style from "./StripeExpressCheckoutElement.module.scss";
import classNames from "classnames";

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

export const StripeExpressCheckoutElement = ({ workshop }) => {
  const stripePromise = loadStripe(workshop.publishableKey);
  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutPage workshop={workshop} />
    </Elements>
  );
};

const options = {
  wallets: { linkPay: "never" },
};

const CheckoutPage = ({ workshop }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlertContext();

  const completeEnrollmentAction = () => {};

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
        },
        isUnauthorized: true,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      let filteredParams = {
        ctype: workshop.productTypeId,
        ...filterAllowedParams(router.query),
      };
      filteredParams = removeNull(filteredParams);
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
  /* const onClick = ({ resolve }) => {
    const options = {
      emailRequired: true,
      phoneNumberRequired: true,
      billingAddressRequired: true,
    };
    resolve(options);
  }; */
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
        onSubmit={async (values) => {
          await completeEnrollmentAction(values);
        }}
      >
        {(formikProps) => {
          return (
            <>
              <div class="scheduling-modal__content-wrapper">
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
                />
              </div>
            </>
          );
        }}
      </Formik>
    </div>
  );
};
