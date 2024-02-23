/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import { AddToCalendarModal, PageLoading } from '@components';
import {
  InPersonGenericCourse,
  OnlineCourse,
  SKYBreathMeditation,
  SahajSamadhi,
  SilentRetreat,
} from '@components/coursethankYouDetails';
import { ABBRS, ALERT_TYPES, COURSE_MODES, COURSE_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { orgConfig } from '@org';
import { api, tConvert } from '@utils';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import moment from 'moment';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useQueryString } from '@hooks';
import { useEffectOnce } from 'react-use';
import { useAnalytics } from 'use-analytics';
import { useEffect } from 'react';

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

function getLastElement(arr) {
  // Check if the array is not null and has a non-zero length
  if (arr && arr.length > 0) {
    // Use slice() to get the last element
    return arr.slice(-1)[0];
  } else {
    return null; // or any default value you prefer
  }
}

const Thankyou = () => {
  const router = useRouter();
  const { track, page } = useAnalytics();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const [paymentIntent] = useQueryString('payment_intent');
  const [courseType] = useQueryString('courseType');
  const { slug } = router.query;
  const workshopId = getLastElement(slug);
  const {
    data: workshop,
    isLoading,
    isError,
    error,
  } = useQuery(
    'workshopDetail',
    async () => {
      const response = await api.get({
        path: 'workshopDetail',
        param: {
          id: workshopId,
          rp: 'checkout',
        },
        isUnauthorized: true,
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!workshopId,
    },
  );

  useEffect(() => {
    if (workshop) {
      track(
        'purchase',
        {
          ecommerce: {
            currency: 'USD',
            value: workshop?.unitPrice,
            transaction_id: paymentIntent,
            shipping: 0.0,
            tax: 0.0,
            coupon: '',
            course_format: workshop?.productTypeId,
            course_name: workshop?.title,
            items: [
              {
                item_id: workshop?.id,
                item_name: workshop?.title,
                affiliation: 'NA',
                coupon: '',
                discount: 0.0,
                index: 0,
                item_brand: workshop?.businessOrg,
                item_category: workshop?.title,
                item_category2: workshop?.mode,
                item_category3: 'paid',
                item_category4: 'NA',
                item_category5: 'NA',
                item_list_id: workshop?.productTypeId,
                item_list_name: workshop?.title,
                item_variant: workshop?.workshopTotalHours,
                location_id: workshop?.locationCity,
                price: workshop?.unitPrice,
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
      page({
        category: 'course_registration',
        name: 'course_registration_thank_you',
        payment_intent: paymentIntent,
        course_type: courseType,
        referral: 'course_search_scheduling',
      });
    }
  }, [workshop]);

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const {
    title = '',
    meetupTitle,
    productTypeId,
    formattedStartDateOnly,
    formattedEndDateOnly,
    eventStartDate,
    eventEndDate,
    isGenericWorkshop,
    eventStartTime,
    eventEndTime,
    meetupStartDateTimeGMT,
    eventendDateTimeGMT,
    eventStartDateTimeGMT,
    mode,
    timings,
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    locationCountry,
  } = workshop;

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  const isMeditationDeluxe =
    COURSE_TYPES.MEDITATION_DELUXE_COURSE.value === productTypeId;
  const gatewayToInfinity =
    COURSE_TYPES.GATEWAY_TO_INFINITY_COURSE.value === productTypeId;

  const newTitle = title || meetupTitle;
  const duration = 2;

  let startDatetime = null;
  if (eventStartDateTimeGMT) {
    startDatetime = moment.utc(`${eventStartDateTimeGMT || ''}`);
  } else if (eventStartDate) {
    startDatetime = moment.utc(
      `${eventStartDate || ''} ${eventStartTime || ''}`,
    );
  } else {
    startDatetime = moment.utc(`${meetupStartDateTimeGMT || ''}`);
  }
  let endDatetime = null;
  if (eventendDateTimeGMT) {
    endDatetime = moment.utc(`${eventendDateTimeGMT || ''}`);
  } else if (eventEndDate) {
    endDatetime = moment.utc(`${eventEndDate || ''} ${eventEndTime || ''}`);
  } else {
    endDatetime = moment.utc(`${meetupStartDateTimeGMT || ''}`).add(2, 'hours');
  }

  const event = {
    timezone: 'Etc/GMT',
    description: newTitle,
    duration,
    endDatetime: endDatetime.format('YYYYMMDDTHHmmss'),
    location:
      mode === COURSE_MODES.IN_PERSON.name
        ? `${locationStreet || ''}, ${locationCity || ''}, ${
            locationProvince || ''
          } ${locationPostalCode || ''}, ${locationCountry || ''}`
        : 'Online',
    startDatetime: startDatetime.format('YYYYMMDDTHHmmss'),
    title: newTitle,
  };

  const addToCalendarAction = (e) => {
    if (e) e.preventDefault();
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: 'Add to Calendar',
      children: <AddToCalendarModal event={event} />,
      closeModalAction: () => {
        hideAlert();
      },
    });

    track('click_button', {
      screen_name: 'course_registration_thank_you',
      event_target: 'add_to_calendar_button',
      course_type: courseType,
      payment_intent: paymentIntent,
      referral: 'course_scheduling_checkout',
    });
  };

  const RenderJourneyContent = () => {
    if (mode === COURSE_MODES.IN_PERSON.name) {
      if (isSilentRetreatType) {
        return <SilentRetreat />;
      }
      if (isSKYType) {
        return <SKYBreathMeditation />;
      }
      if (isSahajSamadhiMeditationType) {
        return <SahajSamadhi />;
      }
      return <InPersonGenericCourse />;
    }
    return <OnlineCourse />;
  };

  const iosAppDownloadAction = () => {
    track('click_button', {
      screen_name: 'course_registration_thank_you',
      event_target: 'ios_app_link',
      course_type: courseType,
      payment_intent: paymentIntent,
      referral: 'course_scheduling_checkout',
    });
  };

  const androidAppDownloadAction = () => {
    track('click_button', {
      screen_name: 'course_registration_thank_you',
      event_target: 'android_app_link',
      course_type: courseType,
      payment_intent: paymentIntent,
      referral: 'course_scheduling_checkout',
    });
  };

  return (
    <>
      <main>
        <NextSeo
          title={title + ' Course Thank You Page'}
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

        {!isSahajSamadhiMeditationType && (
          <>
            <section className="get-started">
              <div className="container-md">
                <div className="row align-items-center">
                  <div className="col-lg-5 col-md-12 p-md-0">
                    <div className="get-started__info">
                      <h3 className="get-started__subtitle">You’re going!</h3>
                      <h1 className="get-started__title section-title">
                        {title}
                      </h1>
                      <p className="get-started__text">
                        You're registered for the {title}{' '}
                        {!isGenericWorkshop &&
                          !isMeditationDeluxe &&
                          !gatewayToInfinity && (
                            <>
                              {' '}
                              from {formattedStartDateOnly} -{' '}
                              {formattedEndDateOnly}
                            </>
                          )}
                      </p>
                      {!isGenericWorkshop &&
                        !isMeditationDeluxe &&
                        !gatewayToInfinity && (
                          <a
                            className="get-started__link"
                            href="#"
                            onClick={addToCalendarAction}
                          >
                            Add to Calendar
                          </a>
                        )}

                      {!gatewayToInfinity && !isMeditationDeluxe && (
                        <p className="get-started__text">
                          <br></br>
                          Next step: You will receive an email with details
                          about your {title}.
                        </p>
                      )}
                      {gatewayToInfinity && (
                        <p className="get-started__text">
                          <br></br>
                          Next step: You will receive an email with details
                          about logging in to your {title} course.
                        </p>
                      )}
                      {isMeditationDeluxe && (
                        <p className="get-started__text">
                          <br></br>
                          Next step: You will receive an email with details
                          about accessing your {title.split('+')?.[0]}
                          online course. You will also receive an email with
                          next steps for choosing your {
                            title.split('+')?.[1]
                          }{' '}
                          course dates.
                        </p>
                      )}
                    </div>
                    {orgConfig.name !== 'HB' && !gatewayToInfinity && (
                      <>
                        <p className="get-started__text">
                          <br />
                          {isMeditationDeluxe
                            ? 'For additional meditations, you can download the app.'
                            : 'To get started, download the app.'}
                          {isGenericWorkshop && (
                            <>
                              <span>
                                We will reach out to schedule dates for your
                                course.
                              </span>
                            </>
                          )}
                        </p>
                        <div className="btn-wrapper">
                          <a
                            className="btn-outline tw-mr-2"
                            onClick={iosAppDownloadAction}
                            href="https://apps.apple.com/us-en/app/art-of-living-journey/id1469587414?ls=1"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img src="/img/ic-apple.svg" alt="apple" />
                            iOS App
                          </a>
                          <a
                            className="btn-outline"
                            onClick={androidAppDownloadAction}
                            href="https://play.google.com/store/apps/details?id=com.aol.app"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img src="/img/ic-android.svg" alt="android" />
                            Android App
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="col-lg-6 col-md-12 offset-lg-1 p-0">
                    <div className="get-started__video">
                      {renderVideo(productTypeId)}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="journey-starts !tw-mb-0">
              <div className="container">
                {!isGenericWorkshop &&
                  !isMeditationDeluxe &&
                  !gatewayToInfinity && (
                    <div className="program-details">
                      <h2 className="program-details__title">
                        Program Details
                      </h2>

                      <ul className="program-details__list-schedule tw-max-h-[400px] tw-overflow-y-auto">
                        {timings &&
                          timings.map((time, i) => {
                            return (
                              <li
                                className="program-details__schedule tw-flex"
                                key={i}
                              >
                                <span className="program-details__schedule-date">
                                  {dayjs.utc(time.startDate).format('LL')}
                                </span>
                                <span className="program-details__schedule-time tw-ml-2">{`${tConvert(
                                  time.startTime,
                                )} - ${tConvert(time.endTime)} ${
                                  ABBRS[time.timeZone]
                                }`}</span>
                              </li>
                            );
                          })}
                      </ul>

                      {(mode === COURSE_MODES.IN_PERSON.name ||
                        mode === COURSE_MODES.DESTINATION_RETREATS.name) && (
                        <>
                          {!workshop.isLocationEmpty && (
                            <ul className="program-details__list-schedule tw-mt-2">
                              <span className="program-details__schedule-date">
                                Location
                              </span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${
                                  workshop.locationStreet || ''
                                }, ${workshop.locationCity} ${
                                  workshop.locationProvince
                                } ${workshop.locationPostalCode} ${
                                  workshop.locationCountry
                                }`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {workshop.locationStreet && (
                                  <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                                    {workshop.locationStreet}
                                  </li>
                                )}
                                <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                                  {workshop.locationCity || ''}
                                  {', '}
                                  {workshop.locationProvince || ''}{' '}
                                  {workshop.locationPostalCode || ''}
                                </li>
                              </a>
                            </ul>
                          )}
                          {workshop.isLocationEmpty && (
                            <ul className="course-details__list">
                              <div className="course-details__list__title">
                                <h6>Location:</h6>
                              </div>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${
                                  workshop.streetAddress1 || ''
                                },${workshop.streetAddress2 || ''} ${
                                  workshop.city
                                } ${workshop.state} ${workshop.zip} ${
                                  workshop.country
                                }`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {workshop.streetAddress1 && (
                                  <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                                    {workshop.streetAddress1}
                                  </li>
                                )}
                                {workshop.streetAddress2 && (
                                  <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                                    {workshop.streetAddress2}
                                  </li>
                                )}
                                <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                                  {workshop.city || ''}
                                  {', '}
                                  {workshop.state || ''} {workshop.zip || ''}
                                </li>
                              </a>
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  )}
                {!isMeditationDeluxe && !gatewayToInfinity && (
                  <>
                    <h2 className="journey-starts__title section-title">
                      Your journey starts here
                    </h2>
                    <RenderJourneyContent />
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <div className="course-bottom-card show">
        <div className="container">
          <div className="course-bottom-card__container">
            <div className="course-bottom-card__info-block">
              <div className="course-bottom-card__img d-none d-lg-block tw-relative tw-h-[60px] tw-max-w-[60px]">
                {isSilentRetreatType && (
                  <img
                    src="/img/course-card-4.png"
                    alt="course-photo"
                    layout="fill"
                  />
                )}
                {isSKYType && (
                  <img
                    src="/img/course-card-2.png"
                    alt="course-photo"
                    layout="fill"
                  />
                )}
                {isSahajSamadhiMeditationType && (
                  <img
                    src="/img/course-card-5.png"
                    alt="course-photo"
                    layout="fill"
                  />
                )}
                {!isSilentRetreatType &&
                  !isSKYType &&
                  !isSahajSamadhiMeditationType && (
                    <img
                      src="/img/course-card-1.png"
                      alt="course-photo"
                      layout="fill"
                    />
                  )}
              </div>
              <div className="course-bottom-card__info">
                {!isGenericWorkshop &&
                  !isMeditationDeluxe &&
                  !gatewayToInfinity && (
                    <p>
                      {dayjs.utc(eventStartDate).format('MMMM D') +
                        ' - ' +
                        dayjs.utc(eventEndDate).format('MMMM D') +
                        ', ' +
                        dayjs.utc(eventEndDate).format('YYYY')}
                    </p>
                  )}
                <div>
                  <h3>{title}</h3>
                </div>
              </div>
            </div>
            {!isMeditationDeluxe && !gatewayToInfinity && (
              <button
                id="register-button-2"
                className="btn-secondary"
                onClick={addToCalendarAction}
              >
                Add to Calendar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Thankyou;
