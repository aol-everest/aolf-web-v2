export default function gtmEcommercePlugin(userConfig = {}) {
  // return object for analytics to use

  return {
    /* All plugins require a name */
    name: 'gtm-ecommerce-plugin',
    /* Everything else below this is optional depending on your plugin requirements */
    config: { ...userConfig },
    initialize: ({ config }) => {
      if (typeof window.dataLayer !== 'undefined') {
        config.dataLayer = window.dataLayer;
      }
    },
    page: ({ payload }) => {},
    track: ({ payload, options, config }) => {
      if (typeof config.dataLayer !== 'undefined') {
        if (
          'gtm-ecommerce-plugin' in (payload.options.plugins || {}) &&
          payload.options.plugins['gtm-ecommerce-plugin']
        ) {
          const {
            anonymousId,
            userId,
            properties,
            options = {},
            event,
          } = payload;
          const formattedPayload = properties;
          if (userId) {
            formattedPayload.userId = userId;
          }
          if (anonymousId) {
            formattedPayload.anonymousId = anonymousId;
          }

          if (config.debug) {
            console.log('dataLayer push', {
              event,
              ...formattedPayload,
            });
          }
          config.dataLayer.push({ ecommerce: null }); // Clear the previous ecommerce object.
          config.dataLayer.push({
            event,
            ...formattedPayload,
          });
        }
      }
      // call provider specific event tracking
    },
    identify: ({ payload }) => {},
    loaded: () => {
      // return boolean so analytics knows when it can send data to third party
      return typeof window !== 'undefined' && !!window.dataLayer;
    },
  };
}
