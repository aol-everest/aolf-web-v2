function getAllowedParams() {
  const allowedParams = [
    'adid',
    'ad_id',
    'adname',
    'ad_name',
    'adgroupid',
    'ad_group_id',
    'adsetid',
    'adset_id',
    'adsetname',
    'adset_name',
    'cpid',
    'campaignid',
    'campaign_id',
    'keyword',
    'placement',
    'site_source',
    'targetid',
    'utm_adgroup',
    'campaign_name',
    'utmcampaign',
    'utm_campaign',
    'utmcontent',
    'utm_content',
    'utmdevice',
    'utm_device',
    'utmlandingpage',
    'utm_landingpage',
    'utmmedium',
    'utm_medium',
    'utmsource',
    'utm_source',
    'utmterm',
    'utm_term',
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

export function removeNull(obj) {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) => {
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === 'string'
        ) {
          // If it's an array of strings, use the first element as the value
          return [key, value[0]];
        } else if (value !== null && String(value).trim() !== '') {
          // If it's not null or an empty string, or an array of strings, keep the value
          return [key, value];
        }
        // Otherwise, skip this key-value pair
        return null;
      })
      .filter((pair) => pair !== null),
  );
}
