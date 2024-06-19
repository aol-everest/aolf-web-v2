import { useAuth, useGlobalAlertContext } from '@contexts';
import React from 'react';
import dynamic from 'next/dynamic';
import { ALERT_TYPES } from '@constants';
import userInfo from './UserInfo';

const ChangeProfile = dynamic(() =>
  import('@components/profile').then((mod) => mod.ChangeProfile),
);

const UpdateProfile = ({ setLoading, loading }) => {
  const { showAlert } = useGlobalAlertContext();
  const { user, reloadProfile, authenticated } = useAuth();

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
  if (!authenticated) {
    return null;
  }

  return (
    <div>
      <ChangeProfile
        updateCompleteAction={updateCompleteAction}
        profile={user.profile}
      ></ChangeProfile>
    </div>
  );
};

export default userInfo(UpdateProfile);
