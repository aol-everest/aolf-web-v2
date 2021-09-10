import React, { Fragment } from "react";
import { Field, ErrorMessage } from "formik";
import { StyledInput } from "./StyledInput";

export const UserInfoForm = ({ formikProps }) => {
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
        placeholder="Phone No"
        isPhoneNumberMask
        maxLength="16"
        type="tel"
        formikProps={formikProps}
        formikKey="contactPhone"
      ></StyledInput>
    </Fragment>
  );
};
