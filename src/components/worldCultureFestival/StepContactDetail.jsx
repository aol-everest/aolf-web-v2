/* eslint-disable react/no-unescaped-entities */
import { useState, useRef } from "react";
import { Field, ErrorMessage } from "formik";
import Select2 from "react-select2-wrapper";
import PhoneInput from "react-phone-input-2";
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
          form.setFieldValue("state", null);
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

const PhoneNumberInputField = ({ field, form, ...props }) => {
  console.log(form.values.country);
  return (
    <PhoneInput
      {...field}
      {...props}
      placeholder="Enter your phone number"
      country={form.values.country ? form.values.country.toLowerCase() : "us"}
      containerClass="wcf-select__field"
      inputClass="wcf-input__field"
      countryCodeEditable={false}
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

export function StepContactDetail({ errors, handleNext, values, ...props }) {
  return (
    <main>
      <section class="world-culture-festival">
        <div class="world-culture-festival__background world-culture-festival__background_people-1">
          <img src="/img/joel-reyer-QlYwXbFeymE-unsplash.png" />
        </div>

        <div class="container world-culture-festival__container">
          <div class="world-culture-festival__column">
            <div class="wcf-form">
              <div class="wcf-form__fields">
                <div class="wcf-select wcf-form__field">
                  <label for="get-tickets-country" class="wcf-select__label">
                    Country
                  </label>

                  <div class="wcf-select__field">
                    <Field name="country" component={CountryInput} />
                  </div>
                </div>

                {values.country === "US" && (
                  <div class="wcf-select wcf-form__field">
                    <label for="get-tickets-state" class="wcf-select__label">
                      State
                    </label>

                    <div class="wcf-select__field">
                      <Field name="state" component={StateInput} />
                    </div>
                  </div>
                )}

                <div class="wcf-combined-input wcf-form__field">
                  <label
                    for="get-tickets-phone"
                    class="wcf-combined-input__label"
                  >
                    Phone number
                  </label>
                  <Field name="phoneNumber" component={PhoneNumberInputField} />
                </div>
              </div>

              <button class="wcf-button wcf-form__button" onClick={handleNext}>
                Get passes
              </button>
            </div>

            <div class="wcf-checkbox world-culture-festival__agreement">
              <input
                type="checkbox"
                class="wcf-checkbox__field"
                id="agreement"
                name="agreement"
                checked
              />
              <label for="agreement" class="wcf-checkbox__label">
                I agree to receive event information and communications from the
                event organizer. I understand that I can opt out anytime.
              </label>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
