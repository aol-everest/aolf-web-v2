import React from "react";
import { api, tConvert } from "@utils";
import { withSSRContext } from "aws-amplify";
import renderHTML from "react-render-html";
import moment from "moment";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useQueryString } from "@hooks";
import { useQuery } from "react-query";
import { MEMBERSHIP_TYPES, COURSE_TYPES } from "@constants";

export const getServerSideProps = async (context) => {
  const { query, req, res, resolvedUrl } = context;
  const { id } = query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
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
    res.writeHead(302, {
      Location: `/login?next=${resolvedUrl}`,
    });
    res.end();
    return;
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
    res.writeHead(302, {
      Location: `/course`,
    });
    res.end();
  }

  // Pass data to the page via props
  return { props };
};

const MembershipThankyou = ({ workshop, order, query }) => {
  const [courseId] = useQueryString("cid");
  const [meetupId] = useQueryString("mid");
  const [page] = useQueryString("page", {
    defaultValue: "detail",
  });
  const [courseCType] = useQueryString("ctype");
  const { afterBuyMessageBody, afterBuyMessageHeader, subscriptionMasterSfid } =
    order || {};
  const router = useRouter();

  const { data: workshopDetail = [] } = useQuery(
    "workshopDetail",
    async () => {
      const response = await api.get({
        path: "workshopDetail",
        param: {
          id: courseId,
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!courseId,
    },
  );

  const { data: meetupDetail = [] } = useQuery(
    "meetupDetail",
    async () => {
      const response = await api.get({
        path: "meetupDetail",
        param: {
          id: meetupId,
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!meetupId,
    },
  );

  const searchSilentRetreatsAction = () => {
    router.push({
      pathname: "/course",
      query: {
        courseType: "SILENT_RETREAT",
      },
    });
  };

  const finishRegistrationAction = () => {
    if (courseId) {
      if (page === "detail") {
        router.push({
          pathname: `/course/${courseId}`,
        });
      } else {
        router.push({
          pathname: `/course/checkout/${courseId}`,
        });
      }
    } else if (meetupId) {
      router.push({
        pathname: `/meetup/checkout/${meetupId}`,
      });
    }
  };

  const exploreMeditationsAction = () => {
    router.push({
      pathname: `/meditate`,
    });
  };

  const getEventImage = () => {
    if (workshop.eventType === "Meetup") {
      switch (workshop.meetupType) {
        case "Short SKY Meditation Meetup":
          return <img src="/img/SKY_Meetup_desktop.png" alt="card" />;
        case "Guided Meditation Meetup":
          return <img src="/img/Sahaj_meetup_desktop.png" alt="card" />;
        default:
          return <img src="/img/SKY_Meetup_desktop.png" alt="card" />;
      }
    } else if (workshop.eventType === "Workshop") {
      if (
        `${COURSE_TYPES.SILENT_RETREAT.value}`.indexOf(
          workshop.productTypeId,
        ) >= 0
      ) {
        return <img src="/img/Silence_desktop.png" alt="card" />;
      }
      if (
        `${COURSE_TYPES.SKY_BREATH_MEDITATION.value}`.indexOf(
          workshop.productTypeId,
        ) >= 0
      ) {
        return <img src="/img/Sahaj_meetup_desktop.png" alt="card" />;
      }
      if (
        `${COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value}`.indexOf(
          workshop.productTypeId,
        ) >= 0
      ) {
        return <img src="/img/Sahaj_meetup_desktop.png" alt="card" />;
      }
      return <img src="/img/Silence_desktop.png" alt="card" />;
    }
  };

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
  } = workshopDetail || {};

  return (
    <main>
      <section
        className={classNames("journey-confirmation", {
          "journey-confirmation_v2": !courseId && !meetupId,
          "journey-confirmation_v1": courseId || meetupId,
        })}
      >
        <div className="container">
          <div className="row">
            <div
              className={classNames({
                "col-12 col-md-10 mx-auto": !courseId && !meetupId,
                "col-11 mx-auto": courseId || meetupId,
              })}
            >
              <h1 className="journey-confirmation__title section-title">
                {afterBuyMessageHeader && renderHTML(afterBuyMessageHeader)}
              </h1>
              <div className="journey-confirmation__card mx-auto">
                <div className="journey-confirmation__info">
                  {!courseId && !meetupId && (
                    <p className="journey-confirmation__info-text">
                      {afterBuyMessageBody && renderHTML(afterBuyMessageBody)}
                    </p>
                  )}
                  {courseId && (
                    <p className="journey-confirmation__info-text">
                      You’re just one step away from completing your{" "}
                      {workshop.title} registration. If you are not
                      automatically redirected, please click the button below.
                    </p>
                  )}
                  {meetupId && (
                    <p className="journey-confirmation__info-text">
                      You’re just one step away from completing your{" "}
                      {workshop.meetupTitle} registration. If you are not
                      automatically redirected, please click the button below.
                    </p>
                  )}
                  <div className="journey-confirmation__info_bottom">
                    {subscriptionMasterSfid ===
                      MEMBERSHIP_TYPES.JOURNEY_PLUS.value && (
                      <>
                        {!courseId && (
                          <button
                            className="btn-secondary"
                            onClick={searchSilentRetreatsAction}
                          >
                            Search Silent Retreats
                          </button>
                        )}
                        {courseId && (
                          <button
                            className="btn-secondary"
                            onClick={finishRegistrationAction}
                          >
                            Finish Registration
                          </button>
                        )}
                      </>
                    )}
                    {subscriptionMasterSfid ===
                      MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value && (
                      <>
                        {meetupId && (
                          <button
                            className="btn-secondary v2"
                            onClick={finishRegistrationAction}
                          >
                            Finish Registration
                          </button>
                        )}
                        {!meetupId && (
                          <button
                            className="btn-secondary v2"
                            onClick={exploreMeditationsAction}
                          >
                            Explore Meditations
                          </button>
                        )}
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
                          Search Silent Retreats
                        </button>
                      )}
                  </div>
                </div>
                {courseId && (
                  <div className="journey-confirmation__image">
                    {moment
                      .utc(eventStartDate)
                      .isSame(moment.utc(eventEndDate), "month") && (
                      <span className="journey-confirmation__date">
                        {`${moment
                          .utc(eventStartDate)
                          .format("MMMM DD")}-${moment
                          .utc(eventEndDate)
                          .format("DD, YYYY")}`}
                      </span>
                    )}
                    {!moment
                      .utc(eventStartDate)
                      .isSame(moment.utc(eventEndDate), "month") && (
                      <span className="journey-confirmation__date">
                        {`${moment
                          .utc(eventStartDate)
                          .format("MMMM DD")}-${moment
                          .utc(eventEndDate)
                          .format("MMMM DD, YYYY")}`}
                      </span>
                    )}
                    <img src="/img/journey-card-img-v2.png" alt="card" />
                    <div className="journey-confirmation__course-detail">
                      <h4 className="journey-confirmation__course-type">
                        {mode}
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
                    {moment
                      .utc(eventStartDate)
                      .isSame(moment.utc(eventEndDate), "month") && (
                      <span className="journey-confirmation__date">
                        {`${moment.utc(meetupStartDate).format("MMMM DD")}, `}
                        {`${tConvert(meetupStartTime)}`}
                      </span>
                    )}
                    {getEventImage()}
                    <div className="journey-confirmation__course-detail">
                      <h4 className="journey-confirmation__course-type">
                        {mode}
                      </h4>
                      <h2 className="journey-confirmation__course-name">
                        {meetupTitle}
                      </h2>
                      <h3 className="journey-confirmation__course-trainer">
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
                <h1 className="journey-confirmation_mobile__title section-title">
                  {afterBuyMessageHeader && renderHTML(afterBuyMessageHeader)}
                </h1>
                <p className="journey-confirmation_mobile__info-text">
                  You’re just one step away from completing your Silent Retreat
                  registration. If you are not automatically redirected, please
                  click the button below.
                </p>
                <button
                  className="journey-confirmation_mobile__button btn-secondary v2"
                  onClick={finishRegistrationAction}
                >
                  Finish Registration
                </button>
              </div>
            </div>
          </div>
          <div className="journey-confirmation_mobile__image">
            {moment
              .utc(eventStartDate)
              .isSame(moment.utc(eventEndDate), "month") && (
              <span className="journey-confirmation_mobile__date">
                {`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                  .utc(eventEndDate)
                  .format("DD, YYYY")}`}
              </span>
            )}
            {!moment
              .utc(eventStartDate)
              .isSame(moment.utc(eventEndDate), "month") && (
              <span className="journey-confirmation_mobile__date">
                {`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                  .utc(eventEndDate)
                  .format("MMMM DD, YYYY")}`}
              </span>
            )}
            {getEventImage()}
            {/* <img
                src={require('../../assests/images/new_design/journey-card-bg.png')}
                alt="card"
              /> */}
            <div className="journey-confirmation_mobile__course-detail">
              <h4 className="journey-confirmation_mobile__course-type">
                {mode}
              </h4>
              <h2 className="journey-confirmation_mobile__course-name">
                {title}
              </h2>
              <h3 className="journey-confirmation_mobile__course-trainer">
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

export default MembershipThankyou;
