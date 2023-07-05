function getAllowedParams() {
  const allowedParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "source",
    "sscid",
  ];

  return allowedParams;
}

export function filterAllowedParams(params) {
  if (params && Object.keys(params).length) {
    const filteredParams = Object.keys(params)
      .filter((key) => getAllowedParams().includes(key.toLowerCase()))
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {});

    return filteredParams;
  }

  return params || {};
}
