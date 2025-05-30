import { PageLoading } from '@components';
import {
  CONTENT_FOLDER_IDS,
  COURSE_TYPES,
  MEMBERSHIP_TYPES,
  COURSE_MODES_MAP,
} from '@constants';
import { useAuth } from '@contexts';
import { withAuth } from '@hoc';
import { useQueryString } from '@hooks';
import { pushRouteWithUTMQuery } from '@service';
import { api, tConvert } from '@utils';
import classNames from 'classnames';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

dayjs.extend(utc);

/* export const getServerSideProps = async (context) => {
  const { query, req, res, resolvedUrl } = context;
  const { id, cid = null } = query;
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
      path: "getSubscriptionOrderDetails",
      token,
      param: {
        oid: id,
      },
    });
    props = {
      ...props,
      order: res.order,
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

const MembershipThankyou = () => {
  const { reloadProfile, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'getSubscriptionOrderDetails',
    queryFn: async () => {
      const response = await api.get({
        path: 'getSubscriptionOrderDetails',
        param: {
          oid: id,
        },
      });
      return response.order;
    },
    enabled: router.isReady,
  });
  useEffect(() => {
    if (!isAuthenticated || !order) return;
    reloadProfile();

    if (courseId || meetupId) {
      setTimeout(() => {
        finishRegistrationAction();
      }, 5000);
    }
  }, [isAuthenticated, order]);

  const [courseId] = useQueryString('cid');
  const [meetupId] = useQueryString('mid');
  const [page] = useQueryString('page', {
    defaultValue: 'detail',
  });
  const [courseCType] = useQueryString('ctype');
  const {
    afterBuyMessageBody,
    afterBuyMessageHeader,
    subscriptionMasterSfid,
    subscriptionType,
  } = order || {};

  const { data: workshopDetail = [] } = useQuery({
    queryKey: 'workshopDetail',
    queryFn: async () => {
      const response = await api.get({
        path: 'workshopDetail',
        param: {
          id: courseId,
        },
      });
      return response.data;
    },

    enabled: !!courseId,
  });

  const { data: meetupDetail = [] } = useQuery({
    queryKey: 'meetupDetail',
    queryFn: async () => {
      const response = await api.get({
        path: 'meetupDetail',
        param: {
          id: meetupId,
        },
      });
      return response.data;
    },
    enabled: !!meetupId,
  });

  const courseDetail = courseId ? workshopDetail : meetupDetail;

  const searchSilentRetreatsAction = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/courses/${COURSE_TYPES.SILENT_RETREAT.slug}`,
    });
  };

  const finishRegistrationAction = () => {
    if (courseId) {
      if (page === 'detail') {
        pushRouteWithUTMQuery(router, {
          pathname: `/us-en/course/${courseId}`,
        });
      } else {
        pushRouteWithUTMQuery(router, {
          pathname: `/us-en/course/checkout/${courseId}`,
          query: {
            page: 'c-o',
          },
        });
      }
    } else if (meetupId) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/meetup/checkout/${meetupId}`,
        query: {
          page: 'c-o',
        },
      });
    }
  };

  const exploreMeditationsAction = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
    });
  };

  const getEventImage = () => {
    if (courseDetail.eventType === 'Meetup') {
      switch (courseDetail.meetupType) {
        case 'Short SKY Meditation Meetup':
          return <img src="/img/SKY_Meetup_desktop.png" alt="card" />;
        case 'Guided Meditation Meetup':
          return (
            <img src="/img/Sahaj_meetup_desktop.png" alt="card" layout="fill" />
          );
        default:
          return <img src="/img/SKY_Meetup_desktop.png" alt="card" />;
      }
    } else if (courseDetail.eventType === 'Workshop') {
      if (
        `${COURSE_TYPES.SILENT_RETREAT.value}`.indexOf(
          courseDetail.productTypeId,
        ) >= 0
      ) {
        return <img src="/img/Silence_desktop.png" alt="card" />;
      }
      if (
        `${COURSE_TYPES.SKY_BREATH_MEDITATION.value}`.indexOf(
          workshopDetail.productTypeId,
        ) >= 0
      ) {
        return <img src="/img/Sahaj_meetup_desktop.png" alt="card" />;
      }
      if (
        `${COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value}`.indexOf(
          courseDetail.productTypeId,
        ) >= 0
      ) {
        return <img src="/img/Sahaj_meetup_desktop.png" alt="card" />;
      }
      return <img src="/img/Silence_desktop.png" alt="card" />;
    }
  };

  const handleiOSAppClick = () => {
    window.open(
      'https://apps.apple.com/us-en/app/art-of-living-journey/id1469587414?ls=1',
      '_blank',
    );
  };

  const handleAndroidAppClick = () => {
    window.open(
      'https://play.google.com/store/apps/details?id=com.aol.app',
      '_blank',
    );
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(courseDetail.productTypeId) >= 0;

  const {
    title,
    meetupTitle,
    meetupStartDate,
    meetupStartTime,
    meetupStartDateTimeGMT,
    mode,
    primaryTeacherName,
    eventStartDate,
    eventEndDate,
  } = courseDetail || {};

  const isDigitalMembership =
    subscriptionMasterSfid === MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value;

  return (
    <main>
      <section
        className={
          isDigitalMembership
            ? 'congratulations'
            : classNames('journey-confirmation', {
                'journey-confirmation_v2':
                  courseId === null && meetupId === null,
                'journey-confirmation_v1': !!courseId || !!meetupId,
              })
        }
      >
        <div className="container">
          <div className="row">
            <div
              className={classNames({
                'col-12 col-md-10 mx-auto':
                  courseId === null && meetupId === null,
                'col-11 mx-auto': !!courseId || !!meetupId,
              })}
            >
              {afterBuyMessageHeader && (
                <h1
                  className="journey-confirmation__title section-title"
                  dangerouslySetInnerHTML={{ __html: afterBuyMessageHeader }}
                ></h1>
              )}
              <div
                className={
                  isDigitalMembership
                    ? 'congratulations__card mx-auto'
                    : 'journey-confirmation__card mx-auto'
                }
              >
                <div
                  className={
                    isDigitalMembership
                      ? 'congratulations__info'
                      : 'journey-confirmation__info'
                  }
                >
                  {!courseId && !meetupId && afterBuyMessageBody && (
                    <p
                      className={
                        isDigitalMembership
                          ? 'congratulations__info-text congratulations__info-text_left'
                          : 'journey-confirmation__info-text'
                      }
                      dangerouslySetInnerHTML={{ __html: afterBuyMessageBody }}
                    ></p>
                  )}
                  {courseId && (
                    <p
                      className={
                        isDigitalMembership
                          ? 'congratulations__info-text congratulations__info-text_left'
                          : 'journey-confirmation__info-text'
                      }
                    >
                      You’re just one step away from completing your{' '}
                      {workshopDetail.title} registration. If you are not
                      automatically redirected, please click the button below.
                    </p>
                  )}
                  {meetupId && (
                    <p
                      className={
                        isDigitalMembership
                          ? 'congratulations__info-text congratulations__info-text_left'
                          : 'journey-confirmation__info-text'
                      }
                    >
                      You’re just one step away from completing your{' '}
                      {courseDetail.meetupTitle} registration. If you are not
                      automatically redirected, please click the button below.
                    </p>
                  )}

                  <div
                    className={
                      isDigitalMembership
                        ? 'congratulations__info_bottom'
                        : 'journey-confirmation__info_bottom'
                    }
                  >
                    {subscriptionType ===
                      MEMBERSHIP_TYPES.JOURNEY_PLUS.name && (
                      <>
                        {(courseId || meetupId) && (
                          <button
                            className="btn-secondary"
                            onClick={finishRegistrationAction}
                          >
                            Finish Registration
                          </button>
                        )}

                        {!courseId && !meetupId && (
                          <button
                            className="btn-secondary"
                            onClick={searchSilentRetreatsAction}
                          >
                            {COURSE_TYPES.SILENT_RETREAT.name}
                          </button>
                        )}
                      </>
                    )}
                    {subscriptionType ===
                      MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.name && (
                      <>
                        <button
                          onClick={handleiOSAppClick}
                          className="app-button congratulations-button"
                        >
                          <img
                            src="/img/ic-ios.png"
                            alt="Available on the AppStore"
                            className="app-button__image"
                          />
                        </button>
                        <button
                          onClick={handleAndroidAppClick}
                          className="app-button congratulations-button"
                        >
                          <img
                            src="/img/ic-gplay.png"
                            alt="Available on the AppStore"
                            className="app-button__image"
                          />
                        </button>
                        {meetupId && (
                          <button
                            className="btn-secondary v2"
                            onClick={finishRegistrationAction}
                          >
                            Finish Registration
                          </button>
                        )}
                        {/* {!meetupId && (
                          <button
                            className="btn-secondary v2"
                            onClick={exploreMeditationsAction}
                          >
                            Explore Meditations
                          </button>
                        )} */}
                      </>
                    )}
                    {subscriptionMasterSfid !==
                      MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value &&
                      subscriptionMasterSfid !==
                        MEMBERSHIP_TYPES.JOURNEY_PLUS.value && (
                        <button
                          className="btn-secondary v2"
                          onClick={searchSilentRetreatsAction}
                        >
                          {COURSE_TYPES.SILENT_RETREAT.name}
                        </button>
                      )}
                  </div>
                </div>
                {courseId && (
                  <div className="journey-confirmation__image">
                    {dayjs
                      .utc(eventStartDate)
                      .isSame(dayjs.utc(eventEndDate), 'month') && (
                      <span className="journey-confirmation__date">
                        {`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
                          .utc(eventEndDate)
                          .format('DD, YYYY')}`}
                      </span>
                    )}
                    {!dayjs
                      .utc(eventStartDate)
                      .isSame(dayjs.utc(eventEndDate), 'month') && (
                      <span className="journey-confirmation__date">
                        {`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
                          .utc(eventEndDate)
                          .format('MMMM DD, YYYY')}`}
                      </span>
                    )}
                    <img src="/img/journey-card-img-v2.png" alt="card" />
                    <div className="journey-confirmation__course-detail">
                      <h4 className="journey-confirmation__course-type">
                        {COURSE_MODES_MAP[mode]}
                      </h4>
                      <h2 className="journey-confirmation__course-name">
                        {title}
                      </h2>
                      <h3 className="journey-confirmation__course-trainer">
                        {primaryTeacherName}
                      </h3>
                    </div>
                  </div>
                )}
                {meetupId && (
                  <div className="journey-confirmation__image">
                    <span className="journey-confirmation__date">
                      {`${dayjs.utc(meetupStartDate).format('MMMM DD')}, `}
                      {`${tConvert(meetupStartTime)}`}
                    </span>
                    {getEventImage()}
                    <div className="journey-confirmation__course-detail ">
                      <h4 className="journey-confirmation__course-type !tw-text-slate-700">
                        {COURSE_MODES_MAP[mode]}
                      </h4>
                      <h2 className="journey-confirmation__course-name !tw-text-slate-700">
                        {meetupTitle}
                      </h2>
                      <h3 className="journey-confirmation__course-trainer !tw-text-slate-700">
                        {primaryTeacherName}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {(courseId || meetupId) && (
        <section className="journey-confirmation_mobile">
          <div className="container">
            <div className="col-12">
              <div className="journey-confirmation_mobile__info">
                {afterBuyMessageHeader && (
                  <h1
                    className="journey-confirmation_mobile__title section-title"
                    dangerouslySetInnerHTML={{ __html: afterBuyMessageHeader }}
                  ></h1>
                )}
                <p className="journey-confirmation_mobile__info-text">
                  You’re just one step away from completing your{' '}
                  {COURSE_TYPES.SILENT_RETREAT.name}
                  registration. If you are not automatically redirected, please
                  click the button below.
                </p>
                <button
                  className="journey-confirmation_mobile__button btn-secondary v2"
                  onClick={finishRegistrationAction}
                >
                  Finish Registration 1
                </button>
              </div>
            </div>
          </div>
          <div className="journey-confirmation_mobile__image">
            {courseId && (
              <>
                {dayjs
                  .utc(eventStartDate)
                  .isSame(dayjs.utc(eventEndDate), 'month') && (
                  <span className="journey-confirmation_mobile__date">
                    {`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
                      .utc(eventEndDate)
                      .format('DD, YYYY')}`}
                  </span>
                )}
                {!dayjs
                  .utc(eventStartDate)
                  .isSame(dayjs.utc(eventEndDate), 'month') && (
                  <span className="journey-confirmation_mobile__date">
                    {`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
                      .utc(eventEndDate)
                      .format('MMMM DD, YYYY')}`}
                  </span>
                )}
              </>
            )}
            {meetupId && (
              <span className="journey-confirmation_mobile__date">
                {`${dayjs.utc(meetupStartDate).format('MMMM DD')}, `}
                {`${tConvert(meetupStartTime)}`}
              </span>
            )}

            {getEventImage()}

            <div className="journey-confirmation_mobile__course-detail">
              <h4 className="journey-confirmation_mobile__course-type !tw-text-slate-700">
                {COURSE_MODES_MAP[mode]}
              </h4>
              <h2 className="journey-confirmation_mobile__course-name !tw-text-slate-700">
                {title || meetupTitle}
              </h2>
              <h3 className="journey-confirmation_mobile__course-trainer !tw-text-slate-700">
                {primaryTeacherName}
              </h3>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

MembershipThankyou.hideHeader = true;

export default withAuth(MembershipThankyou);
