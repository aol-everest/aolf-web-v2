import Axios from "axios";
import queryString from "query-string";
import { Auth } from "aws-amplify";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : "http://localhost:3000";

const axiosClient = Axios.create({
  baseURL: SERVER_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(function (config) {
  return new Promise((resolve, reject) => {
    Auth.currentSession()
      .then((session) => {
        const idTokenExpire = session.getIdToken().getExpiration();
        const refreshToken = session.getRefreshToken();
        const currentTimeSeconds = Math.round(+new Date() / 1000);
        if (idTokenExpire < currentTimeSeconds) {
          Auth.currentAuthenticatedUser().then((res) => {
            res.refreshSession(refreshToken, (err, data) => {
              if (err) {
                Auth.signOut();
              } else {
                config.headers.Authorization =
                  "Bearer " + data.getIdToken().getJwtToken();
                resolve(config);
              }
            });
          });
        } else {
          config.headers.Authorization =
            "Bearer " + session.getIdToken().getJwtToken();
          resolve(config);
        }
      })
      .catch(() => {
        // No logged-in user: don't set auth header
        resolve(config);
      });
  });
});

export const api = {
  get: async (config) => {
    const qs = config.param ? queryString.stringify(config.param) : "";

    const result = await axiosClient.get(SERVER_URL + config.path + "?" + qs, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
    return result.data;
  },

  getFile: async (config) => {
    const result = await axiosClient.get(SERVER_URL + config.path, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      responseType: "blob",
    });
    return result.data;
  },

  post: async (config) => {
    const result = await axiosClient.post(
      SERVER_URL + config.path,
      config.body,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      },
    );
    return result.data;
  },

  postFormData: async (config) => {
    const result = await axiosClient.post(
      SERVER_URL + config.path,
      config.body,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return result.data;
  },

  put: async (config) => {
    const result = await axiosClient.put(
      SERVER_URL + config.path,
      config.body,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return result.data;
  },

  delete: async (config) => {
    const result = await axiosClient.delete(SERVER_URL + config.path, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
    return result.data;
  },
};
