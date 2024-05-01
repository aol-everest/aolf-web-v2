import classNames from 'classnames';
export const FieldWrapper = ({
  children,
  label,
  formikProps,
  formikKey,
  fullWidth,
  containerClass = '',
}) => (
  <div
    className={classNames(`input-block ${containerClass}`, {
      error: formikProps.errors[formikKey] && formikProps.touched[formikKey],
      'validate-error':
        formikProps.errors[formikKey] && formikProps.touched[formikKey],
    })}
  >
    {children}
    {formikProps.errors[formikKey] && (
      <div className="validation-input">{formikProps.errors[formikKey]}</div>
    )}
  </div>
);
