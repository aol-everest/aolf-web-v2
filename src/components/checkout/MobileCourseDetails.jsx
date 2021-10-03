import React, { useState } from "react";
import moment from "moment";
import classNames from "classnames";
import renderHTML from "react-render-html";
import { COURSE_TYPES, MEMBERSHIP_TYPES, ABBRS } from "@constants";
import { tConvert } from "@utils";

const CourseFeeRender = ({
  userSubscriptions,
  productTypeId,
  price,
  openSubscriptionPaywallPage,
  isUsableCreditAvailable,
  premiumRate,
  discount,
}) => {
  const { fee, delfee, offering, isRegularPrice } = price;
  const isJourneyPremium =
    userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus = userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];
  if (`${COURSE_TYPES.SILENT_RETREAT.value}`.indexOf(productTypeId) >= 0) {
    if (!isJourneyPremium && !isJourneyPlus) {
      return (
        <>
          <h3 className="new-price d-flex justify-content-sm-start justify-content-between">
            Regular rate:
            <span>
              {delfee && <span className="discount">${delfee}</span>} ${fee}
            </span>
          </h3>
          {!isUsableCreditAvailable && (
            <h3 className="new-price d-flex justify-content-sm-start justify-content-between">
              Premium/Journey+ rate:
              <span>
                {premiumRate &&
                  premiumRate.listPrice &&
                  premiumRate.listPrice !== premiumRate.unitPrice && (
                    <span className="discount">
                      ${delfee || premiumRate.listPrice}
                    </span>
                  )}{" "}
                ${premiumRate.unitPrice}
              </span>
            </h3>
          )}
          <CourseButtonRender
            userSubscriptions={userSubscriptions}
            productTypeId={productTypeId}
            openSubscriptionPaywallPage={openSubscriptionPaywallPage}
          />
        </>
      );
    }
    if (isJourneyPremium || isJourneyPlus) {
      if (discount && discount.newPrice) {
        return (
          <h3 className="new-price d-flex justify-content-sm-start justify-content-between">
            Premium/Journey+ rate:
            <span>
              <span className="discount">
                ${delfee || premiumRate.listPrice}
              </span>
              ${premiumRate && premiumRate.unitPrice}
            </span>
          </h3>
        );
      } else {
        return (
          <h3 className="new-price d-flex justify-content-sm-start justify-content-between">
            Premium/Journey+ rate:
            <span>{premiumRate && premiumRate.unitPrice}</span>
          </h3>
        );
      }
    }
  }
  if (
    `${COURSE_TYPES.SKY_BREATH_MEDITATION.value}`.indexOf(productTypeId) >= 0
  ) {
    return (
      <>
        {delfee && (
          <>
            <h2 className="new-price">Limited Time Offer: ${fee}</h2>
            <h3 className="common-price">
              Regular Course Fee: <span className="discount">${delfee}</span>
            </h3>
          </>
        )}
        {!delfee && <h2 className="new-price">Regular Course Fee: ${fee}</h2>}
      </>
    );
  }
};

const CourseButtonRender = ({
  userSubscriptions,
  productTypeId,
  openSubscriptionPaywallPage,
  isUsableCreditAvailable,
}) => {
  const isJourneyPremium =
    userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus = userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];
  const isBasicMember =
    userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value];
  if (`${COURSE_TYPES.SILENT_RETREAT.value}`.indexOf(productTypeId) >= 0) {
    if (
      !isJourneyPremium &&
      !isJourneyPlus &&
      !isBasicMember &&
      !isUsableCreditAvailable
    ) {
      return (
        <button
          data-join-modal="journey-join"
          className="btn-outline white join-btn"
          onClick={openSubscriptionPaywallPage(
            MEMBERSHIP_TYPES.JOURNEY_PLUS.value,
          )}
        >
          Join Journey+
        </button>
      );
    }
  }
};

export const MobileCourseDetails = ({
  workshop,
  closeDetailAction,
  userSubscriptions,
  price,
  openSubscriptionPaywallPage,
}) => {
  const {
    title,
    productTypeId,
    eventStartDate,
    eventEndDate,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    phone1,
    phone2,
    contactEmail,
    notes,
    description,
  } = workshop || {};

  return (
    <div className={classNames("mobile-modal active show")}>
      <div className="mobile-modal__header">
        <div className="close-modal" onClick={closeDetailAction}>
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
        <div className="course-name">{title}</div>
        <CourseFeeRender
          userSubscriptions={userSubscriptions}
          productTypeId={productTypeId}
          price={price}
          openSubscriptionPaywallPage={openSubscriptionPaywallPage}
        />
      </div>
      <div className="mobile-modal__body">
        <div className="course-detail">
          Your course:{" "}
          {moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <span>{`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
              .utc(eventEndDate)
              .format("DD, YYYY")}`}</span>
          )}
          {!moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <span>{`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
              .utc(eventEndDate)
              .format("MMMM DD, YYYY")}`}</span>
          )}
        </div>
        <div className="course-detail">
          Timings:
          {timings &&
            timings.map((time) => {
              return (
                <>
                  <span>
                    {`${moment.utc(time.startDate).format("dd")}: ${tConvert(
                      time.startTime,
                    )}-${tConvert(time.endTime)} ${ABBRS[time.timeZone]}`}
                  </span>
                </>
              );
            })}
        </div>
        <div className="course-detail">
          Instructor(s):
          {primaryTeacherName && <span>{primaryTeacherName}</span>}
          {coTeacher1Name && <span>{coTeacher1Name}</span>}
          {coTeacher2Name && <span>{coTeacher2Name}</span>}
        </div>
        <div className="course-detail">
          Location:
          <span>Online</span>
        </div>
        <div className="course-detail">
          Contact details:
          <span>{phone1}</span>
          {phone2 && <span>{phone2}</span>}
          <span>{contactEmail}</span>
        </div>
        <div className="course-more word-wrap">
          {notes && <>Additional Notes: {renderHTML(notes)}</>}
          <br />
          <br />
          {description && (
            <div className="course-more__full">{renderHTML(description)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileCourseDetails;
