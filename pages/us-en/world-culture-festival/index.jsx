/* eslint-disable react/no-unescaped-entities */
import { FormikWizard } from '@components';
import {
  StepAuth,
  StepContactDetail,
  StepWelcome,
} from '@components/worldCultureFestival';
import { ALERT_TYPES } from '@constants';
import { useAuth, useGlobalAlertContext } from '@contexts';
import { useQueryString } from '@hooks';
import { api, phoneRegExp } from '@utils';
import startsWith from 'lodash.startswith';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useAnalytics } from 'use-analytics';
import * as Yup from 'yup';
import { Loader } from '@components';

const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
};

const INITIAL_VALUES = {
  ticketCount: 1,
  sessionsAttending: [],
  country: 'US',
  phoneCountry: 'US',
  state: '',
  phoneNumber: '',
  agreement: true,
};

const useIsSsr = () => {
  // we always start off in "SSR mode", to ensure our initial browser render
  // matches the SSR render
  const [isSsr, setIsSsr] = useState(true);

  useEffect(() => {
    // `useEffect` never runs on the server, so we must be on the client if
    // we hit this block
    setIsSsr(false);
  }, []);

  return isSsr;
};

function WorldCultureFestival() {
  const isSsr = useIsSsr();
  const router = useRouter();
  const { track } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, profile } = useAuth();
  const { showAlert } = useGlobalAlertContext();
  const [activeStep] = useQueryString('s', {
    defaultValue: 0,
    parse: parseInt,
  });
  const [ticketCount] = useQueryString('t', {
    defaultValue: 1,
    parse: parseInt,
  });
  const [sessionsAttending] = useQueryString('sa', {
    defaultValue: ['Full'],
    parse: JSON.parse,
  });

  let formInitialValue = { ...INITIAL_VALUES, ticketCount, sessionsAttending };
  if (isAuthenticated) {
    formInitialValue = {
      ...formInitialValue,
      country: profile.personMailingCountry
        ? profile.personMailingCountry.toUpperCase()
        : 'US',
      phoneCountry: profile.personMailingCountry
        ? profile.personMailingCountry.toUpperCase()
        : 'US',
      state: profile.personMailingState,
      phoneNumber: profile.personMobilePhone,
    };
  }
  if (
    formInitialValue.country === '' ||
    formInitialValue.country === 'USA' ||
    formInitialValue.country === 'UNITED STATES OF AMERICA'
  ) {
    formInitialValue.country = 'US';
    formInitialValue.phoneCountry = 'US';
  }

  if (
    !startsWith(formInitialValue.phoneNumber, '+') &&
    formInitialValue.country === 'US' &&
    !startsWith(formInitialValue.phoneNumber, '+1')
  ) {
    formInitialValue.phoneNumber = '+1' + formInitialValue.phoneNumber;
  }

  const handleSubmit = useCallback(async (values) => {
    setLoading(true);
    try {
      track('attempted_purchase_ticket', {
        screen_name: 'wcf_registration_get_tickets_page',
        sessions_attending_arr: JSON.stringify(values.sessionsAttending),
        number_of_tickets: values.ticketCount,
        utm_parameters: JSON.stringify(router.query),
      });
      const {
        ticketCount,
        sessionsAttending,
        phoneNumber,
        country,
        state,
        agreement,
      } = values;
      const {
        data,
        status,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'wcfAttendee',
        body: {
          sessionsNames: sessionsAttending,
          ticketQuantity: ticketCount,
          phone: phoneNumber,
          countryIsoCode: country,
          state: state,
          communicationOptIn: agreement,
          utm: router.query,
        },
      });
      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      const params = encodeFormData({ sessionsAttending, ticketCount });
      window.location.href =
        'https://event.us.artofliving.org/us-en/wcf-confirmation?' + params;
      setLoading(false);
    } catch (ex) {
      console.error(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      track('failed_purchase_ticket', {
        screen_name: 'wcf_registration_get_tickets_page',
        sessions_attending_arr: JSON.stringify(values.sessionsAttending),
        number_of_tickets: values.ticketCount,
        utm_parameters: JSON.stringify(router.query),
        error_message: message
          ? `Error: ${message} (${statusCode})`
          : ex.message,
      });
      setLoading(false);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
    }
  }, []);

  if (isSsr) {
    return null;
  }

  return (
    <main>
      <Head>
        <title>World Culture Festival</title>
      </Head>
      <div id="wcfSelect" className="wcf-select__dropdown"></div>
      {loading && <Loader />}
      <FormikWizard
        initialValues={formInitialValue}
        onSubmit={handleSubmit}
        validateOnNext
        activeStepIndex={activeStep}
        steps={[
          {
            component: StepWelcome,
            validationSchema: Yup.object().shape({
              ticketCount: Yup.number()
                .label('No of Tickets')
                .integer()
                .min(1)
                .max(6)
                .required(),
              sessionsAttending: Yup.array()
                .label('Sessions Attending')
                .min(1, 'Sessions Attending is required'),
            }),
          },
          {
            component: StepAuth,
          },
          {
            component: StepContactDetail,
            validationSchema: Yup.object().shape({
              country: Yup.string()
                .label('Country')
                .required('Country is required')
                .nullable(),
              state: Yup.string()
                .label('State')
                .when('country', {
                  is: (country) => country === 'US',
                  then: Yup.string().required('State is required').nullable(),
                  otherwise: Yup.string().nullable(),
                }),
              phoneNumber: Yup.string()
                .label('Phone number')
                .required('Phone number required')
                .matches(phoneRegExp, 'Phone number is not valid'),
            }),
          },
        ]}
      >
        {({ renderComponent }) => <>{renderComponent()}</>}
      </FormikWizard>
    </main>
  );
}
WorldCultureFestival.hideHeader = true;
WorldCultureFestival.hideFooter = true;
WorldCultureFestival.wcfHeader = true;

export default WorldCultureFestival;
