import React, { useState, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { api } from "@utils";
import classNames from "classnames";
import { NextSeo } from "next-seo";
import { useIntersectionObserver } from "@hooks";
import { useRouter } from "next/router";
import { useUIDSeed } from "react-uid";
import { MeditationTile } from "@components/meditation/meditationTile";
import "bootstrap-daterangepicker/daterangepicker.css";
import { withSSRContext } from "aws-amplify";
import {
  useGlobalAlertContext,
  useGlobalAudioPlayerContext,
  useGlobalVideoPlayerContext,
  useGlobalModalContext,
} from "@contexts";
import {
  Popup,
  MobileFilterModal,
  SmartDropDown,
  PurchaseMembershipModal,
  RetreatPrerequisiteWarning,
} from "@components";
import { useQueryString } from "@hooks";
import {
  ALERT_TYPES,
  DURATION,
  MEMBERSHIP_TYPES,
  MODAL_TYPES,
} from "@constants";
import { InfiniteScrollLoader } from "@components/loader";
import { meditatePlayEvent, markFavoriteEvent } from "@service";

export const getServerSideProps = async (context) => {
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
    props = {
      authenticated: true,
      token,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }
  const { page = 1, topic, duration, instructor } = context.query;
  // Fetch data from external API
  try {
    let param = {
      page,
      size: 8,
      deviceType: "Web",
    };

    if (topic) {
      param = {
        ...param,
        category: topic,
      };
    }
    if (duration) {
      param = {
        ...param,
        duration: DURATION[duration].value,
      };
    }
    if (instructor) {
      param = {
        ...param,
        teacher: instructor,
      };
    }

    const res = await api.get({
      path: "meditations",
      token,
      param,
    });
    props = {
      ...props,
      meditations: {
        pages: [{ data: res }],
        pageParams: [null],
      },
    };
  } catch (err) {
    props = {
      ...props,
      meditations: {
        error: { message: err.message },
      },
    };
  }
  // Pass data to the page via props
  return { props };
};

const LibrarySearch = ({ meditations, authenticated }) => {
  const seed = useUIDSeed();
  const router = useRouter();
  const { showModal } = useGlobalModalContext();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showAlert } = useGlobalAlertContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();
  const [topic, setTopic] = useQueryString("topic");
  const [duration, setDuration] = useQueryString("duration");
  const [instructor, setInstructor] = useQueryString("instructor");

  const [showFilterModal, setShowFilterModal] = useState(false);

  const { data: meditationCategory = [] } = useQuery(
    "meditationCategory",
    async () => {
      const response = await api.get({
        path: "meditationCategory",
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data: instructorList = [] } = useQuery(
    "instructorList",
    async () => {
      const response = await api.get({
        path: "getAllContentTeachers",
        param: {
          deviceType: "web",
        },
      });
      return response;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data: subsciptionCategories = [] } = useQuery(
    "subsciption",
    async () => {
      const response = await api.get({
        path: "subsciption",
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data: favouriteContents = [], refetch: refetchFavouriteContents } =
    useQuery(
      "favouriteContents",
      async () => {
        const response = await api.get({
          path: "getFavouriteContents",
        });
        return response.data;
      },
      {
        refetchOnWindowFocus: false,
      },
    );

  const toggleFilter = () => {
    setShowFilterModal((showFilterModal) => !showFilterModal);
  };

  const markFavorite = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      await markFavoriteEvent({ meditate, refetch: refetchFavouriteContents });
    }
  };

  const purchaseMembershipAction = (id) => (e) => {
    router.push(`/us/membership/${id}`);
  };

  const meditateClickHandle = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      await meditatePlayEvent({
        meditate,
        showAlert,
        showPlayer,
        hidePlayer,
        showVideoPlayer,
        subsciptionCategories,
        purchaseMembershipAction,
      });
    }
  };

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case "topicFilter":
        setTopic(value);
        break;
      case "durationFilter":
        setDuration(value);
        break;
      case "instructorFilter":
        setInstructor(value);
        break;
    }
  };

  const onFilterChangeEvent = (field) => (value) => async (e) => {
    switch (field) {
      case "topicFilter":
        setTopic(value);
        break;
      case "durationFilter":
        setDuration(value);
        break;
      case "instructorFilter":
        setInstructor(value);
        break;
    }
  };

  const onFilterClearEvent = (field) => async () => {
    switch (field) {
      case "topicFilter":
        setTopic(null);
        break;
      case "durationFilter":
        setDuration(null);
        break;
      case "instructorFilter":
        setInstructor(null);
        break;
    }
  };

  const {
    status,
    isSuccess,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery(
    [
      "meditations",
      {
        topic,
        duration,
        instructor,
      },
    ],
    async ({ pageParam = 1 }) => {
      let param = {
        page: pageParam,
        size: 8,
        deviceType: "Web",
      };

      if (topic) {
        param = {
          ...param,
          category: topic,
        };
      }
      if (duration) {
        param = {
          ...param,
          duration: DURATION[duration].value,
        };
      }
      if (instructor) {
        param = {
          ...param,
          teacher: instructor,
        };
      }

      const res = await api.get({
        path: "meditations",
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
    { initialData: meditations },
  );

  const loadMoreRef = React.useRef();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  let filterCount = 0;
  if (topic) {
    filterCount++;
  }
  if (duration) {
    filterCount++;
  }
  if (instructor) {
    filterCount++;
  }

  console.log(
    data,
    isFetchingNextPage,
    isSuccess && data.pages[0].data.length === 0 && !isFetchingNextPage,
  );

  return (
    <main className="meetsup-filter">
      <NextSeo title="Meditations" />
      <section className="courses">
        <div className="container search_course_form d-lg-block d-none mb-2">
          <div className="row">
            <div className="col">
              <p className="title mb-3">Find a meditation </p>
            </div>
          </div>
          <div className="row">
            <div className="search-form col-12 d-flex align-items-center">
              <div className="switch-flter-container">
                <Popup
                  tabIndex="1"
                  value={topic}
                  buttonText={topic ? topic : "Topic"}
                  closeEvent={onFilterChange("topicFilter")}
                >
                  {({ closeHandler }) => (
                    <>
                      {meditationCategory &&
                        meditationCategory.map((category) => (
                          <li key={category} onClick={closeHandler(category)}>
                            {category}
                          </li>
                        ))}
                    </>
                  )}
                </Popup>

                <Popup
                  tabIndex="2"
                  value={duration}
                  buttonText={duration ? DURATION[duration].name : "Duration"}
                  closeEvent={onFilterChange("durationFilter")}
                >
                  {({ closeHandler }) => (
                    <>
                      <li onClick={closeHandler("MINUTES_5")}>
                        {DURATION.MINUTES_5.name}
                      </li>
                      <li onClick={closeHandler("MINUTES_10")}>
                        {DURATION.MINUTES_10.name}
                      </li>
                      <li onClick={closeHandler("MINUTES_20")}>
                        {DURATION.MINUTES_20.name}
                      </li>
                    </>
                  )}
                </Popup>
                <Popup
                  tabIndex="3"
                  value={instructor}
                  buttonText={instructor ? instructor : "Instructor"}
                  closeEvent={onFilterChange("instructorFilter")}
                >
                  {({ closeHandler }) => (
                    <>
                      {instructorList &&
                        instructorList.map((instructor) => (
                          <li
                            key={instructor.primaryTeacherName}
                            className="topic-dropdown"
                            onClick={closeHandler(
                              instructor.primaryTeacherName,
                            )}
                          >
                            {instructor.primaryTeacherName}
                          </li>
                        ))}
                    </>
                  )}
                </Popup>
              </div>
            </div>
          </div>
        </div>
        <div className="search_course_form_mobile d-lg-none d-block">
          <div className="container">
            <div className="row m-0 justify-content-between align-items-center">
              <p className="title mb-0">Find a meditation</p>
              <div className="filter">
                <div className="filter--button d-flex" onClick={toggleFilter}>
                  <img src="/img/ic-filter.svg" alt="filter" />
                  Filter
                  <span
                    id="filter-count"
                    className={classNames({
                      "filter-count--show": filterCount > 0,
                    })}
                  >
                    {filterCount}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={classNames("filter--box", {
                "d-none": !showFilterModal,
              })}
            >
              <MobileFilterModal
                modalTitle="Topic"
                buttonText={topic ? topic : "Topic"}
                clearEvent={onFilterClearEvent("topicFilter")}
              >
                <div className="dropdown">
                  <SmartDropDown
                    value={topic}
                    buttonText={topic ? topic : "Select Topic"}
                    closeEvent={onFilterChange("topicFilter")}
                  >
                    {({ closeHandler }) => (
                      <>
                        {meditationCategory &&
                          meditationCategory.map((category) => (
                            <li
                              key={category}
                              className="dropdown-item"
                              onClick={closeHandler(category)}
                            >
                              {category}
                            </li>
                          ))}
                      </>
                    )}
                  </SmartDropDown>
                </div>
              </MobileFilterModal>

              <MobileFilterModal
                modalTitle="Duration"
                buttonText={duration ? DURATION[duration].name : "Duration"}
                clearEvent={onFilterClearEvent("durationFilter")}
              >
                <div className="dropdown">
                  <SmartDropDown
                    value={duration}
                    buttonText={duration ? DURATION[duration].name : "Duration"}
                    closeEvent={onFilterChange("durationFilter")}
                  >
                    {({ closeHandler }) => (
                      <>
                        <li
                          className="topic-dropdown"
                          onClick={closeHandler("MINUTES_5")}
                        >
                          {DURATION.MINUTES_5.name}
                        </li>
                        <li
                          className="topic-dropdown"
                          onClick={closeHandler("MINUTES_10")}
                        >
                          {DURATION.MINUTES_10.name}
                        </li>
                        <li
                          className="topic-dropdown"
                          onClick={closeHandler("MINUTES_20")}
                        >
                          {DURATION.MINUTES_20.name}
                        </li>
                      </>
                    )}
                  </SmartDropDown>
                </div>
              </MobileFilterModal>

              <MobileFilterModal
                modalTitle="Course Type"
                buttonText={instructor ? instructor : "Instructor"}
                clearEvent={onFilterClearEvent("instructorFilter")}
              >
                <div className="dropdown">
                  <SmartDropDown
                    value={instructor}
                    buttonText={instructor ? instructor : "Select Instructor"}
                    closeEvent={onFilterChange("instructorFilter")}
                  >
                    {({ closeHandler }) => (
                      <>
                        {instructorList &&
                          instructorList.map((instructor) => (
                            <li
                              key={instructor.primaryTeacherName}
                              className="topic-dropdown"
                              onClick={closeHandler(
                                instructor.primaryTeacherName,
                              )}
                            >
                              {instructor.primaryTeacherName}
                            </li>
                          ))}
                      </>
                    )}
                  </SmartDropDown>
                </div>
              </MobileFilterModal>
            </div>
          </div>
        </div>
        <div className="container upcoming_course">
          <div className="row mb-4">
            {isSuccess &&
              data.pages.map((page) => (
                <React.Fragment key={seed(page)}>
                  {page.data.map((meditation) => (
                    <MeditationTile
                      key={meditation.sfid}
                      data={meditation}
                      authenticated={authenticated}
                      additionalclassName="meditate-find"
                      markFavorite={markFavorite(meditation)}
                      meditateClickHandle={meditateClickHandle(meditation)}
                      favouriteContents={favouriteContents}
                    />
                  ))}
                </React.Fragment>
              ))}
          </div>
          {isSuccess && data.pages[0].data.length === 0 && !isFetchingNextPage && (
            <section className="about" style={{ backgroundImage: "none" }}>
              <div className="container happines_box">
                <div className="row">
                  <div className="col-lg-8 col-md-10 col-12 m-auto text-center">
                    <h1 className="happines_title">
                      Sorry, no meditation match your chosen filters.
                    </h1>
                    <p className="happines_subtitle">
                      Please broaden your options and try again.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
          <div className="row">
            <div className="pt-3 col-12 text-center">
              <div ref={loadMoreRef}>
                {isFetchingNextPage && <InfiniteScrollLoader />}
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

export default LibrarySearch;
