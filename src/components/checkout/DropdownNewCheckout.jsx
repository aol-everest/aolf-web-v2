import classNames from 'classnames';
import { Field } from 'formik';
import Style from './Dropdown.module.scss';
import { FieldWrapper } from './FieldWrapper';
import Select from 'react-select';

const dot = (color = 'transparent') => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

const SelectField = ({ options, field, form, placeholder }) => (
  <Select
    options={options}
    name={field.name}
    value={
      options ? options.find((option) => option.value === field.value) : ''
    }
    onChange={(option) =>
      form.setFieldValue(field.name, option ? option.value : '')
    }
    onBlur={field.onBlur}
    className="react-select-container"
    classNamePrefix="react-select"
    placeholder={placeholder}
    isSearchable
    isClearable
  />
);

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
      <Field
        name={formikKey}
        component={SelectField}
        options={options}
        placeholder={placeholder}
      />
    </FieldWrapper>
  );
};
