import classNames from 'classnames';
import MaskedInput from 'react-text-mask';
import { FieldWrapper } from './FieldWrapper';

const phoneNumberMask = [
  '(',
  /[1-9]/,
  /\d/,
  /\d/,
  ')',
  ' ',
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

export const StyledInputNewCheckout = ({
  label,
  formikProps,
  formikKey,
  containerClass,
  isPhoneNumberMask = false,
  isReadOnly = false,
  textToUpperCase = false,
  tooltip,
  tip,
  fullWidth,
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
      {!isReadOnly && isPhoneNumberMask && (
        <MaskedInput
          mask={phoneNumberMask}
          type="tel"
          name={formikKey}
          value={formikProps.values[formikKey]}
          {...inputProps}
          className={
            formikProps.errors[formikKey] && formikProps.touched[formikKey]
              ? 'text-input error'
              : 'text-input'
          }
          {...rest}
        />
      )}
      {!isPhoneNumberMask && (
        <>
          <label for={formikKey}>{label}</label>
          <input
            type="text"
            name={formikKey}
            value={formikProps.values[formikKey]}
            {...inputProps}
            {...rest}
          />
        </>
      )}
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
