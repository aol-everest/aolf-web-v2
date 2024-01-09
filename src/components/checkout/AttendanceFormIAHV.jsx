import classNames from 'classnames';
import { Fragment } from 'react';
import Style from './AttendanceForm.module.scss';
import { StyledInput } from './StyledInput';
import Select from 'react-select';
import { Field } from 'formik';
import { FieldWrapper } from './FieldWrapper';

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
  const { setFieldValue } = formikProps;

  return (
    <Fragment>
      <Field name="contactHealthcareOrganisation" className="form-control">
        {({ field }) => (
          <FieldWrapper
            formikKey={'contactHealthcareOrganisation'}
            formikProps={formikProps}
            fullWidth
          >
            <Select
              options={corporateOptions || []}
              className="d-flex justify-content-start mt-lg-8"
              styles={{
                control: (styles) => ({
                  ...styles,
                  flex: 1,
                  justifyContent: 'start',
                  width: '250px',
                  borderWidth: 'unset',
                  borderBottom: '1px solid #e9e9e9',
                  borderTop: 0,
                  borderLeft: 0,
                  borderRight: 0,
                  borderRadius: 0,
                  marginTop: 20,
                  boxShadow: 'none',
                }),
                placeholder: (styles) => ({
                  ...styles,
                  color: '#9699A7',
                }),
              }}
              {...field}
              value={
                corporateOptions
                  ? corporateOptions.find(
                      (option) => option.value === field.value,
                    )
                  : ''
              }
              onChange={(option) => {
                if (option) {
                  setFieldValue(field.name, option.value);
                } else {
                  setFieldValue(field.name, '');
                }
              }}
              placeholder="University Affiliation"
            />
          </FieldWrapper>
        )}
      </Field>

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
