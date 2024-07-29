import { api, isSSR } from '@utils';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// import { DesignOne, DesignTwo } from "@components/content";
import { Loader, PageLoading } from '@components';
import { MODAL_TYPES } from '@constants';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalAudioPlayerContext,
  useGlobalModalContext,
  useGlobalVideoPlayerContext,
} from '@contexts';
import { useQueryString } from '@hooks';
import {
  markFavoriteEvent,
  meditatePlayEvent,
  pushRouteWithUTMQuery,
} from '@service';
import ErrorPage from 'next/error';
import { A11y, Navigation, Scrollbar } from 'swiper';
import { NextSeo } from 'next-seo';
import { navigateToLogin } from '@utils';

import 'swiper/css';
import 'swiper/css/a11y';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

const DesignOne = dynamic(() =>
  import('@components/content').then((mod) => mod.DesignOne),
);
const DesignTwo = dynamic(() =>
  import('@components/content').then((mod) => mod.DesignTwo),
);

const CATEGORY_IMAGES = [
  '/img/card-1a.png',
  '/img/card-2a.png',
  '/img/card-6.png',
  '/img/card-4a.png',
];

/* export const getServerSideProps = async (context) => {
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
}; */

export default function Library() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { id: folderId } = router.query;
  const {
    data: rootFolder,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['library', folderId],
    queryFn: async () => {
      const response = await api.get({
        path: 'library',
        param: {
          folderId,
        },
      });
      const [rootFolder] = response.data.folder;
      if (!rootFolder) {
        throw new Error('No library found. Invalid Folder Id.');
      }
      return rootFolder;
    },
    enabled: router.isReady,
  });

  //SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);
  const { showModal, hideModal } = useGlobalModalContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [topic, setTopic] = useQueryString('topic');
  const [duration, setDuration] = useQueryString('duration');
  const [instructor, setInstructor] = useQueryString('instructor');
  const [loading, setLoading] = useState(false);

  const { data: favouriteContents = [], refetch: refetchFavouriteContents } =
    useQuery({
      queryKey: 'favouriteContents',
      queryFn: async () => {
        const response = await api.get({
          path: 'getFavouriteContents',
        });
        return response.data;
      },

      enabled: isAuthenticated,
    });

  const { data: meditationCategory = [], isSuccess } = useQuery({
    queryKey: 'meditationCategory',
    queryFn: async () => {
      const response = await api.get({
        path: 'meditationCategory',
      });
      return response.data;
    },
  });

  const { data: subsciptionCategories = [] } = useQuery({
    queryKey: 'subsciption',
    queryFn: async () => {
      const response = await api.get({
        path: 'subsciption',
      });
      return response.data;
    },
  });

  const { data: instructorList = [] } = useQuery({
    queryKey: 'instructorList',
    queryFn: async () => {
      const response = await api.get({
        path: 'getAllContentTeachers',
        param: {
          deviceType: 'web',
        },
      });
      return response;
    },
  });

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
  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  const onFilterChange = (value) => {
    setTopic(value);
  };

  const markFavorite = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigateToLogin(router);
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
    pushRouteWithUTMQuery(router, `/us-en/membership/${id}`);
  };

  const meditateClickHandle = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigateToLogin(router);
    } else if (meditate.accessible && meditate.type === 'Course') {
      pushRouteWithUTMQuery(router, `/us-en/learn/${meditate.sfid}`);
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
    query = { ...query, folderName: rootFolder.title };
    if (topic) {
      query = { ...query, topic };
    }
    if (duration) {
      query = { ...query, duration };
    }
    if (instructor) {
      query = { ...query, instructor };
    }
    pushRouteWithUTMQuery(router, {
      pathname: '/us-en/library/search',
      query,
    });
  };

  const toggleFilter = () => {
    setShowFilterModal((showFilterModal) => !showFilterModal);
  };

  const params = {
    isAuthenticated,
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
  };

  return (
    <>
      <NextSeo
        title="Meditations"
        description="Relax with a currated colection of guided meditations by Gurudev and senior Art of Living instructors."
      />
      <DesignOne data={rootFolder} {...params} />
    </>
  );
}
