import classNames from "classnames";
import MaskedInput from "react-text-mask";

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

export const ScheduleInput = ({
  children,
  label,
  fullWidth,
  containerClass = "",
  formikProps,
  formikKey,
  isPhoneNumberMask = false,
  isReadOnly = false,
  textToUpperCase = false,
  tooltip,
  tip,
  placeholder,
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

  let inputProps = {
    disabled: true,
  };

  if (!isReadOnly) {
    inputProps = {
      onChange: onChangeAction(),
      onFocus: onFocusAction,
      onBlur: formikProps.handleBlur(formikKey),
    };
  }

  return (
    <li
      className={classNames(`${containerClass}`, {
        error: formikProps.errors[formikKey] && formikProps.touched[formikKey],
        "validate-error":
          formikProps.errors[formikKey] && formikProps.touched[formikKey],
      })}
    >
      {!isReadOnly && isPhoneNumberMask && (
        <MaskedInput
          mask={phoneNumberMask}
          type="tel"
          name={formikKey}
          value={formikProps.values[formikKey]}
          {...inputProps}
          className={
            formikProps.errors[formikKey] && formikProps.touched[formikKey]
              ? "text-input error"
              : "text-input"
          }
          {...rest}
        />
      )}
      {!isPhoneNumberMask && (
        <>
          <input
            className={
              formikProps.errors[formikKey] && formikProps.touched[formikKey]
                ? "text-input text-input-error"
                : "text-input"
            }
            type="text"
            id={formikKey}
            value={formikProps.values[formikKey]}
            name={formikKey}
            placeholder={placeholder}
            {...inputProps}
            {...rest}
          />
          <label className="label-placeholder-style required">{label}</label>
        </>
      )}
      {tooltip && (
        <div className={classNames("input-tooltip", { active: showTooltip })}>
          <div className="tooltip-arrow"></div>
          {tooltip}
        </div>
      )}
      {tip && <p className="agreement__text !tw-ml-0 tw-w-[249px]">{tip}</p>}
    </li>
  );
};
