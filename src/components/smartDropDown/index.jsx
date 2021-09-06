import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
export const SmartDropDown = (props) => {
  const { buttonText, children, value, containerClass = "" } = props;
  const [visible, setVisibility] = useState(false);

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
    <div className="dropdown">
      <button
        className="custom-dropdown"
        type="button"
        id="dropdownCourseButton"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        onClick={handleDropdownClick}
      >
        {buttonText}
      </button>
      <ul className={classNames("dropdown-menu", { show: visible })}>
        {visible &&
          children({
            props,
            closeHandler,
          })}
      </ul>
    </div>
  );
};
