import Axios from "axios";
import queryString from "query-string";

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
