import { PageLoading } from '@components';
import { MeetupPaymentForm } from '@components/meetup/meetupPaymentForm';
import { useAuth, useGlobalAlertContext } from '@contexts';
import { withAuth } from '@hoc';
import { useQueryString } from '@hooks';
import { pushRouteWithUTMQuery, replaceRouteWithUTMQuery } from '@service';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@utils';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ALERT_TYPES } from '@constants';
import isUrl from 'is-url';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

function getDomainFromUrl(url) {
  if (!isUrl(url)) {
    return url;
  }
  const domain = new URL(url);
  return domain.origin;
}

export const getServerSideProps = async (context) => {
  const referringURL = context.req.headers.referer || '';
  const requestingURL = context.req.reqPath || '';
  return { props: { referringURL, requestingURL } };
};

const Checkout = (props) => {
  const { profile, isAuthenticated } = useAuth();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const router = useRouter();
  const { id: workshopId } = router.query;
  const {
    data: meetup,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['meetupDetail', workshopId],
    queryFn: async () => {
      const response = await api.get({
        path: 'meetupDetail',
        param: {
          id: workshopId,
        },
      });
      return response.data;
    },
    enabled: !!workshopId,
  });

  const isReferBySameSite =
    getDomainFromUrl(props.referringURL) ===
    getDomainFromUrl(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT);

  const [mbsy_source] = useQueryString('mbsy_source');
  const [campaignid] = useQueryString('campaignid');
  const [mbsy] = useQueryString('mbsy');

  useEffect(() => {
    if (meetup?.isEventFull) {
      showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        className: 'event-full-alert',
        title: 'Meetup Full',
        closeModalAction: () => {
          hideAlert();
          pushRouteWithUTMQuery(router, '/us-en/meetup');
        },
        footer: () => {
          return (
            <button
              className="btn-secondary"
              onClick={() => {
                hideAlert();
                pushRouteWithUTMQuery(router, '/us-en/meetup');
              }}
            >
              Find a Meetup
            </button>
          );
        },
        children: (
          <p className="course-join-card__text">
            Meetup is full and you can explore more available courses by
            clicking on find a meetup button.
          </p>
        ),
      });
    }
  }, [meetup]);

  const enrollmentCompletionAction = ({ attendeeId }) => {
    replaceRouteWithUTMQuery(router, {
      pathname: `/us-en/meetup/thankyou/${attendeeId}`,
      query: {
        ctype: meetup.productTypeId,
        page: 'ty',
        type: `local${mbsy_source ? '&mbsy_source=' + mbsy_source : ''}`,
        campaignid,
        mbsy,
      },
    });
  };
  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading) return <PageLoading />;
  return (
    <>
      <NextSeo title={meetup.meetupTitle} />
      <main>
        <section className="order">
          <div className="container">
            <h1 className="title">{meetup.meetupTitle}</h1>
            <p className="order__detail">
              Reconnect with your practice and community
            </p>
            <Elements
              stripe={stripePromise}
              fonts={[
                {
                  cssSrc:
                    'https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
                },
              ]}
            >
              <MeetupPaymentForm
                meetup={meetup}
                profile={profile}
                enrollmentCompletionAction={enrollmentCompletionAction}
                isReferBySameSite={isReferBySameSite}
              />
            </Elements>
          </div>
        </section>
        <section className="additional-information">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                <div className="information__blcok">
                  <h2 className="information__tile">
                    UNPARALLELED CONVENIENCE
                  </h2>
                  <p className="information__text">
                    Choose your schedule. Learn from the comfort of your own
                    home.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className="information__blcok">
                  <h2 className="information__tile">
                    EXPERIENCED FACILITATORS
                  </h2>
                  <p className="information__text">
                    Real-time interaction with highly trained instructors
                    (minimum of 500+ training hours)
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className="information__blcok">
                  <h2 className="information__tile">UPLIFTING COMMUNITY</h2>
                  <p className="information__text">
                    Form deep, authentic connections and community with your
                    fellow participants.
                  </p>
                </div>
              </div>
            </div>

            <div className="featured-in featured-in_with-button">
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
    </>
  );
};

Checkout.hideHeader = true;

export default withAuth(Checkout);
