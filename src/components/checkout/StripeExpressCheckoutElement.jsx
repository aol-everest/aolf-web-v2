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
  buttonTheme: { applePay: "black" },
  buttonType: { applePay: "buy" },
  wallets: { applePay: "always" },
};

const CheckoutPage = ({ workshop }) => {
  const stripe = useStripe();
  const elements = useElements();
  // Optional: If you're doing custom animations, hide the Element
  const [visibility, setVisibility] = useState("hidden");
  const [errorMessage, setErrorMessage] = useState();

  const completeEnrollmentAction = () => {};

  const onReady = ({ availablePaymentMethods }) => {
    if (!availablePaymentMethods) {
      // No buttons will show
    } else {
      // Optional: Animate in the Element
      setVisibility("initial");
    }
  };

  const onConfirm = async (event) => {
    if (!stripe) {
      // Stripe.js hasn't loaded yet.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      return;
    }

    // Create the PaymentIntent and obtain clientSecret
    const res = await fetch("/create-intent", {
      method: "POST",
    });
    const { client_secret: clientSecret } = await res.json();

    // Confirm the PaymentIntent using the details collected by the Express Checkout Element
    const { error } = await stripe.confirmPayment({
      // `elements` instance used to create the Express Checkout Element
      elements,
      // `clientSecret` from the created PaymentIntent
      clientSecret,
      confirmParams: {
        return_url: "https://example.com/order/123/complete",
      },
    });

    if (error) {
      // This point is only reached if there's an immediate error when
      // confirming the payment. Show the error to your customer (for example, payment details incomplete)
      setErrorMessage(error.message);
    } else {
      // The payment UI automatically closes with a success animation.
      // Your customer is redirected to your `return_url`.
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
              <div id="express-checkout-element" style={{ visibility }}>
                <ExpressCheckoutElement
                  onReady={onReady}
                  options={options}
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
