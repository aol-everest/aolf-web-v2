import queryString from "query-string";
import { isObject, isString, isNil } from "lodash";

export function pushRouteWithUTMQuery(router, params) {
  if (isNil(params)) {
    throw new Error("Route url missing");
  } else if (isString(params)) {
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

    router.push({
      pathname: pathname,
      query: allParams,
    });
  }
}

function getAllowedParams() {
  const allowedParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "mid",
    "gclid",
    "source",
  ];

  return allowedParams;
}

export function filterAllowedParams(params) {
  if (Object.keys(params).length) {
    const filteredParams = Object.keys(params)
      .filter((key) => getAllowedParams().includes(key.toLowerCase()))
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {});

    return filteredParams;
  }

  return params;
}
