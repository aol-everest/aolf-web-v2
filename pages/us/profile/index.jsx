/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { withSSRContext } from "aws-amplify";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import classNames from "classnames";
import Link from "next/link";
import { FaCamera } from "react-icons/fa";
import { Loader } from "@components";

import {
  EventList,
  ViewCardDetail,
  ChangePassword,
  ChangeProfile,
  ProfileHeader,
  ProfilePicCrop,
} from "@components/profile";
import { api } from "@utils";
import { ALERT_TYPES } from "@constants";
import { useQueryString } from "@hooks";
import { useGlobalAlertContext } from "@contexts";

const UPCOMING_EVENTS = "UPCOMING_EVENTS";
const UPDATE_PROFILE = "UPDATE_PROFILE";
const CARD_DETAILS = "CARD_DETAILS";
const CHANGE_PASSWORD = "CHANGE_PASSWORD";

const MESSAGE_CANCEL_MEMBERSHIP_ERROR = `We're sorry, but an error occurred. Please contact the help desk
                at (844) 273-5500 to resolve the issue and cancel your
                membership.`;

export async function getServerSideProps({ req, res, query }) {
  const { Auth } = withSSRContext({ req });
  const { tab } = query || {};
  try {
    const user = await Auth.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const res = await api.get({
      path: "profile",
      token,
    });
    return {
      props: {
        authenticated: true,
        username: user.username,
        profile: res,
        token,
        tab: tab || UPCOMING_EVENTS,
      },
    };
  } catch (err) {
    console.error(err);
    res.writeHead(302, { Location: "/login" });
    res.end();
  }
  return { props: {} };
}

const Profile = ({ profile, tab }) => {
  const { showAlert } = useGlobalAlertContext();
  const [loading, setLoading] = useState(false);
  const [cropedProfilePic, setCropedProfilePic] = useState(null);
  const [uploadedProfilePic, setUploadedProfilePic] = useState(null);
  const [userProfile, setUserProfile] = useState(profile);
  const [activeTab, setActiveTab] = useQueryString("tab", {
    defaultValue: tab || UPCOMING_EVENTS,
  });
  const [editCardDetail, setEditCardDetail] = useState(false);
  const [request, setRequest] = useQueryString("request");
  const router = useRouter();
  const {
    first_name,
    last_name,
    name,
    userProfilePic: profilePic,
    upcomingWorkshop = [],
    upcomingMeetup = [],
    subscriptions = [],
  } = profile || {};
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
  let initials = `${first_name || ""} ${last_name || ""}`.match(/\b\w/g) || [];
  initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();

  const switchTab = (tab) => (e) => {
    if (e) e.preventDefault();
    setActiveTab(tab);
  };

  const switchCardDetailView = () => {
    setEditCardDetail((editCardDetail) => !editCardDetail);
  };

  const handleOnCropChange = (cropedProfilePic) => {
    setCropedProfilePic(cropedProfilePic);
  };

  const logoutAction = async () => {
    setLoading(true);
    await Auth.signOut();
    setLoading(false);
    router.push("/");
  };

  const handleOnSelectFile = (e) => {
    if (e.target.files.length) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setUploadedProfilePic(reader.result),
      );
      reader.readAsDataURL(e.target.files[0]);
      showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        title: "Edit Profile Pic",
        children: (
          <ProfilePicCrop
            src={uploadedProfilePic}
            handleOnCropChange={handleOnCropChange}
          />
        ),
        className: "research-detail-modal",
        hideConfirm: true,
      });
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
      const res = await api.get({
        path: "profile",
      });
      setUserProfile(res);
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <main className="profile">
        {request === "1" && (
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
        {request === "2" && (
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
        <section className="profile-header">
          <div className="container d-flex flex-md-row flex-column align-items-md-center">
            <div className="profile-header__client profile-pic-section">
              <label htmlFor="upload-button">
                <input
                  type="file"
                  id="upload-button"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleOnSelectFile}
                />
                <div className="profile-header__image wrapper">
                  {profilePic && (
                    <img
                      src={profilePic}
                      className="rounded-circle profile-pic"
                    />
                  )}
                  {!profilePic && <span>{initials}</span>}
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
                  className={classNames("profile-tab", {
                    active: activeTab === UPCOMING_EVENTS,
                  })}
                  onClick={switchTab(UPCOMING_EVENTS)}
                >
                  Upcoming Events
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className={classNames("profile-tab", {
                    active: activeTab === UPDATE_PROFILE,
                  })}
                  onClick={switchTab(UPDATE_PROFILE)}
                >
                  Update Profile
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className={classNames("profile-tab", {
                    active: activeTab === CARD_DETAILS,
                  })}
                  onClick={switchTab(CARD_DETAILS)}
                >
                  Card Details
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className={classNames("profile-tab", {
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
                className={classNames("tab-pane fade", {
                  active: activeTab === UPCOMING_EVENTS,
                  show: activeTab === UPCOMING_EVENTS,
                })}
              >
                <div
                  className={classNames("row", {
                    "profile-body__cards-container":
                      upcomingEvents.length !== 0,
                    "profile-body__cards-empty cards-empty":
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
                        upcoming{" "}
                        <Link href="/course">
                          <a href="#" className="link link_orange">
                            course
                          </a>
                        </Link>{" "}
                        or{" "}
                        <Link href="/meetup">
                          <a href="#" className="link link_orange">
                            meetup
                          </a>
                        </Link>{" "}
                        to join.
                      </div>
                    </>
                  )}
                  <EventList workshops={upcomingEvents}></EventList>
                </div>
              </div>
              <div
                className={classNames("tab-pane profile-update fade", {
                  active: activeTab === UPDATE_PROFILE,
                  show: activeTab === UPDATE_PROFILE,
                })}
              >
                <ChangeProfile
                  updateCompleteAction={updateCompleteAction}
                  profile={profile}
                ></ChangeProfile>
              </div>
              <div
                className={classNames("tab-pane fade", {
                  active: activeTab === CARD_DETAILS,
                  show: activeTab === CARD_DETAILS,
                })}
              >
                {!editCardDetail && (
                  <ViewCardDetail
                    switchCardDetailView={switchCardDetailView}
                  ></ViewCardDetail>
                )}
                {/* {editCardDetail && (
                  <StripeProvider apiKey={APP.STRIPE_PUBLISHABLE_KEY}>
                    <Elements>
                      <ChangeCardDetail
                        updateCompleteAction={updateCompleteAction}
                      />
                    </Elements>
                  </StripeProvider>
                )} */}
              </div>
              <div
                className={classNames("tab-pane fade", {
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
                      className={classNames("btn", {
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
                  className={classNames("collapse", {
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
                          upcoming{" "}
                          <a
                            href="#"
                            className="link link_orange"
                            // onClick={this.navigateToCourses}
                          >
                            course
                          </a>{" "}
                          or{" "}
                          <a
                            href="#"
                            className="link link_orange"
                            // onClick={this.navigateToMeetups}
                          >
                            meetup
                          </a>{" "}
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
                      className={classNames("btn", {
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
                  className={classNames("collapse", {
                    show: activeTab === UPDATE_PROFILE,
                  })}
                >
                  <div className="profile-body_mobile__card-body">
                    <ChangeProfile
                      isMobile
                      updateCompleteAction={updateCompleteAction}
                      profile={profile}
                    ></ChangeProfile>
                  </div>
                </div>
              </div>
              <div className="profile-body_mobile__card">
                <div className="profile-body_mobile__card-header">
                  <h2 className="mb-0">
                    <button
                      className={classNames("btn", {
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
                  className={classNames("collapse", {
                    show: activeTab === CARD_DETAILS,
                  })}
                >
                  <div className="profile-body_mobile__card-body">
                    {!editCardDetail && (
                      <ViewCardDetail
                        isMobile
                        switchCardDetailView={switchCardDetailView}
                      ></ViewCardDetail>
                    )}
                    {/* {editCardDetail && (
                      <StripeProvider apiKey={APP.STRIPE_PUBLISHABLE_KEY}>
                        <Elements>
                          <ChangeCardDetail
                            updateCompleteAction={updateCompleteAction}
                          />
                        </Elements>
                      </StripeProvider>
                    )} */}
                  </div>
                </div>
              </div>
              <div className="profile-body_mobile__card">
                <div className="profile-body_mobile__card-header">
                  <h2 className="mb-0">
                    <button
                      className={classNames("btn", {
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
                  className={classNames("collapse", {
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

export default Profile;
