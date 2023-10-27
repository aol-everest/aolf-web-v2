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
        <h2 className="details__title">
          CME/CNE Certificate of attendance form
        </h2>
      </div>
      <p className="tw-my-5 tw-ml-2 tw-text-[14px] tw-text-[#31364e]">
        Please note, to claim CE credits, your name on the Healing Breaths’ SKY
        program registration should exactly match your name on your professional
        license for which you seek CE credits.
      </p>
      <div className="order__card">
        <StyledInput
          className="mt-0"
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
        <div className="d-flex w-50 justify-content-start">
          <FieldWrapper formikKey={'claimingType'} formikProps={formikProps}>
            <InputDropDown
              placeholder="CE Claiming type"
              formikProps={formikProps}
              formikKey="claimingType"
              closeEvent={onPopupChangeEvent(formikProps, 'claimingType')}
            >
              {({ closeHandler }) => (
                <>
                  <li
                    onClick={closeHandler({
                      name: 'Physician - MD',
                      value: 'Physician - MD',
                    })}
                  >
                    Physician - MD
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Physician - DO',
                      value: 'Physician - DO',
                    })}
                  >
                    Physician - DO
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Physician Assistant',
                      value: 'Physician Assistant',
                    })}
                  >
                    Physician Assistant
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Physical Therapist',
                      value: 'Physical Therapist',
                    })}
                  >
                    Physical Therapist
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Nurse',
                      value: 'Nurse',
                    })}
                  >
                    Nurse
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Dentist',
                      value: 'Dentist',
                    })}
                  >
                    Dentist
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Other',
                      value: 'Other',
                    })}
                  >
                    Other
                  </li>
                </>
              )}
            </InputDropDown>
          </FieldWrapper>
        </div>
        {formikProps.values['claimingType'] === 'Other' && (
          <StyledInput
            placeholder="Specify details (Other)"
            formikProps={formikProps}
            formikKey="contactClaimingTypeOther"
            fullWidth
          ></StyledInput>
        )}
        <div className="d-flex justify-content-start mt-lg-0">
          <FieldWrapper
            formikKey={'certificateOfAttendance'}
            formikProps={formikProps}
          >
            <InputDropDown
              placeholder="I would like to get the following"
              formikProps={formikProps}
              formikKey="certificateOfAttendance"
              closeEvent={onPopupChangeEvent(
                formikProps,
                'certificateOfAttendance',
              )}
            >
              {({ closeHandler }) => (
                <>
                  <li
                    onClick={closeHandler({
                      name: 'CE Credits',
                      value: 'CE Credits',
                    })}
                  >
                    CE Credits
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Certificate of Attendance',
                      value: 'Certificate of Attendance',
                    })}
                  >
                    Certificate of Attendance
                  </li>
                </>
              )}
            </InputDropDown>
          </FieldWrapper>
        </div>
      </div>
    </Fragment>
  );
};
