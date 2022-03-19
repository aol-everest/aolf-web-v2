import React, { Fragment } from "react";
import { StyledInput } from "./StyledInput";

export const UserInfoForm = ({ formikProps, isHBCheckout = false }) => {
  return (
    <Fragment>
      <StyledInput
        className="mt-0"
        placeholder="First name"
        formikProps={formikProps}
        formikKey="firstName"
        tooltip="Enter given name"
      ></StyledInput>
      <StyledInput
        className="mt-lg-0"
        placeholder="Last name"
        formikProps={formikProps}
        formikKey="lastName"
      ></StyledInput>
      <StyledInput
        type="email"
        placeholder="Email"
        formikProps={formikProps}
        formikKey="email"
        isReadOnly={true}
        onCut={(event) => {
          event.preventDefault();
        }}
        onCopy={(event) => {
          event.preventDefault();
        }}
        onPaste={(event) => {
          event.preventDefault();
        }}
      ></StyledInput>
      <StyledInput
        isPhoneNumberMask
        placeholder="Phone No"
        maxLength="16"
        type="tel"
        formikProps={formikProps}
        formikKey="contactPhone"
        tip={
          isHBCheckout
            ? "This number will be used to send reminder texts"
            : null
        }
      ></StyledInput>
    </Fragment>
  );
};
