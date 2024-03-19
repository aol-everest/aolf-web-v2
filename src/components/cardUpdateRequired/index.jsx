/* eslint-disable react/no-unescaped-entities */
import { ALERT_TYPES, MEMBERSHIP_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { api } from '@utils';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export const CardUpdateRequiredModal = (allSubscriptions) => {
  return (
    <center>
      Your free membership period will be ending soon. Please update credit card
      details in your profile and continue with the Digital Membership at $
      {allSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value] &&
        allSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value]
          .activeSubscriptions[0].price}{' '}
      per month.
    </center>
  );
};

export const CardUpdateRequired = () => {
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();

  const { data: subsciptionCategories = [] } = useQuery({
    queryKey: 'subsciption',
    queryFn: async () => {
      const response = await api.get({
        path: 'subsciption',
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (!router.isReady || subsciptionCategories.length === 0) return;
    const allSubscriptions = subsciptionCategories.reduce(
      (accumulator, currentValue) => {
        return {
          ...accumulator,
          [currentValue.sfid]: currentValue,
        };
      },
      {},
    );
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      children: <CardUpdateRequiredModal allSubscriptions={allSubscriptions} />,
      title: 'Action required',
    });
  }, [router.isReady, subsciptionCategories]);

  return null;
};
