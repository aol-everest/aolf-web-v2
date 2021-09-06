import React, { Fragment } from "react";
import { Field, ErrorMessage } from "formik";
import classNames from "classnames";
import { StyledInput } from "./StyledInput";
import { Dropdown } from "./Dropdown";
import { US_STATES } from "@constants";
import Style from "./BillingInfoForm.module.scss";

export const BillingInfoForm = ({ formikProps }) => {
  return (
    <Fragment>
      <StyledInput
        containerClass={classNames(Style.address, "mt-0")}
        className={classNames(Style.address, "mt-0")}
        style={{ width: "100%" }}
        placeholder="Address"
        formikProps={formikProps}
        formikKey="contactAddress"
        fullWidth
      ></StyledInput>
      <Dropdown
        formikProps={formikProps}
        formikKey="contactState"
        options={US_STATES}
      ></Dropdown>
      <StyledInput
        class="zip"
        placeholder="Zip"
        formikProps={formikProps}
        formikKey="contactZip"
      ></StyledInput>
    </Fragment>
  );
};
