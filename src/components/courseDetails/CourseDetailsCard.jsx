/* eslint-disable no-inline-styles/no-inline-styles */
import { Popup } from '@components';
import { LinkedCalendar } from '@components/dateRangePicker';
import { ABBRS, COURSE_MODES, MODAL_TYPES, WORKSHOP_MODE } from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { priceCalculation, tConvert } from '@utils';
import classNames from 'classnames';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useState } from 'react';
import queryString from 'query-string';

dayjs.extend(utc);

export const CourseDetailsCard = ({
  workshop,
  courseType,
  courseViewMode,
  ...rest
}) => {
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
    setFilterStartDate(startDate ? startDate.format('YYYY-MM-DD') : null);
    setFilterEndDate(endDate ? endDate.format('YYYY-MM-DD') : null);
  };

  const handleSearchDates = () => {
    if (!isSearchDatesDisabled) {
      let query = { courseType: 'SKY_BREATH_MEDITATION' };
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
        pathname: '/us-en',
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
    coTeacher1Name,
    coTeacher2Name,
    isGuestCheckoutEnabled = false,
  } = workshop || {};

  const datePickerConfig = {
    opens: 'left',
    drops: 'down',
    showDropdowns: false,
    showISOWeekNumbers: false,
    showWeekNumbers: false,
    locale: {
      cancelLabel: 'Clear',
      daysOfWeek: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      monthNames: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    },
    autoApply: true,
  };

  const isSearchDatesDisabled = !filterStartDate;

  const inPersonCourse = mode === COURSE_MODES.IN_PERSON.name;

  const handleRegister = (e) => {
    e.preventDefault();
    if (authenticated || isGuestCheckoutEnabled) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
        },
      });
    } else {
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo: `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
          router.query,
        )}`,
        defaultView: 'SIGNUP_MODE',
      });
    }
  };

  return (
    <div className={[`course-details ${inPersonCourse ? 'in-person' : ''}`]}>
      <p className="course-details__cost">
        ${fee} {delfee && <span>${delfee}</span>}
      </p>

      <div className="course-details__place">
        <div className="top left course-details__cell">
          <p className="course-details__table-text">
            DATES
            <span>
              {dayjs
                .utc(eventStartDate)
                .isSame(dayjs.utc(eventEndDate), 'month') &&
                `${dayjs.utc(eventStartDate).format('M/D/YYYY')} - ${dayjs
                  .utc(eventEndDate)
                  .format('M/D/YYYY')}`}
              {!dayjs
                .utc(eventStartDate)
                .isSame(dayjs.utc(eventEndDate), 'month') &&
                `${dayjs.utc(eventStartDate).format('M/DD/YYYY')} - ${dayjs
                  .utc(eventEndDate)
                  .format('M/DD/YYYY')}`}
            </span>
          </p>
        </div>

        <div className="top right course-details__cell">
          <p className="course-details__table-text">
            LOCATION
            <span>
              {mode === COURSE_MODES.ONLINE.name ? (
                mode
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${
                    workshop.locationStreet || ''
                  }, ${workshop.locationCity} ${workshop.locationProvince} ${
                    workshop.locationPostalCode
                  } ${workshop.locationCountry}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {`${workshop.locationStreet || ''} ${
                    workshop.locationCity || ''
                  }
                          ${workshop.locationProvince || ''} ${
                            workshop.locationCountry || ''
                          }`}
                </a>
              )}
            </span>
          </p>
        </div>

        <div className="bottom full course-details__cell course-details__times">
          {timings &&
            timings.map((time) => {
              return (
                <p className="course-details__time" key={time.startDate}>
                  <span>{dayjs.utc(time.startDate).format('ddd, MMM DD')}</span>
                  {tConvert(time.startTime)}-{tConvert(time.endTime)}
                  {` (${ABBRS[time.timeZone]})`}
                </p>
              );
            })}
        </div>
      </div>

      <div className="course-details__instructor">
        <div className="top full course-details__cell">
          <p className="course-details__table-text">
            INSTRUCTORS
            {primaryTeacherName && <span>{primaryTeacherName}</span>}
            {coTeacher1Name && <span>{coTeacher1Name}</span>}
            {coTeacher2Name && <span>{coTeacher2Name}</span>}
          </p>
        </div>

        <div className="bottom left course-details__cell">
          <p className="course-details__table-text small">
            EMAIL
            <a href={`mailto:${email}`}>
              <span>{email}</span>
            </a>
          </p>
        </div>

        <div className="bottom right course-details__cell">
          <p className="course-details__table-text small">
            PHONE
            <a href={`tel:${phone1}`}>
              <span>{phone1}</span>
            </a>
          </p>
        </div>
      </div>
      {courseViewMode !== WORKSHOP_MODE.VIEW && (
        <button
          type="button"
          className="btn-secondary justify-content-center"
          onClick={handleRegister}
        >
          Reserve
        </button>
      )}

      {/* <hr style={{ margin: 0 }} />

      <p className="course-details__text">Looking for another date?</p>

      <div id="courses-filters" className="course-details__buttons">
        <Popup
          tabIndex="1"
          value={filterStartDate}
          buttonText={
            filterStartDate ? filterStartDate + ' - ' + filterEndDate : 'Dates'
          }
          closeEvent={onDatesChange}
          containerClassName="course-details__popup_calendar"
          parentClassName={classNames({
            'hidden-border': true,
          })}
          buttonTextclassName={classNames({
            'course-details__filter__button': true,
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
          buttonText={timeZoneFilter ? timeZoneFilter.name : 'Time Zone'}
          closeEvent={onFilterChange}
          parentClassName={classNames({
            'hidden-border': true,
          })}
          buttonTextclassName={classNames({
            'course-details__filter__button': true,
            active: timeZoneFilter !== null,
          })}
        >
          {({ closeHandler }) => (
            <>
              <li
                className="courses-filter__list-item"
                onClick={closeHandler({
                  name: 'Eastern',
                  value: 'EST',
                })}
              >
                Eastern
              </li>
              <li
                className="courses-filter__list-item"
                onClick={closeHandler({
                  name: 'Central',
                  value: 'CST',
                })}
              >
                Central
              </li>
              <li
                className="courses-filter__list-item"
                onClick={closeHandler({
                  name: 'Mountain',
                  value: 'MST',
                })}
              >
                Mountain
              </li>
              <li
                className="courses-filter__list-item"
                onClick={closeHandler({
                  name: 'Pacific',
                  value: 'PST',
                })}
              >
                Pacific
              </li>
              <li
                className="courses-filter__list-item"
                onClick={closeHandler({
                  name: 'Hawaii',
                  value: 'HST',
                })}
              >
                Hawaii
              </li>
            </>
          )}
        </Popup>
      </div> */}

      {!corporateName && (
        <div className="course-details__submit">
          <button
            type="button"
            className={classNames('course-details__search', {
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
