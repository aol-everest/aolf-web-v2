import React, { useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "@contexts";

const createOptions = {
  style: {
    base: {
      fontSize: "16px",
      lineHeight: 2,
      fontWeight: 200,
      fontStyle: "normal",
      color: "#303650",
      fontFamily: "Work Sans, sans-serif",
      "::placeholder": {
        color: "#9598a6",
        fontFamily: "Work Sans, sans-serif",
        fontSize: "16px",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

export default function PaymentFormScheduling({
  formikValues,
  setTokenizeCCFromPayment,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { firstName, lastName } = formikValues;

  useEffect(() => {
    const getTokenizeValue = async () => {
      console.log("elements", elements);
      if (elements && stripe) {
        const cardElement = elements?.getElement(CardElement);
        let createTokenRespone = await stripe.createToken(cardElement, {
          name: user?.profile.name
            ? user?.profile.name
            : firstName + " " + lastName,
        });
        let { error, token } = createTokenRespone;
        if (error) {
          throw error;
        }
        console.log("token", token);
        if (token) {
          setTokenizeCCFromPayment(token);
        }
      }
    };

    getTokenizeValue();
  }, [formikValues]);

  return <CardElement options={createOptions} />;
}
