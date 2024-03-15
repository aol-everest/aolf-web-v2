/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import {
  api,
  stringToBoolean,
  getUserTimeZoneAbbreviation,
  concatenateStrings,
  tConvert,
  findCourseTypeBySlug,
} from '@utils';
import ContentLoader from 'react-content-loader';
import { useInfiniteQuery, useQuery } from 'react-query';
import React, { useEffect, useState } from 'react';
import { useQueryState } from 'nuqs';
import { useUIDSeed } from 'react-uid';
import { useAuth } from '@contexts';
import { useIntersectionObserver, useQueryString } from '@hooks';
import {
  ABBRS,
  COURSE_MODES,
  COURSE_TYPES,
  TIME_ZONE,
  MODAL_TYPES,
} from '@constants';
import { useGlobalModalContext } from '@contexts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useAnalytics } from 'use-analytics';
import { pushRouteWithUTMQuery } from '@service';
import queryString from 'query-string';

dayjs.extend(utc);

async function queryInstructor({ queryKey: [_, term] }) {
  const response = await api.get({
    path: 'cf/teachers',
    param: {
      query: term,
    },
  });
  return response;
}

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
  const seed = useUIDSeed();
  const { authenticated } = useAuth();
  const router = useRouter();
  const { slug } = router.query;

  const courseTypeFilter = findCourseTypeBySlug(slug);
  const [activeFilterType, setActiveFilterType] = useQueryString('mode');
  const [onlyWeekend, setOnlyWeekend] = useQueryString('onlyWeekend', {
    defaultValue: false,
    parse: stringToBoolean,
  });
  const [otherCType] = useQueryString('other-ctype', {
    defaultValue: false,
    parse: stringToBoolean,
  });
  const [institutionalCourses] = useQueryString('ic-type', {
    defaultValue: false,
    parse: stringToBoolean,
  });
  const [privateEvent] = useQueryString('private-event', {
    defaultValue: false,
    parse: stringToBoolean,
  });
  const [locationFilter, setLocationFilter] = useQueryString('location', {
    parse: JSON.parse,
  });
  const [ctypesFilter, setCtypesFilter] = useQueryString('ctypes');
  const [filterStartEndDate, setFilterStartEndDate] =
    useQueryString('startEndDate');
  const [timeZoneFilter, setTimeZoneFilter] = useQueryState('timeZone');
  const [instructorFilter, setInstructorFilter] = useQueryString('instructor', {
    parse: JSON.parse,
  });

  const [cityFilter] = useQueryString('city');
  const [centerFilter] = useQueryString('center');
  const [centerNameFilter] = useQueryString('centerName');
  const [searchKey, setSearchKey] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { isSuccess, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      [
        'workshops',
        {
          privateEvent,
          otherCType,
          locationFilter,
          ctypesFilter,
          courseTypeFilter,
          filterStartEndDate,
          timeZoneFilter,
          instructorFilter,
          activeFilterType,
          onlyWeekend,
          cityFilter,
          centerFilter,
        },
      ],
      async ({ pageParam = 1 }) => {
        let param = {
          page: pageParam,
          size: 12,
          timingsRequired: true,
        };

        if (activeFilterType && COURSE_MODES[activeFilterType]) {
          param = {
            ...param,
            mode: COURSE_MODES[activeFilterType].value,
          };
        }
        if (institutionalCourses) {
          param = {
            ...param,
            ctype: COURSE_TYPES.INSTITUTIONAL_COURSE.value,
          };
        } else if (ctypesFilter) {
          param = {
            ...param,
            ctype: ctypesFilter,
          };
        } else if (courseTypeFilter) {
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
          const [startDate, endDate] = filterStartEndDate.split('|');
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
        if (otherCType) {
          param = {
            ...param,
            other: 1,
          };
        }
        if (privateEvent) {
          param = {
            ...param,
            isPrivateEvent: 1,
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

        const res = await api.get({
          path: 'workshops',
          param,
        });
        return res;
      },
      {
        getNextPageParam: (page) => {
          return page.currectPage === page.lastPage
            ? undefined
            : page.currectPage + 1;
        },
      },
      // { initialData: workshops },
    );

  const loadMoreRef = React.useRef();
  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });
  return (
    <main class="all-courses-find">
      <section class="title-header">
        {!centerFilter && (
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
            <button id="course-filter-btn" class="course-filter-btn">
              View Filters
            </button>
            <div class="course-filter-listing">
              <button class="filter-cancel-button"></button>
              <button class="filter-save-button">Save Changes</button>
              <div class="form-item">
                <label for="center-select">Center</label>
                <select
                  class="form-select form-select-lg mb-3"
                  id="center-select"
                  aria-label=".form-select-lg"
                >
                  <option selected>Select...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
              <div class="form-item">
                <label for="center-format">Course format</label>
                <select
                  class="form-select form-select-lg mb-3"
                  id="center-format"
                  aria-label=".form-select-lg"
                >
                  <option selected>Select...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
              <div class="form-item">
                <label for="center-type">Course type</label>
                <select
                  class="form-select form-select-lg mb-3"
                  id="center-type"
                  aria-label=".form-select-lg"
                >
                  <option selected>Select...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
              <div class="form-item">
                <label for="dates">Dates</label>
                <select
                  class="form-select form-select-lg mb-3"
                  id="dates"
                  aria-label=".form-select-lg"
                >
                  <option selected>Select...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
              <div class="form-item">
                <label for="weekend-courses">Weekend courses</label>
                <select
                  class="form-select form-select-lg mb-3"
                  id="weekend-courses"
                  aria-label=".form-select-lg"
                >
                  <option selected>Select...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
              <div class="form-item">
                <label for="time-zone">Time zone</label>
                <select
                  class="form-select form-select-lg mb-3"
                  id="time-zone"
                  aria-label=".form-select-lg"
                >
                  <option selected>Select...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
              <div class="form-item">
                <label for="instructor">Instructor</label>
                <select
                  class="form-select form-select-lg mb-3"
                  id="instructor"
                  aria-label=".form-select-lg"
                >
                  <option selected>Select...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
            </div>
          </div>
          <div class="course-listing">
            {!isSuccess && (
              <>
                {[...Array(6)].map((e, i) => (
                  <ItemLoaderTile key={i}></ItemLoaderTile>
                ))}
              </>
            )}
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
            {isFetchingNextPage && (
              <>
                {[...Array(6)].map((e, i) => (
                  <ItemLoaderTile key={i}></ItemLoaderTile>
                ))}
              </>
            )}
            <div ref={loadMoreRef} style={{ flex: '0 0 100%' }}></div>
            {isSuccess && !hasNextPage && data.pages[0].data.length > 0 && (
              <div
                className="tw-p-6 tw-text-lg tw-text-center"
                style={{ flex: '0 0 100%' }}
              >
                That's all folks! No more data left to check out.
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
