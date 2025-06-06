import { filterAllowedParams, removeNull } from '@utils/utmParam';
import { isNil, isObject, isString } from 'lodash';
import queryString from 'query-string';

export function pushRouteWithUTMQuery(router, params) {
  if (isNil(params)) {
    throw new Error('Route url missing');
  }
  if (isString(params)) {
    const { url, query = {} } = queryString.parseUrl(params);
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };
    const filterNullQuery = removeNull(allParams);

    router.push({
      pathname: url,
      query: filterNullQuery,
    });
  } else if (isObject(params)) {
    const { pathname, query = {} } = params;
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };
    const filterNullQuery = removeNull(allParams);

    router.push({
      pathname: pathname,
      query: filterNullQuery,
    });
  }
}

export function replaceRouteWithUTMQuery(router, params) {
  if (isNil(params)) {
    throw new Error('Route url missing');
  } else if (isString(params)) {
    const { url, query = {} } = queryString.parseUrl(params);
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };
    const filterNullQuery = removeNull(allParams);

    router.replace({
      pathname: url,
      query: filterNullQuery,
    });
  } else if (isObject(params)) {
    const { pathname, query = {} } = params;
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };

    const filterNullQuery = removeNull(allParams);

    router.replace({
      pathname: pathname,
      query: filterNullQuery,
    });
  }
}

export function returnRouteWithUTMQuery(router, params) {
  if (isNil(params)) {
    throw new Error('Route url missing');
  }

  if (isString(params)) {
    const { url, query = {} } = queryString.parseUrl(params);
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };

    const filterNullQuery = removeNull(allParams);

    return `${url}?${queryString.stringify(filterNullQuery)}`;
  } else if (isObject(params)) {
    const { pathname, query = {} } = params;
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };

    const filterNullQuery = removeNull(allParams);

    return `${pathname}?${queryString.stringify(filterNullQuery)}`;
  }
}

export function iframeRouteWithUTMQuery(router, params) {
  if (isNil(params)) {
    throw new Error('Route url missing');
  } else if (isString(params)) {
    const { pathname, query = {} } = queryString.parseUrl(params);
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };

    const result = '?' + new URLSearchParams(allParams).toString();
    window.top.location.href =
      window.location.protocol +
      '//' +
      window.location.host +
      pathname +
      result;
  } else if (isObject(params)) {
    const { pathname, query = {} } = params;
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };

    const newQuery = removeNull(allParams);
    const result = '?' + new URLSearchParams(newQuery).toString();
    window.top.location.href =
      window.location.protocol +
      '//' +
      window.location.host +
      pathname +
      result;
  }
}
