import { createContext, useContext, useCallback } from 'react';
import { ALERT_TYPES, MEMBERSHIP_TYPES } from '@constants';
import { updateUserActivity, pushRouteWithUTMQuery } from '@service';
import { api, findCourseTypeBySlug, findSlugByProductTypeId } from '@utils';
import { useGlobalAlertContext } from './GlobalAlertContext';
import { useGlobalAudioPlayerContext } from './GlobalAudioPlayerContext';
import { useGlobalVideoPlayerContext } from './GlobalVideoPlayerContext';
import { useRouter } from 'next/router';
import {
  PurchaseMembershipModal,
  RetreatPrerequisiteWarning,
} from '@components';

const MeditationContext = createContext(null);

// Rename the hook to match the pattern
export const useMeditationContext = () => {
  const context = useContext(MeditationContext);
  if (!context) {
    throw new Error(
      'useMeditationContext must be used within a MeditationProvider',
    );
  }
  return context;
};

export const MeditationProvider = ({ children }) => {
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();
  const router = useRouter();

  const handleDigitalMembershipPrompt = (subscription) => {
    const purchaseMembershipAction = () => {
      hideAlert();
      pushRouteWithUTMQuery(router, `/us-en/membership/${subscription.sfid}`);
    };
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      className: 'retreat-prerequisite-big meditation-digital-membership',
      title: 'Go deeper with the Digital Membership',
      footer: () => {
        return (
          <button
            className="btn-secondary v2"
            onClick={purchaseMembershipAction}
          >
            Join Digital Membership
          </button>
        );
      },
      children: <PurchaseMembershipModal modalSubscription={subscription} />,
    });
  };

  const handlePrerequisiteWarning = (message, productTypeId) => {
    const slug = findSlugByProductTypeId(productTypeId);
    const closeRetreatPrerequisiteWarning = () => {
      if (slug) {
        pushRouteWithUTMQuery(router, `/us-en/courses/${slug}`);
      }
      hideAlert();
    };
    const courseType = findCourseTypeBySlug(slug);
    showAlert(ALERT_TYPES.ERROR_ALERT, {
      children: (
        <RetreatPrerequisiteWarning
          warningPayload={message}
          btnText={courseType?.name}
          closeRetreatPrerequisiteWarning={closeRetreatPrerequisiteWarning}
        />
      ),
    });
  };

  const markFavorite = useCallback(
    async ({ meditate, refetch }) => {
      try {
        const data = {
          contentSfid: meditate.sfid,
          removeFavourite: meditate.isFavorite ? true : false,
        };

        await api.post({
          path: 'markFavourite',
          body: data,
        });

        // Show success message
        showAlert(ALERT_TYPES.SUCCESS_ALERT, {
          children: meditate.isFavorite
            ? 'Removed from favorites'
            : 'Added to favorites',
          autoClose: true,
        });

        // If refetch function is provided (for updating UI), call it
        if (refetch) {
          refetch({ refetchPage: (page, index) => index === 0 });
        }
      } catch (error) {
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: 'Failed to update favorite status. Please try again.',
          autoClose: true,
        });
        console.error('Error updating favorite status:', error);
      }
    },
    [showAlert],
  );

  const handleMeditationPlay = useCallback(
    async (meditate, subscriptionCategories) => {
      try {
        if (!meditate.accessible) {
          const allSubscriptions = subscriptionCategories?.reduce(
            (acc, curr) => ({ ...acc, [curr.sfid]: curr }),
            {},
          );

          if (allSubscriptions?.[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value]) {
            handleDigitalMembershipPrompt(
              allSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value],
            );
            return;
          }
        }

        const results = await api.get({
          path: 'meditationDetail',
          param: { id: meditate.sfid },
        });

        const {
          data,
          status,
          workshopPrerequisiteMessage = [],
          requiredPrerequisitWorkshopIds = [],
        } = results;

        if (status === 400) {
          handlePrerequisiteWarning(
            workshopPrerequisiteMessage.length > 0
              ? workshopPrerequisiteMessage[0]
              : null,
            requiredPrerequisitWorkshopIds.length > 0
              ? requiredPrerequisitWorkshopIds[0]
              : null,
          );
          return;
        }

        if (data) {
          const meditateDetails = { ...meditate, ...data };
          const trackData = {
            title: meditateDetails.title,
            artist: meditateDetails.teacher?.name,
            image: meditateDetails.coverImage?.url,
            audioSrc: meditateDetails.track?.url,
          };

          if (
            meditateDetails.contentType === 'Audio' ||
            meditateDetails.contentType === 'audio/x-m4a'
          ) {
            showPlayer({ track: trackData });
          } else if (meditateDetails.contentType === 'Video') {
            hidePlayer();
            showVideoPlayer({
              track: {
                ...trackData,
                description: meditateDetails.description,
              },
            });
          }

          await updateUserActivity({
            contentSfid: meditateDetails.sfid,
          });
        }
      } catch (ex) {
        const { message, statusCode } = ex.response?.data || {};
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: message ? `Error: ${message} (${statusCode})` : ex.message,
        });
      }
    },
    [
      handleDigitalMembershipPrompt,
      handlePrerequisiteWarning,
      showPlayer,
      hidePlayer,
      showVideoPlayer,
      showAlert,
      router,
    ],
  );

  const value = {
    handleMeditationPlay,
    markFavorite,
  };

  return (
    <MeditationContext.Provider value={value}>
      {children}
    </MeditationContext.Provider>
  );
};
