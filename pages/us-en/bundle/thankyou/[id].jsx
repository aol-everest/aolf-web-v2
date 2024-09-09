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

  const getCourseFindLink = () => {
    return `/us-en/bundle/courses/${comboSfid}?course-type=art-of-living-part-1`;
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
                <p className="welcome__description v1">
                  Congratulations on signing up for the <b>{title}</b>.
                </p>
                <p className="welcome__description v1">
                  <b className="tw-text-orange-500">
                    You will receive an email with details, next steps and link
                    to start scheduling your courses.
                  </b>{' '}
                  You may schedule your first course now or later at your
                  convenience.
                </p>
                <p className="welcome__description v1">
                  <b className="tw-text-orange-500">
                    You will be prompted to log into your account to start
                    scheduling your courses.
                  </b>{' '}
                  You will need this to schedule your courses.
                </p>
                <p className="welcome__description v1">
                  We highly recommend that you <b>start your journey</b> with
                  the <b>Art of Living Part 1</b> course.
                </p>
                <div>
                  <a
                    class="btn-primary"
                    href={getCourseFindLink()}
                    target="_blank"
                  >
                    Schedule Now
                  </a>
                </div>
                <p className="welcome__description v1 tw-pt-10">
                  We are here to support you every step of the way. If you have
                  any questions, feel free to reach out to us
                </p>

                <p className="welcome__description v1">
                  <ul>
                    <li>
                      Email:{' '}
                      <a href="mailto:support@us.artofliving.org">
                        support@us.artofliving.org
                      </a>
                    </li>
                    <li>
                      Phone: <a href="tel:+1 (855) 202-4400">(855) 202-4400</a>
                    </li>
                  </ul>
                </p>
                <p className="welcome__description v1">
                  With you on your Journey!{' '}
                </p>
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
        </div>
      </main>
    </>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";
Thankyou.hideHeader = true;
Thankyou.hideFooter = true;

export default Thankyou;
