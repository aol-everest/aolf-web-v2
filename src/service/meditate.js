import { api } from "@utils";
import { ALERT_TYPES } from "@constants";
import { RetreatPrerequisiteWarning } from "@components";
import { updateUserActivity } from "@service";
export const markFavoriteEvent = async ({ meditate, refetch }) => {
  try {
    const data = {
      contentSfid: meditate.sfid,
      removeFavourite: meditate.isFavorite ? true : false,
    };
    await api.post({
      path: "markFavourite",
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
  showVideoPlayer,
}) => {
  try {
    const results = await api.get({
      path: "meditationDetail",
      param: { id: meditate.sfid },
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
      await updateUserActivity({
        contentSfid: meditateDetails.sfid,
      });
    }
  } catch (error) {
    console.log(error);
    showAlert(ALERT_TYPES.ERROR_ALERT, {
      children: error.message,
    });
  }
};
