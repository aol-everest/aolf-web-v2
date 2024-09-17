import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { AddressSearch } from '..';

export const ScheduleLocationFilterNew = ({
  handleLocationChange,
  value = {},
  containerClass = '',
  listClassName = '',
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
    <div className="form-item">
      <label className={classNames(`${containerClass}`, {})}>
        Enter a zip code or city
      </label>
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
          placeholder="Zip code or city"
          parentClass="scheduling-address"
          listClassName={listClassName}
          value={value}
          isDefaultLocation
        />
      )}
    </div>
  );
};
