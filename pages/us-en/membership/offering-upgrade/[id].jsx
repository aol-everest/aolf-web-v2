/* eslint-disable react/no-unescaped-entities */
import { PageLoading } from '@components';
import { MembershipCheckoutStripe } from '@components/membership/membershipCheckoutStripe';
import { ALERT_TYPES, MEMBERSHIP_TYPES, COURSE_TYPES } from '@constants';
import { useAuth, useGlobalAlertContext } from '@contexts';
import { useQueryString } from '@hooks';
import { pushRouteWithUTMQuery } from '@service';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@utils';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnalytics } from 'use-analytics';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const RetreatPrerequisiteWarning = () => {
  return (
    <>
      <p className="course-join-card__text">
        Our records indicate that you have not yet taken the prerequisite for
        the Journey + membership, which is{' '}
        <strong>{COURSE_TYPES.SKY_BREATH_MEDITATION.name}</strong> (formerly
        known as the Happiness Program). In{' '}
        {COURSE_TYPES.SKY_BREATH_MEDITATION.name}, you'll learn a powerful
        breath meditation to effectively settle and calm the mind.
      </p>
      <p className="course-join-card__text">
        If our records are not accurate, please contact customer service at{' '}
        <a href="tel:8442735500">(844) 273-5500</a> or email us at{' '}
        <a href="mailto:app.support@us.artofliving.org">
          app.support@us.artofliving.org
        </a>
        . We will be happy to help you so you can sign up for the Silent
        Retreat.
      </p>
    </>
  );
};

/* export const getServerSideProps = async (context) => {
  const { query, req, res, resolvedUrl } = context;
  const { id, ofid = null, cid = null } = query;
  let props = {};
  let token = "";

  try {
    const { Auth } = await withSSRContext({ req });
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    token = currentSession.idToken.jwtToken;
    const res = await api.get({
      path: "profile",
      token,
    });
    props = {
      authenticated: true,
      username: user.username,
      profile: res,
      token,
    };
  } catch (err) {
    console.error(err);
    return {
      redirect: {
        permanent: false,
        destination: `/login?next=${resolvedUrl}`,
      },
      props: {},
    };
  }

  try {
    const res = await api.get({
      path: "subsciption",
      token,
      param: {
        id,
        system_default: 1,
        ofid: ofid,
      },
    });

    props = {
      ...props,
      subsciption: res?.data[0] || null,
      cid,
      ofid,
    };
  } catch (err) {
    console.error(err);
    return {
      redirect: {
        permanent: false,
        destination: `/us`,
      },
      props: {},
    };
  }
  // Pass data to the page via props
  return { props };
}; */

function OfferingUpgradeCheckout() {
  const { profile, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id, ofid, cid } = router.query;
  const {
    data: subscription,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['subscription', id],
    queryFn: async () => {
      const response = await api.get({
        path: 'subsciption',
        param: {
          id,
          system_default: 1,
          ofid: ofid,
        },
      });
      const [result] = response.data;
      if (!result) {
        throw new Error('No subscription found');
      }
      return result;
    },
  });
  const [couponCode] = useQueryString('coupon');
  const [offeringId] = useQueryString('ofid');
  const [courseId] = useQueryString('cid', {
    defaultValue: cid,
  });
  const [returnPage] = useQueryString('page', {
    defaultValue: 'detail',
  });
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { track } = useAnalytics();

  useEffect(() => {
    if (!router.isReady || !subscription) return;

    const products = subscription?.activeSubscriptions.map(
      (activeSubscription) => ({
        id: activeSubscription.sfid,
        name: activeSubscription.subscriptionName,
        category: 'subscription',
        variant: activeSubscription.interval,
        brand: 'Art of Living Foundation',
        quantity: 1,
        currencyCode: 'USD',
        price: activeSubscription.price,
      }),
    );

    track('eec.checkout', {
      page: `Art of Living subscription page`,
      viewType: 'subscription',
      title: activeSubscription.subscriptionName || '',
      ctype: activeSubscription.sfid || '',
      amount: activeSubscription.price || '',
      requestType: 'Detail',
      hitType: 'paymentpage',
      user: profile.id,
      ecommerce: {
        checkout: {
          actionField: {
            step: 1,
          },
          products: products,
        },
      },
    });

    if (
      MEMBERSHIP_TYPES.JOURNEY_PLUS.value === sfid &&
      !profile.isMandatoryWorkshopAttended
    ) {
      showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        className: 'retreat-prerequisite-big meditation-digital-membership',
        title: 'Prerequisite',
        closeModalAction: closeRetreatPrerequisiteWarning,
        footer: () => {
          return (
            <button
              className="btn-secondary v2"
              onClick={closeRetreatPrerequisiteWarning}
            >
              Discover {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
            </button>
          );
        },
        children: <RetreatPrerequisiteWarning />,
      });
    }
  }, [router.isReady, subscription]);

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading) return <PageLoading />;

  const [activeSubscription] = subscription?.activeSubscriptions || [
    { activeSubscriptions: {} },
  ];

  const { name, sfid } = subscription || {};

  const closeRetreatPrerequisiteWarning = (e) => {
    if (e) e.preventDefault();
    hideAlert();
    pushRouteWithUTMQuery(router, {
      pathname: '/us-en/course',
      query: {
        courseType: 'SKY_BREATH_MEDITATION',
      },
    });
  };

  const completeCheckoutCallback = (orderId) => {
    let query = {};
    if (courseId) {
      query = { cid: courseId, page: returnPage };
    }
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/membership/thankyou/${orderId}`,
      query,
    });
  };

  return (
    <main>
      <NextSeo title={name} />
      <section className="order">
        <div className="container">
          <h1 className="title">{name}</h1>
          <p className="order__detail">Take your journey to the next level</p>
          <Elements
            stripe={stripePromise}
            fonts={[
              {
                cssSrc:
                  'https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
              },
            ]}
          >
            {subscription && (
              <MembershipCheckoutStripe
                isOfferingUpgrade
                offeringId={offeringId}
                subscription={subscription}
                activeSubscription={activeSubscription}
                couponCode={couponCode}
                profile={profile}
                isAuthenticated={isAuthenticated}
                completeCheckoutCallback={completeCheckoutCallback}
                closeRetreatPrerequisiteWarning={
                  closeRetreatPrerequisiteWarning
                }
              />
            )}
          </Elements>
        </div>
      </section>
      <section className="additional-information">
        <div className="container">
          {MEMBERSHIP_TYPES.JOURNEY_PLUS.value !== sfid && (
            <div className="row">
              <div className="col-lg-4">
                <div className="information__blcok">
                  <h2 className="information__tile">
                    Support for your journey
                  </h2>
                  <p className="information__text">
                    Build your SKY practice with daily resources in the SKY
                    Journey.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className="information__blcok">
                  <h2 className="information__tile">
                    Exclusive member content
                  </h2>
                  <p className="information__text">
                    Access content exclusive to digital members.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className="information__blcok">
                  <h2 className="information__tile">
                    Meditate wherever you are
                  </h2>
                  <p className="information__text">
                    Take a library of online meditations with you in your
                    pocket.
                  </p>
                </div>
              </div>
            </div>
          )}
          {MEMBERSHIP_TYPES.JOURNEY_PLUS.value === sfid && (
            <div className="row">
              <div className="col-lg-4">
                <div className="information__blcok">
                  <h2 className="information__tile">
                    {' '}
                    {COURSE_TYPES.SILENT_RETREAT.name} Waiver+
                  </h2>
                  <p className="information__text">
                    $400 waiver on your first {COURSE_TYPES.SILENT_RETREAT.name}
                    .
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className="information__blcok">
                  <h2 className="information__tile">More Discounts</h2>
                  <p className="information__text">
                    Receive $200 off additional{' '}
                    {COURSE_TYPES.SILENT_RETREAT.name}*
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className="information__blcok">
                  <h2 className="information__tile">Special Events</h2>
                  <p className="information__text">
                    Receive more discounts for special events with Sri Sri.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="featured-in">
            <h2 className="featured-in__title">Featured in</h2>
            <div className="featured-in__box d-none d-lg-flex">
              <img src="/img/featured-in-cnn.png" alt="cnn" />
              <img src="/img/featured-in-yoga.png" alt="yoga" />
              <img src="/img/featured-in-tnyt.png" alt="tnyt" />
              <img src="/img/featured-in-time.png" alt="time" />
              <img src="/img/featured-in-wsj.png" alt="wsj" />
              <img src="/img/featured-in-forbes.png" alt="forbes" />
              <img src="/img/featured-in-nbc.png" alt="nbc" />
            </div>
            <div className="featured-in__box d-flex d-lg-none">
              <img src="/img/featured-in-cnn.png" alt="cnn" />
              <img src="/img/featured-in-yoga.png" alt="yoga" />
              <img src="/img/featured-in-nbc.png" alt="nbc" />
              <img src="/img/featured-in-wsj.png" alt="wsj" />
              <img src="/img/featured-in-forbes.png" alt="forbes" />
              <img src="/img/featured-in-time.png" alt="time" />
              <img
                className="m-auto"
                src="/img/featured-in-tnyt.png"
                alt="tnyt"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OfferingUpgradeCheckout;
