/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import { AddToCalendarModal, PageLoading } from '@components';
import classNames from 'classnames';
import { ABBRS, ALERT_TYPES, COURSE_MODES, COURSE_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { orgConfig } from '@org';
import { pushRouteWithUTMQuery } from '@service';
import { api, calculateBusinessDays, isMobile, tConvert } from '@utils';
import { hasCookie, setCookie } from 'cookies-next';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import moment from 'moment';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryString } from '@hooks';
import { useAnalytics } from 'use-analytics';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const renderVideo = (productTypeId) => {
  switch (productTypeId) {
    case '811570':
    case '1001309':
    case '1008432':
      return (
        <iframe
          src="https://player.vimeo.com/video/432237531"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        ></iframe>
      );
    case '811569':
      return (
        <iframe
          src="https://player.vimeo.com/video/411549679"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        ></iframe>
      );
    case '999649':
      return (
        <img
          src="/img/SahajSamadhi.png"
          alt="course img"
          className="img-fluid"
        />
      );
    default:
      return (
        <img src="/img/image@3x.png" alt="course img" className="img-fluid" />
      );
  }
};

const Thankyou = () => {
  const router = useRouter();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { track, page, identify } = useAnalytics();
  const { id: orderId, referral } = router.query;
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'bundleOrderDetails',
    queryFn: async () => {
      const response = await api.get({
        path: 'getBundleOrderDetails',
        param: {
          oid: orderId,
        },
      });
      return response.data;
    },

    enabled: !!orderId,
  });

  useEffect(() => {
    if (!result || hasCookie(orderExternalId)) return;
    identify(email, {
      id: userExternalId,
      email: email,
      first_name: firstname,
      last_name: lastname,
    });
    page({
      category: 'bundle_registration',
      name: 'bundle_registration_thank_you',
      order_id: orderId,
      referral: referral || 'bundle_search',
    });

    let flowName = 'journey_flow';

    track(
      'purchase',
      {
        ecommerce: {
          currency: 'USD',
          value: unitPrice,
          transaction_id: orderExternalId,
          shipping: 0.0,
          tax: 0.0,
          coupon: '',
          course_format: comboProductSfid,
          course_name: title,
          flow_name: flowName,
          items: [
            {
              item_id: comboSfid,
              item_name: title,
              affiliation: 'NA',
              coupon: '',
              discount: 0.0,
              index: 0,
              item_brand: 'AOL',
              item_category: title,
              item_category2: 'paid',
              item_category3: 'NA',
              item_category4: 'NA',
              item_category5: 'NA',
              item_list_id: comboProductSfid,
              item_list_name: title,
              price: unitPrice,
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

    track(
      "'aol_purchase'",
      {
        event_id: orderExternalId,
        user_properties: [
          {
            customer_id: userExternalId,
            customer_email: email,
            customer_first_name: firstname,
            customer_phone: personMobilePhone,
            customer_last_name: lastname,
            customer_city: personMailingCity,
            customer_zip: personMailingPostalCode,
            customer_address_1: personMailingStreet,
            customer_address_2: '',
            customer_country: personMailingCountry,
            customer_state: personMailingState,
          },
        ],
        ecommerce: [
          {
            currencyCode: 'USD',
            purchase: {
              revenue: amountPaid,
              discount_amount: '',
              tax: '0.00',
              shipping: '0.00',
              sub_total: amountPaid,
              coupon: '',
            },
            products: [
              {
                name: title,
                product_id: comboProductSfid,
                id: comboSfid,
                price: amountPaid,
                category: 'bundle',
                brand: 'Art of Living Foundation',
                quantity: 1,
              },
            ],
          },
        ],
      },
      {
        plugins: {
          // disable this specific track call for all plugins except customerio
          'clevertap-plugin': false,
        },
      },
    );

    setCookie(orderExternalId, 'DONE');
  }, [result]);

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !orderId) return <PageLoading />;

  const {
    userExternalId,
    firstname,
    lastname,
    email,
    personMailingCity,
    personMailingCountry,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
    orderExternalId,
    orderIsPaid,
    orderStatus,
    orderType,
    effectiveDate,
    relatedBundleId,
    amountPaid,
    bundleDetail: {
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
      comboProductSfid,
      comboDetails,
      masterPriceBookId,
      masterPriceBookEntryId,
      otherPaymentOptionAvailable,
      showSecondCourseButton,
      isOnlyBundleCheckout,
    },
  } = result;

  const iosAppDownloadAction = () => {
    track('click_button', {
      screen_name: 'bundle_registration_thank_you',
      event_target: 'ios_app_link',
      order_id: orderId,
      referral: 'bundle_checkout',
    });
  };

  const androidAppDownloadAction = () => {
    track('click_button', {
      screen_name: 'bundle_registration_thank_you',
      event_target: 'android_app_link',
      order_id: orderId,
      referral: 'bundle_checkout',
    });
  };

  const findCourseAction = (e) => {
    if (e) e.preventDefault();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/bundle/courses/${comboSfid}`,
      query: {
        'course-type': 'art-of-living-part-1',
      },
    });
  };

  const renderStickyFooter = () => {
    if (isMobile()) {
      return null;
    }
    return (
      <div className="course-bottom-card show">
        <div className="container">
          <div className="course-bottom-card__container">
            <div className="course-bottom-card__info-block">
              <div className="course-bottom-card__img d-none d-lg-block tw-relative tw-h-[60px] tw-max-w-[60px]">
                <img
                  src="/img/course-card-1.png"
                  alt="course-photo"
                  layout="fill"
                />
              </div>
              <div className="course-bottom-card__info">
                <div>
                  <h3>{title}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <main>
        <NextSeo
          title={title + ' Bundle Thank You Page'}
          noindex={true}
          nofollow={true}
          robotsProps={{
            nosnippet: true,
            notranslate: true,
            noimageindex: true,
            noarchive: true,
            maxSnippet: -1,
            maxImagePreview: 'none',
            maxVideoPreview: -1,
          }}
        />

        <div className="breath-meditation">
          <section className="welcome">
            <div className="container_md welcome__container">
              <div className="welcome__content">
                <p className="welcome__heading">
                  <img src="/img/ic-success.svg" alt="success-icon" /> You’re
                  registered!
                </p>
                <h1 className="welcome__title">{title}</h1>
                <p className="welcome__description">
                  Congratulations on signing up for the <b>{title}</b>.
                </p>
                <p className="welcome__description">
                  You will receive an email with details, next steps and link to
                  start scheduling your courses. You may schedule your first
                  course now or later at your convenience.
                </p>
                <p className="welcome__description">
                  We`ve created your account and your user name and the
                  temporary password have been sent to you via email. You will
                  need this to schedule your courses.
                </p>
                <p className="welcome__description">
                  We highly recommend that you <b>start your journey</b> with
                  the <b>Art of Living Part 1</b> course.
                </p>

                <div className="welcome__navigation">
                  <div className="course-action">
                    <a className="course-link" onClick={findCourseAction}>
                      Find a course
                    </a>
                  </div>
                </div>
              </div>

              <div className="welcome__player player-welcome">
                <img
                  className="player-welcome__cover"
                  src="/img/image@3x.png"
                  alt="welcome-bg"
                />
              </div>
            </div>
          </section>
          <section className="schedule">
            <div className="schedule__container container_md">
              <div className="schedule__download download-schedule scheduleDownload">
                <h3 className="download-schedule__title">
                  Download the app and relax with a <br />
                  meditation
                </h3>

                <div className="download-schedule__actions">
                  <a
                    className="download-schedule__link"
                    href="https://apps.apple.com/us-en/app/art-of-living-journey/id1469587414?ls=1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="download-schedule__logo"
                      src="/img/ic-appstore.svg"
                      alt="appstore-link"
                    />
                    <div className="download-schedule__wrapper">
                      <p className="download-schedule__text">Download on the</p>
                      <p className="download-schedule__market">App Store</p>
                    </div>
                  </a>

                  <a
                    className="download-schedule__link"
                    href="https://play.google.com/store/apps/details?id=com.aol.app"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="download-schedule__logo"
                      src="/img/ic-google-play.svg"
                      alt="google-play-link"
                    />
                    <div className="download-schedule__wrapper">
                      <p className="download-schedule__text">Get it On</p>
                      <p className="download-schedule__market">Google Play</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Thankyou;
