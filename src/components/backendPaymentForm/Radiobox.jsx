import { Field } from 'formik';

export function Radiobox({
  name,
  dtype,
  group,
  action,
  label,
  value,
  ...rest
}) {
  const id = `toggle_${Math.random().toString().replace(/0\./, '')}`;
  return (
    <Field name={name}>
      {({ field, form }) => {
        switch (dtype) {
          case 1:
            return (
              <>
                <input
                  id={id}
                  className="cbx tw-hidden"
                  type="checkbox"
                  {...rest}
                  checked={field.value === value}
                  value={value}
                  onChange={() => {
                    if (field.value === value) {
                      form.setFieldValue(name, '');

                      if (action) {
                        action(null);
                      }
                    } else {
                      form.setFieldValue(name, value);
                      if (action) {
                        action(value);
                      }
                    }
                  }}
                />

                <label htmlFor={id} className="check tw-flex">
                  <svg width="18px" height="18px" viewBox="0 0 18 18">
                    <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                  {label}
                </label>
              </>
            );
          default:
            return (
              <>
                <input
                  id={id}
                  className="cbx tw-hidden"
                  type="checkbox"
                  {...rest}
                  checked={field.value.find((v) => v.key === value && v.value)}
                  value={value}
                  onChange={() => {
                    const currentValue = field.value.find(
                      (v) => v.key === value,
                    );
                    const otherValues = field.value.filter(
                      (v) => v.key !== value,
                    );
                    if (currentValue) {
                      currentValue.value = !currentValue.value;
                      const nextValue = [...otherValues, currentValue];

                      form.setFieldValue(name, nextValue);
                      if (action) {
                        action(nextValue);
                      }
                    }
                  }}
                />
                <label htmlFor={id} className="check">
                  <svg width="18px" height="18px" viewBox="0 0 18 18">
                    <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                  {label}
                </label>
              </>
            );
        }
      }}
    </Field>
  );
}
