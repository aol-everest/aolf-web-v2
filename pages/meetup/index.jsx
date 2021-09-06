import React from "react";
import { useInfiniteQuery } from "react-query";
import { api } from "@utils";
import { useIntersectionObserver } from "@hooks";
import { useUIDSeed } from "react-uid";
import { MeetupTile } from "@components/meetup/meetupTile";
import { withSSRContext } from "aws-amplify";

export const getServerSideProps = async (context) => {
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
    props = {
      authenticated: true,
      username: user.username,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }
  // Fetch the first page as default
  const page = context.query.page || 1;
  // Fetch data from external API
  try {
    const res = await api.get({
      path: "meetups",
      token,
      param: {
        page,
        size: 8,
      },
    });
    props = {
      ...props,
      workshops: {
        pages: [{ data: res }],
        pageParams: [null],
      },
    };
  } catch (err) {
    props = {
      ...props,
      workshops: {
        error: { message: err.message },
      },
    };
  }
  // Pass data to the page via props
  return { props };
};

const Workshop = ({ workshops, authenticated }) => {
  const seed = useUIDSeed();
  const {
    status,
    isSuccess,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    "meetups",
    async ({ pageParam = 1 }) => {
      const res = await api.get({
        path: "meetups",
        param: {
          page: pageParam,
          size: 8,
        },
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
    { initialData: workshops },
  );

  const loadMoreRef = React.useRef();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });
  return (
    <main className="meetsup-filter">
      <section className="courses">
        <div className="container search_course_form d-lg-block d-none mb-2">
          <div className="row">
            <div className="col">
              <p className="title mb-3">Find a meetup </p>
            </div>
          </div>
          <div className="row">
            <div className="search-form col-12 d-flex align-items-center">
              <div id="switch-filter" className="btn_outline_box ml-0">
                <a className="btn" href="#" data-swicth-active="true">
                  Online
                </a>
                <a className="btn" href="#" data-swicth-active="false">
                  In-Person
                </a>
              </div>
              <div className="switch-flter-container">
                <div
                  tabIndex="1"
                  className="btn_outline_box tooltip-button"
                  id="course-button"
                >
                  <div id="meetup-type" className="clear-filter"></div>
                  <a className="btn" href="#">
                    Meetup Type{" "}
                  </a>
                </div>
                <ul
                  id="course-tooltip"
                  className="tooltip-block"
                  role="tooltip"
                >
                  <div className="tooltip-arrow" data-popper-arrow></div>
                  <li>SKY Breath Meditation</li>
                  <li>Silent Retreat</li>
                </ul>

                <div tabIndex="2" className="btn_outline_box">
                  <a id="datepicker" className="btn" href="#">
                    Dates
                  </a>
                </div>

                <div
                  tabIndex="3"
                  className="btn_outline_box tooltip-button"
                  aria-describedby="tooltip"
                  id="time-button"
                >
                  <div id="time-clear" className="clear-filter"></div>
                  <a className="btn" href="#">
                    Time
                  </a>
                </div>
                <ul id="time-tooltip" className="tooltip-block" role="tooltip">
                  <div className="tooltip-arrow" data-popper-arrow></div>
                  <h2>Time range</h2>
                  <div className="checkbox-list">
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="morning"
                        value="Morning"
                      />
                      <label htmlFor="morning"></label>
                      <p className="checkbox-text">Morning</p>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="afternoon"
                        value="Afternoon"
                      />
                      <label htmlFor="afternoon"></label>
                      <p className="checkbox-text">Afternoon</p>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="evening"
                        value="Evening"
                      />
                      <label htmlFor="evening"></label>
                      <p className="checkbox-text">Evening</p>
                    </div>
                  </div>

                  <h2>Time zone</h2>
                  <div className="dropdown">
                    <button
                      className="custom-dropdown"
                      type="button"
                      id="dropdownTimeButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Select time zone
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownTimeButton"
                    >
                      <li className="dropdown-item text-left">Eastern</li>
                      <li className="dropdown-item text-left">Central</li>
                      <li className="dropdown-item text-left">Pacific</li>
                    </ul>
                  </div>
                </ul>

                <div
                  data-swicth-active="false"
                  tabIndex="4"
                  className="btn_outline_box tooltip-button"
                  id="location-button"
                >
                  <a className="btn" href="#">
                    Location
                  </a>
                </div>
                <ul
                  id="location-tooltip"
                  className="tooltip-block"
                  role="tooltip"
                >
                  <div className="tooltip-arrow" data-popper-arrow></div>
                  <div className="smart-input">
                    <input
                      placeholder="Search location"
                      type="text"
                      name="location"
                      id="location-input"
                      className="custom-input"
                    />
                    <div className="smart-input--list">
                      <p className="smart-input--list-item">Los Altos</p>
                      <p className="smart-input--list-item">Los Angeles</p>
                      <p className="smart-input--list-item">Los Gatos</p>
                      <p className="smart-input--list-item">Los Mochis</p>
                      <p className="smart-input--list-item">Los Banos</p>
                    </div>
                  </div>
                </ul>

                <div
                  tabIndex="5"
                  className="btn_outline_box tooltip-button"
                  aria-describedby="tooltip"
                  id="instructor-button"
                >
                  <div id="instructor-clear" className="clear-filter"></div>
                  <a className="btn" href="#">
                    Instructor{" "}
                  </a>
                </div>
                <ul
                  id="instructor-tooltip"
                  className="tooltip-block"
                  role="tooltip"
                >
                  <div className="tooltip-arrow" data-popper-arrow></div>
                  <div className="smart-input">
                    <input
                      placeholder="Search instructor"
                      type="text"
                      name="location"
                      id="instructor-input"
                      className="custom-input"
                    />
                    <div className="smart-input--list">
                      <p className="smart-input--list-item">Mary Walker</p>
                      <p className="smart-input--list-item">Rajesh Moksha</p>
                    </div>
                  </div>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="search_course_form_mobile d-lg-none d-block">
          <div className="container">
            <div className="row m-0 justify-content-between align-items-center">
              <p className="title mb-0">Find a course</p>
              <div className="filter">
                <div className="filter--button d-flex">
                  <img src="./img/ic-filter.svg" alt="filter" />
                  Filter
                  <span id="filter-count">0</span>
                </div>
              </div>
            </div>
            <div className="filter--box">
              <div
                id="switch-mobile-filter"
                className="btn_outline_box full-btn mt-3"
              >
                <a className="btn" href="#" data-swicth-active="true">
                  Online
                </a>
                <a className="btn" href="#" data-swicth-active="false">
                  In-Person
                </a>
              </div>

              <div
                className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                id="course-button_mobile"
              >
                <a className="btn" href="#">
                  Meetup Type{" "}
                </a>
              </div>
              <div
                id="course-modal_mobile"
                data-course="null"
                data-course-initial="Meetup Type"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div id="course-close_mobile" className="mobile-modal--close">
                    <img src="./img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Meetup Type</h2>
                  <div className="dropdown">
                    <button
                      className="custom-dropdown"
                      type="button"
                      id="dropdownCourseButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Select course
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownCourseButton"
                    >
                      <li className="dropdown-item">SKY Breath Meditation</li>
                      <li className="dropdown-item">Silent Retreat</li>
                    </ul>
                  </div>
                </div>
                <div className="mobile-modal--body">
                  <div className="row m-0 align-items-center justify-content-between">
                    <div className="clear">Clear</div>
                    <div className="btn_box_primary select-btn">Select</div>
                  </div>
                </div>
              </div>
              <div
                className="btn_outline_box full-btn mt-3"
                id="date-button_mobile"
              >
                <a className="btn" href="#">
                  Dates{" "}
                </a>
              </div>
              <div
                id="date-modal_mobile"
                data-date="null"
                data-date-initial="Dates"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div id="date-close_mobile" className="mobile-modal--close">
                    <img src="./img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Dates</h2>
                  <div className="datepicker-block">
                    <input
                      className="custom-input"
                      type="text"
                      id="datepicker-input"
                    />
                  </div>
                </div>
                <div className="mobile-modal--body">
                  <div className="row m-0 align-items-center justify-content-between">
                    <div className="clear">Clear</div>
                    <div className="btn_box_primary select-btn">Select</div>
                  </div>
                </div>
              </div>
              <div
                className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                aria-describedby="tooltip"
                id="time-button_mobile"
              >
                <a className="btn" href="#">
                  Time{" "}
                </a>
              </div>
              <div
                id="time-modal_mobile"
                data-time="null"
                data-time-initial="Time"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div id="time-close_mobile" className="mobile-modal--close">
                    <img src="./img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Time</h2>
                  <h2>Time range</h2>
                  <div className="checkbox-list">
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="morning"
                      />
                      <label htmlFor="morning"></label>
                      <p className="checkbox-text">Morning</p>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="afternoon"
                      />
                      <label htmlFor="afternoon"></label>
                      <p className="checkbox-text">Afternoon</p>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="evening"
                      />
                      <label htmlFor="evening"></label>
                      <p className="checkbox-text">Evening</p>
                    </div>
                  </div>

                  <h2>Time zone</h2>
                  <div className="dropdown">
                    <button
                      className="custom-dropdown"
                      type="button"
                      id="dropdownTimeButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Select time zone
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownTimeButton"
                    >
                      <li className="dropdown-item">Eastern</li>
                      <li className="dropdown-item">Central</li>
                      <li className="dropdown-item">Pacific</li>
                    </ul>
                  </div>
                </div>
                <div className="mobile-modal--body">
                  <div className="row m-0 align-items-center justify-content-between">
                    <div className="clear">Clear</div>
                    <div className="btn_box_primary select-btn">Select</div>
                  </div>
                </div>
              </div>
              <div
                className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                aria-describedby="tooltip"
                id="instructor-button_mobile"
              >
                <a className="btn" href="#">
                  Instructor{" "}
                </a>
              </div>
              <div
                id="instructor-modal_mobile"
                data-instructor="null"
                data-instructor-initial="Instructor"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div
                    id="instructor-close_mobile"
                    className="mobile-modal--close"
                  >
                    <img src="./img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Instructor</h2>
                  <div
                    className="smart-input-mobile"
                    id="instructor-mobile-input"
                  >
                    <input
                      placeholder="Search instructor"
                      type="text"
                      name="instructor"
                      className="custom-input"
                    />
                    <div className="smart-input--list">
                      <p className="smart-input--list-item">Mary Walker</p>
                      <p className="smart-input--list-item">Rajesh Moksha</p>
                    </div>
                  </div>
                </div>
                <div className="mobile-modal--body">
                  <div className="row m-0 align-items-center justify-content-between">
                    <div className="clear">Clear</div>
                    <div
                      id="instructor-search"
                      className="btn_box_primary select-btn"
                    >
                      Select
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                id="location-button_mobile"
                data-swicth-active="false"
              >
                <a className="btn" href="#">
                  Location
                </a>
              </div>
              <div
                id="location-modal_mobile"
                data-location="null"
                data-location-initial="Location"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div
                    id="location-close_mobile"
                    className="mobile-modal--close"
                  >
                    <img src="./img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Location</h2>
                  <div
                    className="smart-input-mobile"
                    id="location-mobile-input"
                  >
                    <input
                      placeholder="Search location"
                      type="text"
                      name="location"
                      className="custom-input"
                    />
                    <div className="smart-input--list">
                      <p className="smart-input--list-item">Los Altos</p>
                      <p className="smart-input--list-item">Los Angeles</p>
                      <p className="smart-input--list-item">Los Gatos</p>
                      <p className="smart-input--list-item">Los Mochis</p>
                      <p className="smart-input--list-item">Los Banos</p>
                    </div>
                  </div>
                </div>
                <div className="mobile-modal--body">
                  <div className="row m-0 align-items-center justify-content-between">
                    <div className="clear">Clear</div>
                    <div
                      id="location-search"
                      className="btn_box_primary select-btn"
                    >
                      Select
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container upcoming_course">
          <div className="row">
            <div className="col-12">
              <p className="title mb-1 mt-lg-5 mt-3">
                Upcoming live online meetups
              </p>
            </div>
          </div>
          <div className="row mb-4">
            {isSuccess &&
              data.pages.map((page) => (
                <React.Fragment key={seed(page)}>
                  {page.data.map((meetup) => (
                    <MeetupTile data={meetup} />
                  ))}
                </React.Fragment>
              ))}
          </div>
          <div className="row">
            <div className="pt-3 col-12 text-center">
              <div ref={loadMoreRef}>
                {isFetchingNextPage ? "Loading more..." : ""}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Workshop;
