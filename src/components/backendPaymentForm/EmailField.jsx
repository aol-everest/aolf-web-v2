import { api } from '@utils';
import classNames from 'classnames';
import { useState } from 'react';

export function EmailField({
  applyDiscount,
  addOnProducts,
  field,
  form,
  product,
  producttype,
  withLabel,
  parentClassName,
  errors,
  user,
  name,
  applyUser,
  productId,
  ...rest
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(0);

  const removeUser = (form) => (e) => {
    setStatus(0);
    applyUser({ user: null, form });
    form.setFieldValue(name, '');
  };
  const keyPress =
    ({ field, form }) =>
    (e) => {
      if (e.keyCode === 13) {
        findUser({ field, form })(e);
      }
    };

  const validateEmail = async (form, value) => {
    if (value.length === 0) {
      return;
    }
    form.setFieldTouched(name, true);

    setLoading(true);

    try {
      const { user } = await api.get({
        path: 'findUserByEmail',
        param: {
          email: value,
        },
      });

      if (!user) {
        throw new Error();
      }

      const { data } = await api.get({
        path: 'workshopDetail',
        param: {
          isBackendRegistration: 1,
          id: productId,
          uid: user.id,
        },
      });

      applyUser({ user, form }, data);
    } catch (ex) {
      console.log(ex);
      applyUser({ user: null, form });
    }
    setLoading(false);
  };

  const findUser =
    ({ field, form }) =>
    async (e) => {
      if (e) e.preventDefault();
      const value = field.value.trim();
      if (value.length === 0) {
        return;
      }

      await validateEmail(form, value);
    };

  const showTag = user !== null;
  return (
    <div className={classNames('input-group', parentClassName)}>
      {!showTag && (
        <>
          <input
            id="emailId"
            type="email"
            {...rest}
            value={field.value}
            onChange={(evt) => {
              form.setFieldValue(name, evt.target.value.trim().toLowerCase());
            }}
            className="tw-w-full"
            onBlur={findUser({ field, form })}
            onKeyDown={keyPress({ field, form })}
          />

          {withLabel && (
            <label
              htmlFor="emailId"
              className={classNames({
                'couponCode-error': form.errors.email,
              })}
            >
              {form.errors.email || 'Email'}
            </label>
          )}
          {loading && (
            <span className="loader-inline tw-absolute tw-right-0 tw-top-4"></span>
          )}
        </>
      )}
      {showTag && (
        <>
          <div className="couponCode-error">{form.errors.email}</div>

          <div className="react-tag-container-bc">
            {withLabel && <label className="react-tag-label">Email</label>}
            <span
              className={classNames('badge', 'react-tag', {
                'badge-light': status === 0,
                'badge-success': status === 1,
                'badge-danger': status === 2,
              })}
            >
              {field.value}
              <a
                className={classNames('react-tag-remove', {
                  '!tw-text-white': status === 2,
                })}
                onClick={removeUser(form)}
              >
                ×
              </a>
            </span>
            {loading && (
              <span className="loader-inline tw-absolute tw-right-0 tw-top-4"></span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
