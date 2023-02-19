/* eslint-disable react/no-unescaped-entities */
import { useState, useRef } from "react";
import { Field, ErrorMessage } from "formik";
import Select2 from "react-select2-wrapper";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

const CountryInput = ({ field, form, ...props }) => {
  const selectComp = useRef(null);
  const onChangeAction = () => {
    if (selectComp && selectComp.current && selectComp.current.el) {
      const val = selectComp.current.el.val();
      if (field.value !== val) {
        form.setFieldValue(field.name, val);
      }
    }
  };
  return (
    <Select2
      ref={selectComp}
      {...field}
      {...props}
      data={[
        { text: "USA", id: "USA" },
        { text: "Ukraine", id: "Ukraine" },
        { text: "England", id: "England" },
      ]}
      options={{
        placeholder: "Select your country",
        dropdownParent: "#wcfSelect",
      }}
      onChange={onChangeAction}
    />
  );
};

const PhoneNumberInput = ({ field, form, ...props }) => {
  return (
    <PhoneInput
      {...field}
      {...props}
      placeholder="Enter your phone number"
      defaultCountry="US"
      class="wcf-input__field"
      international
      initialValueFormat="national"
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
  return (
    <Select2
      ref={selectComp}
      {...field}
      {...props}
      data={[
        { text: "California", id: "CA" },
        { text: "Texas", id: "TX" },
        { text: "North Carolina", id: "NC" },
      ]}
      options={{
        placeholder: "Select your state",
        dropdownParent: "#wcfSelect",
      }}
      onChange={onChangeAction}
    />
  );
};

export function StepContactDetail({ errors, handleNext, ...props }) {
  return (
    <main>
      <section class="world-culture-festival">
        <div class="world-culture-festival__background world-culture-festival__background_people-1">
          <img src="/img/joel-reyer-QlYwXbFeymE-unsplash.png" />
        </div>

        <div class="container world-culture-festival__container">
          <div class="world-culture-festival__column">
            <h4 class="wcf-h4 world-culture-festival__title d-lg-block d-none">
              Your "Art of Living Journey" account has been created.
            </h4>

            <h4 class="wcf-h4 world-culture-festival__title d-lg-none">
              Your account has been created.
            </h4>

            <form class="wcf-form" id="get-tickets-form">
              <div class="wcf-form__fields">
                <div class="wcf-combined-input wcf-form__field">
                  <label
                    for="get-tickets-phone"
                    class="wcf-combined-input__label"
                  >
                    Phone number
                  </label>
                  <Field name="phoneNumber" component={PhoneNumberInput} />
                </div>

                <div class="wcf-select wcf-form__field">
                  <label for="get-tickets-country" class="wcf-select__label">
                    Country
                  </label>

                  <div class="wcf-select__field">
                    <Field name="country" component={CountryInput} />
                  </div>
                </div>

                <div class="wcf-select wcf-form__field">
                  <label for="get-tickets-state" class="wcf-select__label">
                    State
                  </label>

                  <div class="wcf-select__field">
                    <Field name="state" component={StateInput} />
                  </div>
                </div>
              </div>

              <button class="wcf-button wcf-form__button" onClick={handleNext}>
                Get tickets
              </button>
            </form>

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
