/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import {
  api,
  getUserTimeZoneAbbreviation,
  concatenateStrings,
  tConvert,
} from '@utils';
import ContentLoader from 'react-content-loader';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState, useRef } from 'react';
import { useQueryState, parseAsBoolean, parseAsJson, createParser } from 'nuqs';
import { useUIDSeed } from 'react-uid';
import { useAuth } from '@contexts';
import { withCenterInfo } from '@hoc';
import {
  ABBRS,
  COURSE_MODES,
  COURSE_TYPES,
  TIME_ZONE,
  MODAL_TYPES,
  COURSE_TYPES_MASTER,
} from '@constants';
import { useGlobalModalContext } from '@contexts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useAnalytics } from 'use-analytics';
import { pushRouteWithUTMQuery } from '@service';
import queryString from 'query-string';
import { useInView } from 'react-intersection-observer';
import classNames from 'classnames';
import { orgConfig } from '@org';
import DateRangePicker from 'rsuite/DateRangePicker';
import dynamic from 'next/dynamic';
import { navigateToLogin } from '@utils';
import { NextSeo } from 'next-seo';
import { SmartInput, SmartDropDown, Popup } from '@components';
import { MobileFilterModal } from '@components/filterComps/mobileFilterModal';

// (Optional) Import component styles. If you are using Less, import the `index.less` file.
import 'rsuite/DateRangePicker/styles/index.css';

const AddressSearch = dynamic(() =>
  import('@components').then((mod) => mod.AddressSearch),
);

dayjs.extend(utc);

const queryInstructor = async ({ queryKey: [_, term] }) => {
  const response = await api.get({
    path: 'cf/teachers',
    param: {
      query: term,
    },
  });
  return response;
};

const queryCenter = async ({ queryKey: [_, term] }) => {
  const response = await api.get({
    path: 'getAllCenters',
    param: {
      query: term,
    },
  });
  return response;
};

const parseAsStartEndDate = createParser({
  parse(queryValue) {
    if (queryValue && queryValue.includes('|')) {
      const filterStartEndDateArr = queryValue
        .split('|')
        .map((d) => dayjs.utc(d));
      return filterStartEndDateArr;
    } else {
      return null;
    }
  },
  serialize(value) {
    if (Array.isArray(value) && value.length === 2) {
      return (
        dayjs.utc(value[0]).format('YYYY-MM-DD') +
        '|' +
        dayjs.utc(value[1]).format('YYYY-MM-DD')
      );
    }
    return null;
  },
});

const { allowedMaxDays, beforeToday, combine } = DateRangePicker;

const ItemLoaderTile = () => {
  return (
    <div className="course-item">
      <ContentLoader
        backgroundColor="#f3f3f3"
        foregroundColor="#c2c2c2"
        viewBox="0 0 320 170"
      >
        <rect x="14" y="14" rx="3" ry="3" width="180" height="13" />
        <rect x="14" y="30" rx="3" ry="3" width="10" height="10" />
        <rect x="29" y="30" rx="3" ry="3" width="74" height="10" />

        <circle cx="305" cy="27" r="8" />
        <rect x="0" y="53" rx="0" ry="0" width="320" height="1" />
        <rect x="219" y="146" rx="0" ry="0" width="0" height="0" />
        <rect x="34" y="70" rx="3" ry="3" width="250" height="13" />
        <rect x="0" y="103" rx="0" ry="0" width="320" height="1" />
        <rect x="34" y="120" rx="3" ry="3" width="250" height="13" />
        <rect x="34" y="140" rx="3" ry="3" width="250" height="13" />
        <rect x="34" y="160" rx="3" ry="3" width="250" height="13" />
      </ContentLoader>
    </div>
  );
};

const EventTile = ({ data, isAuthenticated }) => {
  const router = useRouter();
  const { track } = useAnalytics();
  const { showModal } = useGlobalModalContext();
  const {
    title,
    mode,
    primaryTeacherName,
    productTypeId,
    eventStartDate,
    eventEndDate,
    eventTimeZone,
    sfid,
    locationPostalCode,
    locationCity,
    locationProvince,
    locationStreet,
    isGuestCheckoutEnabled = false,
    coTeacher1Name,
    timings,
    unitPrice,
    listPrice,
    isEventFull,
    isPurchased,
    category,
  } = data || {};

  const enrollAction = () => {
    track('allcourses_enroll_click', {
      course_format: data?.productTypeId,
      course_name: data?.title,
      course_id: data?.sfid,
      course_price: data?.unitPrice,
    });
    if (isGuestCheckoutEnabled || isAuthenticated) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
        },
      });
    } else {
      navigateToLogin(
        router,
        `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
          router.query,
        )}`,
      );
    }

    // showAlert(ALERT_TYPES.SUCCESS_ALERT, { title: "Success" });
  };

  const detailAction = () => {
    track('allcourses_details_click', {
      course_format: data?.productTypeId,
      course_name: data?.title,
      course_id: data?.sfid,
      course_price: data?.unitPrice,
    });
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course/${sfid}`,
      query: {
        ctype: productTypeId,
      },
    });
  };

  const getCourseDeration = () => {
    if (dayjs.utc(eventStartDate).isSame(dayjs.utc(eventEndDate), 'day')) {
      return <>{`${dayjs.utc(eventStartDate).format('ddd, MMM DD, YYYY')}`}</>;
    }
    return (
      <>
        {`${dayjs.utc(eventStartDate).format('ddd, MMM DD, YYYY')} - ${dayjs
          .utc(eventEndDate)
          .format('ddd, MMM DD, YYYY')}`}
      </>
    );
  };

  return (
    <div
      className={classNames('course-item', {
        'course-full': isEventFull,
        registered: isPurchased,
      })}
    >
      <div class="course-item-header">
        <div class="course-title-duration">
          <div class="course-title">{title}</div>
          <div
            class={classNames('course-type in-person', {
              'in-person': mode === COURSE_MODES.IN_PERSON.value,
              online: mode === COURSE_MODES.ONLINE.value,
            })}
          >
            {mode}
          </div>
        </div>
      </div>
      {mode !== 'Online' && locationCity && (
        <div className="course-location">
          {concatenateStrings([
            locationStreet,
            locationCity,
            locationProvince,
            locationPostalCode,
          ])}
        </div>
      )}
      <div class="course-date">{getCourseDeration()}</div>
      {timings?.length > 0 &&
        timings.map((time, i) => {
          return (
            <div className="course-time" key={i}>
              <span>{dayjs.utc(time.startDate).format('M/D dddd')}</span>
              {`, ${tConvert(time.startTime)} - ${tConvert(time.endTime)} ${
                ABBRS[time.timeZone]
              }`}
            </div>
          );
        })}

      {/* <div class="event-categories">
        <div class="cat-item">Silver</div>
        <div class="cat-item">General</div>
        <div class="cat-item">General</div>
      </div> */}
      <div class="course-actions">
        <button class="btn-secondary">Details</button>
        <button class="btn-primary">Register</button>
      </div>
    </div>
  );
};

const Event = ({ centerDetail }) => {
  const { track, page } = useAnalytics();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0.1,
  });
  const seed = useUIDSeed();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [courseModeFilter, setCourseModeFilter] = useQueryState('mode');
  const [ctypeFilter] = useQueryState('ctype');

  const [filterStartEndDate, setFilterStartEndDate] = useQueryState(
    'startEndDate',
    parseAsStartEndDate,
  );

  const [searchKey, setSearchKey] = useState('');
  const [centerSearchKey, setCenterSearchKey] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { isSuccess, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      {
        queryKey: [
          'ticketedEvents',
          {
            ctypeFilter,
            filterStartEndDate,
            courseModeFilter,
            centerDetail: centerDetail.sfid,
          },
        ],
        queryFn: async ({ pageParam = 1 }) => {
          let param = {
            page: pageParam,
            size: 12,
            timingsRequired: true,
          };

          if (courseModeFilter && COURSE_MODES[courseModeFilter]) {
            param = {
              ...param,
              mode: COURSE_MODES[courseModeFilter].value,
            };
          }
          if (ctypeFilter) {
            param = {
              ...param,
              ctype: ctypeFilter.value,
            };
          }

          if (filterStartEndDate) {
            const [startDate, endDate] = filterStartEndDate;
            param = {
              ...param,
              sdate: startDate,
              edate: endDate,
            };
          }

          if (centerDetail) {
            param = {
              ...param,
              center: centerDetail.sfid,
            };
          }

          // if (!centerFilter) {
          //   return { data: null };
          // }

          const res = await api.get({
            path: 'ticketedEvents',
            param,
          });
          return res;
        },
        getNextPageParam: (page) => {
          return page.currectPage >= page.lastPage
            ? undefined
            : page.currectPage + 1;
        },
      },
      // { initialData: workshops },
    );

  let instructorResult = useQuery({
    queryKey: ['instructor', searchKey],
    queryFn: queryInstructor,
    // only fetch search terms longer than 2 characters
    enabled: searchKey.length > 0,
    // refresh cache after 10 seconds (watch the network tab!)
    staleTime: 10 * 1000,
  });

  let centerResult = useQuery({
    queryKey: ['centers', centerSearchKey],
    queryFn: queryCenter,
    // only fetch search terms longer than 2 characters
    enabled: centerSearchKey.length > 0,
    // refresh cache after 10 seconds (watch the network tab!)
    staleTime: 10 * 1000,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    if (!router.isReady) return;
    page({
      category: 'course_registration',
      name: 'course_search',
    });
    track('Product List Viewed', {
      category: 'Course',
    });
  }, [router.isReady]);

  const onClearAllFilter = () => {
    setCourseModeFilter(null);
    setFilterStartEndDate(null);
  };

  const centerChangeHandler = (center) => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/centers/events/${center.value}`,
      query: { u: 'true' },
    });
  };

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case 'courseTypeFilter':
        //setCourseTypeFilter(value);
        break;
      case 'courseModeFilter':
        setCourseModeFilter(value);
        break;
    }
  };

  const onFilterClearEvent = (field) => async (e) => {
    if (e) e.preventDefault();
    switch (field) {
      case 'courseTypeFilter':
        // setCourseTypeFilter(null);
        break;
      case 'courseModeFilter':
        setCourseModeFilter(null);
        break;
    }
  };

  const onFilterChangeEvent = (field) => (value) => async (e) => {
    if (e) e.preventDefault();
    switch (field) {
      case 'courseTypeFilter':
        // setCourseTypeFilter(value);
        break;
      case 'courseModeFilter':
        setCourseModeFilter(value);
        break;
    }
  };

  const onDatesChange = async (date) => {
    if (Array.isArray(date)) {
      setFilterStartEndDate(date);
    } else {
      setFilterStartEndDate(null);
    }
  };

  const toggleFilter = (e) => {
    if (e) e.preventDefault();
    setShowFilterModal((showFilterModal) => !showFilterModal);
  };

  let filterCount = 0;

  if (courseModeFilter) {
    filterCount++;
  }
  if (filterStartEndDate) {
    filterCount++;
  }

  let instructorList = instructorResult?.data?.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  instructorList = (instructorList || []).slice(0, 5);

  let centerList = centerResult?.data?.data?.map(({ sfid, centerName }) => ({
    value: sfid,
    label: centerName,
  }));
  centerList = (centerList || []).slice(0, 5);

  const filterStartEndDateStr =
    filterStartEndDate &&
    Array.isArray(filterStartEndDate) &&
    filterStartEndDate.length === 2
      ? dayjs.utc(filterStartEndDate[0]).format('YYYY-MM-DD') +
        ' ~ ' +
        dayjs.utc(filterStartEndDate[1]).format('YYYY-MM-DD')
      : null;

  const renderCourseList = () => {
    if (isSuccess && data?.pages[0].data?.length === 0 && !isFetchingNextPage) {
      return (
        <div className="no-course-found-wrap">
          <h2>No course found</h2>
          <p>Please change your search criteria</p>
        </div>
      );
    }
    return (
      <>
        {isSuccess &&
          data.pages.map((page) => (
            <React.Fragment key={seed(page)}>
              {page.data?.map((course) => (
                <EventTile
                  key={course.sfid}
                  data={course}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </React.Fragment>
          ))}
        {(isFetchingNextPage || !isSuccess) && (
          <>
            {[...Array(8)].map((e, i) => (
              <ItemLoaderTile key={i}></ItemLoaderTile>
            ))}
          </>
        )}
        <div ref={ref} style={{ flex: '0 0 100%' }}></div>
        {isSuccess && !hasNextPage && data.pages[0].data.length > 0 && (
          <div className="no-course-found-wrap">
            <p>That's all folks! No more data left to check out.</p>
          </div>
        )}
      </>
    );
  };

  return (
    <div id="tab1" className="tab-content">
      <NextSeo
        defaultTitle={`${centerDetail.centerName} - Course Dates and Registration`}
      />
      <div className="course-tab-content-wrap events">
        <div className="course-filter-wrap">
          <div
            id="courses-filters"
            className="course-filter-listing search-form col-12 d-flex align-items-center"
          >
            <button className="filter-save-button">Save Changes</button>
            <Popup
              tabIndex="1"
              value={centerDetail ? centerDetail.centerName : null}
              buttonText={centerDetail ? centerDetail.centerName : null}
              closeEvent={centerChangeHandler}
              label="Center"
              hideClearOption
            >
              {({ closeHandler }) => (
                <SmartInput
                  onSearchKeyChange={(value) => setCenterSearchKey(value)}
                  dataList={centerList}
                  closeHandler={closeHandler}
                  value={centerSearchKey}
                ></SmartInput>
              )}
            </Popup>
            <Popup
              tabIndex="2"
              value={COURSE_MODES[courseModeFilter] && courseModeFilter}
              buttonText={
                courseModeFilter && COURSE_MODES[courseModeFilter]
                  ? COURSE_MODES[courseModeFilter].name
                  : null
              }
              closeEvent={onFilterChange('courseModeFilter')}
              label="Event Format"
            >
              {({ closeHandler }) => (
                <>
                  {orgConfig.courseModes.map((courseMode, index) => {
                    return (
                      <li
                        key={index}
                        className="courses-filter__list-item"
                        onClick={closeHandler(courseMode)}
                      >
                        {COURSE_MODES[courseMode].name}
                      </li>
                    );
                  })}
                </>
              )}
            </Popup>

            <div
              data-filter="timezone"
              className={classNames('courses-filter', {
                'with-selected': filterStartEndDate,
              })}
            >
              <button
                className="courses-filter__remove"
                onClick={onDatesChange}
              >
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.5"
                    y="1"
                    width="19"
                    height="19"
                    rx="9.5"
                    fill="#ABB1BA"
                  />
                  <rect
                    x="0.5"
                    y="1"
                    width="19"
                    height="19"
                    rx="9.5"
                    stroke="white"
                  />
                  <path
                    d="M13.5 7L6.5 14"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.5 14L6.5 7"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <label>Dates</label>
              <div className="courses-filter__button date-picker">
                <DateRangePicker
                  placeholder="Select..."
                  appearance="subtle"
                  showHeader={false}
                  onChange={onDatesChange}
                  value={filterStartEndDate}
                  shouldDisableDate={combine(allowedMaxDays(14), beforeToday())}
                  ranges={[]}
                  editable={false}
                />
              </div>
            </div>
          </div>
          <div className="search_course_form_mobile d-lg-none d-block">
            <div>
              <div>
                <div className="filter">
                  <div
                    className={classNames('filter--button d-flex', {
                      active: showFilterModal,
                    })}
                    onClick={toggleFilter}
                  >
                    <span className="icon-aol iconaol-setting"></span>
                    Filter
                    <span id="filter-count">{filterCount}</span>
                  </div>
                </div>
              </div>
              {showFilterModal && (
                <div className="filter--box">
                  <div className="selected-filter-wrap">
                    {courseModeFilter && COURSE_MODES[courseModeFilter] && (
                      <div
                        className="selected-filter-item"
                        onClick={onFilterClearEvent('courseModeFilter')}
                      >
                        {COURSE_MODES[courseModeFilter].value}
                      </div>
                    )}

                    {filterStartEndDateStr && (
                      <div
                        className="selected-filter-item"
                        onClick={onDatesChange}
                      >
                        {filterStartEndDateStr}
                      </div>
                    )}

                    {filterCount > 1 && (
                      <div
                        className="selected-filter-item clear"
                        onClick={onClearAllFilter}
                      >
                        Clear All
                      </div>
                    )}
                  </div>

                  <MobileFilterModal
                    label="Course format"
                    value={
                      courseModeFilter && COURSE_MODES[courseModeFilter]
                        ? COURSE_MODES[courseModeFilter].name
                        : null
                    }
                    closeEvent={onFilterClearEvent('courseModeFilter')}
                  >
                    <div className="dropdown">
                      <SmartDropDown
                        value={courseModeFilter}
                        buttonText={
                          courseModeFilter && COURSE_MODES[courseModeFilter]
                            ? COURSE_MODES[courseModeFilter].name
                            : null
                        }
                        closeEvent={onFilterChange('courseModeFilter')}
                      >
                        {({ closeHandler }) => (
                          <>
                            {orgConfig.courseModes.map((courseMode, index) => {
                              return (
                                <li
                                  key={index}
                                  className="dropdown-item"
                                  onClick={closeHandler(courseMode)}
                                >
                                  {COURSE_MODES[courseMode].name}
                                </li>
                              );
                            })}
                          </>
                        )}
                      </SmartDropDown>
                    </div>
                  </MobileFilterModal>
                  <label>Weekend courses</label>

                  <MobileFilterModal
                    label="Dates"
                    value={filterStartEndDateStr ? filterStartEndDateStr : null}
                    clearEvent={onDatesChange}
                  >
                    <div className="datepicker-block">
                      <DateRangePicker
                        placeholder="Dates"
                        showHeader={false}
                        onChange={onDatesChange}
                        showOneCalendar
                        ranges={[]}
                        editable={false}
                        shouldDisableDate={combine(
                          allowedMaxDays(14),
                          beforeToday(),
                        )}
                        value={filterStartEndDate}
                      />
                    </div>
                  </MobileFilterModal>
                </div>
              )}
              {showFilterModal && (
                <button
                  className="filter-cancel-button"
                  onClick={toggleFilter}
                ></button>
              )}
            </div>
          </div>
        </div>
        <div className="course-listing">
          <div className="selected-filter-wrap">
            {courseModeFilter && COURSE_MODES[courseModeFilter] && (
              <div
                className="selected-filter-item"
                onClick={onFilterClearEvent('courseModeFilter')}
              >
                {COURSE_MODES[courseModeFilter].value}
              </div>
            )}

            {filterStartEndDateStr && (
              <div className="selected-filter-item" onClick={onDatesChange}>
                {filterStartEndDateStr}
              </div>
            )}

            {filterCount > 1 && (
              <div
                className="selected-filter-item clear"
                onClick={onClearAllFilter}
              >
                Clear All
              </div>
            )}
          </div>
          {renderCourseList()}
        </div>
      </div>
    </div>
  );
};

export default withCenterInfo(Event);
