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
  showLabel = true,
  ...rest
}) => {
  console.log('showLabel', showLabel);
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
        placeholder="Phone No"
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
