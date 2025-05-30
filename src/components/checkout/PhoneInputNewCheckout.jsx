import PhoneInput from '@components/phoneInputCmp';

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
  placeholder = 'Phone No',
  className,
  showLabel = true,
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
      <label htmlFor="phone">{label}</label>

      <PhoneInput
        {...rest}
        {...inputProps}
        placeholder={placeholder}
        defaultCountry="us"
        smartCaret={true}
        country="us"
        inputClass={formikProps.errors?.contactPhone ? 'error' : ''}
        value={formikProps.values.contactPhone}
        containerClass="input-block"
        countryCodeEditable={true}
        international={true}
        showLabel={showLabel}
        showSpecialLabel={false}
      />

      {formikProps.errors[formikKey] && (
        <div className="validation-input">{formikProps.errors[formikKey]}</div>
      )}
    </div>
  );
};
