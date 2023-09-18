import { ABBRS, COURSE_MODES, COURSE_TYPES } from "@constants";
import { tConvert } from "@utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const CourseDetailsCard = ({ workshop, ...rest }) => {
  const {
    eventStartDate,
    eventEndDate,
    email,
    phone1,
    phone2,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    productTypeId,
    mode,
    isGenericWorkshop,
  } = workshop || {};

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  return (
    <div className="reciept__details">
      <div className="course">
        <div className="course__photo tw-relative tw-h-[98px] tw-max-w-[98px]">
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
        <div className="course__info info tw-max-w-[190px]">
          {!isGenericWorkshop && (
            <>
              <ul className="info__list">
                <h2 className="info__title">Date:</h2>
                {dayjs
                  .utc(eventStartDate)
                  .isSame(dayjs.utc(eventEndDate), "month") && (
                  <li className="tw-truncate tw-text-sm tw-tracking-tighter">{`${dayjs
                    .utc(eventStartDate)
                    .format("MMMM DD")}-${dayjs
                    .utc(eventEndDate)
                    .format("DD, YYYY")}`}</li>
                )}
                {!dayjs
                  .utc(eventStartDate)
                  .isSame(dayjs.utc(eventEndDate), "month") && (
                  <li className="tw-truncate tw-text-sm tw-tracking-tighter">{`${dayjs
                    .utc(eventStartDate)
                    .format("MMMM DD")}-${dayjs
                    .utc(eventEndDate)
                    .format("MMMM DD, YYYY")}`}</li>
                )}
              </ul>
              <ul className="info__list mt-3">
                <h2 className="info__title">Timings:</h2>
                {timings &&
                  timings.map((time) => {
                    return (
                      <li
                        className="tw-truncate tw-text-sm tw-tracking-tighter"
                        key={time.startDate}
                      >
                        {`${dayjs.utc(time.startDate).format("dd")}: ${tConvert(
                          time.startTime,
                        )}-${tConvert(time.endTime)} ${ABBRS[time.timeZone]}`}
                      </li>
                    );
                  })}
              </ul>
            </>
          )}
          <ul className="info__list mt-3">
            <h2 className="info__title">Instructor(s):</h2>
            {primaryTeacherName && (
              <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                {primaryTeacherName}
              </li>
            )}
            {coTeacher1Name && (
              <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                {coTeacher1Name}
              </li>
            )}
            {coTeacher2Name && (
              <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                {coTeacher2Name}
              </li>
            )}
          </ul>
          <ul className="info__list mt-3">
            <h2 className="info__title">Contact details:</h2>
            <li className="tw-truncate tw-text-sm tw-tracking-tighter">
              <a href={`tel:${phone1}`}>{phone1}</a>
            </li>
            {phone2 && (
              <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                <a href={`tel:${phone2}`}>{phone2}</a>
              </li>
            )}
            <li className="tw-truncate tw-text-sm tw-tracking-tighter">
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          </ul>

          {(mode === COURSE_MODES.IN_PERSON.name ||
            mode === COURSE_MODES.DESTINATION_RETREATS.name) && (
            <>
              {!workshop.isLocationEmpty && (
                <ul className="info__list mt-3">
                  <h2 className="info__title">Location:</h2>
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
                      <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                        {workshop.locationStreet}
                      </li>
                    )}
                    <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                      {workshop.locationCity || ""}
                      {", "}
                      {workshop.locationProvince || ""}{" "}
                      {workshop.locationPostalCode || ""}
                    </li>
                  </a>
                </ul>
              )}
              {workshop.isLocationEmpty && (
                <ul className="info__list mt-3">
                  <h2 className="info__title">Location:</h2>
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
                      <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                        {workshop.streetAddress1}
                      </li>
                    )}
                    {workshop.streetAddress2 && (
                      <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                        {workshop.streetAddress2}
                      </li>
                    )}
                    <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                      {workshop.city || ""}
                      {", "}
                      {workshop.state || ""} {workshop.zip || ""}
                    </li>
                  </a>
                </ul>
              )}
            </>
          )}

          {mode === COURSE_MODES.ONLINE.name && (
            <>
              {!workshop.isLocationEmpty && (
                <ul className="info__list mt-3">
                  <h2 className="info__title">Location:</h2>

                  <li className="tw-truncate tw-text-sm tw-tracking-tighter">
                    {mode}
                  </li>
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsCard;
