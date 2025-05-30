import { PageLoading } from '@components';
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
import { api } from '@utils';
import 'bootstrap-daterangepicker/daterangepicker.css';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { navigateToLogin } from '@utils';

/* export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext({ req });
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    token = currentSession.idToken.jwtToken;
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
}; */

function Tile({
  data,
  authenticated,
  markFavorite,
  meditateClickHandle,
  additionalClass,
  favouriteContents = [],
}) {
  const {
    sfid,
    title,
    description,
    coverImage,
    totalActivities,
    accessible,
    category,
    liveMeetingStartDateTime,
    liveMeetingDuration,
    duration,
    isFavorite,
    isFree,
    primaryTeacherName,
  } = data || {};

  const isFavoriteContent = !!favouriteContents.find((el) => el.sfid === sfid);

  const timeConvert = (data) => {
    const minutes = data % 60;
    const hours = (data - minutes) / 60;

    return String(hours).padStart(2, 0) + ':' + String(minutes).padStart(2, 0);
  };

  return (
    <div className="col-6 col-lg-3 col-md-4">
      <div
        className="upcoming_course_card upcoming_course_card_v1"
        data-full="false"
        data-complete="false"
      >
        <img
          src={coverImage ? coverImage.url : '/img/card-1.png'}
          alt="bg"
          layout="fill"
        />

        <div className="course_data">{timeConvert(duration)}</div>
        {!accessible && (
          <span className="lock collection-lock">
            <img src="/img/ic-lock.png" alt="" />
          </span>
        )}
        {accessible && (
          <div
            className={classNames('course-like', {
              liked: isFavorite || isFavoriteContent,
            })}
            onClick={markFavorite}
          ></div>
        )}
        <div className="forClick" onClick={meditateClickHandle}></div>
        <div className="course_info">
          <div className="course_name">{title}</div>
          <div className="course_place">{primaryTeacherName}</div>
        </div>
      </div>
    </div>
  );
}

function Collection() {
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const [folderName] = useQueryString('folderName');
  const { id: folderId } = router.query;
  const {
    data: rootFolder,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'library',
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

  const { showModal, hideModal } = useGlobalModalContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();

  const { data: subsciptionCategories = [] } = useQuery({
    queryKey: 'subsciption',
    queryFn: async () => {
      const response = await api.get({
        path: 'subsciption',
      });
      return response.data;
    },
  });

  const { data: favouriteContents = [], refetch: refetchFavouriteContents } =
    useQuery({
      queryKey: 'favouriteContents',
      queryFn: async () => {
        const response = await api.get({
          path: 'getFavouriteContents',
        });

        return response.data;
      },
    });
  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  const markFavorite = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigateToLogin(router);
    } else {
      await markFavoriteEvent({ meditate, refetch: refetchFavouriteContents });
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
    } else {
      await meditatePlayEvent({
        meditate,
        showAlert,
        hideAlert,
        showPlayer,
        hidePlayer,
        showVideoPlayer,
        subsciptionCategories,
        purchaseMembershipAction,
        router,
      });
    }
  };

  const content = (rootFolder.content || []).map((content) => {
    const isFavorite = favouriteContents.find((el) => el.sfid === content.sfid);
    return {
      ...content,
      isFavorite: !!isFavorite,
    };
  });

  return (
    <main className="background-image">
      <NextSeo title="Meditations" />
      <div className="sleep-collection">
        <section className="top-column">
          <div className="container">
            {folderName && <p className="type-course">{folderName}</p>}
            {!folderName && <p className="type-course">Guided Meditations</p>}
            <h1 className="course-name">{rootFolder.title}</h1>

            {folderName && (
              <p className="type-guide">
                {folderName} for {rootFolder.title}
                <br />
              </p>
            )}
            {!folderName && (
              <p className="type-guide">
                Guided Meditations for {rootFolder.title}
                <br />
              </p>
            )}
          </div>
        </section>
        <section className="courses">
          <div className="container">
            <div className="row">
              {content.map((content) => (
                <Tile
                  key={content.sfid}
                  data={content}
                  isAuthenticated={isAuthenticated}
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
