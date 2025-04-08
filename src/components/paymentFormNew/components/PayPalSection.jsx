import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

const PAYPAL_BUTTON_STYLES = {
  layout: 'horizontal',
  color: 'blue',
  shape: 'pill',
  height: 40,
  tagline: false,
  label: 'pay',
};

const PayPalSection = React.memo(
  ({ formikProps, createPaypalOrder, handlePaypalPayment }) => (
    <div
      className="order__card__payment-method paypal-info !tw-w-[150px]"
      data-method="paypal"
    >
      <div className="paypal-info__sign-in tw-relative tw-z-0">
        <PayPalScriptProvider
          options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
            debug: true,
            currency: 'USD',
            intent: 'capture',
            components: 'buttons',
          }}
        >
          <PayPalButtons
            style={PAYPAL_BUTTON_STYLES}
            fundingSource="paypal"
            forceReRender={[formikProps.values]}
            disabled={!(formikProps.isValid && formikProps.dirty)}
            createOrder={async (data, actions) =>
              await createPaypalOrder(formikProps.values)
            }
            onApprove={handlePaypalPayment}
          />
        </PayPalScriptProvider>
      </div>
      <div className="paypal-info__sign-out d-none">
        <button type="button" className="paypal-info__link sign-out-paypal">
          Log out from Paypal
        </button>
      </div>
    </div>
  ),
);

PayPalSection.displayName = 'PayPalSection';

export default PayPalSection;
