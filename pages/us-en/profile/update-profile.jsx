import { useAuth, useGlobalAlertContext } from '@contexts';
import React from 'react';
import dynamic from 'next/dynamic';
import { ALERT_TYPES } from '@constants';
import { withAuth, withUserInfo } from '@hoc';

const ChangeProfile = dynamic(() =>
  import('@components/profile').then((mod) => mod.ChangeProfile),
);

const UpdateProfile = ({ setLoading }) => {
  const { showAlert } = useGlobalAlertContext();
  const { reloadProfile, profile } = useAuth();

  const updateCompleteAction = async ({
    message,
    isError = false,
    payload = {},
  }) => {
    if (isError) {
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message,
      });
    } else {
      setLoading(true);
      await reloadProfile();
      setLoading(false);
    }
  };

  return (
    <div>
      <ChangeProfile
        updateCompleteAction={updateCompleteAction}
        profile={profile}
      ></ChangeProfile>
    </div>
  );
};

export default withAuth(withUserInfo(UpdateProfile));
