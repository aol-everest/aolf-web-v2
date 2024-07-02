import { MeetupEnroll } from '@components/meetup/meetupEnroll';
import {
  ABBRS,
  ALERT_TYPES,
  COURSE_TYPES,
  MEMBERSHIP_TYPES,
  MODAL_TYPES,
  WORKSHOP_MODE,
} from '@constants';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalModalContext,
} from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { concatenateStrings, tConvert, api } from '@utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useAnalytics } from 'use-analytics';
import queryString from 'query-string';
import { RetreatPrerequisiteWarning } from '..';
import { filterAllowedParams } from '@utils/utmParam';

dayjs.extend(utc);

export const EventList = ({ isPreferredCenter, workshops }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { track } = useAnalytics();
  const { showModal, hideModal } = useGlobalModalContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();

  return (
    <>
      {workshops.map((workshop) => {
        const {
          sfid,
          title,
          meetupTitle,
          mode,
          primaryTeacherName,
          productTypeId,
          eventStartDate,
          eventEndDate,
          eventTimeZone,
          eventType,
          meetupStartDate,
          meetupStartTime,
          meetupTimeZone,
          meetupDuration,
          locationPostalCode,
          isOnlineMeetup,
          locationCity,
          locationProvince,
          unitPrice,
          listPrice,
          locationStreet,
          centerName,
          coTeacher1Name,
          timings,
          isGuestCheckoutEnabled = false,
          actualAmountPaid,
        } = workshop || {};

        const isWorkshop = eventType === 'Workshop';

        const handleEventDetails = () => {
          pushRouteWithUTMQuery(router, {
            pathname: `/us-en/course/${sfid}`,
            query: {
              ctype: productTypeId,
              mode: WORKSHOP_MODE.VIEW,
            },
          });
        };

        const updateMeetupDuration = meetupDuration?.replace(/Minutes/g, 'Min');

        const getCourseDuration = () => {
          if (
            dayjs.utc(eventStartDate).isSame(dayjs.utc(eventEndDate), 'month')
          ) {
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

        const getMeetupDuration = () => {
          return (
            <>
              {`${dayjs.utc(meetupStartDate).format('MMM DD')}, `}
              {`${tConvert(meetupStartTime)} ${ABBRS[meetupTimeZone]}, `}
              {`${updateMeetupDuration}`}
            </>
          );
        };

        const workshopEnrollAction = () => {
          track('allcourses_enroll_click', {
            course_format: productTypeId,
            course_name: title,
            course_id: sfid,
            course_price: unitPrice,
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
            showModal(MODAL_TYPES.LOGIN_MODAL, {
              navigateTo: `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
                router.query,
              )}`,
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

        const checkoutMeetup =
          (selectedMeetup) => (questionnaire) => async () => {
            const {
              unitPrice,
              memberPrice,
              sfid,
              productTypeId,
              isSubscriptionOfferingUsed,
            } = selectedMeetup;
            const { subscriptions = [] } = user.profile;
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
                } = user.profile || {};

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
                  children: message
                    ? `Error: ${message} (${statusCode})`
                    : ex.message,
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

        const closeRetreatPrerequisiteWarning = (e) => {
          if (e) e.preventDefault();
          hideAlert();
          hideModal();
          pushRouteWithUTMQuery(router, {
            pathname: `/us-en/courses/art-of-living-part-1`,
          });
        };

        const meetupEnrollAction = async (e) => {
          if (e) e.preventDefault();
          if (!isAuthenticated) {
            showModal(MODAL_TYPES.LOGIN_MODAL);
          } else {
            if (!user.profile.isMandatoryWorkshopAttended) {
              const warningPayload = {
                message: (
                  <>
                    Our records indicate that you have not yet taken the
                    prerequisite for the {meetupTitle} which is{' '}
                    <strong>{COURSE_TYPES.SKY_BREATH_MEDITATION.name}</strong>.
                  </>
                ),
              };
              showModal(MODAL_TYPES.EMPTY_MODAL, {
                children: () => {
                  return (
                    <RetreatPrerequisiteWarning
                      meetup={workshop}
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
                    id: sfid,
                  },
                });
                const currentMeetup = { ...workshop, ...meetupDetail };
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

        return (
          <div className="course-item" key={sfid}>
            <div className="course-item-header">
              <div className="course-title-duration">
                <div className="course-title">
                  <span className="icon-aol iconaol-hindu-temple"></span>
                  {isWorkshop ? mode : meetupTitle}
                </div>
                {isWorkshop ? (
                  <div className="course-duration">{getCourseDuration()}</div>
                ) : (
                  <div className="course-mode-duration">
                    <div className="course-duration">{mode} </div>{' '}
                    <div className="course-duration">{getMeetupDuration()}</div>
                  </div>
                )}
              </div>
              {isWorkshop && isPreferredCenter && (
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
              {!isPreferredCenter && (
                <div className="course-price">
                  <span>${actualAmountPaid}</span>
                </div>
              )}
            </div>

            <div className="course-location">
              {isWorkshop ? (
                <>
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
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
            <div className="course-instructors">
              {concatenateStrings([primaryTeacherName, coTeacher1Name])}
            </div>
            {isWorkshop && (
              <div className="course-timings">
                {timings?.length > 0 &&
                  timings.map((time, i) => {
                    return (
                      <div className="course-timing" key={i}>
                        <span>
                          {dayjs.utc(time.startDate).format('M/D dddd')}
                        </span>
                        {`, ${tConvert(time.startTime)} - ${tConvert(time.endTime)} ${
                          ABBRS[time.timeZone]
                        }`}
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="course-actions">
              {isWorkshop ? (
                <>
                  <button
                    className="btn-secondary"
                    onClick={handleEventDetails}
                  >
                    Details
                  </button>
                  {isPreferredCenter && (
                    <button
                      className="btn-primary"
                      onClick={workshopEnrollAction}
                    >
                      Register
                    </button>
                  )}
                </>
              ) : (
                isPreferredCenter && (
                  <button className="btn-primary" onClick={meetupEnrollAction}>
                    Enroll
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
