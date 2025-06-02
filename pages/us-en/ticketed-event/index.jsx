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
import { nuqsParseJson } from '@utils';
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
import { PageLoading, SharePopup } from '@components';
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
  const searchParams = useSearchParams();
  const showAddressFields = searchParams.get('showAddressFields');
  const router = useRouter();
  const {
    mode,
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
    timings,
    unitPrice,
    isEventFull,
    isPurchased,
  } = data || {};

  let queryParams = { ctype: productTypeId };
  if (showAddressFields) {
    queryParams = { ...queryParams, showAddressFields };
  }

  const currentShareLink = `${window.location.origin}/us-en/ticketed-event/${sfid}?${queryString.stringify(
    queryParams,
  )}`;

  const enrollAction = () => {
    if (inIframe) {
      window.open(
        `/us-en/ticketed-event/${sfid}?${queryString.stringify(queryParams)}`,
        '_blank',
      );
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/ticketed-event/${sfid}`,
        query: queryParams,
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
        <SharePopup currentShareLink={currentShareLink} />
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
    nuqsParseJson,
  );
  const [filterStartEndDate, setFilterStartEndDate] = useQueryState(
    'startEndDate',
    parseAsStartEndDate,
  );

  const centerFilter = searchParams.get('center');
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

  const onDatesChange = async (date) => {
    if (Array.isArray(date)) {
      setFilterStartEndDate(date);
    } else {
      setFilterStartEndDate(null);
    }
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
        <div ref={ref} style={{ flex: '0 0 100%' }}></div>
        {isSuccess && !hasNextPage && data.pages[0].data.length > 0 && (
          <div class="no-course-found-wrap">
            <p>No more items to display.</p>
          </div>
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
