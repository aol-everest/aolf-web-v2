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
import { PageLoading } from '@components';
import classNames from 'classnames';
import { orgConfig } from '@org';
import DateRangePicker from 'rsuite/DateRangePicker';
import dynamic from 'next/dynamic';
import { navigateToLogin } from '@utils';
import { NextSeo } from 'next-seo';
import { SmartInput, SmartDropDown, Popup } from '@components';
import { MobileFilterModal } from '@components/filterComps/MobileFilterModal';

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

const fillDefaultTimeZone = () => {
  const userTimeZoneAbbreviation = getUserTimeZoneAbbreviation() || '';
  if (TIME_ZONE[userTimeZoneAbbreviation.toUpperCase()]) {
    return userTimeZoneAbbreviation.toUpperCase();
  }
  return null;
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

const CourseTile = ({ data, isAuthenticated }) => {
  const router = useRouter();
  const { track } = useAnalytics();
  const { showModal } = useGlobalModalContext();
  const {
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
    if (dayjs.utc(eventStartDate).isSame(dayjs.utc(eventEndDate), 'month')) {
      return (
        <>
          {`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
            .utc(eventEndDate)
            .format('DD, YYYY')}`}
          {' ' + ABBRS[eventTimeZone]}
        </>
      );
    }
    return (
      <>
        {`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
          .utc(eventEndDate)
          .format('MMMM DD, YYYY')}`}
        {' ' + ABBRS[eventTimeZone]}
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
      <div className="course-item-header">
        <div className="course-title-duration">
          <div className="course-title">
            {mode}
            {category && (
              <div
                class={`course-type ${mode === COURSE_MODES.IN_PERSON.value ? 'intensive' : 'days'}`}
              >
                {category}
              </div>
            )}
          </div>
          <div className="course-duration">{getCourseDeration()}</div>
        </div>
        {!isPurchased && (
          <div className="course-price">
            {listPrice === unitPrice ? (
              <span>${unitPrice}</span>
            ) : (
              <>
                <s>${listPrice}</s> <span>${unitPrice}</span>
              </>
            )}
          </div>
        )}
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
      <div className="course-instructors">
        {concatenateStrings([primaryTeacherName, coTeacher1Name])}
      </div>
      <div className="course-timings">
        {timings?.length > 0 &&
          timings.map((time, i) => {
            return (
              <div className="course-timing" key={i}>
                <span>{dayjs.utc(time.startDate).format('M/D dddd')}</span>
                {`, ${tConvert(time.startTime)} - ${tConvert(time.endTime)} ${
                  ABBRS[time.timeZone]
                }`}
              </div>
            );
          })}
      </div>
      <div className="course-actions">
        <button className="btn-secondary" onClick={detailAction}>
          Details
        </button>
        <button className="btn-primary" onClick={enrollAction}>
          Register
        </button>
      </div>
    </div>
  );
};

const COURSE_TYPES_OPTIONS = COURSE_TYPES_MASTER[orgConfig.name].reduce(
  (accumulator, currentValue) => {
    const courseTypes = Object.entries(currentValue.courseTypes).reduce(
      (courseTypes, [key, value]) => {
        if (COURSE_TYPES[key]) {
          return {
            ...courseTypes,
            [COURSE_TYPES[key].slug]: { ...COURSE_TYPES[key], ...value },
          };
        } else {
          return courseTypes;
        }
      },
      {},
    );
    return { ...accumulator, ...courseTypes };
  },
  {},
);

const Course = () => {
  const { track, page } = useAnalytics();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0.1,
  });
  const seed = useUIDSeed();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { slug } = router.query;

  const courseTypeFilter = COURSE_TYPES_OPTIONS[slug];
  const [courseModeFilter, setCourseModeFilter] = useQueryState('mode');
  const [onlyWeekend, setOnlyWeekend] = useQueryState(
    'onlyWeekend',
    parseAsBoolean.withDefault(false),
  );
  const [locationFilter, setLocationFilter] = useQueryState(
    'location',
    parseAsJson(),
  );
  const [filterStartEndDate, setFilterStartEndDate] = useQueryState(
    'startEndDate',
    parseAsStartEndDate,
  );
  const [timeZoneFilter, setTimeZoneFilter] = useQueryState('timeZone');
  const [instructorFilter, setInstructorFilter] = useQueryState(
    'instructor',
    parseAsJson(),
  );

  const [cityFilter] = useQueryState('city');
  const [centerFilter] = useQueryState('center');
  const [centerNameFilter] = useQueryState('center-name');
  const [searchKey, setSearchKey] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { isSuccess, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      {
        queryKey: [
          'workshops',
          {
            locationFilter,
            courseTypeFilter,
            filterStartEndDate,
            timeZoneFilter,
            instructorFilter,
            courseModeFilter,
            onlyWeekend,
            cityFilter,
            centerFilter,
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
          if (courseTypeFilter) {
            param = {
              ...param,
              ctype: courseTypeFilter.value,
            };
          }
          if (timeZoneFilter && TIME_ZONE[timeZoneFilter]) {
            param = {
              ...param,
              timeZone: TIME_ZONE[timeZoneFilter].value,
            };
          }
          if (instructorFilter && instructorFilter.value) {
            param = {
              ...param,
              teacherId: instructorFilter.value,
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
          if (locationFilter) {
            const { lat, lng } = locationFilter;
            param = {
              ...param,
              lat,
              lng,
            };
          }

          if (onlyWeekend) {
            param = {
              ...param,
              onlyWeekend: onlyWeekend,
            };
          }
          if (cityFilter) {
            param = {
              ...param,
              city: cityFilter,
            };
          }
          if (centerFilter) {
            param = {
              ...param,
              center: centerFilter,
            };
          }

          if (!courseTypeFilter) {
            return { data: null };
          }

          const res = await api.get({
            path: 'workshops',
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
    if (orgConfig.name === 'AOL' && !timeZoneFilter) {
      setTimeZoneFilter(fillDefaultTimeZone());
    }
  }, [router.isReady]);

  if (!router.isReady) return <PageLoading />;

  const onClearAllFilter = () => {
    setCourseModeFilter(null);
    setOnlyWeekend(null);
    setLocationFilter(null);
    setTimeZoneFilter(null);
    setInstructorFilter(null);
    setFilterStartEndDate(null);
  };

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case 'courseTypeFilter':
        //setCourseTypeFilter(value);
        break;
      case 'courseModeFilter':
        setCourseModeFilter(value);
        break;
      case 'onlyWeekend':
        setOnlyWeekend(value);
        break;
      case 'locationFilter':
        if (value) {
          setLocationFilter(value);
        } else {
          setLocationFilter(null);
        }
        break;
      case 'timeZoneFilter':
        setTimeZoneFilter(value);
        break;
      case 'instructorFilter':
        if (value) {
          setInstructorFilter(value);
        } else {
          setInstructorFilter(null);
        }
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
      case 'onlyWeekend':
        setOnlyWeekend(null);
        break;
      case 'locationFilter':
        setLocationFilter(null);
        break;
      case 'timeZoneFilter':
        setTimeZoneFilter(null);
        break;
      case 'instructorFilter':
        setInstructorFilter(null);
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
      case 'onlyWeekend':
        setOnlyWeekend(value);
        break;
      case 'locationFilter':
        if (value) {
          setLocationFilter(value);
        } else {
          setLocationFilter(null);
        }
        break;
      case 'timeZoneFilter':
        setTimeZoneFilter(value);
        break;
      case 'instructorFilter':
        if (value) {
          setInstructorFilter(value);
        } else {
          setInstructorFilter(null);
        }
        break;
    }
  };

  const changeCourseType = (courseType) => {
    const { slug, ...rest } = router.query;
    router.push(
      {
        ...router,
        query: {
          slug: courseType.slug,
          ...rest,
        },
      },
      undefined,
      { shallow: true },
    );
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
  if (locationFilter) {
    filterCount++;
  }
  if (courseModeFilter) {
    filterCount++;
  }
  if (onlyWeekend) {
    filterCount++;
  }
  if (filterStartEndDate) {
    filterCount++;
  }
  if (timeZoneFilter) {
    filterCount++;
  }
  if (instructorFilter) {
    filterCount++;
  }

  let instructorList = instructorResult?.data?.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  instructorList = (instructorList || []).slice(0, 5);

  const filterStartEndDateStr =
    filterStartEndDate &&
    Array.isArray(filterStartEndDate) &&
    filterStartEndDate.length === 2
      ? dayjs.utc(filterStartEndDate[0]).format('YYYY-MM-DD') +
        ' ~ ' +
        dayjs.utc(filterStartEndDate[1]).format('YYYY-MM-DD')
      : null;

  const renderCourseList = () => {
    if (
      courseTypeFilter.isAvailableInPersonOnly &&
      courseModeFilter &&
      courseModeFilter !== 'IN_PERSON'
    ) {
      return (
        <div className="no-course-found-wrap">
          <h2 className="tw-text-center">
            The {courseTypeFilter.name} is not available online it is offered In
            Person only.
          </h2>
          <p>
            Please check out our{' '}
            <a
              href="#"
              className="link v2"
              onClick={onFilterChangeEvent('courseModeFilter')('IN_PERSON')}
            >
              in-person offerings
            </a>
            .
          </p>
        </div>
      );
    }
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
                <CourseTile
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
    <main className="all-courses-find">
      <NextSeo
        defaultTitle={`${courseTypeFilter.name} - Course Dates and Registration`}
        description={courseTypeFilter.description}
      />
      <section className="title-header">
        {!centerFilter && courseTypeFilter && (
          <>
            <h1 className="page-title">{courseTypeFilter.name}</h1>
            <div className="page-description">
              {courseTypeFilter.description}
            </div>
          </>
        )}
        {centerFilter && (
          <>
            <h1 className="page-title">
              Courses offered by {centerNameFilter} center
            </h1>
          </>
        )}
      </section>
      <section className="section-course-find">
        <div className="container">
          <div className="course-filter-wrap">
            <div
              id="courses-filters"
              className="course-filter-listing search-form col-12 d-flex align-items-center"
            >
              <button className="filter-save-button">Save Changes</button>
              <Popup
                tabIndex="1"
                value={locationFilter}
                buttonText={
                  locationFilter ? `${locationFilter.locationName}` : null
                }
                closeEvent={onFilterChange('locationFilter')}
                label="Location"
              >
                {({ closeHandler }) => (
                  <AddressSearch
                    closeHandler={closeHandler}
                    placeholder="Search for Location"
                  />
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
                label="Course Format"
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

              <Popup
                tabIndex="3"
                value={courseTypeFilter}
                buttonText={
                  courseTypeFilter && courseTypeFilter.name
                    ? courseTypeFilter.name
                    : null
                }
                label="Course Type"
                hideClearOption
                closeEvent={changeCourseType}
              >
                {({ closeHandler }) => (
                  <>
                    {Object.values(COURSE_TYPES_OPTIONS).map(
                      (courseType, index) => {
                        return (
                          <li
                            className="courses-filter__list-item"
                            key={index}
                            onClick={closeHandler(courseType)}
                          >
                            {courseType.name}
                          </li>
                        );
                      },
                    )}
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
                    shouldDisableDate={combine(
                      allowedMaxDays(14),
                      beforeToday(),
                    )}
                    ranges={[]}
                    editable={false}
                  />
                </div>
              </div>
              <Popup
                tabIndex="2"
                value={onlyWeekend}
                closeEvent={onFilterChange('onlyWeekend')}
                showList={false}
                label="Weekend courses"
                buttonText={onlyWeekend ? 'Weekend courses' : null}
              ></Popup>

              <Popup
                tabIndex="4"
                value={TIME_ZONE[timeZoneFilter] ? timeZoneFilter : null}
                buttonText={
                  timeZoneFilter && TIME_ZONE[timeZoneFilter]
                    ? TIME_ZONE[timeZoneFilter].name
                    : null
                }
                closeEvent={onFilterChange('timeZoneFilter')}
                label="Time Zone"
              >
                {({ closeHandler }) => (
                  <>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(TIME_ZONE.EST.value)}
                    >
                      {TIME_ZONE.EST.name}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(TIME_ZONE.CST.value)}
                    >
                      {TIME_ZONE.CST.name}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(TIME_ZONE.MST.value)}
                    >
                      {TIME_ZONE.MST.name}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(TIME_ZONE.PST.value)}
                    >
                      {TIME_ZONE.PST.name}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(TIME_ZONE.HST.value)}
                    >
                      {TIME_ZONE.HST.name}
                    </li>
                  </>
                )}
              </Popup>
              <Popup
                tabIndex="5"
                value={instructorFilter ? instructorFilter.label : null}
                buttonText={instructorFilter ? instructorFilter.label : null}
                closeEvent={onFilterChange('instructorFilter')}
                label="Instructor"
              >
                {({ closeHandler }) => (
                  <SmartInput
                    onSearchKeyChange={(value) => setSearchKey(value)}
                    dataList={instructorList}
                    closeHandler={closeHandler}
                    value={searchKey}
                  ></SmartInput>
                )}
              </Popup>
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
                      {locationFilter && (
                        <div
                          className="selected-filter-item"
                          onClick={onFilterClearEvent('locationFilter')}
                        >
                          {locationFilter.locationName}
                        </div>
                      )}

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

                      {onlyWeekend && (
                        <div
                          className="selected-filter-item"
                          onClick={onFilterClearEvent('onlyWeekend')}
                        >
                          Weekend Courses
                        </div>
                      )}

                      {timeZoneFilter && TIME_ZONE[timeZoneFilter] && (
                        <div
                          className="selected-filter-item"
                          onClick={onFilterClearEvent('timeZoneFilter')}
                        >
                          {TIME_ZONE[timeZoneFilter].name}
                        </div>
                      )}

                      {instructorFilter && (
                        <div
                          className="selected-filter-item"
                          onClick={onFilterClearEvent('instructorFilter')}
                        >
                          {instructorFilter.label}
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
                      label="Location"
                      value={
                        locationFilter ? `${locationFilter.locationName}` : null
                      }
                      clearEvent={onFilterClearEvent('locationFilter')}
                    >
                      <AddressSearch
                        closeHandler={onFilterChange('locationFilter')}
                        placeholder="Search for Location"
                      />
                    </MobileFilterModal>
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
                              {orgConfig.courseModes.map(
                                (courseMode, index) => {
                                  return (
                                    <li
                                      key={index}
                                      className="dropdown-item"
                                      onClick={closeHandler(courseMode)}
                                    >
                                      {COURSE_MODES[courseMode].name}
                                    </li>
                                  );
                                },
                              )}
                            </>
                          )}
                        </SmartDropDown>
                      </div>
                    </MobileFilterModal>
                    <label>Weekend courses</label>
                    <div
                      className={classNames('courses-filter', {
                        'with-selected': onlyWeekend,
                      })}
                    >
                      <button
                        className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                        data-filter="weekend-mobile-courses"
                        data-type="checkbox"
                        onClick={() => {
                          setOnlyWeekend(!onlyWeekend ? true : null);
                        }}
                      >
                        Weekend courses
                      </button>
                      <button
                        className="courses-filter__remove"
                        data-filter="weekend-mobile-courses"
                        data-placeholder="Online"
                        onClick={() => {
                          setOnlyWeekend(null);
                        }}
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
                    </div>
                    <MobileFilterModal
                      label="Course Type"
                      value={
                        courseTypeFilter && courseTypeFilter.name
                          ? courseTypeFilter.name
                          : null
                      }
                      hideClearOption
                      closeEvent={changeCourseType}
                    >
                      <div className="dropdown">
                        <SmartDropDown
                          value={courseTypeFilter}
                          buttonText={
                            courseTypeFilter && courseTypeFilter.name
                              ? courseTypeFilter.name
                              : null
                          }
                          closeEvent={changeCourseType}
                        >
                          {({ closeHandler }) => (
                            <>
                              {Object.values(COURSE_TYPES_OPTIONS).map(
                                (courseType, index) => {
                                  return (
                                    <li
                                      className="dropdown-item"
                                      key={index}
                                      onClick={closeHandler(courseType)}
                                    >
                                      {courseType.name}
                                    </li>
                                  );
                                },
                              )}
                            </>
                          )}
                        </SmartDropDown>
                      </div>
                    </MobileFilterModal>
                    <MobileFilterModal
                      label="Dates"
                      value={
                        filterStartEndDateStr ? filterStartEndDateStr : null
                      }
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
                    <MobileFilterModal
                      label="Time Zone"
                      value={
                        timeZoneFilter && TIME_ZONE[timeZoneFilter]
                          ? TIME_ZONE[timeZoneFilter].name
                          : null
                      }
                      clearEvent={onFilterClearEvent('timeZoneFilter')}
                    >
                      <div className="dropdown">
                        <SmartDropDown
                          value={timeZoneFilter}
                          buttonText={
                            timeZoneFilter && TIME_ZONE[timeZoneFilter]
                              ? TIME_ZONE[timeZoneFilter].name
                              : 'Select Timezone'
                          }
                          closeEvent={onFilterChange('timeZoneFilter')}
                        >
                          {({ closeHandler }) => (
                            <>
                              <li
                                className="dropdown-item"
                                onClick={closeHandler(TIME_ZONE.EST.value)}
                              >
                                {TIME_ZONE.EST.name}
                              </li>
                              <li
                                className="dropdown-item"
                                onClick={closeHandler(TIME_ZONE.CST.value)}
                              >
                                {TIME_ZONE.CST.name}
                              </li>
                              <li
                                className="dropdown-item"
                                onClick={closeHandler(TIME_ZONE.MST.value)}
                              >
                                {TIME_ZONE.MST.name}
                              </li>
                              <li
                                className="dropdown-item"
                                onClick={closeHandler(TIME_ZONE.PST.value)}
                              >
                                {TIME_ZONE.PST.name}
                              </li>
                              <li
                                className="dropdown-item"
                                onClick={closeHandler(TIME_ZONE.HST.value)}
                              >
                                {TIME_ZONE.HST.name}
                              </li>
                            </>
                          )}
                        </SmartDropDown>
                      </div>
                    </MobileFilterModal>
                    <MobileFilterModal
                      label="Instructor"
                      value={instructorFilter ? instructorFilter.label : null}
                      clearEvent={onFilterClearEvent('instructorFilter')}
                    >
                      <SmartInput
                        containerClassName="smart-input-mobile"
                        placeholder="Search Instructor"
                        value={searchKey}
                        onSearchKeyChange={(value) => setSearchKey(value)}
                        dataList={instructorList}
                        closeHandler={onFilterChangeEvent('instructorFilter')}
                      ></SmartInput>
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
              {locationFilter && (
                <div
                  className="selected-filter-item"
                  onClick={onFilterClearEvent('locationFilter')}
                >
                  {locationFilter.locationName}
                </div>
              )}

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

              {onlyWeekend && (
                <div
                  className="selected-filter-item"
                  onClick={onFilterClearEvent('onlyWeekend')}
                >
                  Weekend Courses
                </div>
              )}

              {timeZoneFilter && TIME_ZONE[timeZoneFilter] && (
                <div
                  className="selected-filter-item"
                  onClick={onFilterClearEvent('timeZoneFilter')}
                >
                  {TIME_ZONE[timeZoneFilter].name}
                </div>
              )}

              {instructorFilter && (
                <div
                  className="selected-filter-item"
                  onClick={onFilterClearEvent('instructorFilter')}
                >
                  {instructorFilter.label}
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
      </section>
    </main>
  );
};

// Course.requiresAuth = true;
// Course.redirectUnauthenticated = "/login";

export default Course;
