import { RefObject } from "react";

export { api } from "./api";
export { tConvert } from "./tConvert";
export { priceCalculation } from "./priceCalculation";

export const isSSR = !(
  typeof window !== "undefined" && window.document?.createElement
);

export const getRefElement = (element) => {
  if (element && "current" in element) {
    return element.current;
  }
  return element;
};
