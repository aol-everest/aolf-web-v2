import { FaRegEdit } from 'react-icons/fa';
import MaskedInput from 'react-text-mask';

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
  allowEmailEdit,
  editEmailAction,
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
        <>
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
          {formikProps.errors[formikKey] && (
            <div className="validation-input">
              {formikProps.errors[formikKey]}
            </div>
          )}
        </>
      )}
      {!isPhoneNumberMask && (
        <>
          <label htmlFor={formikKey}>{label}</label>
          <input
            type="text"
            className={
              formikProps.errors[formikKey] && formikProps.touched[formikKey]
                ? 'error'
                : ''
            }
            name={formikKey}
            value={formikProps.values[formikKey]}
            {...inputProps}
            {...rest}
          />
          {allowEmailEdit && (
            <a className="edit-icon" href="#" onClick={editEmailAction}>
              <FaRegEdit />
            </a>
          )}
          {formikProps.errors[formikKey] && (
            <div className="validation-input">
              {formikProps.errors[formikKey]}
            </div>
          )}
        </>
      )}
    </div>
  );
};
