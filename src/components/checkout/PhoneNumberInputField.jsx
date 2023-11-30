import classNames from 'classnames';
import PhoneInput from './../phoneInputCmp';
import { FieldWrapper } from './FieldWrapper';

export const PhoneNumberInputField = ({
  label,
  field,
  form,
  meta,
  tooltip,
  tip,
  ...props
}) => {
  const onChangeAction = (value, data, event, formattedValue) => {
    form.setFieldValue(field.name, formattedValue);
    form.setFieldTouched(field.name, true);
  };

  let showTooltip = false;

  const onFocusAction = () => {
    showTooltip = true;
  };

  return (
    <FieldWrapper label={label} formikKey={field.name} formikProps={form}>
      <PhoneInput
        {...field}
        {...props}
        placeholder="Phone No"
        defaultCountry="us"
        smartCaret={true}
        country="us"
        inputClass={form.errors[field.name] ? 'text-input error' : 'text-input'}
        containerClass="input-block"
        countryCodeEditable={true}
        international={true}
        onChange={onChangeAction}
        onFocus={onFocusAction}
      />
      {tooltip && (
        <div className={classNames('input-tooltip', { active: showTooltip })}>
          <div className="tooltip-arrow"></div>
          {tooltip}
        </div>
      )}
      {tip && <p className="agreement__text !tw-ml-0 tw-w-[249px]">{tip}</p>}
    </FieldWrapper>
  );
};
