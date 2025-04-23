import { useState } from 'react';
import { api } from '@utils';
import { PAYMENT_MODES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { ALERT_TYPES } from '@constants';

export const usePayment = ({
  stripe,
  elements,
  enrollmentCompletionAction,
  enrollmentCompletionLink,
}) => {
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlertContext();

  const handleStripeIntentPayment = async (values, paymentData) => {
    if (!stripe || !elements) {
      throw new Error('Stripe has not been initialized');
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }

    try {
      setLoading(true);

      const {
        data,
        stripeIntentObj,
        status,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'createAndPayOrder',
        body: paymentData,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      if (data && data.totalOrderAmount > 0) {
        const returnUrl = enrollmentCompletionLink(data);
        const result = await stripe.confirmPayment({
          elements,
          clientSecret: stripeIntentObj.client_secret,
          confirmParams: {
            return_url: returnUrl,
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      }

      if (data) {
        enrollmentCompletionAction(data);
      }

      setLoading(false);
      return data;
    } catch (ex) {
      console.error(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setLoading(false);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
      throw ex;
    }
  };

  const handleStripePayment = async (
    values,
    paymentData,
    isPaymentRequired,
  ) => {
    if (!stripe || !elements) {
      throw new Error('Stripe has not been initialized');
    }

    // try {
    setLoading(true);

    let tokenizeCC = null;
    if (values.shouldTokenize && isPaymentRequired) {
      const cardElement = elements.getElement('card');
      const createTokenResponse = await stripe.createToken(cardElement, {
        name: values.cardHolderName,
      });
      const { error, token } = createTokenResponse;
      if (error) {
        throw error;
      }
      tokenizeCC = token;
    }

    const finalPaymentData = {
      ...paymentData,
      shoppingRequest: {
        ...paymentData.shoppingRequest,
        tokenizeCC,
      },
    };

    const {
      data,
      status,
      error: errorMessage,
      isError,
    } = await api.post({
      path: 'createAndPayOrder',
      body: finalPaymentData,
    });

    if (status === 400 || isError) {
      throw new Error(errorMessage);
    }

    if (data) {
      enrollmentCompletionAction(data);
    }

    setLoading(false);
    return data;
    // } catch (ex) {
    //   console.error(ex);
    //   const data = ex.response?.data;
    //   const { message, statusCode } = data || {};
    //   setLoading(false);
    //   showAlert(ALERT_TYPES.ERROR_ALERT, {
    //     children: message ? `Error: ${message} (${statusCode})` : ex.message,
    //   });
    //   throw ex;
    // }
  };

  const createPaypalOrder = async (paymentData) => {
    try {
      setLoading(true);

      const {
        paypalObj,
        status,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'createAndPayOrder',
        body: {
          ...paymentData,
          shoppingRequest: {
            ...paymentData.shoppingRequest,
            isPaypalPayment: true,
          },
        },
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
      throw ex;
    }
  };

  const handlePaypalPayment = async (paypalData) => {
    try {
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
      }

      if (data) {
        enrollmentCompletionAction(data);
      }
      return true;
    } catch (ex) {
      console.error(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setLoading(false);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
      throw ex;
    }
  };

  const processPayment = async (values, paymentData, isPaymentRequired) => {
    const { paymentMode } = values;

    switch (paymentMode) {
      case PAYMENT_MODES.STRIPE_PAYMENT_MODE:
        if (paymentData.shoppingRequest.isStripeIntentPayment) {
          return handleStripeIntentPayment(values, paymentData);
        }
        return handleStripePayment(values, paymentData, isPaymentRequired);

      case PAYMENT_MODES.PAYPAL_PAYMENT_MODE:
        return createPaypalOrder(paymentData);

      default:
        throw new Error('Invalid payment mode');
    }
  };

  return {
    loading,
    processPayment,
    handlePaypalPayment,
  };
};
