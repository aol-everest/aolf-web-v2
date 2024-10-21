import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { AddressSearch } from '..';

export const ScheduleLocationFilterNew = ({
  handleLocationChange,
  value = {},
  containerClass = '',
  listClassName = '',
  placeholder = 'Zip code or city',
  label = 'Enter a zip code or city',
}) => {
  const [isInputAllowed, setIsInputAllowed] = useState(true);

  useEffect(() => {
    setIsInputAllowed(!value);
  }, [value]);

  const removeLocation = (e) => {
    if (e) e.preventDefault();
    handleLocationChange(null);
  };

  const handleLocationFilterChange = (value) => () => {
    handleLocationChange(value);
  };

  return (
    <div className={classNames(`${containerClass} form-item`, {})}>
      <label>{label}</label>
      {!isInputAllowed ? (
        <span
          className={classNames('schedule-location-input scheduling-address')}
          onClick={removeLocation}
        >
          {value?.locationName && (
            <>
              <span className={classNames('schedule-location-value')}>
                {value.locationName}
              </span>

              <a
                className={classNames('react-tag-remove')}
                onClick={removeLocation}
              >
                ×
              </a>
            </>
          )}
        </span>
      ) : (
        <AddressSearch
          closeHandler={handleLocationFilterChange}
          placeholder={placeholder}
          parentClass="scheduling-address"
          listClassName={listClassName}
          value={value}
          isDefaultLocation
        />
      )}
    </div>
  );
};
