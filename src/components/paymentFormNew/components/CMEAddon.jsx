import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  DropdownNewCheckout,
  StyledInputNewCheckout,
} from '@components/checkout';

// TODO: Add CME Addon component it will be formik field component allow user to select cme addon by checkbox and if selected user also need to provide extra infromation

const CLAIMING_TYPES = [
  { label: 'Physician - MD', value: 'Physician - MD' },
  { label: 'Physician - DO', value: 'Physician - DO' },
  { label: 'Physician Assistant', value: 'Physician Assistant' },
  { label: 'Physical Therapist', value: 'Physical Therapist' },
  { label: 'Nurse', value: 'Nurse' },
  { label: 'Other', value: 'Other' },
];

const CERTIFICATE_OF_ATTENDANCE = [
  { label: 'CE Credits', value: 'CE Credits' },
  { label: 'Certificate of Attendance', value: 'Certificate of Attendance' },
];

export const CMEAddon = ({ formikProps }) => {
  const { values, errors, touched } = formikProps;

  return (
    <>
      <DropdownNewCheckout
        containerClass="form-item required"
        placeholder="CE Claiming type"
        formikProps={formikProps}
        formikKey="claimingType"
        options={CLAIMING_TYPES}
        required
      />

      {values.claimingType === 'Other' && (
        <StyledInputNewCheckout
          className="form-item required"
          placeholder="Specify details (Other)"
          formikProps={formikProps}
          formikKey="contactClaimingTypeOther"
          label="Specify details (Other)"
        ></StyledInputNewCheckout>
      )}

      <DropdownNewCheckout
        containerClass="form-item required"
        placeholder="I would like to get the following"
        formikProps={formikProps}
        formikKey="certificateOfAttendance"
        options={CERTIFICATE_OF_ATTENDANCE}
        required
      />

      <Field name="cmeAgreeToShareData">
        {({ field, meta }) => (
          <div className="form-item checkbox">
            <input
              type="checkbox"
              id="cmeAgreeToShareData"
              className={classNames('', {
                error: meta.touched && meta.error,
              })}
              {...field}
              checked={field.value}
            />
            <label htmlFor="cmeAgreeToShareData">
              I allow Healing Breaths to share my data with the ACCME for the
              purposes of reporting credit
            </label>

            {errors.cmeAgreeToShareData && touched.cmeAgreeToShareData && (
              <div className="agreement__important agreement__important_desktop">
                <img
                  className="agreement__important-icon"
                  src="/img/warning.svg"
                  alt="warning"
                />
                <span>{errors.cmeAgreeToShareData}</span>
              </div>
            )}
          </div>
        )}
      </Field>
    </>
  );
};

CMEAddon.propTypes = {
  formikProps: PropTypes.shape({
    values: PropTypes.shape({
      CME: PropTypes.bool,
      claimingType: PropTypes.string,
      contactClaimingTypeOther: PropTypes.string,
      certificateOfAttendance: PropTypes.string,
      cmeAgreeToShareData: PropTypes.bool,
    }).isRequired,
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
};

export default CMEAddon;
