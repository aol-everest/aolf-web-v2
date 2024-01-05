import classNames from 'classnames';
import { AddressSearch } from '..';

export const ScheduleLocationFilter = ({
  handleLocationChange,
  value = {},
  containerClass = '',
  listClassName = '',
}) => {
  const removeCoupon = (e) => {
    if (e) e.preventDefault();
    handleLocationChange(null);
  };

  const handleLocationFilterChange = (value) => () => {
    handleLocationChange(value);
  };

  const updatedValue = JSON.parse(value);

  return (
    <label className={classNames(`${containerClass}`, {})}>
      {updatedValue?.locationName ? (
        <span
          className={classNames('schedule-location-input scheduling-address')}
        >
          <span className={classNames('schedule-location-value')}>
            {updatedValue.locationName}
          </span>
          {updatedValue.locationName && (
            <a
              className={classNames('react-tag-remove')}
              onClick={removeCoupon}
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
    </label>
  );
};
