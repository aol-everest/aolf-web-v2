import React, { Fragment } from "react";
import classNames from "classnames";
import { StyledInput } from "./StyledInput";
import { Dropdown } from "./Dropdown";
import { US_STATES } from "@constants";
import Style from "./BillingInfoForm.module.scss";

export const BillingInfoForm = ({ formikProps }) => {
  return (
    <Fragment>
      <StyledInput
        containerClass={classNames(Style.address, "tw-mt-0")}
        className={classNames(Style.address, "tw-mt-0 !tw-w-full")}
        placeholder="Address"
        formikProps={formikProps}
        formikKey="contactAddress"
        fullWidth
      ></StyledInput>
      <Dropdown
        placeholder="State"
        formikProps={formikProps}
        formikKey="contactState"
        options={US_STATES}
      ></Dropdown>
      <StyledInput
        className="zip"
        placeholder="Zip"
        formikProps={formikProps}
        formikKey="contactZip"
      ></StyledInput>
    </Fragment>
  );
};
