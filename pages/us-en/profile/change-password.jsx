import { useAuth, useGlobalAlertContext } from '@contexts';
import React from 'react';
import dynamic from 'next/dynamic';
import { ALERT_TYPES } from '@constants';
import { withAuth, withUserInfo } from '@hoc';

const ChangePassword = dynamic(() =>
  import('@components/profile').then((mod) => mod.ChangePassword),
);

const UpdatePassword = ({ setLoading }) => {
  const { showAlert } = useGlobalAlertContext();
  const { reloadProfile } = useAuth();

  const updateCompleteAction = async ({ message, isError = false }) => {
    if (isError) {
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message,
      });
    } else {
      setLoading(true);
      await reloadProfile();
      setLoading(false);
      showAlert(ALERT_TYPES.SUCCESS_ALERT, {
        children: 'Your password has been changed successfully',
      });
    }
  };

  return (
    <div>
      <ChangePassword
        updateCompleteAction={updateCompleteAction}
      ></ChangePassword>
    </div>
  );
};

export default withAuth(withUserInfo(UpdatePassword));
