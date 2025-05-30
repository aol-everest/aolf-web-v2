import {
  ABBRS,
  COURSE_MODES,
  COURSE_TYPES,
  MODAL_TYPES,
  COURSE_MODES_MAP,
} from '@constants';
import { useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { tConvert } from '@utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { useAnalytics } from 'use-analytics';
import { navigateToLogin } from '@utils';

dayjs.extend(utc);

export const WorkshopTile = ({ data, isAuthenticated }) => {
  const router = useRouter();
  const { track } = useAnalytics();
  const { showModal } = useGlobalModalContext();
  const {
    title,
    mode,
    isPurchased,
    isEventFull,
    primaryTeacherName,
    productTypeId,
    eventStartDate,
    eventEndDate,
    eventTimeZone,
    sfid,
    locationCity,
    locationProvince,
    centerName,
    isGuestCheckoutEnabled = false,
    coTeacher1Name,
    coTeacher2Name,
    timings,
  } = data || {};

  const enrollAction = (workshopId, productTypeId) => () => {
    track('allcourses_enroll_click', {
      course_format: data?.productTypeId,
      course_name: data?.title,
      course_id: data?.sfid,
      course_price: data?.unitPrice,
    });
    if (isGuestCheckoutEnabled || isAuthenticated) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${workshopId}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
        },
      });
    } else {
      navigateToLogin(
        router,
        `/us-en/course/checkout/${workshopId}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
          router.query,
        )}`,
      );
    }

    // showAlert(ALERT_TYPES.SUCCESS_ALERT, { title: "Success" });
  };

  const isKnownWorkshop =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.SRI_SRI_YOGA_MEDITATION.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.VOLUNTEER_TRAINING_PROGRAM.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.SKY_SILENT_RETREAT.value.indexOf(data.productTypeId) >= 0 ||
    COURSE_TYPES.BLESSINGS_COURSE.value.indexOf(data.productTypeId) >= 0 ||
    COURSE_TYPES.SANYAM_COURSE.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.SRI_SRI_YOGA_DEEP_DIVE.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.ART_OF_LIVING_PREMIUM_PROGRAM.value.indexOf(productTypeId) >=
      0 ||
    COURSE_TYPES.MARMA_TRAINING.value.indexOf(productTypeId) >= 0;

  const coTeacherNames = [coTeacher1Name, coTeacher2Name];
  let extraTeachers = 0;

  for (const name of coTeacherNames) {
    if (name) {
      extraTeachers += 1;
    }
  }

  const detailAction = (workshopId, productTypeId) => () => {
    track('allcourses_details_click', {
      course_format: data?.productTypeId,
      course_name: data?.title,
      course_id: data?.sfid,
      course_price: data?.unitPrice,
    });
    if (isKnownWorkshop) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/${workshopId}`,
        query: {
          ctype: productTypeId,
        },
      });
    } else if (isAuthenticated) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${workshopId}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
        },
      });
    } else {
      navigateToLogin(
        router,
        `/us-en/course/checkout/${workshopId}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
          router.query,
        )}`,
      );
    }
  };

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(data.productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(data.productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(data.productTypeId) >=
    0;

  return (
    <div
      className="course-card"
      data-full={isEventFull}
      data-complete={isPurchased}
    >
      {isSilentRetreatType && (
        <img
          className="course-card__image"
          src="/img/course-card-4.png"
          alt="bg"
          layout="fill"
        />
      )}
      {isSKYType && (
        <img
          className="course-card__image"
          src="/img/course-card-2.png"
          alt="bg"
          layout="fill"
        />
      )}
      {isSahajSamadhiMeditationType && (
        <img
          className="course-card__image"
          src="/img/course-card-5.png"
          alt="bg"
          layout="fill"
        />
      )}
      {!isSilentRetreatType && !isSKYType && !isSahajSamadhiMeditationType && (
        <img
          className="course-card__image"
          src="/img/course-card-1.png"
          alt="bg"
          layout="fill"
        />
      )}
      <h3 className="course-card__title">
        {mode === COURSE_MODES.IN_PERSON.value ? (
          <span className="course-card__type">
            {locationCity ? (
              <span>
                {' '}
                {locationCity || ''}
                {locationProvince && ', '}
                {locationProvince || ''}
              </span>
            ) : (
              centerName
            )}
          </span>
        ) : (
          <span className="course-card__type">{COURSE_MODES_MAP[mode]}</span>
        )}

        <span
          className="course-card__name"
          dangerouslySetInnerHTML={{ __html: title }}
        ></span>
        <span className="course-card__others">
          {primaryTeacherName} {extraTeachers ? `${extraTeachers} more` : ''}
        </span>
      </h3>

      <p className="course-card__date">
        {dayjs.utc(eventStartDate).isSame(dayjs.utc(eventEndDate), 'month') && (
          <>
            {`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
              .utc(eventEndDate)
              .format('DD, YYYY')}`}
            {' ' + ABBRS[eventTimeZone]}
          </>
        )}
        {!dayjs
          .utc(eventStartDate)
          .isSame(dayjs.utc(eventEndDate), 'month') && (
          <>
            {`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
              .utc(eventEndDate)
              .format('MMMM DD, YYYY')}`}
            {' ' + ABBRS[eventTimeZone]}
          </>
        )}
      </p>

      <div className="course-card__times">
        {timings?.length > 0 &&
          timings.map((time, i) => {
            return (
              <p className="course-card__time" key={i}>
                <span>{dayjs.utc(time.startDate).format('ddd')}</span>
                {`${tConvert(time.startTime)} - ${tConvert(time.endTime)} ${
                  ABBRS[time.timeZone]
                }`}
              </p>
            );
          })}
      </div>

      <div className="course-card__navigation">
        <button
          className="btn btn_box_primary text-center"
          onClick={enrollAction(sfid, productTypeId)}
        >
          Enroll
        </button>
        <button
          className="btn btn-box-light text-center"
          onClick={detailAction(sfid, productTypeId)}
        >
          Details
        </button>
      </div>

      <div className="course_complete">Course full</div>
      <div className="course_complete_registration">already registered</div>
    </div>
  );
};
