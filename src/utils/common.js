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

  const hDisplay = h > 0 ? h + (h == 1 ? " hr " : " hrs ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " min " : " mins ") : "";
  const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  if (h > 0 || m > 0 || s > 0) {
    return hDisplay + mDisplay + sDisplay;
  } else {
    return "0 second";
  }
};

export const calculateBusinessDays = (d1, d2) => {
  const days = d2.diff(d1, "days") + 1;
  const result = { weekday: [], weekend: [] };
  let newDay = d1;
  for (let i = 0; i < days; i++) {
    const day = newDay.day();
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) {
      result.weekday = [...result.weekday, d1.format("ddd")];
    } else {
      result.weekend = [...result.weekend, d1.format("ddd")];
    }
    newDay = d1.add(1, "days");
  }

  result.weekday = Array.from(new Set(result.weekday));
  result.weekend = Array.from(new Set(result.weekend));
  if (result.weekday.length >= 2) {
    result.weekday = `(${result.weekday[0]} - ${
      result.weekday[result.weekday.length - 1]
    })`;
  } else if (result.weekday.length > 0) {
    result.weekday = `(${result.weekday.join(", ")})`;
  }
  return {
    weekday: result.weekday,
    weekend: result.weekend.length > 0 ? `(${result.weekend.join(", ")})` : "",
  };
};

export const stringToBoolean = (string) => {
  switch (string.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;

    case "false":
    case "no":
    case "0":
    case null:
      return false;

    default:
      return Boolean(string);
  }
};

export const isEmpty = (obj) => {
  if (typeof obj === "object" && obj != null) {
    return Object.keys(obj).length >= 1 ? false : true;
  }
  return true;
};
