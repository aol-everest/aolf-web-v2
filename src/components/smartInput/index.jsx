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
  const [searchKey, setSearchKey] = useState(value);

  const handleChange = (event) => {
    if (onSearchKeyChange) {
      onSearchKeyChange(event.target.value);
    }
    if (event.target.value) {
      setIsHidden(false);
    }
    setSearchKey(event.target.value);
  };

  const closeHandlerInner = (data) => (event) => {
    if (closeHandler) {
      setSearchKey(data.label);
      //onSearchKeyChange("");
      closeHandler(data)();
    }
    setIsHidden(true);
  };

  return (
    <div className={classNames(containerClass, { active: !isHidden })}>
      <input
        placeholder={placeholder}
        type="text"
        className={classNames("custom-input", inputclassName)}
        value={searchKey}
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
