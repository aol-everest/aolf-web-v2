/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import {
  api,
  getUserTimeZoneAbbreviation,
  concatenateStrings,
  tConvert,
  findCourseTypeBySlug,
} from '@utils';
import ContentLoader from 'react-content-loader';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState, useRef } from 'react';
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
  parseAsTimestamp,
  parseAsIsoDateTime,
  parseAsArrayOf,
  parseAsJson,
  parseAsStringEnum,
  parseAsStringLiteral,
  parseAsNumberLiteral,
  createParser,
} from 'nuqs';
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
import { usePopper } from 'react-popper';
import classNames from 'classnames';
import { orgConfig } from '@org';
import DateRangePicker from 'rsuite/DateRangePicker';
import dynamic from 'next/dynamic';

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
  // console.log('User timezone abbreviation:', userTimeZoneAbbreviation);
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
    console.log(value);
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

const {
  allowedMaxDays,
  allowedDays,
  allowedRange,
  beforeToday,
  afterToday,
  combine,
} = DateRangePicker;

const SmartInput = ({
  dataList,
  containerClass = 'smart-input',
  inputClassName = '',
  placeholder = 'Search',
  closeHandler,
  onSearchKeyChange,
  value,
}) => {
  const [isHidden, setIsHidden] = useState(true);
  const [searchKey, setSearchKey] = useState(value);

  const handleChange = (event) => {
    if (onSearchKeyChange) {
      onSearchKeyChange(event.target.value);
    }
    if (event.target.value) {
      setIsHidden(false);
    }
    setSearchKey(event.target.value);
  };

  const closeHandlerInner = (data) => (event) => {
    if (closeHandler) {
      setSearchKey(data.label);
      //onSearchKeyChange("");
      closeHandler(data)();
    }
    setIsHidden(true);
  };

  return (
    <div className={classNames(containerClass, { active: !isHidden })}>
      <input
        placeholder={placeholder}
        type="text"
        className={classNames('custom-input', inputClassName)}
        value={searchKey}
        onChange={handleChange}
      />
      <div className="smart-input--list">
        {dataList &&
          dataList.map((data) => {
            return (
              <p
                key={data.value}
                className="smart-input--list-item"
                onClick={closeHandlerInner(data)}
              >
                {data.label}
              </p>
            );
          })}
      </div>
    </div>
  );
};

const SmartDropDown = (props) => {
  const { buttonText, children, value } = props;
  const [visible, setVisibility] = useState(false);

  function handleDropdownClick(event) {
    setVisibility(!visible);
  }

  function closeHandler(value) {
    return function () {
      if (props.closeEvent) {
        props.closeEvent(value);
      }
      setVisibility(false);
    };
  }
  return (
    <div className="dropdown">
      <button
        className="custom-dropdown"
        type="button"
        id="dropdownCourseButton"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        onClick={handleDropdownClick}
      >
        {buttonText}
      </button>
      <ul className={classNames('dropdown-menu', { show: visible })}>
        {visible &&
          children({
            props,
            closeHandler,
          })}
      </ul>
    </div>
  );
};

const MobileFilterModal = (props) => {
  const [isHidden, setIsHidden] = useState(true);

  const showModal = () => {
    setIsHidden(false);
    document.body.classList.add('overflow-hidden');
  };

  const hideModal = () => {
    setIsHidden(true);
    document.body.classList.remove('overflow-hidden');
  };

  const clearAction = () => {
    if (props.clearEvent) {
      props.clearEvent();
    }
    setIsHidden(true);
    document.body.classList.remove('overflow-hidden');
  };

  const { label, value, children, hideClearOption = false } = props;
  return (
    <>
      <label>{label}</label>
      <div
        class="btn_outline_box btn-modal_dropdown full-btn mt-3"
        onClick={showModal}
      >
        <a class="btn" href="#">
          {value || label}
        </a>
      </div>
      <div
        className={classNames('mobile-modal', {
          active: !isHidden,
        })}
      >
        <div class="mobile-modal--header">
          <div
            id="course-close_mobile"
            class="mobile-modal--close"
            onClick={hideModal}
          >
            <img src="/img/ic-close.svg" alt="close" />
          </div>
          <h2 class="mobile-modal--title">{label}</h2>
          {children}
        </div>
        <div class="mobile-modal--body">
          <div class="row m-0 align-items-center justify-content-between">
            {!hideClearOption && (
              <div class="clear" onClick={clearAction}>
                Clear
              </div>
            )}
            <div
              class="filter-save-button btn_box_primary select-btn"
              onClick={hideModal}
            >
              Select
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Popup = (props) => {
  const {
    buttonText,
    tabindex,
    children,
    value,
    containerClassName = '',
    showId,
    parentClassName = '',
    buttonTextclassName = '',
    showList = true,
    label,
    hideClearOption = false,
  } = props;

  const [visible, setVisibility] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);
  const arrowRef = useRef(null);

  const { styles, attributes } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement: 'bottom',
      modifiers: [
        {
          name: 'arrow',
          enabled: true,
          options: {
            element: arrowRef.current,
          },
        },
        {
          name: 'offset',
          enabled: true,
          options: {
            offset: [0, 10],
          },
        },
      ],
    },
  );
  useEffect(() => {
    // listen for clicks and close dropdown on body
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  function handleDropdownClick() {
    setVisibility(!visible);
  }

  function handleSelectFilter() {
    props.closeEvent(!value ? true : null);
  }

  function handleDocumentClick(event) {
    if (
      referenceRef.current.contains(event.target) ||
      popperRef?.current?.contains(event.target)
    ) {
      return;
    }
    setVisibility(false);
  }

  function closeHandler(value) {
    return function () {
      if (props.closeEvent) {
        props.closeEvent(value);
      }
      setVisibility(false);
    };
  }

  return (
    <>
      <div
        class="courses-filter"
        data-filter="event-type"
        ref={referenceRef}
        tabIndex={tabindex}
        className={classNames('courses-filter', parentClassName, {
          active: visible,
          'with-selected': value,
        })}
      >
        {value && !hideClearOption && (
          <button
            class="courses-filter__remove"
            data-filter="event-type"
            data-placeholder="Online"
            onClick={closeHandler(null)}
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
        )}
        <label>{label}</label>
        <button
          class="courses-filter__button"
          data-filter="event-type"
          onClick={!showList ? handleSelectFilter : handleDropdownClick}
        >
          {buttonText || label}
        </button>
        {showList && (
          <div className="courses-filter__wrapper-list">
            <ul
              id={showId ? 'time-tooltip' : ''}
              className={classNames(
                'courses-filter__list',
                containerClassName,
                {
                  active: visible,
                },
              )}
              data-filter="event-type"
              ref={popperRef}
              {...attributes.popper}
            >
              {visible &&
                children({
                  props,
                  closeHandler,
                })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

const ItemLoaderTile = () => {
  return (
    <div class="course-item">
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

const CourseTile = ({ data, authenticated }) => {
  const router = useRouter();
  const { track } = useAnalytics();
  const { showModal } = useGlobalModalContext();
  const {
    title,
    mode,
    isPurchased,
    isEventFull,
    primaryTeacherName,
    productTypeId,
    eventStartDate,
    eventEndDate,
    eventTimeZone,
    sfid,
    locationCity,
    locationProvince,
    centerName,
    isGuestCheckoutEnabled = false,
    coTeacher1Name,
    coTeacher2Name,
    timings,
    unitPrice,
  } = data || {};

  const enrollAction = () => {
    track('allcourses_enroll_click', {
      course_format: data?.productTypeId,
      course_name: data?.title,
      course_id: data?.sfid,
      course_price: data?.unitPrice,
    });
    if (isGuestCheckoutEnabled || authenticated) {
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
      });
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
    <div class="course-item">
      <div class="course-item-header">
        <div class="course-title-duration">
          <div class="course-title">
            {locationCity
              ? concatenateStrings([locationCity, locationProvince])
              : centerName}
          </div>
          <div class="course-duration">{getCourseDeration()}</div>
        </div>
        <div class="course-price">
          <span>${unitPrice}</span>
        </div>
      </div>
      <div class="course-instructors">
        {concatenateStrings([primaryTeacherName, coTeacher1Name])}
      </div>
      <div class="course-timings">
        {timings?.length > 0 &&
          timings.map((time, i) => {
            return (
              <div class="course-timing" key={i}>
                <span>{dayjs.utc(time.startDate).format('M/D dddd')}</span>
                {`, ${tConvert(time.startTime)} - ${tConvert(time.endTime)} ${
                  ABBRS[time.timeZone]
                }`}
              </div>
            );
          })}
      </div>
      <div class="course-actions">
        <button class="btn-secondary" onClick={detailAction}>
          Details
        </button>
        <button class="btn-primary" onClick={enrollAction}>
          Register
        </button>
      </div>
    </div>
  );
};

const Course = () => {
  const { track, page } = useAnalytics();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0.1,
  });
  const seed = useUIDSeed();
  const { authenticated } = useAuth();
  const router = useRouter();
  const { slug } = router.query;

  const courseTypeFilter = findCourseTypeBySlug(slug);
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

  const COURSE_TYPES_OPTIONS = COURSE_TYPES_MASTER[orgConfig.name].reduce(
    (accumulator, currentValue) => {
      const courseTypes = currentValue.courseTypes.reduce(
        (courseTypes, courseTypeCurrent) => {
          if (COURSE_TYPES[courseTypeCurrent]) {
            return {
              ...courseTypes,
              [COURSE_TYPES[courseTypeCurrent].slug]:
                COURSE_TYPES[courseTypeCurrent],
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

  return (
    <main class="all-courses-find">
      <section class="title-header">
        {!centerFilter && courseTypeFilter && (
          <>
            <h1 class="page-title">{courseTypeFilter.name}</h1>
            <div class="page-description">{courseTypeFilter.description}</div>
          </>
        )}
        {centerFilter && (
          <>
            <h1 class="page-title">
              Courses offered by {centerNameFilter} center
            </h1>
          </>
        )}
      </section>
      <section class="section-course-find">
        <div class="container">
          <div class="course-filter-wrap">
            <div
              id="courses-filters"
              class="course-filter-listing search-form col-12 d-flex align-items-center"
            >
              <button class="filter-save-button">Save Changes</button>
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
                class="courses-filter"
                data-filter="timezone"
                className={classNames('courses-filter', {
                  'with-selected': filterStartEndDate,
                })}
              >
                <button class="courses-filter__remove" onClick={onDatesChange}>
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
                <div class="courses-filter__button date-picker">
                  <DateRangePicker
                    placeholder="Dates"
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
            <div class="search_course_form_mobile d-lg-none d-block">
              <div>
                <div>
                  <div class="filter">
                    <div
                      className={classNames('filter--button d-flex', {
                        active: showFilterModal,
                      })}
                      onClick={toggleFilter}
                    >
                      View Filters
                      <span id="filter-count">{filterCount}</span>
                    </div>
                  </div>
                </div>
                {showFilterModal && (
                  <div class="filter--box">
                    <button
                      class="filter-cancel-button"
                      onClick={toggleFilter}
                    ></button>
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
                      <div class="datepicker-block">
                        <DateRangePicker
                          placeholder="Dates"
                          showHeader={false}
                          onChange={onDatesChange}
                          showOneCalendar
                          ranges={[]}
                          editable={false}
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
              </div>
            </div>
          </div>
          <div class="course-listing">
            <div class="selected-filter-wrap">
              {courseModeFilter && COURSE_MODES[courseModeFilter] && (
                <div
                  class="selected-filter-item"
                  onClick={onFilterClearEvent('courseModeFilter')}
                >
                  {COURSE_MODES[courseModeFilter].value}
                </div>
              )}

              {filterStartEndDateStr && (
                <div class="selected-filter-item" onClick={onDatesChange}>
                  {filterStartEndDateStr}
                </div>
              )}

              {onlyWeekend && (
                <div
                  class="selected-filter-item"
                  onClick={onFilterClearEvent('onlyWeekend')}
                >
                  Weekend Courses
                </div>
              )}

              {timeZoneFilter && TIME_ZONE[timeZoneFilter] && (
                <div
                  class="selected-filter-item"
                  onClick={onFilterClearEvent('timeZoneFilter')}
                >
                  {TIME_ZONE[timeZoneFilter].name}
                </div>
              )}

              {instructorFilter && (
                <div
                  class="selected-filter-item"
                  onClick={onFilterClearEvent('instructorFilter')}
                >
                  {instructorFilter.label}
                </div>
              )}
              {filterCount > 1 && (
                <div
                  class="selected-filter-item clear"
                  onClick={onClearAllFilter}
                >
                  Clear All
                </div>
              )}
            </div>
            {isSuccess &&
              data.pages.map((page) => (
                <React.Fragment key={seed(page)}>
                  {page.data.map((course) => (
                    <CourseTile
                      key={course.sfid}
                      data={course}
                      authenticated={authenticated}
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
            {isSuccess &&
              data?.pages[0].data.length === 0 &&
              !isFetchingNextPage && (
                <div class="no-course-found-wrap">
                  <h2>No course found</h2>
                  <p>Please change your search criteria</p>
                </div>
              )}
            {isSuccess && !hasNextPage && data.pages[0].data.length > 0 && (
              <div class="no-course-found-wrap">
                <p>That's all folks! No more data left to check out.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

// Course.requiresAuth = true;
// Course.redirectUnauthenticated = "/login";

export default Course;
