/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import { AddToCalendarModal, PageLoading } from '@components';
import {
  InPersonGenericCourse,
  OnlineCourse,
  SKYBreathMeditation,
  SKYBreathMeditationCombo,
  SahajSamadhi,
  SahajSamadhiCombo,
  SilentRetreat,
} from '@components/coursethankYouDetails';
import { ABBRS, ALERT_TYPES, COURSE_MODES, COURSE_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { orgConfig } from '@org';
import { pushRouteWithUTMQuery } from '@service';
import { Talkable, api, calculateBusinessDays, tConvert } from '@utils';
import { hasCookie, setCookie } from 'cookies-next';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import moment from 'moment';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useQueryString } from '@hooks';
import { useAnalytics } from 'use-analytics';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

/* export async function getServerSideProps(context) {
  const { query, req, res } = context;
  const { id } = query;
  const { data, attendeeRecord } = await api.get({
    path: "getWorkshopByAttendee",
    param: {
      aid: id,
      skipcheck: 1,
    },
  });
  return {
    props: {
      workshop: data,
      attendeeRecord,
    },
  };
} */

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
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { track, page, identify } = useAnalytics();
  const [courseType] = useQueryString('courseType');
  const { id: attendeeId, comboId, sscid, referral } = router.query;
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery(
    'attendeeRecord',
    async () => {
      const response = await api.get({
        path: 'getWorkshopByAttendee',
        param: {
          aid: attendeeId,
          skipcheck: '1',
          sscid,
        },
      });
      return response;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!attendeeId,
    },
  );

  useEffect(() => {
    if (!result || hasCookie(orderExternalId)) return;
    identify(userEmail, {
      id: userExternalId,
      email: userEmail,
      first_name: first_name,
      last_name: last_name,
    });
    page({
      category: 'course_registration',
      name: 'course_registration_thank_you',
      attendee_id: attendeeId,
      course_type: courseType,
      referral: referral || 'course_search',
    });

    let flowName = 'journey_flow';

    if (referral) {
      flowName =
        referral === 'course_scheduling_checkout'
          ? 'scheduling_flow'
          : 'journey_flow';
    }

    track(
      'purchase',
      {
        ecommerce: {
          currency: 'USD',
          value: workshop?.unitPrice,
          transaction_id: orderExternalId,
          shipping: 0.0,
          tax: 0.0,
          coupon: couponCode || '',
          course_format: workshop?.productTypeId,
          course_name: workshop?.title,
          flow_name: flowName,
          items: [
            {
              item_id: workshop?.id,
              item_name: workshop?.title,
              affiliation: 'NA',
              coupon: couponCode || '',
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

    track(
      'aol_purchase',
      {
        event_id: orderExternalId,
        user_properties: [
          {
            customer_id: userExternalId,
            customer_email: userEmail,
            customer_first_name: first_name,
            customer_phone: personMobilePhone,
            customer_last_name: last_name,
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
              revenue: ammountPaid,
              discount_amount: '',
              tax: '0.00',
              shipping: '0.00',
              sub_total: ammountPaid,
              coupon: couponCode || '',
            },
            products: [
              {
                name: title,
                product_id: productTypeId,
                id: courseId,
                price: ammountPaid,
                category: 'workshop',
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
    Talkable.purchase(
      {
        order_number: orderExternalId, // Unique order number. Example: '100011'
        subtotal: ammountPaid, // Order subtotal (pre-tax, post-discount). Example: '23.97'
        coupon_code: isTalkableCoupon ? couponCode || '' : '', // Coupon code that was used at checkout (pass multiple as an array). Example: 'SAVE20'
        shipping_address: '',
        shipping_zip: '',
      },
      {
        email: userEmail,
        traffic_source: '', // The source of the traffic driven to the campaign. Example: 'facebook'
      },
    );
    setCookie(orderExternalId, 'DONE');
  }, [result]);

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !attendeeId) return <PageLoading />;
  const { data: workshop, attendeeRecord } = result;

  const {
    title = '',
    meetupTitle,
    productTypeId,
    id: courseId,
    formattedStartDateOnly,
    formattedEndDateOnly,
    primaryTeacherName,
    primaryTeacherSfid,
    eventStartDate,
    eventEndDate,
    timings,
    isGenericWorkshop,
    eventStartTime,
    eventEndTime,
    meetupStartDateTimeGMT,
    eventendDateTimeGMT,
    eventStartDateTimeGMT,
    mode,
    availableBundles,
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

  const {
    ammountPaid,
    orderExternalId,
    couponCode,
    selectedGenericSlot = {},
    pricebookName = '',
    isTalkableCoupon,
    first_name,
    last_name,
    userExternalId,
    email: userEmail,
    personMobilePhone,
    personMailingCity,
    personMailingStreet,
    personMailingCountry,
    personMailingState,
    personMailingPostalCode,
  } = attendeeRecord;

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
      attendee_id: attendeeId,
      referral: 'course_checkout',
    });
  };

  const showTiming = (timeZone, option) => {
    let weekdayTiming = (
      <p className="program_card_subtitle c_text c_timing">
        {option.weekdayStartTime} - {option.weekdayEndTime} {timeZone}{' '}
        {option.weekendStartTime &&
          calculateBusinessDays(
            dayjs.utc(option.startDate),
            dayjs.utc(option.endDate),
          ).weekday}
      </p>
    );
    let weekendTiming = option.weekendStartTime && (
      <p className="program_card_subtitle c_text c_timing">
        {option.weekendStartTime} - {option.weekendEndTime} {timeZone}{' '}
        {
          calculateBusinessDays(
            dayjs.utc(option.startDate),
            dayjs.utc(option.endDate),
          ).weekend
        }
      </p>
    );
    if (
      dayjs.utc(option.startDate).day() === 0 ||
      dayjs.utc(option.startDate).day() === 6
    ) {
      return (
        <>
          {weekendTiming}
          {weekdayTiming}
        </>
      );
    } else {
      return (
        <>
          {weekdayTiming}
          {weekendTiming}
        </>
      );
    }
  };

  const getSelectedTimeSlotDetails = (selectedTimeSlot) => {
    if (selectedTimeSlot) {
      return (
        <>
          <p className="program_card_subtitle c_text">
            {dayjs.utc(selectedTimeSlot.startDate).format('MMM D') +
              ' - ' +
              dayjs.utc(selectedTimeSlot.endDate).format('D, YYYY')}
          </p>
          <>{showTiming(selectedTimeSlot.timeZone, selectedTimeSlot)}</>
        </>
      );
    }
    return null;
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

  const isRepeater = (pricebookName || '').toLowerCase().includes('repeater');

  const comboCourse = comboId
    ? availableBundles?.find(
        (availableBundle) => availableBundle.comboProductSfid === comboId,
      )
    : false;

  const isBundleContainsSahaj =
    (comboCourse &&
      comboCourse.comboDetails?.some(
        (comboDetail) =>
          `${COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value}`.indexOf(
            comboDetail.comboDetailProductAllowedFamilyProduct?.split(',')[0],
          ) >= 0,
      )) ||
    false;

  const isBundleContainsSKY =
    (comboCourse &&
      comboCourse.comboDetails?.some(
        (comboDetail) =>
          `${COURSE_TYPES.SKY_BREATH_MEDITATION.value}`.indexOf(
            comboDetail.comboDetailProductAllowedFamilyProduct?.split(',')[0],
          ) >= 0,
      )) ||
    false;

  const isSkyPlusSahajFirstCourse =
    (comboId && isBundleContainsSahaj && isBundleContainsSKY) || false;

  const handleSecondCourseRedirection = () => {
    const secondCourseType = isSKYType
      ? 'SAHAJ_SAMADHI_MEDITATION'
      : 'SKY_BREATH_MEDITATION';

    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course`,
      query: {
        instructor: JSON.stringify({
          value: primaryTeacherSfid,
          label: primaryTeacherName,
        }),
        courseType: secondCourseType,
      },
    });
  };

  const showSecondCourseButton =
    isSkyPlusSahajFirstCourse && comboCourse.showSecondCourseButton;

  const iosAppDownloadAction = () => {
    track('click_button', {
      screen_name: 'course_registration_thank_you',
      event_target: 'ios_app_link',
      course_type: courseType,
      attendee_id: attendeeId,
      referral: 'course_checkout',
    });
  };

  const androidAppDownloadAction = () => {
    track('click_button', {
      screen_name: 'course_registration_thank_you',
      event_target: 'android_app_link',
      course_type: courseType,
      attendee_id: attendeeId,
      referral: 'course_checkout',
    });
  };

  const autoVoidParam = ammountPaid === 0 ? '&autovoid=1' : '';

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
        {process.env.NEXT_PUBLIC_ENABLE_SHAREASALE &&
          process.env.NEXT_PUBLIC_ENABLE_SHAREASALE === 'true' &&
          [
            '811569',
            '12371',
            '12415',
            '999649',
            '10703361',
            '10703362',
            '10703363',
            '435714',
          ].indexOf(productTypeId) >= 0 &&
          !isRepeater && (
            <>
              <img
                src={`https://www.shareasale.com/sale.cfm?tracking=${attendeeId}&amount=${ammountPaid}&merchantID=103115&transtype=sale&X-type=${productTypeId}${autoVoidParam}`}
                width="1"
                height="1"
                id="_SHRSL_img_1"
              ></img>
              <script
                src="https://www.dwin1.com/51621.js"
                type="text/javascript"
                defer="defer"
              ></script>
            </>
          )}
        {isSkyPlusSahajFirstCourse ? (
          <SKYBreathMeditationCombo
            workshop={workshop}
            selectedGenericSlot={selectedGenericSlot}
            showSecondCourseButton={showSecondCourseButton}
            handleSecondCourseRedirection={handleSecondCourseRedirection}
            addToCalendarAction={addToCalendarAction}
            getSelectedTimeSlotDetails={getSelectedTimeSlotDetails}
            isSKYType={isSKYType}
          />
        ) : isSahajSamadhiMeditationType ? (
          <SahajSamadhiCombo
            workshop={workshop}
            selectedGenericSlot={selectedGenericSlot}
            handleSahajCourseRedirection={handleSecondCourseRedirection}
            addToCalendarAction={addToCalendarAction}
            getSelectedTimeSlotDetails={getSelectedTimeSlotDetails}
          />
        ) : (
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
                            href="https://apps.apple.com/us-en/app/art-of-living-journey/id1469587414?ls=1"
                            target="_blank"
                            rel="noreferrer"
                            onClick={iosAppDownloadAction}
                          >
                            <img src="/img/ic-apple.svg" alt="apple" />
                            iOS App
                          </a>
                          <a
                            className="btn-outline"
                            href="https://play.google.com/store/apps/details?id=com.aol.app"
                            target="_blank"
                            rel="noreferrer"
                            onClick={androidAppDownloadAction}
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
                      {selectedGenericSlot.startDate &&
                        getSelectedTimeSlotDetails(selectedGenericSlot)}
                      {!selectedGenericSlot.startDate && (
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
                      )}
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
