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
import { useSearchParams } from 'next/navigation';
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
import { NextSeo } from 'next-seo';

// (Optional) Import component styles. If you are using Less, import the `index.less` file.
import 'rsuite/DateRangePicker/styles/index.css';

const AddressSearch = dynamic(() =>
  import('@components').then((mod) => mod.AddressSearch),
);

dayjs.extend(utc);

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
        className="btn_outline_box btn-modal_dropdown full-btn mt-3"
        onClick={showModal}
      >
        <a className="btn" href="#">
          {value || label}
        </a>
      </div>
      <div
        className={classNames('mobile-modal', {
          active: !isHidden,
        })}
      >
        <div className="mobile-modal--header">
          <div
            id="course-close_mobile"
            className="mobile-modal--close"
            onClick={hideModal}
          >
            <img src="/img/ic-close.svg" alt="close" />
          </div>
          <h2 className="mobile-modal--title">{label}</h2>
          {children}
        </div>
        <div className="mobile-modal--body">
          <div className="row m-0 align-items-center justify-content-between">
            {!hideClearOption && (
              <div className="clear" onClick={clearAction}>
                Clear
              </div>
            )}
            <div
              className="filter-save-button btn_box_primary select-btn"
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
            className="courses-filter__remove"
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
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.5 14L6.5 7"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <label>{label}</label>
        <button
          className={classNames('courses-filter__button', {
            '!tw-text-slate-300': !buttonText,
          })}
          data-filter="event-type"
          onClick={!showList ? handleSelectFilter : handleDropdownClick}
        >
          {buttonText || 'Select...'}
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

const CourseTile = ({ data, inIframe }) => {
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
    title,
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
  } = data || {};

  const enrollAction = () => {
    if (inIframe) {
      window.open(
        `/us-en/ticketed-event/${sfid}?ctype=${productTypeId}`,
        '_blank',
      );
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/ticketed-event/${sfid}`,
        query: {
          ctype: productTypeId,
        },
      });
    }
  };

  const getCourseDeration = () => {
    if (dayjs.utc(eventStartDate).isSame(dayjs.utc(eventEndDate), 'day')) {
      return (
        <>
          {`${dayjs.utc(eventStartDate).format('MMMM DD, YYYY')}`}
          {' ' + ABBRS[eventTimeZone]}
        </>
      );
    }
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
          <div className="course-title">{title}</div>
          <div className="course-duration">{getCourseDeration()}</div>
        </div>
        {!isPurchased && (
          <div className="course-price">
            <span>${unitPrice === 0 || unitPrice === 1 ? '0' : unitPrice}</span>
          </div>
        )}
      </div>
      <div className="course-location">
        {mode !== 'Online' &&
          locationCity &&
          concatenateStrings([
            locationStreet,
            locationCity,
            locationProvince,
            locationPostalCode,
          ])}
        {mode === 'Online' && 'Online'}
      </div>

      {/* <div className="course-instructors">
        {concatenateStrings([primaryTeacherName, coTeacher1Name])}
      </div> */}
      <div className="course-timings">
        {timings?.length > 0 &&
          timings.map((time, i) => {
            return (
              <div className="course-timing" key={i}>
                <span className="tw-pr-2">
                  {dayjs.utc(time.startDate).format('ddd, MMM DD')}{' '}
                </span>
                {`${tConvert(time.startTime)}-${tConvert(time.endTime)} ${
                  ABBRS[time.timeZone]
                }`}
              </div>
            );
          })}
      </div>
      <div className="course-actions">
        <button className="btn-primary" onClick={enrollAction}>
          Enroll
        </button>
      </div>
    </div>
  );
};

const isInIframe = () => {
  if (typeof window !== 'undefined') {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true; // Assume true if access to window.top is denied
    }
  }
  return false;
};

const TicketedEvent = () => {
  const { track, page } = useAnalytics();
  const searchParams = useSearchParams();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0.1,
  });
  const seed = useUIDSeed();
  const { authenticated } = useAuth();
  const router = useRouter();

  const [courseModeFilter, setCourseModeFilter] = useQueryState('mode');
  const [ctypeFilter] = useQueryState('ctype');
  const [locationFilter, setLocationFilter] = useQueryState(
    'location',
    parseAsJson(),
  );
  const [filterStartEndDate, setFilterStartEndDate] = useQueryState(
    'startEndDate',
    parseAsStartEndDate,
  );

  const centerFilter = searchParams.get('center');
  const centerNameFilter = searchParams.get('center-name');
  const [searchKey, setSearchKey] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    setInIframe(isInIframe());
  }, []);

  const { isSuccess, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      {
        queryKey: [
          'ticketedEvents',
          {
            locationFilter,
            ctypeFilter,
            filterStartEndDate,
            courseModeFilter,
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
          if (locationFilter) {
            const { lat, lng } = locationFilter;
            param = {
              ...param,
              lat,
              lng,
            };
          }

          if (centerFilter) {
            param = {
              ...param,
              center: centerFilter,
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

  if (!router.isReady) return <PageLoading />;

  const onClearAllFilter = () => {
    setCourseModeFilter(null);
    setLocationFilter(null);
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
      case 'locationFilter':
        if (value) {
          setLocationFilter(value);
        } else {
          setLocationFilter(null);
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
      case 'locationFilter':
        setLocationFilter(null);
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
      case 'locationFilter':
        if (value) {
          setLocationFilter(value);
        } else {
          setLocationFilter(null);
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
  if (filterStartEndDate) {
    filterCount++;
  }

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
          <h2>No event found</h2>
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
                  authenticated={authenticated}
                  inIframe={inIframe}
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
      </>
    );
  };

  return (
    <main className="all-courses-find">
      <NextSeo defaultTitle={`Event Dates and Registration`} />
      <section className="title-header">
        {centerFilter && (
          <>
            <h1 className="page-title">Events offered by Art of Living SFBA</h1>
          </>
        )}
      </section>
      <section className="section-course-find">
        <div className="container">
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

TicketedEvent.noHeader = true;
TicketedEvent.hideFooter = true;
// Course.redirectUnauthenticated = "/login";

export default TicketedEvent;
