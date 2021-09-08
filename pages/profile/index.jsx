import React, { useState } from "react";
import { useAuth } from "@contexts";
import moment from "moment";
import { withSSRContext } from "aws-amplify";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import ReactTooltip from "react-tooltip";
import classNames from "classnames";
import Link from "next/link";
import { Collapse } from "reactstrap";
import {
  EventList,
  ViewCardDetail,
  ChangePassword,
  ChangeProfile,
  ProfileHeader,
} from "@components/profile";
import { api } from "@utils";
import { MEMBERSHIP_TYPES } from "@constants";

const UPCOMING_EVENTS = "UPCOMING_EVENTS";
const UPDATE_PROFILE = "UPDATE_PROFILE";
const CARD_DETAILS = "CARD_DETAILS";
const CHANGE_PASSWORD = "CHANGE_PASSWORD";

const MESSAGE_CANCEL_MEMBERSHIP_ERROR = `We're sorry, but an error occurred. Please contact the help desk
                at (844) 273-5500 to resolve the issue and cancel your
                membership.`;

export async function getServerSideProps({ req, res }) {
  const { Auth } = withSSRContext({ req });
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
      },
    };
  } catch (err) {
    console.error(err);
    res.writeHead(302, { Location: "/login" });
    res.end();
  }
  return { props: {} };
}

const Profile = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null);
  const [activeTab, setActiveTab] = useState(UPCOMING_EVENTS);
  const [editCardDetail, setEditCardDetail] = useState(false);
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

  const logoutAction = async () => {
    setLoading(true);
    await Auth.signOut();
    setLoading(false);
    router.push("/");
  };

  const updateCompleteAction = async ({
    message,
    isError = false,
    payload = {},
  }) => {};

  return (
    <>
      <main class="profile">
        {request === "1" && (
          <aside class="profile__alert profile__alert_error">
            <div class="container-xl d-flex align-center">
              <span>
                <img src="/img/ic-error.svg" alt="error" />
                We're sorry, but an error occurred. Please contact the help desk
                at (844) 273-5500 to resolve the issue and cancel your
                membership.
              </span>
            </div>
            <img
              class="profile__close-alert"
              src="/img/ic-close-white.svg"
              alt="close"
            />
          </aside>
        )}
        {request === "2" && (
          <aside class="profile__alert">
            <div class="container-xl d-flex justify-content-center align-center">
              <span>
                <img src="/img/ic-check.svg" alt="check" />
                Your membership has been cancelled.
              </span>
            </div>
            <img
              class="profile__close-alert"
              src="/img/ic-close-white.svg"
              alt="close"
            />
          </aside>
        )}
        <section class="profile-header">
          <div class="container d-flex flex-md-row flex-column align-items-md-center">
            <div class="profile-header__client profile-pic-section">
              <label htmlFor="upload-button">
                <input
                  type="file"
                  id="upload-button"
                  accept="image/*"
                  style={{ display: "none" }}
                  // onChange={this.handleOnSelectFile}
                />
                <div class="profile-header__image wrapper">
                  {profilePic && (
                    <img
                      src={profilePic}
                      className="rounded-circle profile-pic"
                    />
                  )}
                  {!profilePic && <span>{initials}</span>}
                  <div class="camera-icon">
                    <i class="fa fa-camera"></i>
                  </div>
                </div>
              </label>
              <div class="profile-header__full-name d-block d-md-none">
                {name}
              </div>
            </div>
            <div class="profile-header__info">
              <div class="profile-header__full-name d-none d-md-block">
                {name}
              </div>
              <ProfileHeader
                subscriptions={subscriptions}
                userSubscriptions={userSubscriptions}
              />
            </div>
          </div>
        </section>

        <section class="profile-body d-none d-md-block">
          <div class="container">
            <ul
              class="nav nav-pills"
              id="profile-tabs-container"
              role="tablist"
            >
              <li class="nav-item" role="presentation">
                <a
                  class={classNames("profile-tab", {
                    active: activeTab === UPCOMING_EVENTS,
                  })}
                  onClick={switchTab(UPCOMING_EVENTS)}
                >
                  Upcoming Events
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a
                  class={classNames("profile-tab", {
                    active: activeTab === UPDATE_PROFILE,
                  })}
                  onClick={switchTab(UPDATE_PROFILE)}
                >
                  Update Profile
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a
                  class={classNames("profile-tab", {
                    active: activeTab === CARD_DETAILS,
                  })}
                  onClick={switchTab(CARD_DETAILS)}
                >
                  Card Details
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a
                  class={classNames("profile-tab", {
                    active: activeTab === CHANGE_PASSWORD,
                  })}
                  onClick={switchTab(CHANGE_PASSWORD)}
                >
                  Change Password
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a class="profile-tab" onClick={logoutAction}>
                  Log out
                </a>
              </li>
            </ul>
            <div class="tab-content" id="profile-tabContent">
              <div
                class={classNames("tab-pane fade", {
                  active: activeTab === UPCOMING_EVENTS,
                  show: activeTab === UPCOMING_EVENTS,
                })}
              >
                <div
                  class={classNames("row", {
                    "profile-body__cards-container":
                      upcomingEvents.length !== 0,
                    "profile-body__cards-empty cards-empty":
                      upcomingEvents.length === 0,
                  })}
                >
                  {upcomingEvents.length === 0 && (
                    <>
                      <div class="cards-empty__img">
                        <img src="/img/ic-search-calendar.svg" alt="search" />
                      </div>
                      <div class="cards-empty__text">
                        You don't have any events scheduled right now. Find an
                        upcoming{" "}
                        <Link href="/workshop">
                          <a href="#" class="link link_orange">
                            course
                          </a>
                        </Link>{" "}
                        or{" "}
                        <Link href="/meetup">
                          <a href="#" class="link link_orange">
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
                class={classNames("tab-pane profile-update fade", {
                  active: activeTab === UPDATE_PROFILE,
                  show: activeTab === UPDATE_PROFILE,
                })}
              >
                {/* <ChangeProfile
                  updateCompleteAction={this.updateCompleteAction}
                ></ChangeProfile> */}
              </div>
              <div
                class={classNames("tab-pane fade", {
                  active: activeTab === CARD_DETAILS,
                  show: activeTab === CARD_DETAILS,
                })}
              >
                {!editCardDetail && (
                  <ViewCardDetail
                    switchCardDetailView={switchCardDetailView}
                  ></ViewCardDetail>
                )}
                {editCardDetail && (
                  <StripeProvider apiKey={APP.STRIPE_PUBLISHABLE_KEY}>
                    <Elements>
                      <ChangeCardDetail
                        updateCompleteAction={updateCompleteAction}
                      />
                    </Elements>
                  </StripeProvider>
                )}
              </div>
              <div
                class={classNames("tab-pane fade", {
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

        <section class="profile-body_mobile d-block d-md-none">
          <div class="container">
            <div class="profile-body_mobile__accordion">
              <div class="profile-body_mobile__card">
                <div class="profile-body_mobile__card-header">
                  <h2 class="mb-0">
                    <button
                      class={classNames("btn", {
                        collapsed: activeTab !== UPCOMING_EVENTS,
                      })}
                      type="button"
                      onClick={switchTab(UPCOMING_EVENTS)}
                    >
                      Upcoming Events
                    </button>
                  </h2>
                </div>
                <Collapse isOpen={activeTab === UPCOMING_EVENTS}>
                  <div class="profile-body_mobile__card-body">
                    {upcomingEvents.length === 0 && (
                      <div class="profile-body_mobile__cards-empty cards-empty">
                        <div class="cards-empty__img">
                          <img src="/img/ic-search-calendar.svg" alt="search" />
                        </div>
                        <div class="cards-empty__text">
                          You don't have any events scheduled right now. Find an
                          upcoming{" "}
                          <a
                            href="#"
                            class="link link_orange"
                            // onClick={this.navigateToCourses}
                          >
                            course
                          </a>{" "}
                          or{" "}
                          <a
                            href="#"
                            class="link link_orange"
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
                </Collapse>
              </div>
              <div class="profile-body_mobile__card">
                <div class="profile-body_mobile__card-header">
                  <h2 class="mb-0">
                    <button
                      class={classNames("btn", {
                        collapsed: activeTab !== UPDATE_PROFILE,
                      })}
                      type="button"
                      onClick={switchTab(UPDATE_PROFILE)}
                    >
                      Update Profile
                    </button>
                  </h2>
                </div>
                <Collapse isOpen={activeTab === UPDATE_PROFILE}>
                  <div class="profile-body_mobile__card-body">
                    <ChangeProfile
                      isMobile
                      updateCompleteAction={updateCompleteAction}
                    ></ChangeProfile>
                  </div>
                </Collapse>
              </div>
              <div class="profile-body_mobile__card">
                <div class="profile-body_mobile__card-header">
                  <h2 class="mb-0">
                    <button
                      class={classNames("btn", {
                        collapsed: activeTab !== CARD_DETAILS,
                      })}
                      onClick={switchTab(CARD_DETAILS)}
                      type="button"
                    >
                      Card Details
                    </button>
                  </h2>
                </div>
                <Collapse isOpen={activeTab === CARD_DETAILS}>
                  <div class="profile-body_mobile__card-body">
                    {!editCardDetail && (
                      <ViewCardDetail
                        isMobile
                        switchCardDetailView={switchCardDetailView}
                      ></ViewCardDetail>
                    )}
                    {editCardDetail && (
                      <StripeProvider apiKey={APP.STRIPE_PUBLISHABLE_KEY}>
                        <Elements>
                          <ChangeCardDetail
                            updateCompleteAction={updateCompleteAction}
                          />
                        </Elements>
                      </StripeProvider>
                    )}
                  </div>
                </Collapse>
              </div>
              <div class="profile-body_mobile__card">
                <div class="profile-body_mobile__card-header">
                  <h2 class="mb-0">
                    <button
                      class={classNames("btn", {
                        collapsed: activeTab !== CHANGE_PASSWORD,
                      })}
                      type="button"
                      onClick={switchTab(CHANGE_PASSWORD)}
                    >
                      Change Password
                    </button>
                  </h2>
                </div>
                <Collapse isOpen={activeTab === CHANGE_PASSWORD}>
                  <div class="profile-body_mobile__card-body">
                    <ChangePassword
                      isMobile
                      updateCompleteAction={updateCompleteAction}
                    ></ChangePassword>
                  </div>
                </Collapse>
              </div>
              <div class="profile-body_mobile__card">
                <div class="profile-body_mobile__card-header">
                  <h2 class="mb-0">
                    <button
                      class="btn collapsed"
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
