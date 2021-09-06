import React, { useState } from "react";
import classNames from "classnames";

export const SmartInput = ({
  dataList,
  containerClass = "smart-input",
  inputclassName = "",
  placeholder = "Search",
  closeHandler,
  onSearchKeyChange,
  value,
}) => {
  const [isHidden, setIsHidden] = useState(true);

  const handleChange = (event) => {
    if (onSearchKeyChange) {
      onSearchKeyChange(event.target.value);
    }
    if (event.target.value) {
      setIsHidden(false);
    }
  };

  const closeHandlerInner = (data) => (event) => {
    if (closeHandler) {
      onSearchKeyChange("");
      closeHandler(data)();
    }
    setIsHidden(true);
  };

  return (
    <div class={classNames(containerClass, { active: !isHidden })}>
      <input
        placeholder={placeholder}
        type="text"
        class={classNames("custom-input", inputclassName)}
        value={value}
        onChange={handleChange}
      />
      <div className="smart-input--list">
        {dataList &&
          dataList.map((data) => {
            return (
              <p
                key={data.value}
                className="smart-input--list-item"
                onClick={closeHandlerInner(data)}
              >
                {data.label}
              </p>
            );
          })}
      </div>
    </div>
  );
};

export default SmartInput;
