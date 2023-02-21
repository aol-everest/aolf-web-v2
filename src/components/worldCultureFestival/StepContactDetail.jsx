/* eslint-disable react/no-unescaped-entities */
import { useState, useRef } from "react";
import { Field, ErrorMessage } from "formik";
import Select2 from "react-select2-wrapper";
import PhoneInput from "./phoneInputCmp";
import countryData from "./country.json";
import { US_STATES } from "@constants";

function formatCountryOption(state) {
  if (!state.id) return state.text;

  return `<span class='wcf-country-option'>
      <img src='https://hatscripts.github.io/circle-flags/flags/${state.element.value.toLowerCase()}.svg' class='wcf-country-option__image'/>
      <span class='wcf-country-option__text'>${state.text}</span>
    </span>`;
}

const CountryInput = ({ field, form, ...props }) => {
  const selectComp = useRef(null);
  const onChangeAction = () => {
    if (selectComp && selectComp.current && selectComp.current.el) {
      const val = selectComp.current.el.val();
      if (field.value !== val) {
        form.setFieldValue(field.name, val);
        if (field.value !== "US") {
          form.setFieldValue("state", "");
        }
        form.setFieldValue("phoneNumber", field.value);
      }
    }
  };
  const data = countryData.map((c) => {
    return {
      text: c.Name,
      id: c.Code,
    };
  });
  return (
    <Select2
      ref={selectComp}
      {...field}
      {...props}
      data={data}
      options={{
        placeholder: "Select your country",
        dropdownParent: "#wcfSelect",
        templateResult: formatCountryOption,
        templateSelection: formatCountryOption,
        escapeMarkup: function (m) {
          return m;
        },
      }}
      onChange={onChangeAction}
    />
  );
};

const StateInput = ({ field, form, ...props }) => {
  const selectComp = useRef(null);
  const onChangeAction = () => {
    if (selectComp && selectComp.current && selectComp.current.el) {
      const val = selectComp.current.el.val();
      if (field.value !== val) {
        form.setFieldValue(field.name, val);
      }
    }
  };
  const data = US_STATES.map((s) => {
    return {
      text: s.label,
      id: s.value,
    };
  });
  return (
    <Select2
      ref={selectComp}
      {...field}
      {...props}
      data={data}
      options={{
        placeholder: "Select your state",
        dropdownParent: "#wcfSelect",
      }}
      onChange={onChangeAction}
    />
  );
};

const PhoneNumberInputField = ({ field, form, ...props }) => {
  const onChangeAction = (value, data, event, formattedValue) => {
    form.setFieldValue(field.name, formattedValue);
  };
  return (
    <PhoneInput
      {...field}
      {...props}
      placeholder="Enter your phone number"
      country={form.values.country ? form.values.country.toLowerCase() : "us"}
      containerClass="wcf-select__field"
      inputClass="wcf-input__field"
      countryCodeEditable={false}
      onChange={onChangeAction}
    />
  );
};

const AgreementField = ({ field, form, ...props }) => {
  const onClickAction = () => {
    form.setFieldValue(field.name, !field.value);
  };
  return (
    <div className="wcf-checkbox world-culture-festival__agreement">
      <input type="checkbox" {...field} {...props} />
      <label
        htmlFor="agreement"
        className="wcf-checkbox__label"
        onClick={onClickAction}
      >
        I agree to receive event information and communications from the event
        organizer. I understand that I can opt out anytime.
      </label>
    </div>
  );
};

export function StepContactDetail({ errors, handleNext, values, ...props }) {
  console.log(errors);

  return (
    <main>
      <section className="world-culture-festival">
        <div className="world-culture-festival__background world-culture-festival__background_people-1">
          <img src="/img/joel-reyer-QlYwXbFeymE-unsplash.png" />
        </div>

        <div className="container world-culture-festival__container">
          <div className="world-culture-festival__column">
            <div className="wcf-form">
              <div className="wcf-form__fields">
                <div className="wcf-select wcf-form__field">
                  <label
                    for="get-tickets-country"
                    className="wcf-select__label"
                  >
                    Country
                  </label>

                  <div className="wcf-select__field">
                    <Field name="country" component={CountryInput} />
                    {errors.country && (
                      <p className="validation-input">{errors.country}</p>
                    )}
                  </div>
                </div>

                {values.country === "US" && (
                  <div className="wcf-select wcf-form__field">
                    <label
                      for="get-tickets-state"
                      className="wcf-select__label"
                    >
                      State
                    </label>

                    <div className="wcf-select__field">
                      <Field name="state" component={StateInput} />
                      {errors.state && (
                        <p className="validation-input">{errors.state}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="wcf-combined-input wcf-form__field">
                  <label
                    for="get-tickets-phone"
                    className="wcf-combined-input__label"
                  >
                    Phone number
                  </label>
                  <Field name="phoneNumber" component={PhoneNumberInputField} />
                  {errors.phoneNumber && (
                    <p className="validation-input">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <button
                className="wcf-button wcf-form__button"
                onClick={handleNext}
              >
                Get passes
              </button>
            </div>
            <Field
              type="checkbox"
              name="agreement"
              className="wcf-checkbox__field"
              component={AgreementField}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
