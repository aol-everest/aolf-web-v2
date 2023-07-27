import classNames from "classnames";
import { useState } from "react";

export const Comment = ({ children, shortText, fullText }) => {
  const [isHidden, setIsHidden] = useState(true);

  const showFull = () => {
    setIsHidden(!isHidden);
  };

  return (
    <>
      {children}
      <div className="comments__text">
        <p className={classNames("short", { "d-none": !isHidden })}>
          {shortText}
        </p>
        <p className={classNames("full", { "d-none": isHidden })}>{fullText}</p>
      </div>
      {fullText && (
        <button
          className={classNames("comments__link link", {
            "d-none": !isHidden,
          })}
          onClick={showFull}
        >
          Read more
        </button>
      )}
    </>
  );
};
