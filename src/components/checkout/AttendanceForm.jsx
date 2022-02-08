import React, { Fragment } from "react";
import { StyledInput } from "./StyledInput";
import { FieldWrapper } from "./FieldWrapper";
import { InputDropDown } from "./InputDropDown";
import classNames from "classnames";
import Style from "./AttendanceForm.module.scss";

export const AttendanceForm = ({ formikProps }) => {
  const onPopupChangeEvent = (formikProps, field) => (value) => {
    formikProps.setFieldValue(field, value?.name || "");
  };

  return (
    <Fragment>
      <div className="details mb-4 mt-5">
        <h2 className="details__title">CME/CNE & Attendance Form</h2>
      </div>
      <div className="order__card">
        <StyledInput
          class="mt-0"
          placeholder="Title"
          formikProps={formikProps}
          formikKey="contactTitle"
          fullWidth
        ></StyledInput>
        <StyledInput
          class="mt-lg-0"
          placeholder="Healthcare Organisation"
          formikProps={formikProps}
          formikKey="contactHealthcareOrganisation"
          fullWidth
        ></StyledInput>
        <StyledInput
          containerClass={classNames(Style.address, "mt-0")}
          class={classNames(Style.address)}
          placeholder="Degree/Qualifications"
          formikProps={formikProps}
          formikKey="contactDegree"
          fullWidth
        ></StyledInput>
        <div className="d-flex w-50 justify-content-start">
          <FieldWrapper formikKey={"claimingType"} formikProps={formikProps}>
            <InputDropDown
              placeholder="CE Claiming type"
              formikProps={formikProps}
              formikKey="claimingType"
              closeEvent={onPopupChangeEvent(formikProps, "claimingType")}
            >
              {({ closeHandler }) => (
                <>
                  <li
                    onClick={closeHandler({
                      name: "Physician - MD",
                      value: "Physician - MD",
                    })}
                  >
                    Physician - MD
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "Physician - DO",
                      value: "Physician - DO",
                    })}
                  >
                    Physician - DO
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "Nurse NP",
                      value: "Nurse NP",
                    })}
                  >
                    Nurse NP
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "Nurse RN",
                      value: "Nurse RN",
                    })}
                  >
                    Nurse RN
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "Nurse LPN",
                      value: "Nurse LPN",
                    })}
                  >
                    Nurse LPN
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "Nurse CNA",
                      value: "Nurse CNA",
                    })}
                  >
                    Nurse CNA
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "CME - PA",
                      value: "CME - PA",
                    })}
                  >
                    CME - PA
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "Dentists",
                      value: "Dentists",
                    })}
                  >
                    Dentists
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "Other",
                      value: "Other",
                    })}
                  >
                    Other
                  </li>
                </>
              )}
            </InputDropDown>
          </FieldWrapper>
        </div>
        {formikProps.values["claimingType"] === "Other" && (
          <StyledInput
            placeholder="Specify details (Other)"
            formikProps={formikProps}
            formikKey="contactClaimingTypeOther"
            fullWidth
          ></StyledInput>
        )}
        <div className="d-flex justify-content-start mt-lg-0">
          <FieldWrapper
            formikKey={"certificateOfAttendance"}
            formikProps={formikProps}
          >
            <InputDropDown
              placeholder="I would like to get the following"
              formikProps={formikProps}
              formikKey="certificateOfAttendance"
              closeEvent={onPopupChangeEvent(
                formikProps,
                "certificateOfAttendance",
              )}
            >
              {({ closeHandler }) => (
                <>
                  <li
                    onClick={closeHandler({
                      name: "CE Credits",
                      value: "CE Credits",
                    })}
                  >
                    CE Credits
                  </li>
                  <li
                    onClick={closeHandler({
                      name: "Certificate of Attendance",
                      value: "Certificate of Attendance",
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
