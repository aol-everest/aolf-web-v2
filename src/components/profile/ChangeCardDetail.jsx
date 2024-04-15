import { useAuth } from '@contexts';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { api } from '@utils';
import { useState } from 'react';

const createOptions = {
  style: {
    base: {
      fontSize: '16px',
      lineHeight: 2,
      fontWeight: 200,
      fontStyle: 'normal',
      color: '#303650',
      fontFamily: 'Work Sans, sans-serif',
      '::placeholder': {
        color: '#9598a6',
        fontFamily: 'Work Sans, sans-serif',
        fontSize: '16px',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};
export const ChangeCardDetail = ({ updateCompleteAction }) => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { profile } = useAuth();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      let createTokenRespone = await stripe.createToken(cardElement, {
        name: profile.name,
      });
      let { error, token } = createTokenRespone;
      if (error) {
        throw error;
      }
      const payload = {
        tokenizeCC: token,
      };
      const { status, error: errorMessage } = await api.post({
        path: 'updateProfile',
        body: payload,
      });

      if (status === 400) {
        throw new Error(errorMessage);
      }
      updateCompleteAction({ payload: { editCardDetail: false } });
    } catch (ex) {
      updateCompleteAction({ message: ex.message, isError: true });
    }
    setLoading(false);
  };
  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <form className="profile-update__form" onSubmit={handleSubmit}>
        <div className="profile-update__form-header d-flex justify-content-between align-items-center">
          <h6 className="profile-update__title m-0">Card Details:</h6>
          <div className="profile-update__images-container">
            <img src="/img/ic-visa.svg" alt="visa" />
            <img src="/img/ic-mc.svg" alt="mc" />
            <img src="/img/ic-ae.svg" alt="ae" />
          </div>
        </div>
        <div className="profile-update__card">
          <CardElement options={createOptions} />
        </div>
        <button type="submit" className="btn-primary d-block ml-auto mt-4 v2">
          Update Card
        </button>
      </form>
    </>
  );
};
