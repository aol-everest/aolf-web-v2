import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";

export const DateRangeInput = (props) => {
  const { buttonText, tabindex, children, value, containerClass = "" } = props;
  const [visible, setVisibility] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);
  const arrowRef = useRef(null);

  function handleDropdownClick(event) {
    setVisibility(!visible);
  }

  function closeHandler(value) {
    return function () {
      if (props.closeEvent) {
        props.closeEvent(value);
      }
      setVisibility(false);
    };
  }

  return (
    <>
      <div
        ref={referenceRef}
        tabIndex={tabindex}
        class={classNames({
          "tooltip-button_active": visible,
        })}
      >
        <input
          className="custom-input"
          type="text"
          id="datepicker-input"
          value={buttonText}
          onClick={handleDropdownClick}
          readOnly
        />
        <div style={{ position: "relative" }} ref={popperRef}>
          <ul
            class={classNames("tooltip-block", containerClass, {
              active: visible,
            })}
            style={{
              padding: 8,

              left: 0,
              top: 0,
              right: "auto",
              bottom: "auto",
            }}
          >
            {visible &&
              children({
                props,
                closeHandler,
              })}
            <div ref={arrowRef} className="tooltip-arrow"></div>
          </ul>
        </div>
      </div>
    </>
  );
};
