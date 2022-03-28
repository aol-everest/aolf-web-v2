import React, { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { api, isSSR } from "@utils";
import { useQuery } from "react-query";
// import { DesignOne, DesignTwo } from "@components/content";
import { withSSRContext } from "aws-amplify";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { useQueryString } from "@hooks";
import { PurchaseMembershipModal, Loader } from "@components";
import {
  useGlobalAudioPlayerContext,
  useGlobalAlertContext,
  useGlobalVideoPlayerContext,
  useGlobalModalContext,
} from "@contexts";
import { useAuth } from "@contexts";
import { meditatePlayEvent, markFavoriteEvent } from "@service";
import { MODAL_TYPES, ALERT_TYPES, MEMBERSHIP_TYPES } from "@constants";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/a11y";
import "swiper/css/scrollbar";

const DesignOne = dynamic(() =>
  import("@components/content").then((mod) => mod.DesignOne),
);
const DesignTwo = dynamic(() =>
  import("@components/content").then((mod) => mod.DesignTwo),
);

const CATEGORY_IMAGES = [
  "/img/card-1a.png",
  "/img/card-2a.png",
  "/img/card-6.png",
  "/img/card-4a.png",
];

export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  const { id } = query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext({ req });
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    token = currentSession.idToken.jwtToken;
    props = {
      authenticated: true,
      username: user.username,
      token,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }
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
  props = {
    ...props,
    data,
  };
  // Pass data to the page via props
  return { props };
};

export default function Library({ data }) {
  const [rootFolder] = data.folder;
  const [{ authenticated }] = useAuth();

  //SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);
  const router = useRouter();
  const { showModal, hideModal } = useGlobalModalContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [topic, setTopic] = useQueryString("topic");
  const [duration, setDuration] = useQueryString("duration");
  const [instructor, setInstructor] = useQueryString("instructor");
  const [loading, setLoading] = useState(false);

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

  const { data: meditationCategory = [], isSuccess } = useQuery(
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

  let backgroundIterator = -1;
  const pickCategoryImage = (i) => {
    backgroundIterator = backgroundIterator + 1;
    if (backgroundIterator <= 3) {
      return CATEGORY_IMAGES[backgroundIterator];
    } else {
      backgroundIterator = 0;
      return CATEGORY_IMAGES[backgroundIterator];
    }
  };

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case "topic":
        setTopic(value);
        break;
      case "duration":
        setDuration(value);
        break;
      case "instructor":
        setInstructor(value);
        break;
    }
  };

  const onFilterClearEvent = (field) => async () => {
    switch (field) {
      case "topic":
        setTopic(null);
        break;
      case "duration":
        setDuration(null);
        break;
      case "instructor":
        setInstructor(null);
        break;
    }
  };

  const markFavorite = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      await markFavoriteEvent({
        meditate,
        refetch: refetchFavouriteContents,
      });
    }
  };

  const purchaseMembershipAction = (id) => (e) => {
    hideModal();
    hideAlert();
    router.push(`/us-en/membership/${id}`);
  };

  const meditateClickHandle = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else if (meditate.accessible && meditate.type === "Course") {
      router.push(`/us-en/learn/${meditate.sfid}`);
    } else {
      setLoading(true);
      await meditatePlayEvent({
        meditate,
        showAlert,
        showPlayer,
        hidePlayer,
        showVideoPlayer,
        subsciptionCategories,
        purchaseMembershipAction,
      });
      setLoading(false);
    }
  };

  const findMeditation = () => {
    let query = {};
    if (topic) {
      query = { ...query, topic };
    }
    if (duration) {
      query = { ...query, duration };
    }
    if (instructor) {
      query = { ...query, instructor };
    }
    router.push({
      pathname: "/us-en/library/search",
      query,
    });
  };

  let slidesPerView = 5;
  if (!isSSR) {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1600 && screenWidth > 1200) {
      slidesPerView = 4.3;
    } else if (screenWidth < 1200 && screenWidth > 981) {
      slidesPerView = 3.3;
    } else if (screenWidth < 981 && screenWidth > 767) {
      slidesPerView = 3;
    } else if (screenWidth < 767) {
      slidesPerView = 2.2;
    }
  }

  let swiperOption = {
    modules: [Navigation, Pagination, Scrollbar, A11y],
    allowTouchMove: true,
    slidesPerView: slidesPerView,
    spaceBetween: 30,
    preventInteractionOnTransition: true,
    navigation: true,
    breakpoints: {
      320: {
        slidesPerView: 2.2,
      },
      767: {
        slidesPerView: 3,
      },
      981: {
        slidesPerView: 3.3,
      },
      1200: {
        slidesPerView: 4.3,
      },
      1600: {
        slidesPerView: 5,
      },
    },
  };

  const toggleFilter = () => {
    setShowFilterModal((showFilterModal) => !showFilterModal);
  };

  const params = {
    authenticated,
    swiperOption,
    pickCategoryImage,
    backgroundIterator,
    markFavorite,
    meditateClickHandle,
    showFilterModal,
    toggleFilter,
    onFilterChange,
    topic,
    meditationCategory,
    instructorList,
    instructor,
    findMeditation,
    duration,
    favouriteContents,
    onFilterClearEvent,
  };

  switch (rootFolder.screenDesign) {
    case "Design 1":
      return (
        <>
          {loading && <Loader />}
          <DesignOne data={rootFolder} {...params} />
        </>
      );
    case "Design 2":
      return (
        <>
          {loading && <Loader />}
          <DesignTwo data={rootFolder} {...params} />
        </>
      );
    default:
      return null;
  }
}
