import React, { useState, useEffect, useRef } from "react";
import { usePopper } from "react-popper";
import classNames from "classnames";

export const Popup = (props) => {
  const {
    buttonText,
    tabindex,
    children,
    value,
    containerClass = "",
    showId = false,
    parentClass = "",
    buttonTextClass = "",
    className,
  } = props;
  const [visible, setVisibility] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);
  const arrowRef = useRef(null);

  const { styles, attributes } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement: "bottom",
      modifiers: [
        {
          name: "arrow",
          enabled: true,
          options: {
            element: arrowRef.current,
          },
        },
        {
          name: "offset",
          enabled: true,
          options: {
            offset: [0, 10],
          },
        },
      ],
    },
  );
  useEffect(() => {
    // listen for clicks and close dropdown on body
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);
  function handleDropdownClick(event) {
    setVisibility(!visible);
  }

  function handleDocumentClick(event) {
    if (
      referenceRef.current.contains(event.target) ||
      popperRef.current.contains(event.target)
    ) {
      return;
    }
    setVisibility(false);
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
        className={classNames("btn_outline_box tooltip-button", parentClass, {
          "tooltip-button_active": visible,
          active: value != null,
        })}
        onClick={handleDropdownClick}
      >
        {value != null && (
          <div
            id="meetup-type"
            className="clear-filter active"
            onClick={closeHandler(null)}
          ></div>
        )}

        <a className={classNames("btn", buttonTextClass)}>{buttonText}</a>
      </div>

      <ul
        id={showId ? "time-tooltip" : ""}
        className={classNames("tooltip-block", containerClass, {
          active: visible,
        })}
        ref={popperRef}
        style={styles.popper}
        {...attributes.popper}
      >
        {visible &&
          children({
            props,
            closeHandler,
          })}
        <div
          ref={arrowRef}
          className="tooltip-arrow"
          style={styles.arrow}
        ></div>
      </ul>
    </>
  );
};
