import React, { Fragment } from "react";
import { StyledInput } from "./StyledInput";
import { PhoneNumberInputField } from "./PhoneNumberInputField";
import { Field } from "formik";
import classNames from "classnames";

// const PhoneNumberInputField = ({ isMobile, field, form, ...props }) => {
//   console.log(field);
//   const onChangeAction = (value, data, event, formattedValue) => {
//     form.setFieldValue(field.name, formattedValue);
//   };
//   return (
//     <PhoneInput
//       {...field}
//       {...props}
//       placeholder="Phone No"
//       country="us"
//       inputClass={classNames({
//         validate: form.errors.contactPhone,
//         "w-100": isMobile,
//       })}
//       containerClass="input-block"
//       countryCodeEditable={false}
//       onChange={onChangeAction}
//     />
//   );
// };

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
      <Field
        name="contactPhone"
        type="tel"
        component={PhoneNumberInputField}
        tip={
          isHBCheckout
            ? "This number will be used to send reminder texts"
            : null
        }
      />
    </Fragment>
  );
};
