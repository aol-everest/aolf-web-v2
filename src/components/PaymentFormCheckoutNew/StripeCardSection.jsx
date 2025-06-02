import React from 'react';
import { CardElement, PaymentElement } from '@stripe/react-stripe-js';

const StripeCardSection = React.memo(
  ({
    isStripeIntentPayment,
    paymentElementOptions,
    cardLast4Digit,
    isChangingCard,
    toggleCardChangeDetail,
    createOptions,
  }) => (
    <div className="order__card__payment-method" data-method="card">
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
                <div className="col-12 col-lg-6 pb-3 px-2">
                  <div className="form-item required">
                    <input
                      id="card-number"
                      type="text"
                      value={`**** **** **** ${cardLast4Digit}`}
                      placeholder="Card Number"
                    />
                  </div>
                </div>
                <div className="col-12 col-lg-3 pb-3 px-2">
                  <div className="form-item required">
                    <input
                      id="mm-yy"
                      type="text"
                      placeholder="MM/YY"
                      value="**/**"
                    />
                  </div>
                </div>
                <div className="col-12 col-lg-3 pb-3 px-2">
                  <div className="form-item required">
                    <input
                      id="cvc"
                      type="text"
                      placeholder="CVC"
                      value="****"
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
      )}
    </div>
  ),
);

StripeCardSection.displayName = 'StripeCardSection';

export default StripeCardSection;
