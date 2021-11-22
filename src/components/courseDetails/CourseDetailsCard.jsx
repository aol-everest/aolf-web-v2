import React, { useState } from "react";
import moment from "moment";
import classNames from "classnames";
import NumberFormat from "react-number-format";
import renderHTML from "react-render-html";
import { ABBRS } from "@constants";
import { Popup } from "@components";
import { LinkedCalendar } from "@components/dateRangePicker";
import { tConvert } from "@utils";
import { useRouter } from "next/router";

export const CourseDetailsCard = ({ workshop, courseType, ...rest }) => {
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [timeZoneFilter, setTimeZoneFilter] = useState(null);
  const router = useRouter();

  const onFilterChange = (value) => {
    setTimeZoneFilter(value);
  };

  const onDatesChange = (date) => {
    const { startDate, endDate } = date || {};
    setFilterStartDate(startDate ? startDate.format("YYYY-MM-DD") : null);
    setFilterEndDate(endDate ? endDate.format("YYYY-MM-DD") : null);
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
      router.push({
        pathname: "/us",
        query,
      });
    }
  };

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
    notes,
    streetAddress1,
    streetAddress2,
    state,
    city,
    country,
    productTypeId,
    mode,
    corporateName,
  } = workshop || {};

  const datePickerConfig = {
    opens: "center",
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

  return (
    <div className="course-details">
      <div className="course-details__body">
        <h2>{mode} course details</h2>
        <ul className="course-details__list">
          <div className="course-details__list__title">
            <img src="/img/ic-calendar.svg" alt="date" title="date" />
            <h6>Date:</h6>
          </div>
          {moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <li>{`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
              .utc(eventEndDate)
              .format("DD, YYYY")}`}</li>
          )}
          {!moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <li>{`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
              .utc(eventEndDate)
              .format("MMMM DD, YYYY")}`}</li>
          )}
        </ul>
        <ul className="course-details__list">
          <div className="course-details__list__title">
            <img src="/img/ic-clock.svg" alt="timings" title="timings" />
            <h6>Timings:</h6>
          </div>
          {timings &&
            timings.map((time) => {
              return (
                <li key={time.startDate}>
                  {`${moment.utc(time.startDate).format("dd")}: ${tConvert(
                    time.startTime,
                  )}-${tConvert(time.endTime)} ${ABBRS[time.timeZone]}`}
                </li>
              );
            })}
        </ul>
        {!corporateName && (
          <ul className="course-details__list">
            <h6 className="course-details__filter__title">
              Looking for another date/time?
            </h6>
            <div className="course-details__filter__buttons">
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
                      onClick={closeHandler({
                        name: "Eastern",
                        value: "EST",
                      })}
                    >
                      Eastern
                    </li>
                    <li
                      onClick={closeHandler({
                        name: "Central",
                        value: "CST",
                      })}
                    >
                      Central
                    </li>
                    <li
                      onClick={closeHandler({
                        name: "Mountain",
                        value: "MST",
                      })}
                    >
                      Mountain
                    </li>
                    <li
                      onClick={closeHandler({
                        name: "Pacific",
                        value: "PST",
                      })}
                    >
                      Pacific
                    </li>
                    <li
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
          </ul>
        )}
        <ul className="course-details__list">
          <div className="course-details__list__title">
            <img
              src="/img/ic-instructor.svg"
              alt="instructor"
              title="instructor"
            />
            <h6>Instructor(s):</h6>
          </div>
          {primaryTeacherName && <li>{primaryTeacherName}</li>}
          {coTeacher1Name && <li>{coTeacher1Name}</li>}
          {coTeacher2Name && <li>{coTeacher2Name}</li>}
        </ul>
        <ul className="course-details__list">
          <div className="course-details__list__title">
            <img src="/img/ic-phone.svg" alt="contact" title="contact" />
            <h6>Contact details:</h6>
          </div>
          <li>
            <a href={`tel:${phone1}`}>
              <NumberFormat
                value={phone1}
                displayType={"text"}
                format="+1 (###) ###-####"
              ></NumberFormat>
            </a>
          </li>
          {phone2 && (
            <li>
              <a href={`tel:${phone2}`}>
                <NumberFormat
                  value={phone2}
                  displayType={"text"}
                  format="+1 (###) ###-####"
                ></NumberFormat>
              </a>
            </li>
          )}
          <li>
            <a href={`mailto:${email}`}>{email}</a>
          </li>
        </ul>

        {productTypeId == 22119 && (
          <ul className="course-details__list">
            <div className="course-details__list__title">
              <h6>Location:</h6>
            </div>
            <li>
              {" "}
              {`${streetAddress1 || ""} ${streetAddress2 || ""}, ${
                city || ""
              }, ${country || ""}`}
            </li>
          </ul>
        )}
        {!corporateName && (
          <div className="course-details__submit">
            <button
              type="button"
              className={classNames("course-details__submit-button", {
                disabled: isSearchDatesDisabled,
              })}
              onClick={handleSearchDates}
            >
              Search Dates
            </button>
          </div>
        )}
      </div>
      {notes && (
        <div className="course-details__footer">
          <div className="course-details__additional word-wrap">
            Additional Notes: {renderHTML(notes)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsCard;
