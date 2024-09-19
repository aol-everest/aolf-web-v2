import { Loader, PageLoading } from '@components';
import { useAuth } from '@contexts';
import { useQueryString } from '@hooks';
import { pushRouteWithUTMQuery, replaceRouteWithUTMQuery } from '@service';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api, convertToUpperCaseAndReplaceSpacesForURL } from '@utils';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { useAnalytics } from 'use-analytics';
import { filterAllowedParams, removeNull } from '@utils/utmParam';
import { PaymentFormBundle } from '@components/paymentFormBundle';
import { orgConfig } from '@org';
import { navigateToLogin } from '@utils';

const Checkout = () => {
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const { id: bundleId } = router.query;
  const [mbsy_source] = useQueryString('mbsy_source', {
    defaultValue: null,
  });
  const [campaignid] = useQueryString('campaignid', {
    defaultValue: null,
  });
  const [mbsy] = useQueryString('mbsy', {
    defaultValue: null,
  });
  const [loading, setLoading] = useState(true);
  const { track, page } = useAnalytics();

  const {
    data: bundle,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'getBundleDetail',
    queryFn: async () => {
      let param = {
        bundleSfid: bundleId,
      };
      const response = await api.get({
        path: 'getBundleDetail',
        param,
      });
      return response.data;
    },
    enabled: !!bundleId,
  });

  const {
    mainProductCtypeIds,
    isPartialPaymentAllowedOnBundle,
    minimumPartialPaymentOnBundle,
    remainPartialPaymentDateCap,
    comboSfid,
    comboName: title,
    comboDescription: description,
    comboIsActive,
    comboUnitPrice: unitPrice,
    comboListPrice: listPrice,
    comboProductSfid: productTypeId,
    comboDetails,
    masterPriceBookId,
    masterPriceBookEntryId,
    otherPaymentOptionAvailable,
    showSecondCourseButton,
    isOnlyBundleCheckout,
  } = bundle || {};

  console.log(bundle);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    if (!bundle) return;

    const products = [
      {
        id: name,
        name: title,
        category: 'bundle',
        ctype: productTypeId,
        variant: 'N/A',
        brand: 'Art of Living Foundation',
        quantity: 1,
        currencyCode: 'USD',
        price: unitPrice,
      },
    ];

    page({
      category: 'course_registration',
      name: 'course_checkout',
      title: title,
      ctype: productTypeId,
      amount: unitPrice,
      requestType: 'Detail',
      hitType: 'paymentpage',
      user: profile?.id,
    });

    track('eec.checkout', {
      page: `Art of Living ${title} workshop registration page`,
      viewType: 'workshop',
      title: title,
      ctype: productTypeId,
      amount: unitPrice,
      requestType: 'Detail',
      hitType: 'paymentpage',
      user: profile?.id,
      ecommerce: {
        checkout: {
          actionField: {
            step: 1,
          },
          products: products,
        },
      },
    });

    track(
      'begin_checkout',
      {
        ecommerce: {
          currency: 'USD',
          value: bundle?.unitPrice,
          course_format: bundle?.productTypeId,
          course_name: bundle?.title,
          items: [
            {
              item_id: bundle?.id,
              item_name: bundle?.title,
              affiliation: 'NA',
              coupon: '',
              discount: 0.0,
              index: 0,
              item_brand: bundle?.businessOrg,
              item_category: bundle?.title,
              item_category2: bundle?.mode,
              item_category3: 'paid',
              item_category4: 'NA',
              item_category5: 'NA',
              item_list_id: bundle?.productTypeId,
              item_list_name: bundle?.title,
              item_variant: bundle?.workshopTotalHours,
              location_id: bundle?.locationCity,
              price: bundle?.unitPrice,
              quantity: 1,
            },
          ],
        },
      },
      {
        plugins: {
          all: false,
          'gtm-ecommerce-plugin': true,
        },
      },
    );
  }, [profile, bundle]);

  const enrollmentCompletionAction = ({ orderId }) => {
    const title = convertToUpperCaseAndReplaceSpacesForURL(bundle.comboName);
    replaceRouteWithUTMQuery(router, {
      pathname: `/us-en/bundle/thankyou/${orderId}`,
      query: {
        comboId: productTypeId,
        page: 'ty',
        referral: 'bundle_checkout',
        type: `local${mbsy_source ? '&mbsy_source=' + mbsy_source : ''}`,
        campaignid,
        mbsy,
      },
    });
  };

  const enrollmentCompletionLink = ({ orderId }) => {
    const title = convertToUpperCaseAndReplaceSpacesForURL(bundle.comboName);
    let filteredParams = {
      comboId: productTypeId,
      page: 'ty',
      referral: 'bundle_checkout',
      type: `local${mbsy_source ? '&mbsy_source=' + mbsy_source : ''}`,
      campaignid,
      mbsy,
      ...filterAllowedParams(router.query),
    };
    filteredParams = removeNull(filteredParams);
    const returnUrl = `${
      window.location.origin
    }/us-en/bundle/thankyou/${orderId}?${queryString.stringify(
      filteredParams,
    )}`;
    return returnUrl;
  };

  const login = () => {
    navigateToLogin(router);
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !bundleId) return <PageLoading />;

  const stripePromise = loadStripe(bundle.publishableKey);

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
        borderRadius: '4px',
      },
      rules: {
        '.Block': {
          backgroundColor: 'var(--colorBackground)',
          boxShadow: 'none',
          padding: '12px',
        },
        '.Input': {
          padding: '12px',
        },
        '.Input:disabled, .Input--invalid:disabled': {
          color: 'lightgray',
        },
        '.Tab': {
          padding: '10px 12px 8px 12px',
          border: 'none',
        },
        '.Tab:hover': {
          border: 'none',
          boxShadow:
            '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)',
        },
        '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
          border: '1px solid #89beec',
          backgroundColor: '#fff',
          boxShadow: '0 2px 25px 0 rgba(61,139,232,.2)',
        },
        '.Label': {
          fontWeight: '500',
        },
      },
    },
  };

  const { email } = profile || {};

  return (
    <>
      <NextSeo title={title} />
      {loading && <Loader />}
      <main>
        <section>
          <div className="container">
            <Elements stripe={stripePromise} options={elementsOptions}>
              <div className="order">
                <PaymentFormBundle
                  bundle={bundle}
                  profile={profile}
                  enrollmentCompletionAction={enrollmentCompletionAction}
                  enrollmentCompletionLink={enrollmentCompletionLink}
                  login={login}
                  isLoggedUser={isAuthenticated}
                />
              </div>
            </Elements>
          </div>
        </section>
      </main>
    </>
  );
};

Checkout.hideHeader = true;
Checkout.hideFooter = true;

export default Checkout;
