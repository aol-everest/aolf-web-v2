import {
  PurchaseMembershipModal,
  RetreatPrerequisiteWarning,
} from '@components';
import { ALERT_TYPES, MEMBERSHIP_TYPES } from '@constants';
import { updateUserActivity } from '@service';
import { api } from '@utils';
export const markFavoriteEvent = async ({ meditate, refetch }) => {
  try {
    const data = {
      contentSfid: meditate.sfid,
      removeFavourite: meditate.isFavorite ? true : false,
    };
    await api.post({
      path: 'markFavourite',
      body: data,
    });
    if (refetch) refetch({ refetchPage: (page, index) => index === 0 });
  } catch (error) {
    console.log(error);
  }
};

export const meditatePlayEvent = async ({
  meditate,
  showAlert,
  showPlayer,
  hidePlayer,
  subsciptionCategories,
  showVideoPlayer,
  purchaseMembershipAction,
}) => {
  try {
    if (!meditate.accessible) {
      const allSubscriptions = subsciptionCategories?.reduce(
        (accumulator, currentValue) => {
          return {
            ...accumulator,
            [currentValue.sfid]: currentValue,
          };
        },
        {},
      );
      if (
        allSubscriptions &&
        allSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value]
      ) {
        showAlert(ALERT_TYPES.CUSTOM_ALERT, {
          className: 'retreat-prerequisite-big meditation-digital-membership',
          title: 'Go deeper with the Digital Membership',
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
    } else {
      const results = await api.get({
        path: 'meditationDetail',
        param: { id: meditate.sfid },
      });
      const { data, status, workshopPrerequisiteMessage = [] } = results;

      if (status === 400) {
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: (
            <RetreatPrerequisiteWarning
              warningPayload={
                workshopPrerequisiteMessage.length > 0
                  ? workshopPrerequisiteMessage[0]
                  : null
              }
            />
          ),
        });
      }

      if (data) {
        const meditateDetails = { ...meditate, ...data };
        if (
          meditateDetails.contentType === 'Audio' ||
          meditateDetails.contentType === 'audio/x-m4a'
        ) {
          showPlayer({
            track: {
              title: meditateDetails.title,
              artist: meditateDetails.teacher?.name,
              image: meditateDetails.coverImage?.url,
              audioSrc: meditateDetails.track?.url,
            },
          });
        } else if (meditateDetails.contentType === 'Video') {
          hidePlayer();
          showVideoPlayer({
            track: {
              title: meditateDetails.title,
              artist: meditateDetails.teacher?.name,
              image: meditateDetails.coverImage?.url,
              audioSrc: meditateDetails.track?.url,
              description: meditateDetails.description,
            },
          });
        }
        await updateUserActivity({
          contentSfid: meditateDetails.sfid,
        });
      }
    }
  } catch (ex) {
    const data = ex.response?.data;
    const { message, statusCode } = data || {};
    showAlert(ALERT_TYPES.ERROR_ALERT, {
      children: message ? `Error: ${message} (${statusCode})` : ex.message,
    });
  }
};
