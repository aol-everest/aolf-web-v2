import React from 'react';
import classNames from 'classnames';
import { AddressSearchSchedulingOnline } from '@components/addressSearchSchedulingOnline';

export const ScheduleLocationFilterOnline = ({
  handleLocationChange,
  value = {},
  containerClass = '',
  listClassName = '',
  placeholder = 'Zip code or city',
  label = 'Enter a zip code or city',
  showOnlyRegions,
  formikProps,
  formikKey,
}) => {
  const handleLocationFilterChange = (value) => () => {
    handleLocationChange(value);
  };

  return (
    <div className={classNames(`${containerClass} form-item`, {})}>
      <label>{label}</label>
      <AddressSearchSchedulingOnline
        closeHandler={handleLocationFilterChange}
        placeholder={placeholder}
        parentClass="scheduling-address"
        listClassName={listClassName}
        value={value}
        showOnlyRegions={showOnlyRegions}
        formikProps={formikProps}
        formikKey={formikKey}
      />
    </div>
  );
};
