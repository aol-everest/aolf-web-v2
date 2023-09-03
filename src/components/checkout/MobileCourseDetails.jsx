import {
  ABBRS,
  COURSE_MODES,
  COURSE_TYPES,
  MEMBERSHIP_TYPES,
} from "@constants";
import { tConvert } from "@utils";
import classNames from "classnames";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const CourseFeeRender = ({
  userSubscriptions,
  productTypeId,
  price,
  openSubscriptionPaywallPage,
  isUsableCreditAvailable,
  premiumRate,
  discount,
  isComboDetailAvailable,
}) => {
  const { fee, delfee } = price;
  const isJourneyPremium =
    userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus = userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;

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
      {delfee && !isComboDetailAvailable && (
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
  isComboDetailAvailable,
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
    meetupStartDate,
    meetupStartTime,
    eventTimeZone,
    meetupStartDateTime,
    primaryTeacherMobilePhone,
    primaryTeacherPhone,
    primaryTeacherEmail,
  } = workshop || {};

  const day = meetupStartDateTime && meetupStartDateTime.split(",")[0];

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  let modalStyle = {
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
          isComboDetailAvailable={isComboDetailAvailable}
        />
      </div>
      <div className="mobile-modal__body">
        {!isGenericWorkshop && (
          <>
            <div className="course-detail">
              Your course:{" "}
              {meetupStartDate && dayjs.utc(meetupStartDate) ? (
                <span>{`${dayjs.utc(meetupStartDate).format("MMMM DD")}, ${dayjs
                  .utc(meetupStartDate)
                  .format("YYYY")}`}</span>
              ) : (
                <>
                  {dayjs
                    .utc(eventStartDate)
                    .isSame(dayjs.utc(eventEndDate), "month") && (
                    <span>{`${dayjs
                      .utc(eventStartDate)
                      .format("MMMM DD")}`}</span>
                  )}
                  {!dayjs
                    .utc(eventStartDate)
                    .isSame(dayjs.utc(eventEndDate), "month") && (
                    <span>{`${dayjs
                      .utc(eventStartDate)
                      .format("MMMM DD")}-${dayjs
                      .utc(eventEndDate)
                      .format("MMMM DD, YYYY")}`}</span>
                  )}
                </>
              )}
            </div>

            <div className="course-detail">
              Timings:
              {timings ? (
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
                })
              ) : (
                <span>
                  {`${day}: ${tConvert(meetupStartTime)} ${
                    ABBRS[eventTimeZone]
                  }`}
                </span>
              )}
            </div>
          </>
        )}
        <div className="course-detail">
          Instructor(s):
          {primaryTeacherName && <span>{primaryTeacherName}</span>}
          {coTeacher1Name && <span>{coTeacher1Name}</span>}
          {coTeacher2Name && <span>{coTeacher2Name}</span>}
        </div>
        {mode === COURSE_MODES.IN_PERSON.name ||
        mode === COURSE_MODES.DESTINATION_RETREATS.name ? (
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
          {phone1 || phone2 || contactEmail ? (
            <>
              <span>{phone1}</span>
              {phone2 && <span>{phone2}</span>}
              <span>{contactEmail}</span>
            </>
          ) : (
            <>
              <span>
                <a href={`tel:${primaryTeacherMobilePhone}`}>
                  {primaryTeacherMobilePhone}
                </a>
              </span>
              {primaryTeacherPhone && (
                <span>
                  <a href={`tel:${primaryTeacherPhone}`}>
                    {primaryTeacherPhone}
                  </a>
                </span>
              )}
              {/* <li>{contactPersonName1}</li> */}
              <span className="meetup-emial">
                <a href={`mailto:${primaryTeacherEmail}`}>
                  {primaryTeacherEmail}
                </a>
              </span>
            </>
          )}
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
