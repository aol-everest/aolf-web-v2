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
import { nuqsParseJson } from '@utils';
import {
  ABBRS,
  COURSE_MODES,
  COURSE_TYPES,
  TIME_ZONE,
  MODAL_TYPES,
  COURSE_TYPES_MASTER,
  COURSE_MODES_MAP,
} from '@constants';
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
import { navigateToLogin, isEmpty } from '@utils';
import { NextSeo } from 'next-seo';
import { SmartInput, SmartDropDown, Popup } from '@components';
import { MobileFilterModal } from '@components/filterComps/mobileFilterModal';
import { withAuth } from '@hoc';

// (Optional) Import component styles. If you are using Less, import the `index.less` file.
import 'rsuite/DateRangePicker/styles/index.css';

export async function getServerSideProps(context) {
  let bundle = null;
  let allowCourseTypes = null;
  let defaultCourseType = null;
  const { id } = context.params;

  try {
    const response = await api.get({
      path: 'getBundleDetail',
      param: {
        bundleSfid: id,
      },
    });
    bundle = response.data;
    if (bundle && bundle.comboDetails) {
      allowCourseTypes = getCourseTypes(bundle.comboDetails);
      defaultCourseType = getCourseTypes(bundle.comboDetails, true);
      if (defaultCourseType && typeof defaultCourseType === 'object') {
        const [[, value]] = Object.entries(defaultCourseType);
        defaultCourseType = value;
      }
    }
    if (bundle.package) {
      const slug = bundle.package.packageMasterTitle
        .toLowerCase()
        .replace(/\s+/g, '-');

      allowCourseTypes = {
        ...allowCourseTypes,
        [slug]: {
          slug: slug, // Slug in lowercase and without spaces
          name: bundle.package.packageMasterTitle,
          value: bundle.package.packageMasterCtypeId,
          description: bundle.package.packageMasterDescription,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch ZIP code by IP');
  }

  return {
    props: { bundle, allowCourseTypes, defaultCourseType },
  };
}

const getCourseTypes = (comboDetails, onlyMain = false) => {
  return comboDetails.reduce((accumulator, comboDetail) => {
    const allowedProducts = comboDetail.comboDetailProductAllowedFamilyProduct;
    if (!onlyMain || (onlyMain && comboDetail.comboDetailIsMainProduct)) {
      if (allowedProducts && allowedProducts.length > 0) {
        allowedProducts.split(',').forEach((productTypeId) => {
          for (const courseKey in COURSE_TYPES) {
            const course = COURSE_TYPES[courseKey];
            if (course.value.includes(productTypeId)) {
              accumulator[course.slug] = course;
            }
          }
        });
      }
    }

    return accumulator;
  }, {});
};

dayjs.extend(utc);

const parseCourseType = (courseTypesOptions) => {
  return createParser({
    parse(queryValue) {
      if (queryValue && courseTypesOptions[queryValue]) {
        return courseTypesOptions[queryValue];
      } else {
        return null;
      }
    },
    serialize(value) {
      if (value) return value;
      return null;
    },
  });
};

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
  return 'EST';
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

const CourseTile = ({ data, isAuthenticated, courseTypeFilter }) => {
  const router = useRouter();
  const { id: bundleSfid } = router.query;
  const { track } = useAnalytics();
  const {
    mode,
    primaryTeacherName,
    productTypeId,
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
    title,
  } = data || {};

  const enrollAction = () => {
    track('click_button', {
      screen_name: 'bundle_course_search_scheduling',
      event_target: 'register_button',
      course_type: courseTypeFilter || '',
      location_type: mode,
    });
    if (isGuestCheckoutEnabled || isAuthenticated) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
          'source-bundle': bundleSfid,
        },
      });
    } else {
      navigateToLogin(
        router,
        `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&source-bundle=${bundleSfid}&${queryString.stringify(
          router.query,
        )}`,
      );
    }
  };

  const detailAction = () => {
    track('click_button', {
      screen_name: 'bundle_course_search_scheduling',
      event_target: 'details_button',
      course_type: courseTypeFilter || '',
      location_type: mode,
    });
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course/${sfid}`,
      query: {
        ctype: productTypeId,
      },
    });
  };

  const { usableCredit } = data;

  const isUsableCreditAvailable = usableCredit && !isEmpty(usableCredit);

  let UpdatedFeeAfterCredits;
  if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === 'Quantity' &&
    usableCredit.availableCredit === 1
  ) {
    UpdatedFeeAfterCredits = 0;
  } else if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === 'Amount'
  ) {
    if (usableCredit.availableCredit > unitPrice) {
      UpdatedFeeAfterCredits = 0;
    } else {
      UpdatedFeeAfterCredits = unitPrice - usableCredit.availableCredit;
    }
  }

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
          <div
            class={classNames('course-type in-person', {
              'in-person': mode === COURSE_MODES.IN_PERSON.value,
              online: mode === COURSE_MODES.ONLINE.value,
            })}
          >
            {COURSE_MODES_MAP[mode]}
          </div>
          {/* <div className="course-duration">{getCourseDeration()}</div> */}
        </div>
        {!isPurchased && (
          <>
            {isUsableCreditAvailable && (
              <div className="course-price">
                <s>${listPrice}</s> <span>${UpdatedFeeAfterCredits}</span>
              </div>
            )}

            {!isUsableCreditAvailable && (
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
          </>
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

const Course = ({ bundle, allowCourseTypes }) => {
  const { track, page } = useAnalytics();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0.1,
  });
  const seed = useUIDSeed();
  const { isAuthenticated, profile, passwordLess } = useAuth();
  const { signOut } = passwordLess;
  const { first_name } = profile || {};
  const router = useRouter();
  const { id: bundleSfid } = router.query;

  const [courseTypeFilter, setCourseTypeFilter] = useQueryState(
    'course-type',
    parseCourseType(allowCourseTypes),
  );
  const [onlyWeekend, setOnlyWeekend] = useQueryState(
    'onlyWeekend',
    parseAsBoolean.withDefault(false),
  );
  const [filterStartEndDate, setFilterStartEndDate] = useQueryState(
    'startEndDate',
    parseAsStartEndDate,
  );
  const [timeZoneFilter, setTimeZoneFilter] = useQueryState('timeZone');
  const [instructorFilter, setInstructorFilter] = useQueryState(
    'instructor',
    nuqsParseJson,
  );

  const [cityFilter] = useQueryState('city');
  const [searchKey, setSearchKey] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const {
    comboName,
    comboDescription,
    comboUnitPrice: unitPrice,
    comboListPrice: listPrice,
    comboProductSfid: productTypeId,
  } = bundle || {};

  const { isSuccess, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: [
        'getBundleWorkshopsOnly',
        {
          courseTypeFilter,
          bundleSfid,
          filterStartEndDate,
          timeZoneFilter,
          instructorFilter,
          onlyWeekend,
          cityFilter,
        },
      ],
      queryFn: async ({ pageParam = 1 }) => {
        let param = {
          page: pageParam,
          size: 12,
          timingsRequired: true,
        };

        if (courseTypeFilter) {
          param = {
            ...param,
            ctype: courseTypeFilter.value,
          };
        }

        if (bundleSfid) {
          param = {
            ...param,
            bundleSfid,
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

        if (!bundleSfid) {
          return { data: null };
        }

        const res = await api.get({
          path: 'getBundleWorkshopsOnly',
          param,
        });
        return res;
      },
      getNextPageParam: (page) => {
        return page.currectPage >= page.lastPage
          ? undefined
          : page.currectPage + 1;
      },
    });

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
      name: 'bundle_course_search_scheduling',
      course_type: courseTypeFilter || '',
    });
    if (orgConfig.name === 'AOL' && !timeZoneFilter) {
      setTimeZoneFilter(fillDefaultTimeZone());
    }
  }, [router.isReady]);

  // analytics.page("course_registration","bundle_course_search_scheduling",{"course_type": "<course-type> filter on the page"});

  if (!router.isReady) return <PageLoading />;

  const onClearAllFilter = () => {
    setOnlyWeekend(null);
    setTimeZoneFilter(null);
    setFilterStartEndDate(null);
    setCourseTypeFilter(null);
    setSearchKey('');
    setInstructorFilter(null);
  };

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case 'courseTypeFilter':
        setCourseTypeFilter(value?.slug);
        break;
      case 'onlyWeekend':
        setOnlyWeekend(value);
        break;

      case 'timeZoneFilter':
        setTimeZoneFilter(value);
        break;
      case 'instructorFilter':
        if (value) {
          setInstructorFilter(value);
        } else {
          setSearchKey('');
          setInstructorFilter(null);
        }
        break;
    }
  };

  const onFilterClearEvent = (field) => async (e) => {
    if (e) e.preventDefault();
    switch (field) {
      case 'courseTypeFilter':
        setCourseTypeFilter(null);
        break;
      case 'onlyWeekend':
        setOnlyWeekend(null);
        break;
      case 'timeZoneFilter':
        setTimeZoneFilter(null);
        break;
      case 'instructorFilter':
        setSearchKey('');
        setInstructorFilter(null);
        break;
    }
  };

  const onFilterChangeEvent = (field) => (value) => async (e) => {
    if (e) e.preventDefault();
    switch (field) {
      case 'courseTypeFilter':
        setCourseTypeFilter(value.slug);
        break;
      case 'onlyWeekend':
        setOnlyWeekend(value);
        break;
      case 'timeZoneFilter':
        setTimeZoneFilter(value);
        break;
      case 'instructorFilter':
        if (value) {
          setInstructorFilter(value);
        } else {
          setSearchKey('');
          setInstructorFilter(null);
        }
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

  const logout = async (e) => {
    if (e) e.preventDefault();
    await signOut();
    pushRouteWithUTMQuery(
      router,
      `/us-en/signin?next=${encodeURIComponent(location.pathname + location.search)}`,
    );
  };

  let filterCount = 0;

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
  if (courseTypeFilter) {
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
                  bundleSfid={bundleSfid}
                  courseTypeFilter={courseTypeFilter}
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
      {comboName && (
        <>
          <NextSeo
            defaultTitle={`${comboName} - Course Dates and Registration`}
            description={comboDescription}
          />
          <section className="title-header">
            <h1 className="page-title">{comboName}</h1>
            <div className="page-description">{comboDescription}</div>
          </section>
        </>
      )}
      <section className="section-course-find !tw-pt-[60px]">
        <div className="container tw-pb-4">
          <div class="user_detail">
            Welcome {first_name}! (
            <a href="#" class="link" onClick={logout}>
              logout
            </a>
            )
          </div>
        </div>

        <div className="container">
          <div className="course-filter-wrap">
            <div
              id="courses-filters"
              className="course-filter-listing search-form col-12 d-flex align-items-center"
            >
              <button className="filter-save-button">Save Changes</button>

              <Popup
                tabIndex="3"
                value={courseTypeFilter}
                buttonText={
                  courseTypeFilter && courseTypeFilter.name
                    ? courseTypeFilter.name
                    : null
                }
                label="Course Type"
                closeEvent={onFilterChange('courseTypeFilter')}
              >
                {({ closeHandler }) => (
                  <>
                    {Object.values(allowCourseTypes).map(
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
                label="Weekend Courses / Events"
                buttonText={onlyWeekend ? 'Weekend Courses / Events' : null}
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
                parentClassName="upward"
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
                parentClassName="upward"
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
                      {courseTypeFilter && (
                        <div
                          className="selected-filter-item"
                          onClick={onFilterClearEvent('courseTypeFilter')}
                        >
                          {courseTypeFilter.name}
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
                          Weekend Courses / Events
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
                      label="Course Type"
                      value={
                        courseTypeFilter && courseTypeFilter.name
                          ? courseTypeFilter.name
                          : null
                      }
                      clearEvent={onFilterClearEvent('courseTypeFilter')}
                    >
                      <div className="dropdown">
                        <SmartDropDown
                          value={courseTypeFilter}
                          buttonText={
                            courseTypeFilter && courseTypeFilter.name
                              ? courseTypeFilter.name
                              : null
                          }
                          closeEvent={onFilterChange('courseTypeFilter')}
                        >
                          {({ closeHandler }) => (
                            <>
                              {Object.values(allowCourseTypes).map(
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
                    <label>Weekend Courses / Events</label>
                    <div
                      className={classNames('courses-filter', {
                        'with-selected': onlyWeekend,
                      })}
                    >
                      <button
                        className={classNames(
                          'btn_outline_box btn-modal_dropdown full-btn mt-3',
                          {
                            '!tw-text-slate-300': !onlyWeekend,
                          },
                        )}
                        data-filter="weekend-mobile-courses"
                        data-type="checkbox"
                        onClick={() => {
                          setOnlyWeekend(!onlyWeekend ? true : null);
                        }}
                      >
                        Weekend Courses / Events
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
                    </div>
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
              {courseTypeFilter && (
                <div
                  className="selected-filter-item"
                  onClick={onFilterClearEvent('courseTypeFilter')}
                >
                  {courseTypeFilter.name}
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
                  Weekend Courses / Events
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

Course.requiresAuth = true;
Course.hideHeader = true;
Course.hideFooter = true;

export default withAuth(Course, { hideHeader: true, hideFooter: true });
