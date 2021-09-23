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
import { useGlobalAlertContext, useGlobalAudioPlayerContext } from "@contexts";
import { useQueryString } from "@hooks";
import { ALERT_TYPES, DURATION, MEMBERSHIP_TYPES } from "@constants";
import { InfiniteScrollLoader } from "@components/loader";
import { updateUserActivity } from "@service";
import {
  PurchaseMembershipModal,
  RetreatPrerequisiteWarning,
} from "@components";

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
  const { page = 1, type } = context.query;
  // Fetch data from external API
  try {
    let param = {
      page,
      size: 8,
      deviceType: "Web",
    };

    if (type) {
      param = {
        ...param,
        category: type,
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

function MeditationCollection({ meditations, authenticated, token }) {
  const seed = useUIDSeed();
  const router = useRouter();
  const { showPlayer } = useGlobalAudioPlayerContext();
  const { showAlert } = useGlobalAlertContext();
  const [type, setType] = useQueryString("type");

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
                artist: meditateDetails.teacher.name,
                image: meditateDetails.coverImage.url,
                audioSrc: meditateDetails.track.url,
              },
            });
          } else if (meditateDetails.contentType === "Video") {
            // this.setState(({ video }) => {
            //   return {
            //     video: { ...video, isRender: true },
            //     videoMeditateDetails: meditateDetails,
            //   };
            // });
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
          className: "meditation-digital-membership",
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
        type,
      },
    ],
    async ({ pageParam = 1 }) => {
      let param = {
        page: pageParam,
        size: 8,
        deviceType: "Web",
      };

      if (type) {
        param = {
          ...param,
          category: type,
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
    <main className="background-image">
      <div className="sleep-collection">
        <section className="top-column">
          <div className="container">
            <p className="type-course">Guided Meditations</p>
            <h1 className="course-name">{type}</h1>
            <p className="type-guide">
              Guided Meditations for {type}
              <br />
            </p>
          </div>
        </section>
        <section className="courses">
          <div className="container">
            <div className="row">
              {isSuccess &&
                data.pages.map((page) => (
                  <React.Fragment key={seed(page)}>
                    {page.data.map((meditation) => (
                      <MeditationTile
                        key={meditation.sfid}
                        data={meditation}
                        authenticated={authenticated}
                        additionalclassName="meditate-collection"
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
      </div>
    </main>
  );
}

export default MeditationCollection;
