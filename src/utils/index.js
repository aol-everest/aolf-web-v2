export { api } from "./api";
export { tConvert } from "./tConvert";
export { priceCalculation } from "./priceCalculation";
export { Compose } from "./compose";

export const isSSR = !(
  typeof window !== "undefined" && window.document?.createElement
);

export const getRefElement = (element) => {
  if (element && "current" in element) {
    return element.current;
  }
  return element;
};

export const secondsToHms = (d) => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hrs, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " min, " : " mins, ") : "";
  const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  if (h > 0 || m > 0 || s > 0) {
    return hDisplay + mDisplay + sDisplay;
  } else {
    return "0 second";
  }
};
