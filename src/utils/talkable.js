export const Talkable = {
  authenticate: function (payload) {
    if (!window._talkableq) {
      return null;
    }
    window._talkableq.push(["authenticate_customer", payload]);
  },

  purchase: function (purchase, customer) {
    if (!window._talkableq) {
      return null;
    }
    const _talkable_data = {
      purchase,
      customer,
    };
    window._talkableq.push(["register_purchase", _talkable_data]);
  },
};
