import React, { useState, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { api } from "@utils";
import classNames from "classnames";
import { NextSeo } from "next-seo";
import { useIntersectionObserver } from "@hooks";
import { useUIDSeed } from "react-uid";
import { MeditationTile } from "@components/meditation/meditationTile";
import "bootstrap-daterangepicker/daterangepicker.css";
import { withSSRContext } from "aws-amplify";
import {
  useGlobalAlertContext,
  useGlobalAudioPlayerContext,
  useGlobalVideoPlayerContext,
} from "@contexts";
import {
  Popup,
  SmartInput,
  MobileFilterModal,
  SmartDropDown,
  DateRangeInput,
  PurchaseMembershipModal,
  RetreatPrerequisiteWarning,
} from "@components";
import { useQueryString } from "@hooks";
import { ALERT_TYPES, DURATION, MEMBERSHIP_TYPES } from "@constants";
import { InfiniteScrollLoader } from "@components/loader";
import { updateUserActivity } from "@service";

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

const MeditationFind = ({ meditations, authenticated, token }) => {
  const seed = useUIDSeed();

  const { showPlayer } = useGlobalAudioPlayerContext();
  const { showAlert } = useGlobalAlertContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();
  const [topic, setTopic] = useQueryString("topic");
  const [duration, setDuration] = useQueryString("duration");
  const [instructor, setInstructor] = useQueryString("instructor");

  const [searchKey, setSearchKey] = useState("");
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

  const toggleFilter = () => {
    setShowFilterModal((showFilterModal) => !showFilterModal);
  };

  const markFavorite = (meditate) => async () => {
    try {
      const data = {
        contentSfid: meditate.sfid,
        removeFavourite: meditate.isFavorite ? true : false,
      };
      await api.post({
        path: "markFavourite",
        body: data,
        token,
      });
      refetch({ refetchPage: (page, index) => index === 0 });
    } catch (error) {
      console.log(error);
    }
  };

  const purchaseMembershipAction = (id) => (e) => {
    router.push(`/membership/${id}`);
  };

  const meditateClickHandle = (meditate) => async (e) => {
    if (e) e.preventDefault();

    if (meditate.accessible) {
      try {
        const results = await api.get({
          path: "meditationDetail",
          param: { id: meditate.sfid },
          token,
        });
        const {
          data,
          status,
          error: errorMessage,
          workshopPrerequisiteMessage,
          requiredPrerequisitWorkshopIds,
        } = results;

        if (status === 400) {
          showAlert(ALERT_TYPES.ERROR_ALERT, {
            children: (
              <RetreatPrerequisiteWarning
                warningPayload={workshopPrerequisiteMessage}
              />
            ),
          });
        }

        if (data) {
          const meditateDetails = { ...data, ...meditate };
          if (
            meditateDetails.contentType === "Audio" ||
            meditateDetails.contentType === "audio/x-m4a"
          ) {
            showPlayer({
              track: {
                title: meditateDetails.title,
                artist: meditateDetails.teacher?.name,
                image: meditateDetails.coverImage?.url,
                audioSrc: meditateDetails.track?.url,
              },
            });
          } else if (meditateDetails.contentType === "Video") {
            showVideoPlayer({
              track: {
                title: meditateDetails.title,
                artist: meditateDetails.teacher?.name,
                image: meditateDetails.coverImage?.url,
                audioSrc: meditateDetails.track?.url,
              },
            });
          }
          const { totalActivity } = await updateUserActivity(token, {
            contentSfid: meditateDetails.sfid,
          });
        }
      } catch (error) {
        console.log(error);
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: error.message,
        });
      }
      // } else if (meditate.accessible && !meditate.utilizable) {
      //   this.setState({
      //     retreatPrerequisiteWarningPayload: meditate,
      //     showRetreatPrerequisiteWarning: true,
      //   });
    } else {
      const allSubscriptions = subsciptionCategories.reduce(
        (accumulator, currentValue) => {
          return {
            ...accumulator,
            [currentValue.sfid]: currentValue,
          };
        },
        {},
      );
      if (
        allSubscriptions.hasOwnProperty(
          MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value,
        )
      ) {
        showAlert(ALERT_TYPES.CUSTOM_ALERT, {
          footer: () => {
            return (
              <button
                className="btn-secondary v2"
                onClick={purchaseMembershipAction(
                  MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value,
                )}
              >
                Join Digital Membership
              </button>
            );
          },
          children: (
            <PurchaseMembershipModal
              modalSubscription={
                allSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value]
              }
            />
          ),
        });
      }
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
                          <li onClick={closeHandler(category)}>{category}</li>
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
                  <img src="./img/ic-filter.svg" alt="filter" />
                  Filter
                  <span id="filter-count">0</span>
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
                    />
                  ))}
                </React.Fragment>
              ))}
          </div>
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

export default MeditationFind;
