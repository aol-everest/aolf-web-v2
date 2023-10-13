/* eslint-disable react/no-unescaped-entities */
import { Loader } from '@components';
import Link from '@components/linkWithUTM';
import { ALERT_TYPES, MODAL_TYPES, COURSE_TYPES } from '@constants';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalModalContext,
} from '@contexts';
import { withAuth } from '@hoc';
import { useQueryString } from '@hooks';
import { pushRouteWithUTMQuery } from '@service';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Auth } from '@utils';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaCamera } from 'react-icons/fa';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const EventList = dynamic(() =>
  import('@components/profile').then((mod) => mod.EventList),
);
const CouponStack = dynamic(() =>
  import('@components/profile').then((mod) => mod.CouponStack),
);
const ChangePassword = dynamic(() =>
  import('@components/profile').then((mod) => mod.ChangePassword),
);
const ChangeProfile = dynamic(() =>
  import('@components/profile').then((mod) => mod.ChangeProfile),
);
const PastCourses = dynamic(() =>
  import('@components/profile').then((mod) => mod.PastCourses),
);
const ViewCardDetail = dynamic(() =>
  import('@components/profile').then((mod) => mod.ViewCardDetail),
);
const ProfilePicCrop = dynamic(() =>
  import('@components/profile').then((mod) => mod.ProfilePicCrop),
);
const ProfileHeader = dynamic(() =>
  import('@components/profile').then((mod) => mod.ProfileHeader),
);

const ChangeCardDetail = dynamic(() =>
  import('@components/profile').then((mod) => mod.ChangeCardDetail),
);

const UPCOMING_EVENTS = 'UPCOMING_EVENTS';
const PAST_COURSES = 'PAST_COURSES';
const UPDATE_PROFILE = 'UPDATE_PROFILE';
const REFER_A_FRIEND = 'REFER_A_FRIEND';
const CARD_DETAILS = 'CARD_DETAILS';
const CHANGE_PASSWORD = 'CHANGE_PASSWORD';

const MESSAGE_CANCEL_MEMBERSHIP_ERROR = `We're sorry, but an error occurred. Please contact the help desk
                at (855) 202-4400 to resolve the issue and cancel your
                membership.`;
const MESSAGE_DELETE_PERSONAL_INFORMATION_ERROR = `We're sorry, but an error occurred. Please contact the help desk
                at (855) 202-4400 to resolve the issue and delete your information.`;
const MESSAGE_ALREADY_CASE_REGISTERED_ERROR = `We have already received your request to delete PII/CC. The support team is working on it and will get in touch with you shortly`;
// export async function getServerSideProps({ req, resolvedUrl, query }) {
//   const { Auth } = withSSRContext({ req });
//   const { tab } = query || {};
//   try {
//     const user = await Auth.currentAuthenticatedUser();
//     const currentSession = await Auth.currentSession();
//     const token = currentSession.idToken.jwtToken;
//     const res = await api.get({
//       path: "profile",
//       token,
//     });
//     return {
//       props: {
//         authenticated: true,
//         username: user.username,
//         profile: res,
//         token,
//         tab: tab || UPCOMING_EVENTS,
//       },
//     };
//   } catch (err) {
//     console.error(err);
//     return {
//       redirect: {
//         permanent: false,
//         destination: `/login?next=${resolvedUrl}`,
//       },
//       props: {},
//     };
//   }
// }

const Profile = ({ tab }) => {
  const { showAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const [loading, setLoading] = useState(false);
  const { user, setUser, reloadProfile, authenticated } = useAuth();
  const [activeTab, setActiveTab] = useQueryString('tab', {
    defaultValue: tab || UPCOMING_EVENTS,
  });
  const [editCardDetail, setEditCardDetail] = useState(false);
  const [request, setRequest] = useQueryString('request');
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    reloadProfile();
  }, [router.isReady]);

  const {
    first_name,
    last_name,
    name,
    userProfilePic: profilePic,
    upcomingWorkshop = [],
    upcomingMeetup = [],
    subscriptions = [],
  } = user?.profile || {};
  const upcomingEvents = [...upcomingWorkshop, ...upcomingMeetup];
  const userSubscriptions = subscriptions.reduce(
    (accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.subscriptionMasterSfid]: currentValue,
      };
    },
    {},
  );
  let initials = `${first_name || ''} ${last_name || ''}`.match(/\b\w/g) || [];
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

  // const { data = {}, isSuccess } = useQuery(
  //   "userPastCourses",
  //   async () => {
  //     const response = await api.get({
  //       path: "getUserPastCourses",
  //     });
  //     return response;
  //   },
  //   {
  //     refetchOnWindowFocus: false,
  //   },
  // );
  // console.log("userPastCourses", data);

  const switchTab = (tab) => (e) => {
    if (e) e.preventDefault();
    setActiveTab(tab);
  };

  const switchCardDetailView = () => {
    setEditCardDetail((editCardDetail) => !editCardDetail);
  };

  const logoutAction = async () => {
    setLoading(true);
    await Auth.logout();
    setLoading(false);
    setUser(null);
    pushRouteWithUTMQuery(router, '/us-en');
  };

  const navigateToReferFriendPage = () => {
    pushRouteWithUTMQuery(router, '/us-en/refer');
  };

  const handleOnSelectFile = (e) => {
    if (e.target.files.length) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        showModal(MODAL_TYPES.EMPTY_MODAL, {
          title: 'Enrollment Completed Successfully.',
          children: (handleModalToggle) => (
            <ProfilePicCrop
              src={reader.result}
              closeDetailAction={handleModalToggle}
            />
          ),
        });
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleTopShowMessage = () => {
    setRequest({
      request: null,
    });
  };

  const updateCompleteAction = async ({
    message,
    isError = false,
    payload = {},
  }) => {
    if (isError) {
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message,
      });
    } else {
      setLoading(true);
      await reloadProfile();
      setLoading(false);
      setEditCardDetail(false);
    }
  };
  if (!authenticated) {
    return null;
  }

  return (
    <>
      {loading && <Loader />}
      <main className="profile">
        {request === '1' && (
          <aside className="profile__alert profile__alert_error">
            <div className="container-xl d-flex align-center">
              <span>
                <img src="/img/ic-error.svg" alt="error" />
                {MESSAGE_CANCEL_MEMBERSHIP_ERROR}
              </span>
            </div>
            <img
              className="profile__close-alert"
              src="/img/ic-close-white.svg"
              alt="close"
              onClick={toggleTopShowMessage}
            />
          </aside>
        )}
        {request === '2' && (
          <aside className="profile__alert">
            <div className="container-xl d-flex justify-content-center align-center">
              <span>
                <img src="/img/ic-check.svg" alt="check" />
                Your membership has been cancelled.
              </span>
            </div>
            <img
              className="profile__close-alert"
              src="/img/ic-close-white.svg"
              alt="close"
              onClick={toggleTopShowMessage}
            />
          </aside>
        )}
        {request === '3' && (
          <aside className="profile__alert">
            <div className="container-xl d-flex justify-content-center align-center">
              <span>
                <img src="/img/ic-check.svg" alt="check" />
                Your case has been registered.
              </span>
            </div>
            <img
              className="profile__close-alert"
              src="/img/ic-close-white.svg"
              alt="close"
              onClick={toggleTopShowMessage}
            />
          </aside>
        )}
        {request === '4' && (
          <aside className="profile__alert">
            <div className="container-xl d-flex justify-content-center align-center">
              <span>
                <img src="/img/ic-error.svg" alt="error" />
                {MESSAGE_DELETE_PERSONAL_INFORMATION_ERROR}
              </span>
            </div>
            <img
              className="profile__close-alert"
              src="/img/ic-close-white.svg"
              alt="close"
              onClick={toggleTopShowMessage}
            />
          </aside>
        )}

        {request === '5' && (
          <aside className="profile__alert">
            <div className="container-xl d-flex justify-content-center align-center">
              <span>
                <img src="/img/ic-error.svg" alt="error" />
                {MESSAGE_ALREADY_CASE_REGISTERED_ERROR}
              </span>
            </div>
            <img
              className="profile__close-alert"
              src="/img/ic-close-white.svg"
              alt="close"
              onClick={toggleTopShowMessage}
            />
          </aside>
        )}
        <section className="profile-header">
          <div className="container d-flex flex-md-row flex-column align-items-md-center">
            <div className="profile-header__client profile-pic-section">
              <label htmlFor="upload-button">
                <input
                  type="file"
                  id="upload-button"
                  accept="image/*"
                  className="tw-hidden"
                  onChange={handleOnSelectFile}
                />
                <div className="profile-header__image wrapper">
                  <span>{initials}</span>
                  {profilePic && (
                    <img
                      src={profilePic}
                      className="rounded-circle profile-pic"
                      onError={(i) => (i.target.style.display = 'none')}
                    />
                  )}

                  <div className="camera-icon">
                    <i className="fa">
                      <FaCamera />
                    </i>
                  </div>
                </div>
              </label>
              <div className="profile-header__full-name d-block d-md-none">
                {name}
              </div>
            </div>
            <div className="profile-header__info">
              <div className="profile-header__full-name d-none d-md-block">
                {name}
              </div>
              <ProfileHeader
                subscriptions={subscriptions}
                userSubscriptions={userSubscriptions}
              />
            </div>
          </div>
        </section>

        <section className="profile-body d-none d-md-block">
          <div className="container">
            <ul
              className="nav nav-pills"
              id="profile-tabs-container"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <a
                  className={classNames('profile-tab', {
                    active: activeTab === UPCOMING_EVENTS,
                  })}
                  onClick={switchTab(UPCOMING_EVENTS)}
                >
                  Upcoming Events
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className={classNames('profile-tab', {
                    active: activeTab === PAST_COURSES,
                  })}
                  onClick={switchTab(PAST_COURSES)}
                >
                  Past Courses
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className={classNames('profile-tab', {
                    active: activeTab === UPDATE_PROFILE,
                  })}
                  onClick={switchTab(UPDATE_PROFILE)}
                >
                  Update Profile
                </a>
              </li>
              {process.env.NEXT_PUBLIC_TALKABLE_INSTANCE_URL && (
                <li className="nav-item" role="presentation">
                  <a
                    className={classNames('profile-tab', {
                      active: activeTab === REFER_A_FRIEND,
                    })}
                    onClick={switchTab(REFER_A_FRIEND)}
                  >
                    Refer a Friend
                  </a>
                </li>
              )}

              <li className="nav-item" role="presentation">
                <a
                  className={classNames('profile-tab', {
                    active: activeTab === CARD_DETAILS,
                  })}
                  onClick={switchTab(CARD_DETAILS)}
                >
                  Card Details
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className={classNames('profile-tab', {
                    active: activeTab === CHANGE_PASSWORD,
                  })}
                  onClick={switchTab(CHANGE_PASSWORD)}
                >
                  Change Password
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a className="profile-tab" onClick={logoutAction}>
                  Log out
                </a>
              </li>
            </ul>
            <div className="tab-content" id="profile-tabContent">
              <div
                className={classNames('tab-pane fade', {
                  active: activeTab === UPCOMING_EVENTS,
                  show: activeTab === UPCOMING_EVENTS,
                })}
              >
                <div
                  className={classNames('row', {
                    'profile-body__cards-container':
                      upcomingEvents.length !== 0,
                    'profile-body__cards-empty cards-empty':
                      upcomingEvents.length === 0,
                  })}
                >
                  {upcomingEvents.length === 0 && (
                    <>
                      <div className="cards-empty__img">
                        <img src="/img/ic-search-calendar.svg" alt="search" />
                      </div>
                      <div className="cards-empty__text">
                        You don't have any events scheduled right now. Find an
                        upcoming{' '}
                        <Link href="/us-en" prefetch={false} legacyBehavior>
                          <a href="#" className="link link_orange">
                            course
                          </a>
                        </Link>{' '}
                        or{' '}
                        <Link
                          href="/us-en/meetup"
                          prefetch={false}
                          legacyBehavior
                        >
                          <a href="#" className="link link_orange">
                            meetup
                          </a>
                        </Link>{' '}
                        to join.
                      </div>
                    </>
                  )}
                  <EventList workshops={upcomingEvents}></EventList>
                </div>
              </div>
              <div
                className={classNames('tab-pane past-courses fade', {
                  active: activeTab === PAST_COURSES,
                  show: activeTab === PAST_COURSES,
                })}
              >
                <PastCourses />
              </div>
              <div
                className={classNames('tab-pane profile-update fade', {
                  active: activeTab === UPDATE_PROFILE,
                  show: activeTab === UPDATE_PROFILE,
                })}
              >
                <ChangeProfile
                  updateCompleteAction={updateCompleteAction}
                  profile={user.profile}
                ></ChangeProfile>
              </div>
              <div
                className={classNames('tab-pane profile-update fade', {
                  active: activeTab === REFER_A_FRIEND,
                  show: activeTab === REFER_A_FRIEND,
                })}
              >
                <div>
                  <h6 className="course-details-card__subtitle">
                    How To Earn Rewards
                  </h6>
                  <ol>
                    <li>
                      Invite your friends to take the{' '}
                      {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                      course
                    </li>
                    <li>
                      Your friends will get 20% off their very first SKY Breath
                      Meditation course
                    </li>
                    <li>
                      You’ll get $20 for every friend that completes the course,
                      earning up to $200 per year
                    </li>
                    <li>
                      You can use the credit towards Sahaj Samadhi Meditation™,
                      Silent Retreats, or to repeat your SKY course
                    </li>
                  </ol>{' '}
                  <h6 className="course-details-card__subtitle">
                    How To Claim The Rewards
                  </h6>
                  <ol>
                    <li>
                      You’ll receive a $20 coupon code for every friend that
                      completes their course via email
                    </li>
                    <li>
                      Enter the coupon code and select your course of choice to
                      redeem your reward. A new code will be provided, which can
                      be applied at checkout upon registering for your course.
                    </li>
                    <li>
                      If you have multiple coupon codes that you’d like to
                      redeem for a single course, you can merge your coupons
                      below. Your dashboard balance will update once your new
                      coupon code has been enjoyed—have a great course :)
                    </li>
                  </ol>
                </div>
                <div className="tw-mb-2">
                  <CouponStack></CouponStack>
                </div>
                <div id="talkable-offer"></div>
              </div>
              <div
                className={classNames('tab-pane fade', {
                  active: activeTab === CARD_DETAILS,
                  show: activeTab === CARD_DETAILS,
                })}
              >
                {!editCardDetail && (
                  <ViewCardDetail
                    switchCardDetailView={switchCardDetailView}
                    profile={user.profile}
                  ></ViewCardDetail>
                )}
                {editCardDetail && (
                  <Elements
                    stripe={stripePromise}
                    fonts={[
                      {
                        cssSrc:
                          'https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
                      },
                    ]}
                  >
                    <ChangeCardDetail
                      updateCompleteAction={updateCompleteAction}
                    />
                  </Elements>
                )}
              </div>
              <div
                className={classNames('tab-pane fade', {
                  active: activeTab === CHANGE_PASSWORD,
                  show: activeTab === CHANGE_PASSWORD,
                })}
              >
                <ChangePassword
                  updateCompleteAction={updateCompleteAction}
                ></ChangePassword>
              </div>
            </div>
          </div>
        </section>

        <section className="profile-body_mobile d-block d-md-none">
          <div className="container">
            <div className="profile-body_mobile__accordion">
              <div className="profile-body_mobile__card">
                <div className="profile-body_mobile__card-header">
                  <h2 className="mb-0">
                    <button
                      className={classNames('btn', {
                        collapsed: activeTab !== UPCOMING_EVENTS,
                      })}
                      type="button"
                      onClick={switchTab(UPCOMING_EVENTS)}
                    >
                      Upcoming Events
                    </button>
                  </h2>
                </div>
                <div
                  className={classNames('collapse', {
                    show: activeTab === UPCOMING_EVENTS,
                  })}
                >
                  <div className="profile-body_mobile__card-body">
                    {upcomingEvents.length === 0 && (
                      <div className="profile-body_mobile__cards-empty cards-empty">
                        <div className="cards-empty__img">
                          <img src="/img/ic-search-calendar.svg" alt="search" />
                        </div>
                        <div className="cards-empty__text">
                          You don't have any events scheduled right now. Find an
                          upcoming{' '}
                          <Link href="/us-en" prefetch={false} legacyBehavior>
                            <a href="#" className="link link_orange">
                              course
                            </a>
                          </Link>{' '}
                          or{' '}
                          <Link
                            href="/us-en/meetup"
                            prefetch={false}
                            legacyBehavior
                          >
                            <a href="#" className="link link_orange">
                              meetup
                            </a>
                          </Link>{' '}
                          to join.
                        </div>
                      </div>
                    )}
                    <EventList workshops={upcomingEvents} isMobile></EventList>
                  </div>
                </div>
              </div>
              <div className="profile-body_mobile__card">
                <div className="profile-body_mobile__card-header">
                  <h2 className="mb-0">
                    <button
                      className={classNames('btn', {
                        collapsed: activeTab !== PAST_COURSES,
                      })}
                      type="button"
                      onClick={switchTab(PAST_COURSES)}
                    >
                      Past Courses
                    </button>
                  </h2>
                </div>
                <div
                  className={classNames('collapse', {
                    show: activeTab === PAST_COURSES,
                  })}
                >
                  <div className="profile-body_mobile__card-body">
                    <PastCourses isMobile />
                  </div>
                </div>
              </div>
              <div className="profile-body_mobile__card">
                <div className="profile-body_mobile__card-header">
                  <h2 className="mb-0">
                    <button
                      className={classNames('btn', {
                        collapsed: activeTab !== UPDATE_PROFILE,
                      })}
                      type="button"
                      onClick={switchTab(UPDATE_PROFILE)}
                    >
                      Update Profile
                    </button>
                  </h2>
                </div>
                <div
                  className={classNames('collapse', {
                    show: activeTab === UPDATE_PROFILE,
                  })}
                >
                  <div className="profile-body_mobile__card-body">
                    <ChangeProfile
                      isMobile
                      updateCompleteAction={updateCompleteAction}
                      profile={user.profile}
                    ></ChangeProfile>
                  </div>
                </div>
              </div>
              {process.env.NEXT_PUBLIC_TALKABLE_INSTANCE_URL && (
                <div className="profile-body_mobile__card">
                  <div className="profile-body_mobile__card-header">
                    <h2 className="mb-0">
                      <button
                        className={classNames('btn', {
                          collapsed: activeTab !== REFER_A_FRIEND,
                        })}
                        onClick={navigateToReferFriendPage}
                        type="button"
                      >
                        Refer a Friend
                      </button>
                    </h2>
                  </div>
                  <div
                    className={classNames('collapse', {
                      show: activeTab === REFER_A_FRIEND,
                    })}
                  >
                    <div className="profile-body_mobile__card-body"></div>
                  </div>
                </div>
              )}

              <div className="profile-body_mobile__card">
                <div className="profile-body_mobile__card-header">
                  <h2 className="mb-0">
                    <button
                      className={classNames('btn', {
                        collapsed: activeTab !== CARD_DETAILS,
                      })}
                      onClick={switchTab(CARD_DETAILS)}
                      type="button"
                    >
                      Card Details
                    </button>
                  </h2>
                </div>
                <div
                  className={classNames('collapse', {
                    show: activeTab === CARD_DETAILS,
                  })}
                >
                  <div className="profile-body_mobile__card-body">
                    {!editCardDetail && (
                      <ViewCardDetail
                        isMobile
                        switchCardDetailView={switchCardDetailView}
                        profile={user.profile}
                      ></ViewCardDetail>
                    )}
                    {editCardDetail && (
                      <Elements
                        stripe={stripePromise}
                        fonts={[
                          {
                            cssSrc:
                              'https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
                          },
                        ]}
                      >
                        <ChangeCardDetail
                          updateCompleteAction={updateCompleteAction}
                        />
                      </Elements>
                    )}
                  </div>
                </div>
              </div>
              <div className="profile-body_mobile__card">
                <div className="profile-body_mobile__card-header">
                  <h2 className="mb-0">
                    <button
                      className={classNames('btn', {
                        collapsed: activeTab !== CHANGE_PASSWORD,
                      })}
                      type="button"
                      onClick={switchTab(CHANGE_PASSWORD)}
                    >
                      Change Password
                    </button>
                  </h2>
                </div>
                <div
                  className={classNames('collapse', {
                    show: activeTab === CHANGE_PASSWORD,
                  })}
                >
                  <div className="profile-body_mobile__card-body">
                    <ChangePassword
                      isMobile
                      updateCompleteAction={updateCompleteAction}
                    ></ChangePassword>
                  </div>
                </div>
              </div>
              <div className="profile-body_mobile__card">
                <div className="profile-body_mobile__card-header">
                  <h2 className="mb-0">
                    <button
                      className="btn collapsed"
                      type="button"
                      onClick={logoutAction}
                    >
                      Log out
                    </button>
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default withAuth(Profile);
