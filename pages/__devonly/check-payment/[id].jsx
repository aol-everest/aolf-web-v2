import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@utils';
import { useRouter } from 'next/router';

const checkPaymentStatus = async (id) => {
  const response = await api.get({
    path: 'getOrderAndAttendeeDetailsPOC',
    param: {
      orderId: id,
    },
  });
  if (response.status !== 200) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};

const retryPaymentStatusCheck = async (
  id,
  maxRetries = 5,
  initialDelay = 1000,
) => {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxRetries) {
    try {
      const response = await checkPaymentStatus(id);
      if (response.status === 200) {
        return response.data; // If payment is successful, return the status
      }
      attempts++;
      console.log(`Attempt ${attempts}: Payment status is ${status}`);
      if (attempts >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts`);
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed: ${error.message}`);
      if (attempts >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

const PaymentStatus = () => {
  const searchParams = useSearchParams();
  const [result, setResult] = useState('{}');
  const [errorMessage, setErrorMessage] = useState();
  const router = useRouter();
  const { id } = router.query;
  const next = searchParams.get('next');

  useEffect(() => {
    if (id) {
      const fetchStatus = async () => {
        try {
          setErrorMessage(null);
          const data = await retryPaymentStatusCheck(id);
          setResult(data);
        } catch (error) {
          setErrorMessage(error.message);
          console.error(error.message);
        }
      };

      fetchStatus();
    }
  }, [id]);

  return (
    <main class="login-register-page">
      <section class="section-login-register">
        <div class="loading-overlay no-bg">
          <div class="overlay-loader"></div>
          <div class="loading-text">
            <p class="tw-font-bold tw-py-5">Processing payment...</p>
            <p>
              Please wait a few minutes. We appreciate your patience during this
              time!
            </p>
            {errorMessage && <p>{errorMessage}</p>}
            <p>{JSON.stringify(result, null, 2)}</p>
          </div>
        </div>
      </section>
    </main>
  );
};
PaymentStatus.noHeader = true;
PaymentStatus.hideFooter = true;

export default PaymentStatus;
