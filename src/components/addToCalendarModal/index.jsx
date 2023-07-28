import { SHARE_SITES } from "@constants";
import { buildShareUrl, isInternetExplorer } from "@utils";
import Style from "./AddToCalendarModal.module.scss";

export const AddToCalendarModal = ({ event }) => {
  const handleCalendarButtonClick = (e) => {
    if (e) e.preventDefault();
    const url = e.currentTarget.getAttribute("href");
    if (url.startsWith("BEGIN")) {
      const filename = "download.ics";
      const blob = new Blob([url], { type: "text/calendar;charset=utf-8" });

      if (isInternetExplorer()) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      window.open(url, "_blank");
    }
  };
  return (
    <>
      <p className="description text-center">
        {Object.values(SHARE_SITES).map((item) => (
          <a
            className={Style.addToCalendarLink}
            key={item}
            onClick={handleCalendarButtonClick}
            href={buildShareUrl(event, item)}
          >
            {item}
          </a>
        ))}
      </p>
    </>
  );
};
