import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import classNames from "classnames";
import {
  COURSE_TYPES,
  MEMBERSHIP_TYPES,
  ABBRS,
  COURSE_MODES,
} from "@constants";
import { tConvert } from "@utils";

dayjs.extend(utc);

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
  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSriSriYogaMeditationType =
    COURSE_TYPES.SRI_SRI_YOGA_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isHealingBreathProgram =
    COURSE_TYPES.HEALING_BREATH.value.indexOf(productTypeId) >= 0;
  if (isSilentRetreatType) {
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

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSriSriYogaMeditationType =
    COURSE_TYPES.SRI_SRI_YOGA_MEDITATION.value.indexOf(productTypeId) >= 0;
  if (isSilentRetreatType) {
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
  isUsableCreditAvailable,
  discount,
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
    premiumRate,
    isGenericWorkshop,
    mode,
  } = workshop || {};

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  let modalStyle = {
    backgroundImage: "url(/img/course-card-1.png)",
    backgroundPositionY: "-12px",
    color: "#000000",
  };
  if (isSilentRetreatType) {
    modalStyle = {
      ...modalStyle,
      backgroundImage: "url(/img/course-card-4.png)",
    };
  } else if (isSahajSamadhiMeditationType) {
    modalStyle = {
      ...modalStyle,
      backgroundImage: "url(/img/course-card-5.png)",
    };
  } else if (isSKYType) {
    modalStyle = {
      ...modalStyle,
      backgroundImage: "url(/img/course-card-2.png)",
    };
  }

  return (
    <div className={classNames("mobile-modal active show")}>
      <div className="mobile-modal__header" style={{ ...modalStyle }}>
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
          isUsableCreditAvailable={isUsableCreditAvailable}
          premiumRate={premiumRate}
          discount={discount}
        />
      </div>
      <div className="mobile-modal__body">
        {!isGenericWorkshop && (
          <>
            <div className="course-detail">
              Your course:{" "}
              {dayjs
                .utc(eventStartDate)
                .isSame(dayjs.utc(eventEndDate), "month") && (
                <span>{`${dayjs.utc(eventStartDate).format("MMMM DD")}-${dayjs
                  .utc(eventEndDate)
                  .format("DD, YYYY")}`}</span>
              )}
              {!dayjs
                .utc(eventStartDate)
                .isSame(dayjs.utc(eventEndDate), "month") && (
                <span>{`${dayjs.utc(eventStartDate).format("MMMM DD")}-${dayjs
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
                        {`${dayjs.utc(time.startDate).format("dd")}: ${tConvert(
                          time.startTime,
                        )}-${tConvert(time.endTime)} ${ABBRS[time.timeZone]}`}
                      </span>
                    </>
                  );
                })}
            </div>
          </>
        )}
        <div className="course-detail">
          Instructor(s):
          {primaryTeacherName && <span>{primaryTeacherName}</span>}
          {coTeacher1Name && <span>{coTeacher1Name}</span>}
          {coTeacher2Name && <span>{coTeacher2Name}</span>}
        </div>
        {mode === COURSE_MODES.IN_PERSON.name ? (
          <>
            {!workshop.isLocationEmpty && (
              <div className="course-detail">
                Location:
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${
                    workshop.locationStreet || ""
                  }, ${workshop.locationCity} ${workshop.locationProvince} ${
                    workshop.locationPostalCode
                  } ${workshop.locationCountry}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {workshop.locationStreet && (
                    <span>{workshop.locationStreet}</span>
                  )}
                  <span>
                    {workshop.locationCity || ""}
                    {", "}
                    {workshop.locationProvince || ""}{" "}
                    {workshop.locationPostalCode || ""}
                  </span>
                </a>
              </div>
            )}
            {workshop.isLocationEmpty && (
              <div className="course-detail">
                Location:
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${
                    workshop.streetAddress1 || ""
                  },${workshop.streetAddress2 || ""} ${workshop.city} ${
                    workshop.state
                  } ${workshop.zip} ${workshop.country}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {workshop.streetAddress1 && (
                    <span>{workshop.streetAddress1}</span>
                  )}
                  {workshop.streetAddress2 && (
                    <span>{workshop.streetAddress2}</span>
                  )}
                  <span>
                    {workshop.city || ""}
                    {", "}
                    {workshop.state || ""} {workshop.zip || ""}
                  </span>
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="course-detail">
            Location:
            <span>Online</span>
          </div>
        )}
        <div className="course-detail">
          Contact details:
          <span>{phone1}</span>
          {phone2 && <span>{phone2}</span>}
          <span>{contactEmail}</span>
        </div>
        <div className="course-more word-wrap">
          {notes && (
            <>
              Additional Notes:{" "}
              <span dangerouslySetInnerHTML={{ __html: notes }}></span>
            </>
          )}
          <br />
          <br />
          {description && (
            <div
              className="course-more__full"
              dangerouslySetInnerHTML={{ __html: description }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileCourseDetails;
