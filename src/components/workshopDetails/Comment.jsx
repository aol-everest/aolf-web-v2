import React, { useState } from "react";
import classNames from "classnames";

export const Comment = ({ children, shortText, fullText }) => {
  const [isHidden, setIsHidden] = useState(true);

  const showFull = () => {
    setIsHidden(!isHidden);
  };

  return (
    <>
      {children}
      <div className="comments__text">
        <p class={classNames("short", { "d-none": !isHidden })}>{shortText}</p>
        <p class={classNames("full", { "d-none": isHidden })}>{fullText}</p>
      </div>
      {fullText && (
        <button
          class={classNames("comments__link link", {
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
