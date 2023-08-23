import PhoneInput from "@components/phoneInputCmp";
import classNames from "classnames";

export const SchedulePhoneInput = ({
  children,
  label,
  fullWidth,
  containerClass = "",
  formikProps,
  formikKey,
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
      <PhoneInput
        {...rest}
        {...inputProps}
        placeholder="Phone No"
        country="us"
        inputClass={
          formikProps.errors?.contactPhone ? "text-input error" : "text-input"
        }
        containerClass="input-block"
        countryCodeEditable={true}
        onChange={onChangeAction}
        onFocus={onFocusAction}
        showSpecialLabel={false}
        showLabel={true}
        label={label}
      />

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
