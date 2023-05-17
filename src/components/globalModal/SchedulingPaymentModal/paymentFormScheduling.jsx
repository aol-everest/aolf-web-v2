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
  cardLast4Digit,
  toggleCardChangeDetail,
  isChangingCard,
  formikValues,
  setTokenizeCCFromPayment,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { firstName, lastName } = formikValues;

  useEffect(() => {
    const getTokenizeValue = async () => {
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
        if (token) {
          setTokenizeCCFromPayment(token);
        }
      }
    };

    getTokenizeValue();
  }, [isChangingCard && !cardLast4Digit && elements]);

  if (cardLast4Digit && !isChangingCard) {
    return (
      <>
        <div>
          <label class="scheduling__label" for="card-number">
            Card Number
          </label>
          <input
            class="scheduling__input mb-2"
            id="card-number"
            type="text"
            value={`**** **** **** ${cardLast4Digit}`}
            placeholder="Card Number"
          />

          <div class="row no-gutters justify-content-between">
            <div class="col-5">
              <label class="scheduling__label" for="mm-yy">
                Expiration Date
              </label>
              <input
                class="scheduling__input"
                id="mm-yy"
                type="text"
                placeholder="MM/YY"
                value={`**/**`}
              />
            </div>

            <div class="col-5">
              <label class="scheduling__label" for="cvc">
                CVC Code
              </label>
              <input
                class="scheduling__input"
                id="cvc"
                type="text"
                placeholder="CVC"
                value={`****`}
              />
            </div>
          </div>
        </div>
        <div className="change-cc-detail-link">
          <a href="#" onClick={toggleCardChangeDetail}>
            Would you like to use a different credit card?
          </a>
        </div>
      </>
    );
  }
  if (cardLast4Digit && isChangingCard) {
    return (
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
    );
  } else {
    return <CardElement options={createOptions} />;
  }
}
