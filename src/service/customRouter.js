import { filterAllowedParams, removeNull } from "@utils/utmParam";
import { isNil, isObject, isString } from "lodash";
import queryString from "query-string";

export function pushRouteWithUTMQuery(router, params) {
  if (isNil(params)) {
    throw new Error("Route url missing");
  }
  if (isString(params)) {
    const { url, query = {} } = queryString.parseUrl(params);
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };

    router.push({
      pathname: url,
      query: allParams,
    });
  } else if (isObject(params)) {
    const { pathname, query = {} } = params;
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };
    const newQuery = removeNull(allParams);

    router.push({
      pathname: pathname,
      query: newQuery,
    });
  }
}

export function replaceRouteWithUTMQuery(router, params) {
  if (isNil(params)) {
    throw new Error("Route url missing");
  } else if (isString(params)) {
    const { url, query = {} } = queryString.parseUrl(params);
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };

    router.replace({
      pathname: url,
      query: allParams,
    });
  } else if (isObject(params)) {
    const { pathname, query = {} } = params;
    const filteredParams = filterAllowedParams(router.query);
    const allParams = {
      ...filteredParams,
      ...query,
    };

    const newQuery = removeNull(allParams);

    router.replace({
      pathname: pathname,
      query: newQuery,
    });
  }
}
