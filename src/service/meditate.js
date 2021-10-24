import { api } from "@utils";
import { ALERT_TYPES, MEMBERSHIP_TYPES } from "@constants";
import {
  PurchaseMembershipModal,
  RetreatPrerequisiteWarning,
} from "@components";
import { updateUserActivity } from "@service";
export const markFavoriteEvent = async ({ meditate, refetch, token }) => {
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

export const meditatePlayEvent = async ({
  meditate,
  showAlert,
  showPlayer,
  hidePlayer,
  showVideoPlayer,
  subsciptionCategories,
  purchaseMembershipAction,
  token,
}) => {
  if (meditate.accessible) {
    try {
      const results = await api.get({
        path: "meditationDetail",
        param: { id: meditate.sfid },
        token,
      });
      const { data, status, workshopPrerequisiteMessage } = results;

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
        await updateUserActivity(token, {
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
    if (allSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value]) {
      showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        className: "retreat-prerequisite-big meditation-digital-membership",
        title: "Go deeper with the Digital Membership",
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
