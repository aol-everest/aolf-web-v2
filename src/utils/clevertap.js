const CLEVERTAP_ACCOUNT_ID = process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID;

export const Clevertap = {
  initialize: function () {
    if (!CLEVERTAP_ACCOUNT_ID || window.clevertap) {
      return null;
    }
    window.clevertap = {
      event: [],
      profile: [],
      account: [],
      onUserLogin: [],
      notifications: [],
    };
    window.clevertap.account.push({ id: CLEVERTAP_ACCOUNT_ID });
    (function () {
      var wzrk = document.createElement("script");
      wzrk.type = "text/javascript";
      wzrk.async = true;
      wzrk.src =
        ("https:" == document.location.protocol
          ? "https://d2r1yp2w7bby2u.cloudfront.net"
          : "http://static.clevertap.com") + "/js/a.js";
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(wzrk, s);
    })();
  },

  event: function (name, payload) {
    if (!CLEVERTAP_ACCOUNT_ID) {
      return null;
    }
    if (payload) {
      window.clevertap.event.push(name, payload);
    } else {
      window.clevertap.event.push(name);
    }
  },

  profile: function (payload) {
    if (!CLEVERTAP_ACCOUNT_ID) {
      return null;
    }
    window.clevertap.onUserLogin.push(payload);
  },

  logout: function () {
    if (
      !CLEVERTAP_ACCOUNT_ID ||
      !window.clevertap ||
      !window.clevertap.logout
    ) {
      return null;
    }
    window.clevertap.logout();
  },
};
