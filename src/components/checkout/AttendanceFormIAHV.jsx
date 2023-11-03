import classNames from 'classnames';
import { Fragment } from 'react';
import Style from './AttendanceForm.module.scss';
import { StyledInput } from './StyledInput';
import { Dropdown } from './Dropdown';

export const AttendanceFormIAHV = ({ formikProps, corporates }) => {
  let corporateOptions = corporates?.map((corporate) => {
    return { value: corporate.sfid, label: corporate.corporateName };
  });

  if (corporateOptions) {
    corporateOptions = [
      ...corporateOptions,
      { value: 'other', label: 'Other' },
    ];
  }

  return (
    <Fragment>
      <Dropdown
        placeholder="University Affiliation"
        formikProps={formikProps}
        formikKey="contactHealthcareOrganisation"
        options={corporateOptions || []}
      ></Dropdown>
      {formikProps.values.contactHealthcareOrganisation === 'other' && (
        <StyledInput
          containerClass={classNames(Style.address, 'mt-0')}
          className={classNames(Style.address)}
          placeholder="University Affiliation Name"
          formikProps={formikProps}
          formikKey="contactOtherHealthcareOrganization"
          fullWidth
        ></StyledInput>
      )}
    </Fragment>
  );
};
