import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { useQueryState } from 'nuqs';
import { FaCamera } from 'react-icons/fa';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Loader } from '@components/loader';
import { MODAL_TYPES } from '@constants';

const ProfileHeader = dynamic(() =>
  import('@components/profile').then((mod) => mod.ProfileHeader),
);

const ProfilePicCrop = dynamic(() =>
  import('@components/profile').then((mod) => mod.ProfilePicCrop),
);

const MESSAGE_CANCEL_MEMBERSHIP_ERROR = `We're sorry, but an error occurred. Please contact the help desk
                at (855) 202-4400 to resolve the issue and cancel your
                membership.`;
const MESSAGE_DELETE_PERSONAL_INFORMATION_ERROR = `We're sorry, but an error occurred. Please contact the help desk
                at (855) 202-4400 to resolve the issue and delete your information.`;
const MESSAGE_ALREADY_CASE_REGISTERED_ERROR = `We have already received your request to delete PII/CC. The support team is working on it and will get in touch with you shortly`;

const UPCOMING_EVENTS = '/us-en/profile/upcoming-courses';
const PAST_COURSES = '/us-en/profile/past-courses';
const UPDATE_PROFILE = '/us-en/profile/update-profile';
const REFER_A_FRIEND = '/us-en/profile/refer-a-friend';
const CARD_DETAILS = '/us-en/profile/card-details';
const CHANGE_PASSWORD = '/us-en/profile/change-password';
// const PREFERENCES = '/us-en/profile/preferences';

export const withUserInfo = (WrappedComponent) => {
  return function UserInfo(props) {
    const [request, setRequest] = useQueryState('request');
    const { showModal } = useGlobalModalContext();
    const { passwordLess, isAuthenticated, profile } = useAuth();
    const { signOut } = passwordLess;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const elementRef = useRef(null);
    const [activeTab, setActiveTab] = useState(() => {
      // Initialize active tab based on current route
      if (pathname.includes(UPDATE_PROFILE)) return 'profile';
      if (pathname.includes(CARD_DETAILS)) return 'payment';
      if (pathname.includes(CHANGE_PASSWORD)) return 'changePassword';
      if (pathname.includes(PAST_COURSES)) return 'pastCourses';
      if (pathname.includes(UPCOMING_EVENTS)) return 'upcomingCourses';
      if (pathname.includes(REFER_A_FRIEND)) return 'referFriend';
      return null;
    });

    const tabRefs = {
      profile: useRef(null),
      payment: useRef(null),
      changePassword: useRef(null),
      pastCourses: useRef(null),
      upcomingCourses: useRef(null),
      referFriend: useRef(null),
    };

    const scrollOffset = 75; // Adjust this value as needed

    const isMobileOrTablet = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
    };

    useEffect(() => {
      if (elementRef.current && isMobileOrTablet()) {
        const elementPosition = elementRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition - scrollOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, [router.pathname]);

    const {
      first_name,
      last_name,
      name,
      userProfilePic: profilePic,
      subscriptions = [],
    } = profile || {};

    const userSubscriptions = subscriptions.reduce(
      (accumulator, currentValue) => {
        return {
          ...accumulator,
          [currentValue.subscriptionMasterSfid]: currentValue,
        };
      },
      {},
    );
    let initials =
      `${first_name || ''} ${last_name || ''}`.match(/\b\w/g) || [];
    initials = (
      (initials.shift() || '') + (initials.pop() || '')
    ).toUpperCase();

    const toggleTopShowMessage = () => {
      setRequest({
        request: null,
      });
    };

    const logoutAction = async (e) => {
      if (e) e.preventDefault();
      setLoading(true);
      await signOut();
      setLoading(false);
      pushRouteWithUTMQuery(router, '/us-en');
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

    const switchTab = (screen) => {
      setActiveTab(screen);
      router.push(screen);
    };

    if (!isAuthenticated) {
      return null;
    }

    // Define the alerts based on the request status
    const renderAlert = () => {
      switch (request) {
        case '1':
          return (
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
          );
        case '2':
          return (
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
          );
        case '3':
          return (
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
          );
        case '4':
          return (
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
          );
        case '5':
          return (
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
          );
        default:
          return null;
      }
    };

    return (
      <>
        {loading && <Loader />}
        <NextSeo
          title="Profile"
          description="Manage your journey with ease on your profile dashboard: Access upcoming events, review past courses, update your profile, refer a friend, manage card details, and change your password—all in one convenient place."
        />
        <main className="user-profile-page">
          {renderAlert()}
          <section className="profile-area">
            <div className="container">
              <div className="user-info-grid">
                <div className="user-info-box">
                  <div className="profile-picture">
                    {initials}
                    {profilePic && (
                      <img
                        src={profilePic}
                        width={120}
                        height={120}
                        className="rounded-circle profile-pic"
                        onError={(i) => (i.target.style.display = 'none')}
                      />
                    )}

                    <div className="camera-icon">
                      <input
                        type="file"
                        id="upload-button"
                        accept="image/*"
                        onChange={handleOnSelectFile}
                      />
                      <i className="fa">
                        <FaCamera />
                      </i>
                    </div>
                  </div>
                  <div className="user-name"> {name}</div>
                  <ProfileHeader
                    subscriptions={subscriptions}
                    userSubscriptions={userSubscriptions}
                  />
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
                            active: pathname.includes(UPDATE_PROFILE),
                          })}
                          onClick={() => switchTab(UPDATE_PROFILE)}
                          ref={tabRefs.profile}
                        >
                          Profile
                        </a>
                      </li>
                      <li>
                        <a
                          className={classNames('profile-tab', {
                            active: pathname.includes(CARD_DETAILS),
                          })}
                          onClick={() => switchTab(CARD_DETAILS)}
                          ref={tabRefs.payment}
                        >
                          Payment
                        </a>
                      </li>
                      <li>
                        <a
                          className={classNames('profile-tab', {
                            active: pathname.includes(CHANGE_PASSWORD),
                          })}
                          onClick={() => switchTab(CHANGE_PASSWORD)}
                          ref={tabRefs.changePassword}
                        >
                          Change Password
                        </a>
                      </li>
                      <li>
                        <a
                          className={classNames('profile-tab', {
                            active: pathname.includes(PAST_COURSES),
                          })}
                          onClick={() => switchTab(PAST_COURSES)}
                          ref={tabRefs.pastCourses}
                        >
                          Past Courses
                        </a>
                      </li>
                      <li>
                        <a
                          className={classNames('profile-tab', {
                            active: pathname.includes(UPCOMING_EVENTS),
                          })}
                          onClick={() => switchTab(UPCOMING_EVENTS)}
                          ref={tabRefs.upcomingCourses}
                        >
                          Upcoming Courses
                        </a>
                      </li>

                      <li>
                        <a
                          className={classNames('profile-tab', {
                            active: pathname.includes(REFER_A_FRIEND),
                          })}
                          onClick={() => switchTab(REFER_A_FRIEND)}
                          ref={tabRefs.referFriend}
                        >
                          Refer a Friend
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div ref={elementRef}>
                    <WrappedComponent
                      setLoading={setLoading}
                      loading={loading}
                      {...props}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  };
};
