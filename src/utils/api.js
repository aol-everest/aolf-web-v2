import Axios from 'axios';
import queryString from 'query-string';
import { Auth } from './auth';
import { showGlobalAlert } from '@components/globalAlert';
import { ALERT_TYPES } from '@constants';

const API_CONFIG = {
  SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ORG_NAME: process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
  DEFAULT_HEADERS: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  REQUEST_TIMEOUT: 10000, // 10 seconds
};

const axiosClient = Axios.create({
  baseURL: API_CONFIG.SERVER_URL,
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
});

axiosClient.interceptors.request.use(async function (config) {
  try {
    if (!config.isUnauthorized) {
      const { accessToken } = await Auth.getSession();
      if (!accessToken) {
        throw new Error('No access token available');
      }
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  } catch (error) {
    console.warn('Auth error in request interceptor:', error);
    return config;
  }
});

const handleApiError = (error) => {
  console.log('error', error);
  if (!error.response) {
    showGlobalAlert(
      'Network error. Please check your internet connection.',
      ALERT_TYPES.WARNING_ALERT,
    );
    return Promise.reject(error);
  }

  const { status, data } = error.response;
  const errorMap = {
    // 400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please refresh the page to continue.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    429: 'Too many requests. Please try again later.',
    503: "We're experiencing higher than normal traffic. Please try again in a moment.",
  };

  if (errorMap[status]) {
    const message =
      errorMap[status] ||
      (data?.message ? data.message.split('(')[0].trim() : 'Unknown error');

    showGlobalAlert(message, ALERT_TYPES.WARNING_ALERT);
  }
  return Promise.reject(error);
};

// Add response interceptor for global error handling
axiosClient.interceptors.response.use((response) => response, handleApiError);

function generateQueryString(params) {
  if (!params) return queryString.stringify({ org: API_CONFIG.ORG_NAME });
  return queryString.stringify({ ...params, org: API_CONFIG.ORG_NAME });
}

export const api = {
  async withRetry(apiCall, maxRetries = API_CONFIG.MAX_RETRIES) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        if (
          attempt === maxRetries ||
          ![503, 429].includes(error.response?.status)
        ) {
          throw error;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt),
        );
      }
    }
  },

  async get(config) {
    const { param, path, signal, ...rest } = config;
    const qs = generateQueryString(param);
    const result = await this.withRetry(() =>
      axiosClient.get(`${path}?${qs}`, { signal, ...rest }),
    );
    return result.data;
  },

  async getFile(config) {
    const { param, path, signal, ...rest } = config;
    const qs = generateQueryString(param);
    const result = await this.withRetry(() =>
      axiosClient.get(`${path}?${qs}`, {
        responseType: 'blob',
        signal,
        ...rest,
      }),
    );
    return result.data;
  },

  async post(config) {
    const { body, param, path, signal, ...rest } = config;
    const qs = generateQueryString(param);
    const result = await this.withRetry(() =>
      axiosClient.post(`${path}?${qs}`, body, { signal, ...rest }),
    );
    return result.data;
  },

  async postFormData(config) {
    const { body, param, path, onProgress, signal, ...rest } = config;
    const qs = generateQueryString(param);
    const result = await axiosClient.post(`${path}?${qs}`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percentCompleted);
          }
        : undefined,
      signal,
      ...rest,
    });
    return result.data;
  },

  async put(config) {
    const { body, param, path, signal, ...rest } = config;
    const qs = generateQueryString(param);
    const result = await this.withRetry(() =>
      axiosClient.put(`${path}?${qs}`, body, {
        headers: { 'Content-Type': 'application/json' },
        signal,
        ...rest,
      }),
    );
    return result.data;
  },

  async delete(config) {
    const { param, path, signal, ...rest } = config;
    const qs = generateQueryString(param);
    const result = await this.withRetry(() =>
      axiosClient.delete(`${path}?${qs}`, { signal, ...rest }),
    );
    return result.data;
  },
};
