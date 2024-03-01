export const config = {
  debug: false,
  containerId: null,
  dataLayerName: 'dataLayer',
  dataLayer: undefined,
  preview: undefined,
  auth: undefined,
  execution: 'async',
  // assumesPageview: true,
};

let initializedDataLayerName;

/**
 * Google tag manager plugin
 * @link https://getanalytics.io/plugins/google-tag-manager
 * @link https://developers.google.com/tag-manager/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.containerId - The Container ID uniquely identifies the GTM Container.
 * @param {string} [pluginConfig.dataLayerName=dataLayer] - The optional name for dataLayer-object. Defaults to dataLayer.
 * @param {string} [pluginConfig.customScriptSrc] - Load Google Tag Manager script from a custom source
 * @param {string} [pluginConfig.preview] - The preview-mode environment
 * @param {string} [pluginConfig.auth] - The preview-mode authentication credentials
 * @param {string} [pluginConfig.execution] - The script execution mode
 * @return {object} Analytics plugin
 * @example
 *
 * googleTagManager({
 *   containerId: 'GTM-123xyz'
 * })
 */
function googleTagManager(pluginConfig = {}) {
  // Allow for userland overides of base methods
  return {
    name: 'google-tag-manager',
    config: {
      ...config,
      ...pluginConfig,
    },
    initialize: ({ config }) => {
      const { containerId, dataLayerName, preview, auth } = config;
      if (!containerId) {
        throw new Error('No google tag manager containerId defined');
      }
      if (preview && !auth) {
        throw new Error(
          'When enabling preview mode, both preview and auth parameters must be defined',
        );
      }

      /* eslint-enable */
      initializedDataLayerName = dataLayerName;
      if (typeof window !== 'undefined') {
        config.dataLayer = window[dataLayerName];
      }
    },
    page: ({ payload, options, instance, config }) => {
      if (typeof config.dataLayer !== 'undefined') {
        config.dataLayer.push(payload.properties);
      }
    },
    track: ({ payload, options, config }) => {
      if (typeof config.dataLayer !== 'undefined') {
        const { anonymousId, userId, properties } = payload;
        const formattedPayload = properties;
        if (userId) {
          formattedPayload.userId = userId;
        }
        if (anonymousId) {
          formattedPayload.anonymousId = anonymousId;
        }
        if (!properties.category) {
          formattedPayload.category = 'All';
        }
        if (config.debug) {
          console.log('dataLayer push', {
            event: payload.event,
            ...formattedPayload,
          });
        }
        config.dataLayer.push({
          event: payload.event,
          ...formattedPayload,
        });
      }
    },
    loaded: () => {
      if (typeof window === 'undefined') {
        return false;
      }
      const hasDataLayer =
        !!initializedDataLayerName &&
        !!(
          window[initializedDataLayerName] &&
          Array.prototype.push !== window[initializedDataLayerName].push
        );
      return hasDataLayer;
    },
  };
}

export default googleTagManager;
