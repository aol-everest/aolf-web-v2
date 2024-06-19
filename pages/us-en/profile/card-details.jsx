import { useAuth, useGlobalAlertContext } from '@contexts';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import withUserInfo from '../../../src/hoc/withUserInfo';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ALERT_TYPES } from '@constants';

const ChangeCardDetail = dynamic(() =>
  import('@components/profile').then((mod) => mod.ChangeCardDetail),
);
const ViewCardDetail = dynamic(() =>
  import('@components/profile').then((mod) => mod.ViewCardDetail),
);

const CardDetails = ({ setLoading }) => {
  const { showAlert } = useGlobalAlertContext();
  const { user, reloadProfile, authenticated } = useAuth();
  const [editCardDetail, setEditCardDetail] = useState(false);

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  const updateCompleteAction = async ({ message, isError = false }) => {
    if (isError) {
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message,
      });
    } else {
      setLoading(true);
      await reloadProfile();
      setLoading(false);
      setEditCardDetail(false);
    }
  };

  const switchCardDetailView = () => {
    setEditCardDetail((editCardDetail) => !editCardDetail);
  };

  return (
    <div>
      <div className="profile-form-box">
        <div className="form-title-wrap">
          <div className="form-title-text">Credit or debit card</div>
          <div className="form-title-icon">
            <span className="icon-aol iconaol-payment-card"></span>
          </div>
        </div>
        {!editCardDetail && (
          <ViewCardDetail
            switchCardDetailView={switchCardDetailView}
            profile={user.profile}
          ></ViewCardDetail>
        )}
        {editCardDetail && (
          <Elements
            stripe={stripePromise}
            fonts={[
              {
                cssSrc:
                  'https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
              },
            ]}
          >
            <ChangeCardDetail
              switchCardDetailView={switchCardDetailView}
              updateCompleteAction={updateCompleteAction}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default withUserInfo(CardDetails);
