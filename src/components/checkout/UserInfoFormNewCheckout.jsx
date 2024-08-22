import { Fragment } from 'react';
import {
  PhoneInputNewCheckout,
  StyledInputNewCheckout,
} from '@components/checkout';
import { US_STATES } from '@constants';
import { DropdownNewCheckout } from './DropdownNewCheckout';

export const UserInfoFormNewCheckout = ({
  formikProps,
  isLoggedUser = false,
  showStreetAddress = true,
}) => {
  return (
    <Fragment>
      <div className="form-inputs">
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

        {showStreetAddress && (
          <StyledInputNewCheckout
            className="form-item required"
            placeholder="Street Address"
            formikProps={formikProps}
            formikKey="contactAddress"
            label="Street Address"
          ></StyledInputNewCheckout>
        )}

        <DropdownNewCheckout
          placeholder="State"
          formikProps={formikProps}
          formikKey="contactState"
          options={US_STATES}
          containerClass="form-item required"
        ></DropdownNewCheckout>

        <StyledInputNewCheckout
          className="form-item required"
          placeholder="City"
          formikProps={formikProps}
          formikKey="contactCity"
          label="City"
        ></StyledInputNewCheckout>

        <StyledInputNewCheckout
          className="form-item required"
          placeholder="Zip"
          formikProps={formikProps}
          formikKey="contactZip"
          label="Zip"
        ></StyledInputNewCheckout>

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

        <PhoneInputNewCheckout
          label="Mobile Number"
          className="second form-item required"
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
