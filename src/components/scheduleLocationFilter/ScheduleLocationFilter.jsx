import classNames from "classnames";
import { AddressSearch } from "..";

export const ScheduleLocationFilter = ({
  handleLocationChange,
  value = {},
  containerClass = "",
}) => {
  const removeCoupon = (e) => {
    if (e) e.preventDefault();
    handleLocationChange({});
  };

  const handleLocationFilterChange = (value) => () => {
    handleLocationChange(value);
  };

  return (
    <label className={classNames(`${containerClass}`, {})}>
      {value?.locationName ? (
        <span className={classNames("schedule-location-input")}>
          <span className={classNames("schedule-location-value")}>
            {value.locationName}
          </span>
          {value.locationName && (
            <a
              className={classNames("react-tag-remove")}
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
          value={value}
          isDefaultLocation
        />
      )}
    </label>
  );
};
