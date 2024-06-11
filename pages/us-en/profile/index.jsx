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
import { NextSeo } from 'next-seo';

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
    defaultValue: tab || UPDATE_PROFILE,
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
      <NextSeo
        title="Profile"
        description="Manage your journey with ease on your profile dashboard: Access upcoming events, review past courses, update your profile, refer a friend, manage card details, and change your password—all in one convenient place."
      />
      <main className="user-profile-page">
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
        <section className="profile-area">
          <div className="container">
            <div className="user-info-grid">
              <div className="user-info-box">
                <div className="profile-picture">
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
                <div className="user-name"> {name}</div>
                <div className="user-type">Journey (premium) member</div>
                <div className="user-since">since January 21, 2019</div>
                <div className="user-logout">
                  <a onClick={logoutAction}>
                    <span className="icon-aol iconaol-logout"></span>Log Out
                  </a>
                </div>
              </div>
              <div className="profile-info-box">
                <div className="profile-tabs">
                  <ul className="tab-links">
                    <li>
                      <a
                        className={classNames('profile-tab', {
                          active: activeTab === UPDATE_PROFILE,
                        })}
                        onClick={switchTab(UPDATE_PROFILE)}
                      >
                        Profile
                      </a>
                    </li>
                    <li>
                      <a
                        className={classNames('profile-tab', {
                          active: activeTab === CARD_DETAILS,
                        })}
                        onClick={switchTab(CARD_DETAILS)}
                      >
                        Payment
                      </a>
                    </li>
                    <li>
                      <a
                        className={classNames('profile-tab', {
                          active: activeTab === CHANGE_PASSWORD,
                        })}
                        onClick={switchTab(CHANGE_PASSWORD)}
                      >
                        Change Password
                      </a>
                    </li>
                    <li>
                      <a
                        className={classNames('profile-tab', {
                          active: activeTab === PAST_COURSES,
                        })}
                        onClick={switchTab(PAST_COURSES)}
                      >
                        Past Courses
                      </a>
                    </li>
                    <li>
                      <a
                        className={classNames('profile-tab', {
                          active: activeTab === UPCOMING_EVENTS,
                        })}
                        onClick={switchTab(UPCOMING_EVENTS)}
                      >
                        Upcoming Courses
                      </a>
                    </li>
                    <li>
                      <a href="#" onclick="openTab(event, 'tab6')">
                        Preferences
                      </a>
                    </li>
                    <li>
                      <a
                        className={classNames('profile-tab', {
                          active: activeTab === REFER_A_FRIEND,
                        })}
                        onClick={switchTab(REFER_A_FRIEND)}
                      >
                        Refer a Friend
                      </a>
                    </li>
                  </ul>
                </div>
                <div
                  id="tab1"
                  className={classNames('', {
                    'tab-content': activeTab !== UPDATE_PROFILE,
                  })}
                >
                  <ChangeProfile
                    updateCompleteAction={updateCompleteAction}
                    profile={user.profile}
                  ></ChangeProfile>
                </div>
                <div
                  id="tab2"
                  className={classNames('', {
                    'tab-content': activeTab !== CARD_DETAILS,
                  })}
                >
                  <div className="profile-form-box">
                    <div className="form-title-wrap">
                      <div className="form-title-text">
                        Credit or debit card
                      </div>
                      <div className="form-title-icon">
                        <span className="icon-aol iconaol-payment-card"></span>
                      </div>
                    </div>
                    <div className="profile-form-wrap">
                      <div className="form-item card-number">
                        <label for="cardnum">Card number</label>
                        <input type="text" id="cardnum" />
                      </div>
                      <div className="form-item expiry">
                        <label for="exp">Expirty</label>
                        <input type="text" id="exp" />
                      </div>
                      <div className="form-item cvv">
                        <label for="cvv">CVV</label>
                        <input type="text" id="cvv" />
                      </div>
                      <div className="form-actions col-1-1">
                        <button className="secondary-btn">
                          Discard Changes
                        </button>
                        <button className="primary-btn">Save Changes</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="tab3"
                  className={classNames('', {
                    'tab-content': activeTab !== CHANGE_PASSWORD,
                  })}
                >
                  <div className="profile-form-box">
                    <div className="profile-form-wrap">
                      <div className="form-item col-1-2 relative">
                        <label for="password">Current password</label>
                        <input
                          type="password"
                          id="password"
                          placeholder="Password"
                        />
                        <button className="showPass">
                          <span className="icon-aol iconaol-eye"></span>
                        </button>
                      </div>
                      <div className="form-item col-1-2 relative">
                        <label for="cpassword">New password</label>
                        <input
                          type="password"
                          id="cpassword"
                          placeholder="Password"
                        />
                        <button className="showPass">
                          <span className="icon-aol iconaol-eye"></span>
                        </button>
                        <div className="input-info">Minimum 6 characters</div>
                      </div>
                      <div className="form-actions col-1-1">
                        <button className="secondary-btn">
                          Discard Changes
                        </button>
                        <button className="primary-btn">Save Changes</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="tab4"
                  className={classNames('', {
                    'tab-content': activeTab !== PAST_COURSES,
                  })}
                >
                  <div className="profile-form-box">
                    <div className="past-courses-stats">
                      <div className="stats-info">
                        <div className="number">12</div>
                        <div className="text">courses you've taken</div>
                      </div>
                      <div className="stats-info">
                        <div className="number">234</div>
                        <div className="text">
                          hours you spent in meditation
                        </div>
                      </div>
                      <div className="stats-info">
                        <div className="number">11</div>
                        <div className="text">places you've meditated in</div>
                      </div>
                    </div>
                    <div className="courses-history">
                      <h2 className="title">History of courses</h2>
                      <div className="accordion" id="accordionExample">
                        <div className="history-accordion-item">
                          <div
                            className="history-accordion-header"
                            id="headingOne"
                          >
                            <h2 className="mb-0">
                              <span className="icon-aol iconaol-Tick"></span>
                              <button
                                className="btn btn-link btn-block text-left"
                                type="button"
                                data-toggle="collapse"
                                data-target="#collapseOne"
                                aria-expanded="true"
                                aria-controls="collapseOne"
                              >
                                Art of Living Part 1
                                <span className="icon-aol iconaol-arrow-down"></span>
                              </button>
                            </h2>
                          </div>

                          <div
                            id="collapseOne"
                            className="collapse show"
                            aria-labelledby="headingOne"
                            data-parent="#accordionExample"
                          >
                            <div className="history-accordion-body">
                              <div className="course-history-info">
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-profile"></span>{' '}
                                  Theresa Webb
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-sms"></span>{' '}
                                  felicia.reid@example.com
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-calendar"></span>{' '}
                                  04.10.2023 - 07.10.2023
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="history-accordion-item">
                          <div
                            className="history-accordion-header"
                            id="headingTwo"
                          >
                            <h2 className="mb-0">
                              <span className="icon-aol iconaol-Tick"></span>
                              <button
                                className="btn btn-link btn-block text-left collapsed"
                                type="button"
                                data-toggle="collapse"
                                data-target="#collapseTwo"
                                aria-expanded="false"
                                aria-controls="collapseTwo"
                              >
                                Art of Living Part 1
                                <span className="icon-aol iconaol-arrow-down"></span>
                              </button>
                            </h2>
                          </div>
                          <div
                            id="collapseTwo"
                            className="collapse"
                            aria-labelledby="headingTwo"
                            data-parent="#accordionExample"
                          >
                            <div className="history-accordion-body">
                              <div className="course-history-info">
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-profile"></span>{' '}
                                  Theresa Webb
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-sms"></span>{' '}
                                  felicia.reid@example.com
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-calendar"></span>{' '}
                                  04.10.2023 - 07.10.2023
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="history-accordion-item">
                          <div
                            className="history-accordion-header"
                            id="headingThree"
                          >
                            <h2 className="mb-0">
                              <span className="icon-aol iconaol-Tick"></span>
                              <button
                                className="btn btn-link btn-block text-left collapsed"
                                type="button"
                                data-toggle="collapse"
                                data-target="#collapseThree"
                                aria-expanded="false"
                                aria-controls="collapseThree"
                              >
                                Art of Living Part 1
                                <span className="icon-aol iconaol-arrow-down"></span>
                              </button>
                            </h2>
                          </div>
                          <div
                            id="collapseThree"
                            className="collapse"
                            aria-labelledby="headingThree"
                            data-parent="#accordionExample"
                          >
                            <div className="history-accordion-body">
                              <div className="course-history-info">
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-profile"></span>{' '}
                                  Theresa Webb
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-sms"></span>{' '}
                                  felicia.reid@example.com
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-calendar"></span>{' '}
                                  04.10.2023 - 07.10.2023
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="history-accordion-item">
                          <div
                            className="history-accordion-header"
                            id="headingFour"
                          >
                            <h2 className="mb-0">
                              <span className="icon-aol iconaol-Tick"></span>
                              <button
                                className="btn btn-link btn-block text-left collapsed"
                                type="button"
                                data-toggle="collapse"
                                data-target="#collapseFour"
                                aria-expanded="false"
                                aria-controls="collapseFour"
                              >
                                Art of Living Part 1
                                <span className="icon-aol iconaol-arrow-down"></span>
                              </button>
                            </h2>
                          </div>
                          <div
                            id="collapseFour"
                            className="collapse"
                            aria-labelledby="headingFour"
                            data-parent="#accordionExample"
                          >
                            <div className="history-accordion-body">
                              <div className="course-history-info">
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-profile"></span>{' '}
                                  Theresa Webb
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-sms"></span>{' '}
                                  felicia.reid@example.com
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-calendar"></span>{' '}
                                  04.10.2023 - 07.10.2023
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="history-accordion-item active">
                          <div
                            className="history-accordion-header"
                            id="headingFive"
                          >
                            <h2 className="mb-0">
                              <span className="icon-aol iconaol-Tick"></span>
                              <button
                                className="btn btn-link btn-block text-left collapsed"
                                type="button"
                                data-toggle="collapse"
                                data-target="#collapseFive"
                                aria-expanded="false"
                                aria-controls="collapseFive"
                              >
                                Art of Living Part 1
                                <span className="icon-aol iconaol-arrow-down"></span>
                              </button>
                            </h2>
                          </div>
                          <div
                            id="collapseFive"
                            className="collapse"
                            aria-labelledby="headingFive"
                            data-parent="#accordionExample"
                          >
                            <div className="history-accordion-body">
                              <div className="course-history-info">
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-profile"></span>{' '}
                                  Theresa Webb
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-sms"></span>{' '}
                                  felicia.reid@example.com
                                </div>
                                <div className="ch-info-pill">
                                  <span className="icon-aol iconaol-calendar"></span>{' '}
                                  04.10.2023 - 07.10.2023
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="tab5"
                  className={classNames('', {
                    'tab-content': activeTab !== UPCOMING_EVENTS,
                  })}
                >
                  <div className="profile-form-box">
                    <div className="no-events">
                      <div className="no-events-icon">
                        <span className="icon-aol iconaol-calendar"></span>
                      </div>
                      <div className="no-events-text">
                        You don't have any events scheduled right now.
                      </div>
                      <div className="find-event-text">
                        Find an upcoming <a href="#">course</a> or{' '}
                        <a href="#">meetup</a> to join.
                      </div>
                    </div>
                    <div className="preffered-upcoming-events">
                      <h2 className="title">
                        Here are the upcoming courses in your preferred center
                      </h2>
                      <div className="course-listing">
                        <div className="course-item">
                          <div className="course-item-header">
                            <div className="course-title-duration">
                              <div className="course-title">
                                <span className="icon-aol iconaol-hindu-temple"></span>
                                Tampa, FL
                              </div>
                              <div className="course-duration">
                                January 18-21, 2024 PT
                              </div>
                            </div>
                            <div className="course-price">
                              <span>$100</span>
                            </div>
                          </div>
                          <div className="course-location">
                            1901 Thornridge Cir. Shiloh, Hawaii 81063
                          </div>
                          <div className="course-instructors">
                            Cameron Williamson, Cameron Williamson
                          </div>
                          <div className="course-timings">
                            <div className="course-timing">
                              1/18, Monday, 12pm - 2:30 pm ET
                            </div>
                            <div className="course-timing">
                              1/19, Tuesdauy, 12pm - 2:30 pm ET
                            </div>
                            <div className="course-timing">
                              1/20, Wednesday, 12pm - 2:30pm ET
                            </div>
                          </div>
                          <div className="course-actions">
                            <button className="btn-secondary">Details</button>
                            <button className="btn-primary">Register</button>
                          </div>
                        </div>
                        <div className="course-item">
                          <div className="course-item-header">
                            <div className="course-title-duration">
                              <div className="course-title">
                                <span className="icon-aol iconaol-hindu-temple"></span>
                                Tampa, FL
                              </div>
                              <div className="course-duration">
                                January 18-21, 2024 PT
                              </div>
                            </div>
                            <div className="course-price">
                              <span>$100</span>
                            </div>
                          </div>
                          <div className="course-location">
                            1901 Thornridge Cir. Shiloh, Hawaii 81063
                          </div>
                          <div className="course-instructors">
                            Cameron Williamson, Cameron Williamson
                          </div>
                          <div className="course-timings">
                            <div className="course-timing">
                              1/18, Monday, 12pm - 2:30 pm ET
                            </div>
                            <div className="course-timing">
                              1/19, Tuesdauy, 12pm - 2:30 pm ET
                            </div>
                            <div className="course-timing">
                              1/20, Wednesday, 12pm - 2:30pm ET
                            </div>
                          </div>
                          <div className="course-actions">
                            <button className="btn-secondary">Details</button>
                            <button className="btn-primary">Register</button>
                          </div>
                        </div>
                        <div className="course-item">
                          <div className="course-item-header">
                            <div className="course-title-duration">
                              <div className="course-title">
                                <span className="icon-aol iconaol-hindu-temple"></span>
                                Tampa, FL
                              </div>
                              <div className="course-duration">
                                January 18-21, 2024 PT
                              </div>
                            </div>
                            <div className="course-price">
                              <span>$100</span>
                            </div>
                          </div>
                          <div className="course-location">
                            1901 Thornridge Cir. Shiloh, Hawaii 81063
                          </div>
                          <div className="course-instructors">
                            Cameron Williamson, Cameron Williamson
                          </div>
                          <div className="course-timings">
                            <div className="course-timing">
                              1/18, Monday, 12pm - 2:30 pm ET
                            </div>
                            <div className="course-timing">
                              1/19, Tuesdauy, 12pm - 2:30 pm ET
                            </div>
                            <div className="course-timing">
                              1/20, Wednesday, 12pm - 2:30pm ET
                            </div>
                          </div>
                          <div className="course-actions">
                            <button className="btn-secondary">Details</button>
                            <button className="btn-primary">Register</button>
                          </div>
                        </div>
                        <div className="course-item">
                          <div className="course-item-header">
                            <div className="course-title-duration">
                              <div className="course-title">
                                <span className="icon-aol iconaol-hindu-temple"></span>
                                Tampa, FL
                              </div>
                              <div className="course-duration">
                                January 18-21, 2024 PT
                              </div>
                            </div>
                            <div className="course-price">
                              <span>$100</span>
                            </div>
                          </div>
                          <div className="course-location">
                            1901 Thornridge Cir. Shiloh, Hawaii 81063
                          </div>
                          <div className="course-instructors">
                            Cameron Williamson, Cameron Williamson
                          </div>
                          <div className="course-timings">
                            <div className="course-timing">
                              1/18, Monday, 12pm - 2:30 pm ET
                            </div>
                            <div className="course-timing">
                              1/19, Tuesdauy, 12pm - 2:30 pm ET
                            </div>
                            <div className="course-timing">
                              1/20, Wednesday, 12pm - 2:30pm ET
                            </div>
                          </div>
                          <div className="course-actions">
                            <button className="btn-secondary">Details</button>
                            <button className="btn-primary">Register</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="tab6" className="tab-content">
                  <div className="profile-form-box">
                    <div className="user-preferences">
                      <div className="preferred-centers">
                        <h2 className="title">Preferred Centers</h2>
                        <div className="desc">You can add up to 3</div>
                        <div className="centers-listing">
                          <div className="center-item">
                            <div className="item-top-row">
                              <div className="number">1</div>
                              <div className="city">New York</div>
                              <button className="delete-item">
                                <span className="icon-aol iconaol-trash"></span>
                              </button>
                            </div>
                            <div className="center-other-info">
                              <span className="icon-aol iconaol-location"></span>
                              1901 Thornridge Cir. Shiloh, Hawaii 81063
                            </div>
                            <div className="center-other-info">
                              <span className="icon-aol iconaol-call-calling"></span>
                              (808) 555-0111
                            </div>
                            <div className="center-other-info">
                              <span className="icon-aol iconaol-sms"></span>
                              felicia.reid@example.com
                            </div>
                          </div>
                          <div className="center-item">
                            <div className="item-top-row">
                              <div className="number">2</div>
                              <div className="city">New York</div>
                              <button className="delete-item">
                                <span className="icon-aol iconaol-trash"></span>
                              </button>
                            </div>
                            <div className="center-other-info">
                              <span className="icon-aol iconaol-location"></span>
                              1901 Thornridge Cir. Shiloh, Hawaii 81063
                            </div>
                            <div className="center-other-info">
                              <span className="icon-aol iconaol-call-calling"></span>
                              (808) 555-0111
                            </div>
                            <div className="center-other-info">
                              <span className="icon-aol iconaol-sms"></span>
                              felicia.reid@example.com
                            </div>
                          </div>
                          <div
                            className="center-item add-new"
                            data-toggle="modal"
                            data-target="#addNewModal"
                          >
                            <span className="icon-aol iconaol-add-square"></span>
                            <div>Add New Center</div>
                          </div>
                        </div>
                      </div>
                      <div className="preferred-teachers">
                        <h2 className="title">
                          Preferred Advanced Course Teachers
                        </h2>
                        <div className="desc">You can add up to 3</div>
                        <div className="teachers-listing">
                          <div className="teachers-item">
                            <div className="teacher-photo">CM</div>
                            <div className="teacher-name">
                              Cameron Williamson
                            </div>
                            <button className="delete-item">
                              <span className="icon-aol iconaol-trash"></span>
                            </button>
                          </div>
                          <div className="teachers-item">
                            <div className="teacher-photo">CM</div>
                            <div className="teacher-name">
                              Cameron Williamson
                            </div>
                            <button className="delete-item">
                              <span className="icon-aol iconaol-trash"></span>
                            </button>
                          </div>
                          <div className="teachers-item">
                            <div className="teacher-photo">CM</div>
                            <div className="teacher-name">
                              Cameron Williamson
                            </div>
                            <button className="delete-item">
                              <span className="icon-aol iconaol-trash"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="tab7"
                  className={classNames('', {
                    'tab-content': activeTab !== REFER_A_FRIEND,
                  })}
                >
                  <div className="profile-form-box">
                    <div className="refer-section">
                      <div className="top-logo">
                        <img
                          src="/img/ic-logo-2.svg"
                          className="logo footer-logo"
                          alt="logo"
                          height="44"
                        />
                      </div>
                      <h1 className="title">
                        Journey Deeper:
                        <br />
                        Empower your life & your Friends!
                      </h1>
                      <div className="section-desc">
                        Refer a friend to the Art of Living - Part 1 Course, you
                        get a chance to WIN a transformative silence program
                      </div>
                      <div className="refer-section-items">
                        <div className="refer-section-col">
                          <div className="refer-section-card">
                            <h2 className="title">Redeem Advocate Coupons</h2>
                            <div className="desc">
                              Select Rewards Codes to Redeem.
                            </div>
                            <div className="redeem-coupons">
                              <div className="form-item">
                                <input
                                  type="radio"
                                  name="coupon"
                                  id="coupon1"
                                  checked
                                />
                                <label for="coupon1">
                                  Art of Living Part 1
                                </label>
                              </div>
                              <div className="form-item">
                                <input
                                  type="radio"
                                  name="coupon"
                                  id="coupon2"
                                  checked
                                />
                                <label for="coupon2">
                                  Art of Living Part 2
                                </label>
                              </div>
                              <button className="btn-primary">Redeem</button>
                            </div>
                          </div>
                          <div className="refer-section-card">
                            <h2 className="title">
                              Keep track of your shares & rewards
                            </h2>
                            <div className="share-rewards">
                              <div className="share-reward-stats">
                                <div className="stat-item">
                                  <div className="value">24</div>
                                  <label>Shared</label>
                                </div>
                                <div className="stat-item">
                                  <div className="value">$124,50</div>
                                  <label>Rewards</label>
                                </div>
                              </div>
                              <div className="tracking-bar-wrap">
                                <div className="tracking-bar-item">
                                  <label>
                                    Invited to SKY (2){' '}
                                    <a>
                                      <span className="icon-aol iconaol-info-circle-bold"></span>
                                    </a>
                                  </label>
                                  <div className="progress">
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      aria-valuenow="20"
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                      style={{ width: '20%' }}
                                    >
                                      <span className="sr-only">
                                        70% Complete
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="tracking-bar-item">
                                  <label>
                                    Friends that clicked (0){' '}
                                    <a>
                                      <span className="icon-aol iconaol-info-circle-bold"></span>
                                    </a>
                                  </label>
                                  <div className="progress">
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      aria-valuenow="0"
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                      style={{ width: '0%' }}
                                    >
                                      <span className="sr-only">
                                        0% Complete
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="tracking-bar-item">
                                  <label>
                                    Claimed discount codes (1){' '}
                                    <a>
                                      <span className="icon-aol iconaol-info-circle-bold"></span>
                                    </a>
                                  </label>
                                  <div className="progress">
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      aria-valuenow="10"
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                      style={{ width: '10%' }}
                                    >
                                      <span className="sr-only">
                                        10% Complete
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="tracking-bar-item">
                                  <label>
                                    Approved Refferrals (5){' '}
                                    <a>
                                      <span className="icon-aol iconaol-info-circle-bold"></span>
                                    </a>
                                  </label>
                                  <div className="progress">
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      aria-valuenow="50"
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                      style={{ width: '50%' }}
                                    >
                                      <span className="sr-only">
                                        50% Complete
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="refer-section-col">
                          <div className="refer-section-card">
                            <h2 className="title">Refer a friend</h2>
                            <div className="refer-friend">
                              <label>Share via Email</label>
                              <button
                                className="btn-primary"
                                data-toggle="modal"
                                data-target="#referEmailModal"
                              >
                                <span className="icon-aol iconaol-sms"></span>
                                Share
                              </button>
                              <div className="or-separator">
                                <span>OR</span>
                              </div>
                              <label>Here is your personal link:</label>
                              <input type="text" disabled />
                              <div className="refer-desc">
                                You can share it on Twitter, instant messengers.
                                SMS, or simply tell a friend!
                              </div>
                              <button className="btn-secondary">
                                <span className="icon-aol iconaol-copy"></span>
                                Copy Link
                              </button>
                              <div className="tac">
                                By accepting this offer you agroe to the Terme
                                of Service and Privacy Policy.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion" id="accordionRefer">
                        <div className="refer-accordion-item">
                          <div
                            className="refer-accordion-header"
                            id="referHeadingOne"
                          >
                            <h2 className="mb-0">
                              <button
                                className="btn btn-link btn-block text-left"
                                type="button"
                                data-toggle="collapse"
                                data-target="#referCollapseOne"
                                aria-expanded="true"
                                aria-controls="referCollapseOne"
                              >
                                How To Earn Rewards
                                <span className="icon-aol iconaol-arrow-down"></span>
                              </button>
                            </h2>
                          </div>

                          <div
                            id="referCollapseOne"
                            className="collapse show"
                            aria-labelledby="referHeadingOne"
                            data-parent="#accordionRefer"
                          >
                            <div className="reward-accordion-body">
                              <ol>
                                <li>
                                  Invite your friends to take the Art of Living
                                  Part 1 course
                                </li>
                                <li>
                                  For every friend that completes the course,
                                  you'll be entered into a Sweepstakes where you
                                  can win an Art of Living Part 2 Course
                                  (Silence Program) online or in-person up to a
                                  value of $700. The winner will be announced at
                                  the end of every quarter. See T&Cs for
                                  details.
                                </li>
                              </ol>
                            </div>
                          </div>
                        </div>
                        <div className="refer-accordion-item">
                          <div
                            className="refer-accordion-header"
                            id="referHeadingTwo"
                          >
                            <h2 className="mb-0">
                              <button
                                className="btn btn-link btn-block text-left collapsed"
                                type="button"
                                data-toggle="collapse"
                                data-target="#referCollapseTwo"
                                aria-expanded="false"
                                aria-controls="referCollapseTwo"
                              >
                                How To Claim The Rewards
                                <span className="icon-aol iconaol-arrow-down"></span>
                              </button>
                            </h2>
                          </div>
                          <div
                            id="referCollapseTwo"
                            className="collapse"
                            aria-labelledby="referHeadingTwo"
                            data-parent="#accordionRefer"
                          >
                            <div className="reward-accordion-body">
                              <ol>
                                <li>
                                  Invite your friends to take the Art of Living
                                  Part 1 course
                                </li>
                                <li>
                                  For every friend that completes the course,
                                  you'll be entered into a Sweepstakes where you
                                  can win an Art of Living Part 2 Course
                                  (Silence Program) online or in-person up to a
                                  value of $700. The winner will be announced at
                                  the end of every quarter. See T&Cs for
                                  details.
                                </li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
