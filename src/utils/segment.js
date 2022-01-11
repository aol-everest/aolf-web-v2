const ANALYTICS_WRITE_KEY = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY;

export const Segment = {
  event: function (name, payload) {
    if (!ANALYTICS_WRITE_KEY) {
      return null;
    }
    window.analytics.track(name, payload);
  },

  profile: function (id, payload) {
    if (!ANALYTICS_WRITE_KEY) {
      return null;
    }
    window.analytics.identify(id, payload);
  },

  logout: function () {
    if (!ANALYTICS_WRITE_KEY || !window.analytics || !window.analytics.reset) {
      return null;
    }
    window.analytics.reset();
  },
};
