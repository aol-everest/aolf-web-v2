import { Fragment, useRef, useEffect } from 'react';
import {
  PhoneInputNewCheckout,
  StyledInputNewCheckout,
} from '@components/checkout';
import { US_STATES } from '@constants';
import { DropdownNewCheckout } from './DropdownNewCheckout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@utils';
import { ScheduleLocationFilterOnline } from '@components/scheduleLocationFilter/ScheduleLocationFilterOnline';

export const UserInfoFormNewCheckout = ({
  formikProps,
  isLoggedUser = false,
  showStreetAddress = true,
  showContactEmail = true,
  showLocationSearch = false,
  showContactState = true,
  showContactCity = true,
  showContactZip = true,
  isHBForm = false,
  handleLocationFilterChange,
  locationValue,
}) => {
  const inputRef = useRef(null);

  const { data: corporates = [] } = useQuery({
    queryKey: ['corporates'],
    queryFn: async () => {
      const response = await api.get({
        path: 'getCorporates',
      });
      return response;
    },
    enabled: isHBForm,
  });

  let corporateOptions = corporates?.map((corporate) => {
    return { value: corporate.sfid, label: corporate.corporateName };
  });

  if (corporateOptions) {
    corporateOptions = [
      ...corporateOptions,
      { value: 'other', label: 'Other' },
    ];
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Fragment>
      <div className="form-inputs checkout-fields">
        <StyledInputNewCheckout
          className="form-item required"
          placeholder="First Name"
          formikProps={formikProps}
          ref={inputRef}
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

        {showLocationSearch && (
          <ScheduleLocationFilterOnline
            handleLocationChange={handleLocationFilterChange}
            value={locationValue}
            containerClass="required fullw"
            listClassName="result-list"
            placeholder="Address"
            label="Address"
            formikProps={formikProps}
            formikKey="contactAddress"
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
      {isHBForm && (
        <div className="form-inputs checkout-fields">
          <h2 className="tw-w-full tw-text-2xl tw-mb-4 tw-line-height-10 tw-mt-3">
            Healthcare Information
          </h2>
          <StyledInputNewCheckout
            className="form-item required"
            placeholder="Title"
            formikProps={formikProps}
            formikKey="contactTitle"
            label="Title"
            fullWidth
          ></StyledInputNewCheckout>
          <StyledInputNewCheckout
            className="form-item required"
            placeholder="Degree/Qualifications"
            formikProps={formikProps}
            formikKey="contactDegree"
            label="Degree/Qualifications"
          ></StyledInputNewCheckout>
          <DropdownNewCheckout
            placeholder="Healthcare Organization"
            formikProps={formikProps}
            formikKey="contactHealthcareOrganisation"
            options={corporateOptions}
            containerClass="form-item required"
          ></DropdownNewCheckout>
          {formikProps.values.contactHealthcareOrganisation === 'other' && (
            <StyledInputNewCheckout
              className="form-item required"
              placeholder="Other Healthcare Organization Name"
              formikProps={formikProps}
              formikKey="contactOtherHealthcareOrganization"
              label="Other Healthcare Organization Name"
            ></StyledInputNewCheckout>
          )}
        </div>
      )}
    </Fragment>
  );
};
