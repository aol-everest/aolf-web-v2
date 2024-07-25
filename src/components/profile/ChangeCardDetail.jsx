import { useAuth } from '@contexts';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { api } from '@utils';
import { useState } from 'react';
import { Loader } from '@components';

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
export const ChangeCardDetail = ({
  updateCompleteAction,
  switchCardDetailView,
}) => {
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
      {loading && <Loader />}
      <form className="profile-update__form" onSubmit={handleSubmit}>
        <CardElement options={createOptions} />
        <div className="form-actions col-1-1">
          <button className="secondary-btn" onClick={switchCardDetailView}>
            Discard Changes
          </button>
          <button type="submit" className="primary-btn">
            Save Changes
          </button>
        </div>
      </form>
    </>
  );
};
