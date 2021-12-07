const CLEVERTAP_ACCOUNT_ID = process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID;

export const Clevertap = {
  event: function (name, payload) {
    if (!CLEVERTAP_ACCOUNT_ID || !window.clevertap) {
      return null;
    }
    if (payload) {
      window.clevertap.event.push(name, payload);
    } else {
      window.clevertap.event.push(name);
    }
  },

  profile: function (payload) {
    if (!CLEVERTAP_ACCOUNT_ID || !window.clevertap) {
      return null;
    }
    window.clevertap.onUserLogin.push(payload);
  },

  logout: function () {
    if (!CLEVERTAP_ACCOUNT_ID || !window.clevertap) {
      return null;
    }
    window.clevertap.logout();
  },
};
