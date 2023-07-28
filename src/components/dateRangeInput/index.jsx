import classNames from "classnames";
import { useRef, useState } from "react";

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
        className={classNames({
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
        <div className="tw-relative" ref={popperRef}>
          <ul
            className={classNames(
              "tooltip-block tw-bottom-auto tw-left-0 tw-right-auto tw-top-0 tw-p-0",
              containerClass,
              {
                active: visible,
              },
            )}
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
