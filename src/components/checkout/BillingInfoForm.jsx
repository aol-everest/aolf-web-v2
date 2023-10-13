import { US_STATES } from '@constants';
import classNames from 'classnames';
import { Fragment } from 'react';
import Style from './BillingInfoForm.module.scss';
import { Dropdown } from './Dropdown';
import { StyledInput } from './StyledInput';

export const BillingInfoForm = ({ formikProps }) => {
  return (
    <Fragment>
      <StyledInput
        containerClass={classNames(Style.address, 'tw-mt-0')}
        className={classNames(Style.address, 'tw-mt-0 !tw-w-full')}
        placeholder="Address"
        formikProps={formikProps}
        formikKey="contactAddress"
        fullWidth
      ></StyledInput>
      <StyledInput
        containerClass={classNames(Style.address, 'tw-mt-0')}
        className={classNames(Style.address, 'tw-mt-0 !tw-w-full')}
        placeholder="City"
        formikProps={formikProps}
        formikKey="contactCity"
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
