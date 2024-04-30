import classNames from 'classnames';
import { Field } from 'formik';
import Style from './Dropdown.module.scss';
import { FieldWrapper } from './FieldWrapper';

export const DropdownNewCheckout = ({
  label,
  formikProps,
  formikKey,
  containerClass,
  options,
  fullWidth,
  placeholder,
  innerFullWidth = false,
  ...rest
}) => {
  return (
    <FieldWrapper
      label={label}
      formikKey={formikKey}
      formikProps={formikProps}
      containerClass={containerClass}
      fullWidth={fullWidth}
    >
      <label>{placeholder}</label>
      <div
        className={classNames('select-box state-dropdown', {
          'order__card__payment-select': !innerFullWidth,
          error:
            formikProps.errors[formikKey] && formikProps.touched[formikKey],
        })}
      >
        <div tabIndex="1" className="select-box__current">
          {options.map((option) => {
            return (
              <div key={option.value}>
                <Field
                  className="select-box__input"
                  type="radio"
                  id={`${formikKey}${option.value}`}
                  name={formikKey}
                  checked={formikProps.values[formikKey] === option.value}
                  value={option.value}
                  placeholder={placeholder}
                />
                <span className="select-box__input-text">{option.label}</span>
              </div>
            );
          })}
        </div>
        <ul
          className={classNames(
            'select-box__list drop-list',
            Style.select_box_list,
          )}
        >
          {options.map((option) => {
            return (
              <li key={option.value}>
                <label
                  htmlFor={`${formikKey}${option.value}`}
                  aria-hidden="aria-hidden"
                  data-value="card"
                  className="select-box__option"
                >
                  <span>{option.label}</span>
                  <img
                    src="/img/ic-tick-blue-lg.svg"
                    alt="Option selected"
                    style={{
                      display:
                        formikProps.values[formikKey] === option.value
                          ? 'block'
                          : 'none',
                    }}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </FieldWrapper>
  );
};
