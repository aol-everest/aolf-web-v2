import classNames from 'classnames';
import { Field } from 'formik';
import { Fragment } from 'react';
import Select from 'react-select';
import Style from './AttendanceForm.module.scss';
import { FieldWrapper } from './FieldWrapper';
import { InputDropDown } from './InputDropDown';
import { StyledInput } from './StyledInput';

export const AttendanceForm = ({ formikProps, corporates }) => {
  const onPopupChangeEvent = (formikProps, field) => (value) => {
    formikProps.setFieldValue(field, value?.name || '');
  };

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
      <div className="details mb-4 mt-5">
        <h2 className="details__title">Additional Details</h2>
      </div>
      {/* <p className="tw-my-5 tw-ml-2 tw-text-[14px] tw-text-[#31364e]">
        Please note, to claim CE credits, your name on the Healing Breaths’ SKY
        program registration should exactly match your name on your professional
        license for which you seek CE credits.
      </p> */}
      <div className="order__card">
        <StyledInput
          className="mt-0 mb-3"
          placeholder="Title"
          formikProps={formikProps}
          formikKey="contactTitle"
          fullWidth
        ></StyledInput>
        <Field name="contactHealthcareOrganisation" className="form-control">
          {({ field }) => (
            <FieldWrapper
              formikKey={'contactHealthcareOrganisation'}
              formikProps={formikProps}
              fullWidth
            >
              <Select
                options={corporateOptions || []}
                className="d-flex justify-content-start mt-lg-0"
                styles={{
                  control: (styles) => ({
                    ...styles,
                    flex: 1,
                    justifyContent: 'start',
                    width: '250px',
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
                placeholder="Healthcare Organization"
                isSearchable
                isClearable
              />
            </FieldWrapper>
          )}
        </Field>
        {formikProps.values.contactHealthcareOrganisation === 'other' && (
          <StyledInput
            containerClass={classNames(Style.address, 'mt-0')}
            className={classNames(Style.address)}
            placeholder="Other Healthcare Organization Name"
            formikProps={formikProps}
            formikKey="contactOtherHealthcareOrganization"
            fullWidth
          ></StyledInput>
        )}
        <StyledInput
          containerClass={classNames(Style.address, 'mt-0')}
          className={classNames(Style.address)}
          placeholder="Degree/Qualifications"
          formikProps={formikProps}
          formikKey="contactDegree"
          fullWidth
        ></StyledInput>
      </div>
    </Fragment>
  );
};
