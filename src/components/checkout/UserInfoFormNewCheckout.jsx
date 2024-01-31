import { Fragment } from 'react';
import {
  PhoneInputNewCheckout,
  StyledInputNewCheckout,
} from '@components/checkout';

export const UserInfoFormNewCheckout = ({
  formikProps,
  isHBCheckout = false,
  isLoggedUser = false,
}) => {
  return (
    <Fragment>
      <div className="col-12 col-lg-6 pb-3 px-2">
        <StyledInputNewCheckout
          className="form-item required"
          placeholder="First Name"
          formikProps={formikProps}
          formikKey="firstName"
          label="First Name"
        ></StyledInputNewCheckout>
      </div>

      <div className="col-12 col-lg-6 pb-3 px-2">
        <StyledInputNewCheckout
          className="form-item required"
          placeholder="Last Name"
          formikProps={formikProps}
          formikKey="lastName"
          label="Last Name"
        ></StyledInputNewCheckout>
      </div>

      <div className="col-12 col-lg-6 pb-3 px-2 ">
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
      </div>

      <div className="col-12 col-lg-6 pb-3 px-2 second">
        <PhoneInputNewCheckout
          className="form-item required"
          containerClass={`scheduling-modal__content-wrapper-form-list-row`}
          formikProps={formikProps}
          formikKey="contactPhone"
          name="contactPhone"
          label="Mobile Number"
          placeholder="Mobile Number"
          type="tel"
          tip={
            isHBCheckout
              ? 'This number will be used to send reminder texts'
              : null
          }
        ></PhoneInputNewCheckout>
      </div>
    </Fragment>
  );
};
