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
  placeholder,
  ...rest
}) => {
  return (
    <FieldWrapper
      label={label}
      formikKey={formikKey}
      formikProps={formikProps}
      containerclassName={containerClass}
      fullWidth={fullWidth}
    >
      <div className="select-box order__card__payment-select">
        <div tabIndex="1" className="select-box__current">
          <span className="select-box__placeholder">{placeholder}</span>
          {options.map((option) => {
            return (
              <div className="select-box__value" key={option.value}>
                <Field
                  className="select-box__input"
                  type="radio"
                  id={option.value}
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
            "select-box__list drop-list",
            Style.select_box_list,
          )}
        >
          {options.map((option) => {
            return (
              <li key={option.value}>
                <label
                  htmlhtmlFor={option.value}
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
