import { Fragment } from 'react';
import {
  PhoneInputNewCheckout,
  StyledInputNewCheckout,
} from '@components/checkout';
import { US_STATES } from '@constants';
import { DropdownNewCheckout } from './DropdownNewCheckout';
import { ScheduleLocationFilterNew } from '@components/scheduleLocationFilter/ScheduleLocationFilterNew';

export const UserInfoFormNewCheckout = ({
  formikProps,
  isLoggedUser = false,
  showStreetAddress = true,
  showContactEmail = true,
  showLocationSearch = false,
  showContactState = true,
  showContactCity = true,
  showContactZip = true,
  handleLocationFilterChange,
  locationFilter,
}) => {
  return (
    <Fragment>
      <div className="form-inputs checkout-fields">
        <StyledInputNewCheckout
          className="form-item required"
          placeholder="First Name"
          formikProps={formikProps}
          formikKey="firstName"
          label="First Name"
        ></StyledInputNewCheckout>

        <StyledInputNewCheckout
          className="form-item required"
          placeholder="Last Name"
          formikProps={formikProps}
          formikKey="lastName"
          label="Last Name"
        ></StyledInputNewCheckout>

        {showLocationSearch && !locationFilter && (
          <ScheduleLocationFilterNew
            handleLocationChange={handleLocationFilterChange}
            value={locationFilter}
            containerClass="required fullw"
            listClassName="result-list"
            placeholder="Address"
            label="Address"
            showOnlyRegions={false}
          />
        )}

        {showStreetAddress && (
          <StyledInputNewCheckout
            className="form-item required fullw"
            placeholder="Street Address"
            formikProps={formikProps}
            formikKey="contactAddress"
            label="Street Address"
          ></StyledInputNewCheckout>
        )}

        {showContactCity && (
          <StyledInputNewCheckout
            className="form-item required fullw"
            placeholder="City"
            formikProps={formikProps}
            formikKey="contactCity"
            label="City"
          ></StyledInputNewCheckout>
        )}

        {showContactState && (
          <DropdownNewCheckout
            placeholder="State"
            formikProps={formikProps}
            formikKey="contactState"
            options={US_STATES}
            containerClass="form-item required"
          ></DropdownNewCheckout>
        )}

        {showContactZip && (
          <StyledInputNewCheckout
            className="form-item required"
            placeholder="Zip"
            formikProps={formikProps}
            formikKey="contactZip"
            label="Zip"
          ></StyledInputNewCheckout>
        )}

        {showContactEmail && (
          <StyledInputNewCheckout
            type="email"
            label="Email Address"
            className="form-item required"
            placeholder="Email"
            formikProps={formikProps}
            formikKey="email"
            isReadOnly={isLoggedUser}
            onCut={(event) => {
              event.preventDefault();
            }}
            onCopy={(event) => {
              event.preventDefault();
            }}
            onPaste={(event) => {
              event.preventDefault();
            }}
          ></StyledInputNewCheckout>
        )}

        <PhoneInputNewCheckout
          label="Mobile Number"
          className="second form-item required fullw"
          containerClass={`scheduling-modal__content-wrapper-form-list-row`}
          formikProps={formikProps}
          formikKey="contactPhone"
          name="contactPhone"
          placeholder="Mobile Number"
          type="tel"
        ></PhoneInputNewCheckout>
      </div>
    </Fragment>
  );
};
