import Axios from "axios";
import queryString from "query-string";
import { Auth } from "./auth";

class HTTPError extends Error {
  constructor(message, statusCode, stack = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HTTPError";
    this.stack = stack;
  }
}

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
    Auth.getSession()
      .then(({ session }) => {
        const token = session.idToken.jwtToken;
        config.headers.Authorization = "Bearer " + token;
        resolve(config);
      })
      .catch(() => {
        // No logged-in user: don't set auth header
        resolve(config);
      });
  });
});

export const api = {
  get: async (config) => {
    const param = config.param
      ? { ...config.param, org: process.env.NEXT_PUBLIC_ORGANIZATION_NAME }
      : null;
    const qs = param ? queryString.stringify(param) : "";
    try {
      const result = await axiosClient.get(
        SERVER_URL + config.path + "?" + qs,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        },
      );
      return result.data;
    } catch (error) {
      throw new HTTPError(
        error.response?.data?.message || error.message,
        error.response?.data?.statusCode || 500,
        error.response?.data?.stack,
      );
    }
  },

  getFile: async (config) => {
    const qs = queryString.stringify({
      org: process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
    });
    try {
      const result = await axiosClient.get(
        SERVER_URL + config.path + "?" + qs,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
          responseType: "blob",
        },
      );
      return result.data;
    } catch (error) {
      throw new HTTPError(
        error.response?.data?.message || error.message,
        error.response?.data?.statusCode || 500,
        error.response?.data?.stack,
      );
    }
  },

  post: async (config) => {
    const qs = queryString.stringify({
      org: process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
    });
    try {
      const result = await axiosClient.post(
        SERVER_URL + config.path + "?" + qs,
        config.body,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        },
      );
      return result.data;
    } catch (error) {
      throw new HTTPError(
        error.response?.data?.message || error.message,
        error.response?.data?.statusCode || 500,
        error.response?.data?.stack,
      );
    }
  },

  postFormData: async (config) => {
    const qs = queryString.stringify({
      org: process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
    });
    try {
      const result = await axiosClient.post(
        SERVER_URL + config.path + "?" + qs,
        config.body,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return result.data;
    } catch (error) {
      throw new HTTPError(
        error.response?.data?.message || error.message,
        error.response?.data?.statusCode || 500,
        error.response?.data?.stack,
      );
    }
  },

  put: async (config) => {
    try {
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
    } catch (error) {
      throw new HTTPError(
        error.response?.data?.message || error.message,
        error.response?.data?.statusCode || 500,
        error.response?.data?.stack,
      );
    }
  },

  delete: async (config) => {
    try {
      const result = await axiosClient.delete(SERVER_URL + config.path, {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      });
      return result.data;
    } catch (error) {
      throw new HTTPError(
        error.response?.data?.message || error.message,
        error.response?.data?.statusCode || 500,
        error.response?.data?.stack,
      );
    }
  },
};
