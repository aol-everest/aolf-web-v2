export default function clevertapPlugin(userConfig) {
  // return object for analytics to use

  return {
    /* All plugins require a name */
    name: "clevertap-plugin",
    /* Everything else below this is optional depending on your plugin requirements */
    config: {},
    initialize: ({ config }) => {
      // not required
    },
    page: ({ payload }) => {
      window.clevertap.event.push(payload.type, payload.properties);
      // call provider specific page tracking
    },
    track: ({ payload }) => {
      console.log(payload);
      window.clevertap.event.push(payload.event, payload.properties);
      // call provider specific event tracking
    },
    identify: ({ payload }) => {
      // call provider specific user identify method
      window.clevertap.onUserLogin.push({
        Site: {
          ...payload.traits,
          Identity: payload.traits.sfid,
          Name: `${payload.traits.first_name} ${payload.traits.last_name}`, // String
          Email: payload.traits.email,
        },
      });
    },
    loaded: () => {
      // return boolean so analytics knows when it can send data to third party
      return typeof window !== "undefined" && !!window.clevertap;
    },
  };
}
