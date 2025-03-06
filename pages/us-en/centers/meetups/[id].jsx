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
import { useAuth, useGlobalAlertContext } from '@contexts';
import { withCenterInfo } from '@hoc';
import {
  ABBRS,
  COURSE_MODES,
  TIME_ZONE,
  MODAL_TYPES,
  ALERT_TYPES,
  MEMBERSHIP_TYPES,
  COURSE_TYPES,
  COURSE_MODES_MAP,
} from '@constants';
import { RetreatPrerequisiteWarning } from '@components';
import { useGlobalModalContext } from '@contexts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useAnalytics } from 'use-analytics';
import { pushRouteWithUTMQuery } from '@service';
import { nuqsParseJson } from '@utils';
import { useInView } from 'react-intersection-observer';
import classNames from 'classnames';
import { orgConfig } from '@org';
import DateRangePicker from 'rsuite/DateRangePicker';
import dynamic from 'next/dynamic';
import { navigateToLogin } from '@utils';
import { NextSeo } from 'next-seo';
import { SmartInput, SmartDropDown, Popup } from '@components';
import { MobileFilterModal } from '@components/filterComps/mobileFilterModal';
import { filterAllowedParams } from '@utils/utmParam';
import { MeetupEnroll } from '@components/meetup/meetupEnroll';

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

const MeetupTile = ({ data }) => {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const { showModal, hideModal } = useGlobalModalContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const {
    mode,
    primaryTeacherName,
    eventTimeZone,
    locationPostalCode,
    locationCity,
    locationProvince,
    centerName,
    coTeacher1Name,
    meetupTitle,
    isOnlineMeetup,
    meetupStartDate,
    meetupStartTime,
    meetupDuration,
    isEventFull,
    isPurchased,
  } = data || {};

  const updateMeetupDuration = `${meetupDuration.replace(/Minutes/g, '')} Min`;

  const closeRetreatPrerequisiteWarning = (e) => {
    if (e) e.preventDefault();
    hideAlert();
    hideModal();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/courses/art-of-living-part-1`,
    });
  };

  const checkoutMeetup = (selectedMeetup) => (questionnaire) => async () => {
    const {
      unitPrice,
      memberPrice,
      sfid,
      productTypeId,
      isSubscriptionOfferingUsed,
    } = selectedMeetup;
    const { subscriptions = [] } = profile;
    hideAlert();
    hideModal();

    const complianceQuestionnaire = questionnaire
      ? questionnaire.reduce(
          (res, current) => ({
            ...res,
            [current.key]: current.value ? 'Yes' : 'No',
          }),
          {},
        )
      : null;

    if (!isSubscriptionOfferingUsed) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/meetup/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
        },
      });
      return;
    }

    const userSubscriptions =
      subscriptions &&
      subscriptions.reduce((accumulator, currentValue) => {
        return {
          ...accumulator,
          [currentValue.subscriptionMasterSfid]: currentValue,
        };
      }, {});

    const isDigitalMember =
      !!userSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value];
    const isPremiumMember =
      !!userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
    const isBasicMember =
      !!userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value];

    if (
      ((isDigitalMember || isPremiumMember || isBasicMember) &&
        memberPrice === 0) ||
      unitPrice === 0
    ) {
      try {
        const {
          first_name,
          last_name,
          personMobilePhone,
          personMailingStreet,
          personMailingState,
          personMailingPostalCode,
        } = profile || {};

        let payLoad = {
          shoppingRequest: {
            tokenizeCC: null,
            couponCode: '',
            contactAddress: {
              contactPhone: personMobilePhone,
              contactAddress: personMailingStreet,
              contactState: personMailingState,
              contactZip: personMailingPostalCode,
            },
            billingAddress: {
              billingPhone: personMobilePhone,
              billingAddress: personMailingStreet,
              billingState: personMailingState,
              billingZip: personMailingPostalCode,
            },
            products: {
              productType: 'meetup',
              productSfId: sfid,
              AddOnProductIds: [],
            },
            complianceQuestionnaire,
            isInstalmentOpted: false,
          },
          utm: filterAllowedParams(router.query),
        };

        if (!isAuthenticated) {
          payLoad = {
            ...payLoad,
            user: {
              first_name,
              last_name,
            },
          };
        }
        //token.saveCardForFuture = true;
        const {
          data,
          status,
          error: errorMessage,
          isError,
        } = await api.post({
          path: 'createAndPayOrder',
          body: payLoad,
        });

        if (status === 400 || isError) {
          throw new Error(errorMessage);
        } else if (data) {
          showEnrollmentCompletionAction(selectedMeetup, data);
        }
      } catch (ex) {
        console.log(ex);
        const data = ex.response?.data;
        const { message, statusCode } = data || {};

        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: message ? `Error: ${message} (${statusCode})` : ex.message,
        });
      }
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/meetup/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
        },
      });
    }
  };

  const showEnrollmentCompletionAction = (selectedMeetup, data) => {
    const { attendeeId } = data;

    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/meetup/thankyou/${attendeeId}`,
      query: {
        cid: selectedMeetup.sfid,
        ctype: selectedMeetup.productTypeId,
        type: 'local',
      },
    });
  };

  const enrollAction = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigateToLogin(router);
    } else {
      if (!profile.isMandatoryWorkshopAttended) {
        const warningPayload = {
          message: (
            <>
              Our records indicate that you have not yet taken the prerequisite
              for the {data.meetupTitle} which is{' '}
              <strong>{COURSE_TYPES.SKY_BREATH_MEDITATION.name}</strong>.
            </>
          ),
        };
        showModal(MODAL_TYPES.EMPTY_MODAL, {
          children: () => {
            return (
              <RetreatPrerequisiteWarning
                meetup={data}
                warningPayload={warningPayload}
                closeRetreatPrerequisiteWarning={
                  closeRetreatPrerequisiteWarning
                }
              />
            );
          },
        });
        return;
      } else {
        try {
          const { data: meetupDetail } = await api.get({
            path: 'meetupDetail',
            param: {
              id: data.sfid,
            },
          });
          const currentMeetup = { ...data, ...meetupDetail };
          showModal(MODAL_TYPES.EMPTY_MODAL, {
            children: (handleModalToggle) => {
              return (
                <MeetupEnroll
                  selectedMeetup={currentMeetup}
                  checkoutMeetup={checkoutMeetup(currentMeetup)}
                  closeDetailAction={handleModalToggle}
                />
              );
            },
          });
        } catch (ex) {
          const data = ex.response?.data;
          const { message, statusCode } = data || {};
          showAlert(ALERT_TYPES.ERROR_ALERT, {
            children: message
              ? `Error: ${message} (${statusCode})`
              : ex.message,
          });
        }
      }
    }
  };

  const getCourseDuration = () => {
    return (
      <>
        {`${dayjs.utc(meetupStartDate).format('MMM DD')}, `}
        {`${tConvert(meetupStartTime)} ${ABBRS[eventTimeZone]}, `}
        {`${updateMeetupDuration}`}
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
          <div className="course-title">{meetupTitle}</div>
          <div className={`course-type ${mode === 'Online' ? 'online' : ''}`}>
            {COURSE_MODES_MAP[mode]}
          </div>
          <div className="course-duration">{getCourseDuration()}</div>
        </div>
      </div>

      <div className="course-location">
        {isOnlineMeetup ? (
          'Live Streaming from' + ' ' + centerName
        ) : (
          <>
            {locationCity
              ? concatenateStrings([
                  locationCity,
                  locationProvince,
                  locationPostalCode,
                ])
              : centerName}
          </>
        )}
      </div>

      <div className="course-instructors">
        {concatenateStrings([primaryTeacherName, coTeacher1Name])}
      </div>
      <div className="course-actions">
        <button className="btn-primary" onClick={enrollAction}>
          Enroll
        </button>
      </div>
    </div>
  );
};

const Meetup = ({ centerDetail }) => {
  const { track, page } = useAnalytics();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0.1,
  });
  const seed = useUIDSeed();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [meetupTypeFilter, setMeetupTypeFilter] = useQueryState('meetupType');
  const [timesOfDayFilter, setTimesOfDayFilter] = useQueryState('timesOfDay');
  const [meetupModeFilter, setMeetupModeFilter] = useQueryState('mode');
  const [privateEvent] = useQueryState('private-event', parseAsBoolean);
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
  const [centerFilter] = useQueryState('center');
  const [searchKey, setSearchKey] = useState('');
  const [centerSearchKey, setCenterSearchKey] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { data: allMeetupMaster = [] } = useQuery({
    queryKey: 'allMeetupMaster',
    queryFn: async () => {
      const response = await api.get({
        path: 'getAllMeetupMaster',
      });
      return response;
    },
  });

  const meetupMasters = allMeetupMaster.reduce((acc, meetup) => {
    return { ...acc, [meetup.id]: meetup };
  }, {});

  const { isSuccess, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      {
        queryKey: [
          'meetups',
          {
            privateEvent,
            meetupTypeFilter,
            filterStartEndDate,
            timeZoneFilter,
            instructorFilter,
            meetupModeFilter,
            cityFilter,
            centerFilter,
            centerDetail: centerDetail.sfid,
          },
        ],
        queryFn: async ({ pageParam = 1 }) => {
          let param = {
            page: pageParam || 1,
            size: 12,
            timingsRequired: true,
          };

          if (meetupModeFilter && COURSE_MODES[meetupModeFilter]) {
            param = {
              ...param,
              mode: COURSE_MODES[meetupModeFilter].value,
            };
          }
          if (meetupTypeFilter) {
            param = {
              ...param,
              filter: meetupTypeFilter,
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
          if (privateEvent) {
            param = {
              ...param,
              isPrivateEvent: 1,
            };
          }
          if (cityFilter) {
            param = {
              ...param,
              city: cityFilter,
            };
          }
          if (centerDetail) {
            param = {
              ...param,
              centerId: centerDetail.sfid,
            };
          }

          const res = await api.get({
            path: 'meetups',
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
    if (orgConfig.name === 'AOL' && !timeZoneFilter) {
      setTimeZoneFilter(fillDefaultTimeZone());
    }
  }, [router.isReady]);

  const onClearAllFilter = () => {
    setMeetupModeFilter(null);
    setTimeZoneFilter(null);
    setInstructorFilter(null);
    setFilterStartEndDate(null);
    setMeetupTypeFilter(null);
  };

  const centerChangeHandler = (center) => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/centers/meetups/${center.value}`,
      query: { u: 'true' },
    });
  };

  const centerChangeHandlerWrapper = (center) => () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/centers/courses/${center.value}`,
      query: { u: 'true' },
    });
  };

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case 'meetupTypeFilter':
        setMeetupTypeFilter(value);
        break;
      case 'meetupModeFilter':
        setMeetupModeFilter(value);
        break;
      case 'timesOfDayFilter':
        setTimesOfDayFilter(value);
        break;
      case 'timeZoneFilter':
        if (value) {
          setTimeZoneFilter(value);
        } else {
          setTimeZoneFilter(null);
          setTimeout(() => {
            setTimesOfDayFilter(null);
          }, 0);
        }
        break;
      case 'instructorFilter':
        if (value) {
          setInstructorFilter(value);
        } else {
          setInstructorFilter(null);
          setSearchKey('');
        }
        break;
    }
  };

  const onFilterClearEvent = (field) => async (e) => {
    if (e) e.preventDefault();
    switch (field) {
      case 'meetupTypeFilter':
        setMeetupTypeFilter(null);
        break;
      case 'meetupModeFilter':
        setMeetupModeFilter(null);
        break;
      case 'timesOfDayFilter':
        setTimesOfDayFilter(null);
        break;
      case 'timeZoneFilter':
        setTimeZoneFilter(null);
        setTimeout(() => {
          setTimesOfDayFilter(null);
        }, 0);
        break;
      case 'instructorFilter':
        setInstructorFilter(null);
        break;
    }
  };

  const onFilterChangeEvent = (field) => (value) => async (e) => {
    if (e) e.preventDefault();
    switch (field) {
      case 'meetupTypeFilter':
        setMeetupTypeFilter(value);
        break;
      case 'meetupModeFilter':
        setMeetupModeFilter(value);
        break;
      case 'timesOfDayFilter':
        setTimesOfDayFilter(value);
        break;
      case 'timeZoneFilter':
        setTimeZoneFilter(value);
        break;
      case 'instructorFilter':
        if (value) {
          setInstructorFilter(value);
        } else {
          setInstructorFilter(null);
          setSearchKey('');
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

  let filterCount = 0;

  if (meetupModeFilter) {
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
  if (meetupTypeFilter) {
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

  const renderMeetupList = () => {
    if (isSuccess && data?.pages[0].data?.length === 0 && !isFetchingNextPage) {
      return (
        <div className="no-course-found-wrap">
          <h2>No meetup found</h2>
          <p>Please change your search criteria</p>
        </div>
      );
    }
    return (
      <>
        {isSuccess &&
          data.pages.map((page) => (
            <React.Fragment key={seed(page)}>
              {page.data?.map((meetup) => (
                <MeetupTile key={meetup.sfid} data={meetup} />
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
    <div id="tab1" className="tab-content">
      <NextSeo
        defaultTitle={`${centerDetail.centerName} - Meetup Dates and Registration`}
      />
      <div className="course-tab-content-wrap meetup">
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
              value={COURSE_MODES[meetupModeFilter] && meetupModeFilter}
              buttonText={
                meetupModeFilter && COURSE_MODES[meetupModeFilter]
                  ? COURSE_MODES[meetupModeFilter].name
                  : null
              }
              closeEvent={onFilterChange('meetupModeFilter')}
              label="Meetup Format"
            >
              {({ closeHandler }) => (
                <>
                  {orgConfig.meetupModes?.map((courseMode, index) => {
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
              value={meetupTypeFilter}
              buttonText={
                meetupTypeFilter && meetupMasters[meetupTypeFilter]
                  ? meetupMasters[meetupTypeFilter].name
                  : null
              }
              label="Meetup Type"
              closeEvent={onFilterChange('meetupTypeFilter')}
            >
              {({ closeHandler }) => (
                <>
                  {allMeetupMaster?.map((mtype, index) => {
                    return (
                      <li
                        className="courses-filter__list-item"
                        key={index}
                        onClick={closeHandler(mtype.id)}
                      >
                        {mtype.name}
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
                  shouldDisableDate={combine(allowedMaxDays(14), beforeToday())}
                  ranges={[]}
                  editable={false}
                />
              </div>
            </div>

            <Popup
              tabIndex="4"
              value={TIME_ZONE[timeZoneFilter] ? timeZoneFilter : null}
              buttonText={
                timeZoneFilter && TIME_ZONE[timeZoneFilter]
                  ? TIME_ZONE[timeZoneFilter].name
                  : null
              }
              closeEvent={onFilterChange('timeZoneFilter')}
              label="TimeZone"
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
              parentClassName="instructor"
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
                    {meetupTypeFilter && meetupMasters[meetupTypeFilter] && (
                      <div
                        className="selected-filter-item"
                        onClick={onFilterClearEvent('meetupTypeFilter')}
                      >
                        {meetupMasters[meetupTypeFilter].name}
                      </div>
                    )}

                    {meetupModeFilter && COURSE_MODES[meetupModeFilter] && (
                      <div
                        className="selected-filter-item"
                        onClick={onFilterClearEvent('meetupModeFilter')}
                      >
                        {COURSE_MODES[meetupModeFilter].value}
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
                    label="Center"
                    hideClearOption
                    value={centerDetail ? centerDetail.centerName : null}
                  >
                    <SmartInput
                      containerClassName="smart-input-mobile"
                      placeholder="Search Center"
                      value={centerSearchKey}
                      onSearchKeyChange={(value) => setCenterSearchKey(value)}
                      dataList={centerList}
                      closeHandler={centerChangeHandlerWrapper}
                    ></SmartInput>
                  </MobileFilterModal>

                  <MobileFilterModal
                    label="Meetup Format"
                    cl
                    value={
                      meetupModeFilter
                        ? COURSE_MODES[meetupModeFilter].name
                        : null
                    }
                    hideClearOption
                    clearEvent={onFilterChange('meetupModeFilter')}
                  >
                    <div className="dropdown">
                      <SmartDropDown
                        value={meetupModeFilter}
                        buttonText={
                          meetupModeFilter
                            ? COURSE_MODES[meetupModeFilter].name
                            : 'Select Format'
                        }
                        closeEvent={onFilterChange('meetupModeFilter')}
                      >
                        {({ closeHandler }) => (
                          <>
                            {orgConfig.meetupModes?.map((courseMode, index) => {
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

                  <MobileFilterModal
                    label="Meetup Type"
                    value={
                      meetupTypeFilter && meetupMasters[meetupTypeFilter]
                        ? meetupMasters[meetupTypeFilter].name
                        : null
                    }
                    clearEvent={onFilterChange('meetupTypeFilter')}
                  >
                    <div className="dropdown">
                      <SmartDropDown
                        value={meetupTypeFilter}
                        buttonText={
                          meetupTypeFilter && meetupMasters[meetupTypeFilter]
                            ? meetupMasters[meetupTypeFilter].name
                            : 'Select Meetup'
                        }
                        closeEvent={onFilterChange('meetupTypeFilter')}
                      >
                        {({ closeHandler }) => (
                          <>
                            {allMeetupMaster?.map((mtype, index) => {
                              return (
                                <li
                                  className="dropdown-item"
                                  key={index}
                                  onClick={closeHandler(mtype.id)}
                                >
                                  {mtype.name}
                                </li>
                              );
                            })}
                          </>
                        )}
                      </SmartDropDown>
                    </div>
                  </MobileFilterModal>
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
                        value={filterStartEndDate}
                      />
                    </div>
                  </MobileFilterModal>

                  <MobileFilterModal
                    label="TimeZone"
                    value={
                      timeZoneFilter && TIME_ZONE[timeZoneFilter]
                        ? TIME_ZONE[timeZoneFilter].name
                        : null
                    }
                    clearEvent={onFilterClearEvent('timeZoneFilter')}
                  >
                    <div className="dropdown">
                      <h2>Time Range</h2>
                      <div className="checkbox-list">
                        <div className="checkbox-wrapper">
                          <input
                            className="custom-checkbox"
                            type="checkbox"
                            name="morning"
                            id="morning"
                            checked={
                              timesOfDayFilter
                                ? timesOfDayFilter === 'Morning'
                                : false
                            }
                            onClick={onFilterChangeEvent('timesOfDayFilter')(
                              'Morning',
                            )}
                          />
                          <label className="checkbox-text" htmlFor="morning">
                            Morning
                          </label>
                        </div>
                        <div className="checkbox-wrapper">
                          <input
                            className="custom-checkbox"
                            type="checkbox"
                            name="afternoon"
                            id="afternoon"
                            checked={
                              timesOfDayFilter
                                ? timesOfDayFilter === 'Afternoon'
                                : false
                            }
                            onClick={onFilterChangeEvent('timesOfDayFilter')(
                              'Afternoon',
                            )}
                          />
                          <label className="checkbox-text" htmlFor="afternoon">
                            Afternoon
                          </label>
                        </div>
                        <div className="checkbox-wrapper">
                          <input
                            className="custom-checkbox"
                            type="checkbox"
                            name="evening"
                            id="evening"
                            checked={
                              timesOfDayFilter
                                ? timesOfDayFilter === 'Evening'
                                : false
                            }
                            onClick={onFilterChangeEvent('timesOfDayFilter')(
                              'Evening',
                            )}
                          />
                          <label className="checkbox-text" htmlFor="evening">
                            Evening
                          </label>
                        </div>
                      </div>
                      <h2>Time zone</h2>
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
            {meetupTypeFilter && meetupMasters[meetupTypeFilter] && (
              <div
                className="selected-filter-item"
                onClick={onFilterClearEvent('meetupTypeFilter')}
              >
                {meetupMasters[meetupTypeFilter].name}
              </div>
            )}

            {meetupModeFilter && COURSE_MODES[meetupModeFilter] && (
              <div
                className="selected-filter-item"
                onClick={onFilterClearEvent('meetupModeFilter')}
              >
                {COURSE_MODES[meetupModeFilter].value}
              </div>
            )}

            {filterStartEndDateStr && (
              <div className="selected-filter-item" onClick={onDatesChange}>
                {filterStartEndDateStr}
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
          {renderMeetupList()}
        </div>
      </div>
    </div>
  );
};

export default withCenterInfo(Meetup);
