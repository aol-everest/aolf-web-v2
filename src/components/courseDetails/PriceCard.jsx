import { useState } from "react";
import { COURSE_TYPES, COURSE_MODES, MODAL_TYPES, ABBRS } from "@constants";
import { useAuth, useGlobalModalContext } from "@contexts";
import { pushRouteWithUTMQuery } from "@service";
import { LinkedCalendar } from "@components/dateRangePicker";
import { isEmpty, priceCalculation, tConvert } from "@utils";
import classNames from "classnames";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/router";
import queryString from "query-string";
import { Popup } from "@components";
import {
  FaArrowRightLong,
  FaUser,
  FaPhone,
  FaSearchengin,
} from "react-icons/fa6";

dayjs.extend(utc);

const datePickerConfig = {
  opens: "left",
  drops: "down",
  showDropdowns: false,
  showISOWeekNumbers: false,
  showWeekNumbers: false,
  locale: {
    cancelLabel: "Clear",
    daysOfWeek: ["S", "M", "T", "W", "T", "F", "S"],
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  autoApply: true,
};

export const PriceCard = ({ workshop }) => {
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [timeZoneFilter, setTimeZoneFilter] = useState(null);
  const { authenticated = false, user } = useAuth();
  const { showModal } = useGlobalModalContext();
  const router = useRouter();
  const { fee, delfee } = priceCalculation({ workshop });

  const {
    title,
    sfid,
    mode,
    premiumRate,
    earlyBirdFeeIncreasing,
    roomAndBoardRange,
    usableCredit,
    productTypeId,
    eventStartDate,
    isGuestCheckoutEnabled = false,
    eventEndDate,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    email,
    phone1,
  } = workshop || {};

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(workshop.productTypeId) >=
    0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(workshop.productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(
      workshop.productTypeId,
    ) >= 0;
  const isVolunteerTrainingProgram =
    COURSE_TYPES.VOLUNTEER_TRAINING_PROGRAM.value.indexOf(
      workshop.productTypeId,
    ) >= 0;
  const isSKYCampusHappinessRetreat =
    COURSE_TYPES.SKY_CAMPUS_HAPPINESS_RETREAT.value.indexOf(
      workshop.productTypeId,
    ) >= 0;
  const isSanyamCourse =
    COURSE_TYPES.SANYAM_COURSE.value.indexOf(workshop.productTypeId) >= 0;
  const isBlessingsCourse =
    COURSE_TYPES.BLESSINGS_COURSE.value.indexOf(workshop.productTypeId) >= 0;

  const isSearchDatesDisabled = !filterStartDate;

  let courseType = "SKY_BREATH_MEDITATION";
  if (isSilentRetreatType) {
    courseType = "SILENT_RETREAT";
  }
  if (isSahajSamadhiMeditationType) {
    courseType = "SAHAJ_SAMADHI_MEDITATION";
  }

  const handleSearchDates = () => {
    if (!isSearchDatesDisabled) {
      let query = { courseType };
      if (filterStartDate) {
        query = {
          ...query,
          startEndDate: `${filterStartDate}|${filterEndDate}`,
        };
      }
      if (timeZoneFilter) {
        query = { ...query, timeZone: timeZoneFilter.value };
      }
      pushRouteWithUTMQuery(router, {
        pathname: "/us-en",
        query,
      });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (authenticated || isGuestCheckoutEnabled) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: "c-o",
        },
      });
    } else {
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo: `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
          router.query,
        )}`,
        defaultView: "SIGNUP_MODE",
      });
    }
  };

  const onDatesChange = (date) => {
    const { startDate, endDate } = date || {};
    setFilterStartDate(startDate ? startDate.format("YYYY-MM-DD") : null);
    setFilterEndDate(endDate ? endDate.format("YYYY-MM-DD") : null);
  };

  const onFilterChange = (value) => {
    setTimeZoneFilter(value);
  };

  const teachers = [primaryTeacherName, coTeacher1Name, coTeacher2Name]
    .filter((name) => name && name.trim() !== "")
    .join(", ");

  return (
    <div class="container">
      <div class="registration-widget">
        <div class=" row register-content">
          <div class="col discount-price">
            ${fee}&nbsp;
            {delfee && (
              <span class="actual-price">
                <s>${delfee}</s>
              </span>
            )}
          </div>
          <div class="col dates">
            <span class="title">Dates</span>
            <br />
            <span class="content">
              {dayjs
                .utc(eventStartDate)
                .isSame(dayjs.utc(eventEndDate), "month") &&
                `${dayjs.utc(eventStartDate).format("M/D/YYYY")} - ${dayjs
                  .utc(eventEndDate)
                  .format("M/D/YYYY")}`}
              {!dayjs
                .utc(eventStartDate)
                .isSame(dayjs.utc(eventEndDate), "month") &&
                `${dayjs.utc(eventStartDate).format("M/DD/YYYY")} - ${dayjs
                  .utc(eventEndDate)
                  .format("M/DD/YYYY")}`}
            </span>
          </div>
          <div class="col location">
            <span class="title">Location</span>
            <br />
            <span class="content">
              {mode === COURSE_MODES.ONLINE.name ? (
                mode
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${
                    workshop.locationStreet || ""
                  }, ${workshop.locationCity} ${workshop.locationProvince} ${
                    workshop.locationPostalCode
                  } ${workshop.locationCountry}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {`${workshop.locationStreet || ""} ${
                    workshop.locationCity || ""
                  }
                          ${workshop.locationProvince || ""} ${
                    workshop.locationCountry || ""
                  }`}
                </a>
              )}
            </span>
          </div>
        </div>
        <div class=" row register-content">
          {timings &&
            timings.map((time) => {
              return (
                <div class="col circle" key={time.startDate}>
                  <div class="dates">
                    <span class="title">
                      {dayjs.utc(time.startDate).format("ddd, MMM DD")}
                    </span>
                    <br />
                    <span class="content">
                      {tConvert(time.startTime)}-{tConvert(time.endTime)}
                      {` (${ABBRS[time.timeZone]})`}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
        <div class=" row register-content">
          <div class="col dates instructor">
            <FaUser class="fa-solid orange" />

            <div class="instructor-content">
              <span class="title">Instructor</span>
              <br />
              <span class="content">{teachers}</span>
            </div>
          </div>
          <div class="col location contact">
            <FaPhone class="fa-solid orange" />
            <div class="contact-content">
              <span class="title">Contact</span>
              <br />
              <span class="content">
                {email} | {phone1}
              </span>
            </div>
          </div>
        </div>

        <div class=" row register-content no_border">
          <div class="col-md-4">
            <button class="register-button" onClick={handleRegister}>
              Register Now <FaArrowRightLong />
            </button>
          </div>
          <div class="col-md-8">
            <div class="select-date-timezone">
              <span class="title">Looking for another date?</span>
              <div class="actions search-form d-flex align-items-center">
                <Popup
                  tabIndex="1"
                  value={filterStartDate}
                  buttonText={
                    filterStartDate
                      ? filterStartDate + " - " + filterEndDate
                      : "Dates"
                  }
                  closeEvent={onDatesChange}
                  containerClassName="course-details__popup_calendar"
                  parentClassName="tw-mr-[20px]"
                  buttonTextclassName={classNames({
                    "select-button": true,
                    active: filterStartDate !== null,
                  })}
                >
                  {({ closeHandler }) => (
                    <LinkedCalendar
                      {...datePickerConfig}
                      noFooter
                      noInfo
                      noCancel
                      onDatesChange={closeHandler}
                    />
                  )}
                </Popup>

                <Popup
                  tabIndex="2"
                  value={timeZoneFilter}
                  buttonText={
                    timeZoneFilter ? timeZoneFilter.name : "Time Zone"
                  }
                  closeEvent={onFilterChange}
                  parentClassName={classNames({
                    "hidden-border": true,
                  })}
                  buttonTextclassName={classNames({
                    "course-details__filter__button": true,
                    active: timeZoneFilter !== null,
                  })}
                >
                  {({ closeHandler }) => (
                    <>
                      <li
                        class="courses-filter__list-item"
                        onClick={closeHandler({
                          name: "Eastern",
                          value: "EST",
                        })}
                      >
                        Eastern
                      </li>
                      <li
                        class="courses-filter__list-item"
                        onClick={closeHandler({
                          name: "Central",
                          value: "CST",
                        })}
                      >
                        Central
                      </li>
                      <li
                        class="courses-filter__list-item"
                        onClick={closeHandler({
                          name: "Mountain",
                          value: "MST",
                        })}
                      >
                        Mountain
                      </li>
                      <li
                        class="courses-filter__list-item"
                        onClick={closeHandler({
                          name: "Pacific",
                          value: "PST",
                        })}
                      >
                        Pacific
                      </li>
                      <li
                        class="courses-filter__list-item"
                        onClick={closeHandler({
                          name: "Hawaii",
                          value: "HST",
                        })}
                      >
                        Hawaii
                      </li>
                    </>
                  )}
                </Popup>
                {/* <button class="select-button">
                <FaCalendarDays /> Dates
              </button>
              <button class="select-button">
                <FaClock /> Time Zone
              </button> */}
              </div>
            </div>
            {!isSearchDatesDisabled && (
              <div class="text-right">
                <button
                  className="register-button mt-4"
                  onClick={handleSearchDates}
                >
                  Search <FaSearchengin />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
