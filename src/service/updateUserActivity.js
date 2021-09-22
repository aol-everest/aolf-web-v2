import { api } from "@utils";

export const updateUserActivity = async (
  token,
  { contentSfid, subContentSfid },
) => {
  const payLoad = {
    contentSfid,
    subContentSfid,
  };

  return await api.post({
    path: "updateUserActivity",
    body: payLoad,
    token,
  });
};
