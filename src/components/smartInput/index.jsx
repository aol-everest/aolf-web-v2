import classNames from 'classnames';
import { useEffect, useState } from 'react';

export const SmartInput = ({
  dataList,
  containerClass = 'smart-input',
  inputClassName = '',
  placeholder = 'Search',
  closeHandler,
  onSearchKeyChange,
  value,
}) => {
  const [isHidden, setIsHidden] = useState(true);
  const [searchKey, setSearchKey] = useState(value);

  useEffect(() => {
    if (value !== searchKey) {
      setSearchKey(value);
    }
  }, [value]);

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
      if (onSearchKeyChange) {
        onSearchKeyChange(data.label);
      }

      closeHandler(data)();
    }
    setIsHidden(true);
  };

  return (
    <div className={classNames(containerClass, { active: !isHidden })}>
      <input
        placeholder={placeholder}
        type="text"
        className={classNames('custom-input', inputClassName)}
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
