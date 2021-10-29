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
import { useQueryString } from "@hooks";
import { InfiniteScrollLoader } from "@components/loader";
import { meditatePlayEvent, markFavoriteEvent } from "@service";
import { MODAL_TYPES } from "@constants";

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
  const { id } = context.query;
  // Fetch data from external API
  const { data } = await api.get({
    path: "library",
    token,
    param: {
      folderId: id,
    },
  });
  if (data.folder.length === 0) {
    throw new Error("Invalid Folder Id");
  }
  const [rootFolder] = data.folder;
  props = {
    ...props,
    rootFolder,
  };
  // Pass data to the page via props
  return { props };
};

function Collection({ rootFolder, authenticated, token }) {
  const router = useRouter();
  const { showModal } = useGlobalModalContext();
  const { showAlert } = useGlobalAlertContext();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();

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

  const markFavorite = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      await markFavoriteEvent({ meditate, refetch: null, token });
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
        token,
      });
    }
  };

  return (
    <main className="background-image">
      <NextSeo title="Meditations" />
      <div className="sleep-collection">
        <section className="top-column">
          <div className="container">
            <p className="type-course">Guided Meditations</p>
            <h1 className="course-name">{rootFolder.title}</h1>
            <p className="type-guide">
              Guided Meditations for {rootFolder.title}
              <br />
            </p>
          </div>
        </section>
        <section className="courses">
          <div className="container">
            <div className="row">
              {rootFolder.content.map((content) => (
                <MeditationTile
                  key={content.sfid}
                  data={content}
                  authenticated={authenticated}
                  additionalclassName="meditate-collection"
                  markFavorite={markFavorite(content)}
                  meditateClickHandle={meditateClickHandle(content)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Collection;
