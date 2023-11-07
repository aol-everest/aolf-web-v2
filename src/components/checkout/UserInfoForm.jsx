import { Field } from 'formik';
import { Fragment } from 'react';
import { PhoneNumberInputField } from './PhoneNumberInputField';
import { StyledInput } from './StyledInput';

export const UserInfoForm = ({
  formikProps,
  isHBCheckout = false,
  isLoggedUser = false,
}) => {
  return (
    <Fragment>
      <StyledInput
        className="mt-0"
        placeholder="First name"
        formikProps={formikProps}
        formikKey="firstName"
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
      ></StyledInput>
      <Field
        name="contactPhone"
        type="tel"
        component={PhoneNumberInputField}
        tip={
          isHBCheckout
            ? 'This number will be used to send reminder texts'
            : null
        }
      />
    </Fragment>
  );
};
