import { FieldWrapper } from "./FieldWrapper";
import React from "react";
import MaskedInput from "react-text-mask";
import classNames from "classnames";

const phoneNumberMask = [
  "(",
  /[1-9]/,
  /\d/,
  /\d/,
  ")",
  " ",
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

export const StyledInput = ({
  label,
  formikProps,
  formikKey,
  containerClass,
  isPhoneNumberMask = false,
  isReadOnly = false,
  textToUpperCase = false,
  disabled = false,
  tooltip,
  fullWidth,
  ...rest
}) => {
  const onChangeAction = () => {
    if (isReadOnly) {
      return null;
    }
    if (textToUpperCase) {
      return (evt) => {
        formikProps.setFieldValue(formikKey, evt.target.value.toUpperCase());
      };
    }
    return formikProps.handleChange(formikKey);
  };

  let showTooltip = false;

  const onFocusAction = () => {
    showTooltip = true;
  };

  const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      const intlCode = match[1] ? "+1 " : "";
      return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
    }
    return phoneNumberString;
  };

  return (
    <FieldWrapper
      label={label}
      formikKey={formikKey}
      formikProps={formikProps}
      containerClass={containerClass}
      fullWidth={fullWidth}
    >
      {!isReadOnly && isPhoneNumberMask && (
        <MaskedInput
          mask={phoneNumberMask}
          type="tel"
          id={formikKey}
          name={formikKey}
          onChange={onChangeAction()}
          onFocus={onFocusAction}
          onBlur={!isReadOnly ? formikProps.handleBlur(formikKey) : null}
          value={formikProps.values[formikKey]}
          className={
            formikProps.errors[formikKey] && formikProps.touched[formikKey]
              ? "text-input error"
              : "text-input"
          }
          {...rest}
        />
      )}
      {!isPhoneNumberMask && (
        <input
          type="text"
          id={formikKey}
          onChange={onChangeAction()}
          onFocus={onFocusAction}
          onBlur={!isReadOnly ? formikProps.handleBlur(formikKey) : null}
          value={formikProps.values[formikKey]}
          name={formikKey}
          disabled={disabled}
          {...rest}
        />
      )}
      {tooltip && (
        <div className={classNames("input-tooltip", { active: showTooltip })}>
          <div className="tooltip-arrow"></div>
          {tooltip}
        </div>
      )}
    </FieldWrapper>
  );
};
