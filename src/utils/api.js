import Axios from 'axios';
import queryString from 'query-string';
import { Auth } from './auth';

class HTTPError extends Error {
  constructor(message, statusCode, stack = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HTTPError';
    this.stack = stack;
  }
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : 'http://localhost:3000';
const ORG_NAME = process.env.NEXT_PUBLIC_ORGANIZATION_NAME;

const axiosClient = Axios.create({
  baseURL: SERVER_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(async function (config) {
  try {
    if (!config.isUnauthorized) {
      const { session } = await Auth.getSession();
      const token = session.idToken.jwtToken;
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // No logged-in user: don't set auth header
  }
  return config;
});

function generateQueryString(params) {
  if (!params) return queryString.stringify({ org: ORG_NAME });
  return queryString.stringify({ ...params, org: ORG_NAME });
}

export const api = {
  async get(config) {
    const { param, path, ...rest } = config;
    const qs = generateQueryString(param);
    try {
      const result = await axiosClient.get(`${path}?${qs}`, rest);
      return result.data;
    } catch (error) {
      throw new HTTPError(
        error.response?.data?.message || error.message,
        error.response?.data?.statusCode || 500,
        error.response?.data?.stack,
      );
    }
  },

  async getFile(config) {
    const { param, path, ...rest } = config;
    const qs = generateQueryString(param);
    try {
      const result = await axiosClient.get(`${path}?${qs}`, {
        responseType: 'blob',
        ...rest,
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

  async post(config) {
    const { body, param, path, ...rest } = config;
    const qs = generateQueryString(param);
    try {
      const result = await axiosClient.post(`${path}?${qs}`, body, rest);
      return result.data;
    } catch (error) {
      throw new HTTPError(
        error.response?.data?.message || error.message,
        error.response?.data?.statusCode || 500,
        error.response?.data?.stack,
      );
    }
  },

  async postFormData(config) {
    const { body, param, path, ...rest } = config;
    const qs = generateQueryString(param);
    try {
      const result = await axiosClient.post(`${path}?${qs}`, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...rest,
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

  async put(config) {
    const { body, param, path, ...rest } = config;
    const qs = generateQueryString(param);
    try {
      const result = await axiosClient.put(`${path}?${qs}`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...rest,
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

  async delete(config) {
    const { param, path, ...rest } = config;
    const qs = generateQueryString(param);
    try {
      const result = await axiosClient.delete(`${path}?${qs}`, rest);
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
