import Router from "next/router";
import NProgress from "nprogress";
import { useGlobalLoadingContext } from "@contexts";
import "nprogress/nprogress.css";

let timer;
let state;
// let activeRequests = 0;
const delay = 250;

let loader = {};

function load() {
  if (state === "loading") {
    return;
  }

  state = "loading";
  if (loader.showLoader) {
    loader.showLoader();
  }

  timer = setTimeout(function () {
    NProgress.start();
  }, delay); // only show progress bar if it takes longer than the delay
}

function stop() {
  // if (activeRequests > 0) {
  //   return;
  // }

  state = "stop";

  clearTimeout(timer);
  if (loader.hideLoader) {
    loader.hideLoader();
  }
  NProgress.done();
}

Router.events.on("routeChangeStart", load);
Router.events.on("routeChangeComplete", (url) => {
  window.analytics.page(url);
  stop();
});
Router.events.on("routeChangeError", stop);

NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 800,
  showSpinner: false,
});

// const originalFetch = window.fetch;
// window.fetch = async function (...args) {
//   if (activeRequests === 0) {
//     load();
//   }

//   activeRequests++;

//   try {
//     const response = await originalFetch(...args);
//     return response;
//   } catch (error) {
//     return Promise.reject(error);
//   } finally {
//     activeRequests -= 1;
//     if (activeRequests === 0) {
//       stop();
//     }
//   }
// };

export default function _() {
  const { showLoader, hideLoader } = useGlobalLoadingContext();
  loader = { showLoader, hideLoader };
  return null;
}
