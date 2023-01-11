export const Talkable = {
  authenticate: function (payload) {
    window._talkableq = window._talkableq || [];
    window._talkableq.push(["authenticate_customer", payload]);
  },

  purchase: function (purchase, customer) {
    window._talkableq = window._talkableq || [];
    const _talkable_data = {
      purchase,
      customer,
    };
    window._talkableq.push(["register_purchase", _talkable_data]);
  },
};
