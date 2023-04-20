import queryString from "query-string";
import { isObject, isString, isNil } from "lodash";
import { filterAllowedParams } from "@utils/utmParam";

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
