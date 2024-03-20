import classNames from 'classnames';
import { AddressSearch } from '..';

export const ScheduleLocationFilterNew = ({
  handleLocationChange,
  value = {},
  containerClass = '',
  listClassName = '',
}) => {
  const removeLocation = (e) => {
    if (e) e.preventDefault();
    handleLocationChange(null);
  };

  const handleLocationFilterChange = (value) => () => {
    handleLocationChange(value);
  };

  return (
    <>
      <label className={classNames(`${containerClass}`, {})}>
        Enter a zip code or city
      </label>
      {value?.locationName ? (
        <span
          className={classNames('schedule-location-input scheduling-address')}
        >
          <span className={classNames('schedule-location-value')}>
            {value.locationName}
          </span>
          {value.locationName && (
            <a
              className={classNames('react-tag-remove')}
              onClick={removeLocation}
            >
              ×
            </a>
          )}
        </span>
      ) : (
        <AddressSearch
          closeHandler={handleLocationFilterChange}
          placeholder="Filter by zip code or city"
          parentClass="scheduling-address"
          listClassName={listClassName}
          value={value}
          isDefaultLocation
        />
      )}
    </>
  );
};
