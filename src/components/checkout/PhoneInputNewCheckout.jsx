import PhoneInput from '@components/phoneInputCmp';
import classNames from 'classnames';

export const PhoneInputNewCheckout = ({
  children,
  label,
  fullWidth,
  containerClass = '',
  formikProps,
  formikKey,
  isReadOnly = false,
  textToUpperCase = false,
  tooltip,
  tip,
  placeholder,
  className,
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
    <div className={className}>
      <label for="phone"></label>
      <PhoneInput
        placeholder="Phone No"
        country="us"
        inputClass={
          formikProps.errors?.contactPhone
            ? 'text-input text-input-error'
            : 'text-input'
        }
        containerClass="input-block"
        countryCodeEditable={true}
        showSpecialLabel={false}
        showLabel={true}
        smartCaret={true}
        international={true}
        value={formikProps.values.contactPhone}
        {...rest}
        {...inputProps}
      />

      {tooltip && (
        <div className={classNames('input-tooltip', { active: showTooltip })}>
          <div className="tooltip-arrow"></div>
          {tooltip}
        </div>
      )}
      {tip && <p className="agreement__text !tw-ml-0 tw-w-[249px]">{tip}</p>}
    </div>
  );
};
