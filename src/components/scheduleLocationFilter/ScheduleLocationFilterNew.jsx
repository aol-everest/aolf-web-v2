import classNames from 'classnames';
import { AddressSearch } from '..';
import { useState } from 'react';

export const ScheduleLocationFilterNew = ({
  handleLocationChange,
  value = {},
  containerClass = '',
  listClassName = '',
}) => {
  const [isInputAllowed, setIsInputAllowed] = useState(true);

  const removeLocation = (e) => {
    if (e) e.preventDefault();
    handleLocationChange(null);
    setIsInputAllowed(true);
  };

  const handleLocationFilterChange = (value) => () => {
    console.log('value', value);
    handleLocationChange(value);
    setIsInputAllowed(false);
  };

  const handleAddressClick = () => {
    if (!isInputAllowed) {
      setIsInputAllowed(true);
    }
  };

  return (
    <div className="form-item">
      <label className={classNames(`${containerClass}`, {})}>
        Enter a zip code or city
      </label>
      {!isInputAllowed ? (
        <span
          className={classNames('schedule-location-input scheduling-address')}
          onClick={handleAddressClick}
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
