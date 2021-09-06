import React from "react";
import classNames from "classnames";
import { Field } from "formik";
import { FieldWrapper } from "./FieldWrapper";
import Style from "./Dropdown.module.scss";

export const Dropdown = ({
  label,
  formikProps,
  formikKey,
  containerClass,
  options,
  fullWidth,
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
      <div
        class="select-box order__card__payment-select"
        style={{ marginTop: "1.5em" }}
      >
        <div tabindex="1" class="select-box__current">
          <span class="select-box__placeholder">{label}</span>
          {options.map((option) => {
            return (
              <div class="select-box__value">
                <Field
                  class="select-box__input"
                  type="radio"
                  id={option.value}
                  name={formikKey}
                  checked={formikProps.values[formikKey] === option.value}
                  value={option.value}
                />

                <span class="select-box__input-text">{option.label}</span>
              </div>
            );
          })}
        </div>
        <ul
          className={classNames(
            "select-box__list drop-list",
            Style.select_box_list,
          )}
        >
          {options.map((option) => {
            return (
              <li>
                <label
                  for={option.value}
                  aria-hidden="aria-hidden"
                  data-value="card"
                  class="select-box__option"
                >
                  <span>{option.label}</span>
                  <img
                    src="/img/ic-tick-blue-lg.svg"
                    alt="Option selected"
                    style={{
                      display:
                        formikProps.values[formikKey] === option.value
                          ? "block"
                          : "none",
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
