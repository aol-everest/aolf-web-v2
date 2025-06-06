import React, { useState, useEffect } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import { PageLoading, PaymentFormScheduling } from '@components';
import { replaceRouteWithUTMQuery } from '@service';
import { api, findCourseTypeByKey, findKeyByProductTypeId } from '@utils';
import { useAuth } from '@contexts';
import { COURSE_TYPES } from '@constants';
import { NextSeo } from 'next-seo';
import { useQuery } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const CheckoutStates = {
  EMAIL_INPUT: 'EMAIL_INPUT',
  USER_INFO: 'USER_INFO',
};

const SchedulingCheckoutFlow = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mode] = useQueryState('mode');
  const [ctype] = useQueryState('ctype');

  const [activeStep, setActiveStep] = useQueryState(
    'step',
    parseAsString.withDefault(CheckoutStates.EMAIL_INPUT),
  );

  const { id: workshopId } = router.query;
  const [courseType, setCourseType] = useQueryState(
    'courseType',
    parseAsString.withDefault('SKY_BREATH_MEDITATION'),
  );

  useEffect(() => {
    if (ctype) {
      const courseTypeKey = findKeyByProductTypeId(ctype);
      setCourseType(courseTypeKey);
    }
  }, [ctype]);

  const { data: workshopMaster = {} } = useQuery({
    queryKey: ['workshopMaster', mode],
    queryFn: async () => {
      let ctypeId = null;
      if (mode === 'both' && findCourseTypeByKey(courseType)?.subTypes) {
        ctypeId = findCourseTypeByKey(courseType)?.subTypes['Online'];
      } else if (
        findCourseTypeByKey(courseType)?.subTypes &&
        findCourseTypeByKey(courseType)?.subTypes[mode]
      ) {
        ctypeId = findCourseTypeByKey(courseType)?.subTypes[mode];
      } else {
        const courseTypeValue =
          findCourseTypeByKey(courseType)?.value ||
          COURSE_TYPES.SKY_BREATH_MEDITATION?.value;

        ctypeId = courseTypeValue ? courseTypeValue.split(';')[0] : undefined;
      }

      let param = {
        ctypeId,
      };
      const response = await api.get({
        path: 'workshopMaster',
        param,
      });
      return response.data;
    },
  });

  const {
    data: activeWorkshop,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['workshopDetail', { workshopId }],
    queryFn: async () => {
      const response = await api.get({
        path: 'workshopDetail',
        param: {
          id: workshopId,
          rp: 'checkout',
        },
        isUnauthorized: !isAuthenticated,
      });
      return response.data;
    },
    enabled: !!workshopId,
  });

  const handleChangeDates = () => {
    replaceRouteWithUTMQuery(router, {
      pathname: `/us-en/course/scheduling`,
      query: {
        ...router.query,
        productTypeId: null,
        mode: 'both',
        ctype: null,
      },
    });
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const stripePromise = loadStripe(activeWorkshop.publishableKey);

  const elementsOptions = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: '"Work Sans",Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '16px',
      },
      rules: {
        '.Block': {
          backgroundColor: 'var(--colorBackground)',
          boxShadow: 'none',
          padding: '12px',
        },
        '.Input': {
          padding: '16px',
          width: '100%',
          maxHeight: '48px',
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.15)',
        },
        '.Input:disabled, .Input--invalid:disabled': {
          color: 'lightgray',
        },
        '.Tab': {
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          padding: '16px 24px',
          color: '#FCA248',
        },
        '.Tab:hover': {
          borderRadius: '16px',
          border: '1px solid #FF9E1B',
          padding: '16px 24px',
          color: '#FCA248',
          boxShadow: 'none',
        },
        '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
          borderRadius: '16px',
          border: '1px solid #FF9E1B',
          padding: '16px 24px',
          color: '#FCA248',
          boxShadow: 'none',
        },
        '.TabIcon--selected, .TabIcon--selected:focus, .TabIcon--selected:hover':
          {
            color: '#FCA248',
            fill: '#FCA248',
          },
        '.TabIcon, .TabIcon:hover': {
          color: '#FCA248',
          fill: '#FCA248',
        },
        '.Label': {
          opacity: '0',
        },
      },
    },
  };

  return (
    <main className="scheduling-page">
      <NextSeo
        title={
          (activeWorkshop?.title || workshopMaster?.title) + ' Course Checkout'
        }
      />
      <Elements stripe={stripePromise} options={elementsOptions}>
        <PaymentFormScheduling
          workshopMaster={workshopMaster}
          workshop={activeWorkshop}
          router={router}
          courseType={courseType}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          handleChangeDates={handleChangeDates}
        />
      </Elements>
    </main>
  );
};

SchedulingCheckoutFlow.hideFooter = true;

export default SchedulingCheckoutFlow;
