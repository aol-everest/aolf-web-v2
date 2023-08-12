import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";

export const Popup = (props) => {
  const {
    buttonText,
    tabindex,
    children,
    value,
    containerClassName = "",
    showId = false,
    parentClassName = "",
    buttonTextclassName = "",
    isWorkshop = false,
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

  if (!isWorkshop) {
    return (
      <>
        <div
          ref={referenceRef}
          tabIndex={tabindex}
          className={classNames(
            "btn_outline_box tooltip-button",
            parentClassName,
            {
              "tooltip-button_active": visible,
              active: value != null,
            },
          )}
          onClick={handleDropdownClick}
        >
          {value != null && (
            <div
              id="meetup-type"
              className="clear-filter active"
              onClick={closeHandler(null)}
            ></div>
          )}

          <a className={classNames("btn", buttonTextclassName)}>{buttonText}</a>
        </div>

        <ul
          id={showId ? "time-tooltip" : ""}
          className={classNames("tooltip-block", containerClassName, {
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
  }

  return (
    <>
      <div
        class={[
          `courses-filter ${value ? "with-selected" : ""} ${
            visible ? "active" : ""
          }`,
        ]}
        data-filter="event-type"
      >
        <button
          class="courses-filter__remove"
          data-filter="event-type"
          onClick={closeHandler(null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M3.70033 2.87518C3.47252 2.64737 3.10318 2.64737 2.87537 2.87518C2.64756 3.10299 2.64756 3.47233 2.87537 3.70014L10.3 11.1248C10.5278 11.3526 10.8971 11.3526 11.1249 11.1248C11.3528 10.897 11.3528 10.5276 11.1249 10.2998L3.70033 2.87518Z"
              fill="white"
            />
            <path
              d="M11.1254 3.70014C11.3532 3.47234 11.3532 3.10299 11.1254 2.87519C10.8976 2.64738 10.5282 2.64738 10.3004 2.87519L2.87579 10.2998C2.64798 10.5276 2.64798 10.897 2.87579 11.1248C3.1036 11.3526 3.47294 11.3526 3.70075 11.1248L11.1254 3.70014Z"
              fill="white"
            />
          </svg>
        </button>

        <button
          class="courses-filter__button"
          ref={referenceRef}
          tabIndex={tabindex}
          data-filter="event-type"
          onClick={handleDropdownClick}
        >
          {buttonText}
        </button>

        <div class="courses-filter__wrapper-list">
          <ul
            className={classNames("courses-filter__list", containerClassName)}
            ref={popperRef}
            {...attributes.popper}
          >
            {visible &&
              children({
                props,
                closeHandler,
              })}
          </ul>
        </div>
      </div>
    </>
  );
};
