/* eslint-disable no-inline-styles/no-inline-styles */
import { Popup } from "@components";
import { LinkedCalendar } from "@components/dateRangePicker";
import { ABBRS, COURSE_MODES, MODAL_TYPES } from "@constants";
import { useAuth, useGlobalModalContext } from "@contexts";
import { pushRouteWithUTMQuery } from "@service";
import { priceCalculation, tConvert } from "@utils";
import classNames from "classnames";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/router";
import { useState } from "react";
import queryString from "query-string";

dayjs.extend(utc);

export const CourseDetailsCard = ({ workshop, courseType, ...rest }) => {
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [timeZoneFilter, setTimeZoneFilter] = useState(null);
  const router = useRouter();
  const { authenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();

  const onFilterChange = (value) => {
    setTimeZoneFilter(value);
  };

  const onDatesChange = (date) => {
    const { startDate, endDate } = date || {};
    setFilterStartDate(startDate ? startDate.format("MM/DD") : null);
    setFilterEndDate(endDate ? endDate.format("MM/DD") : null);
  };

  const handleSearchDates = () => {
    if (!isSearchDatesDisabled) {
      let query = { courseType: "SKY_BREATH_MEDITATION" };
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

  const { fee, delfee } = priceCalculation({ workshop });

  const {
    eventStartDate,
    eventEndDate,
    email,
    phone1,
    timings,
    primaryTeacherName,
    sfid,
    productTypeId,
    mode,
    corporateName,
  } = workshop || {};

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

  const isSearchDatesDisabled = !filterStartDate;

  const inPersonCourse = mode === COURSE_MODES.IN_PERSON.name;

  const handleRegister = (e) => {
    e.preventDefault();
    if (authenticated) {
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

  return (
    <div className={[`course-details ${inPersonCourse ? "in-person" : ""}`]}>
      <p class="course-details__cost">
        ${fee} {delfee && <span>${delfee}</span>}
      </p>

      <div class="course-details__place">
        <div class="top left course-details__cell">
          <p class="course-details__table-text">
            DATES
            <span>
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
          </p>
        </div>

        <div class="top right course-details__cell">
          <p class="course-details__table-text">
            LOCATION
            <span>{mode}</span>
          </p>
        </div>

        <div class="bottom full course-details__cell course-details__times">
          {timings &&
            timings.map((time) => {
              return (
                <p class="course-details__time" key={time.startDate}>
                  <span>{dayjs.utc(time.startDate).format("ddd, MMM DD")}</span>
                  {tConvert(time.startTime)}-{tConvert(time.endTime)}
                  {` (${ABBRS[time.timeZone]})`}
                </p>
              );
            })}
        </div>
      </div>

      <div class="course-details__instructor">
        <div class="top full course-details__cell">
          <p class="course-details__table-text">
            INSTRUCTORS
            {primaryTeacherName && <span>{primaryTeacherName}</span>}
          </p>
        </div>

        <div class="bottom left course-details__cell">
          <p class="course-details__table-text small">
            EMAIL
            <a href={`mailto:${email}`}>
              <span>{email}</span>
            </a>
          </p>
        </div>

        <div class="bottom right course-details__cell">
          <p class="course-details__table-text small">
            PHONE
            <a href={`tel:${phone1}`}>
              <span>{phone1}</span>
            </a>
          </p>
        </div>
      </div>

      <button
        type="button"
        class="btn-secondary justify-content-center"
        onClick={handleRegister}
      >
        Reserve
      </button>

      <hr style={{ margin: 0 }} />

      <p class="course-details__text">Looking for another date?</p>

      <div id="courses-filters" class="course-details__buttons">
        <Popup
          tabIndex="1"
          value={filterStartDate}
          buttonText={
            filterStartDate ? filterStartDate + " - " + filterEndDate : "Dates"
          }
          closeEvent={onDatesChange}
          containerClassName="course-details__popup_calendar"
          parentClassName={classNames({
            "hidden-border": true,
          })}
          buttonTextclassName={classNames({
            "course-details__filter__button": true,
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
          buttonText={timeZoneFilter ? timeZoneFilter.name : "Time Zone"}
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
      </div>

      {!corporateName && (
        <div className="course-details__submit">
          <button
            type="button"
            className={classNames("course-details__search", {
              disabled: isSearchDatesDisabled,
            })}
            onClick={handleSearchDates}
          >
            Search Dates
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsCard;
