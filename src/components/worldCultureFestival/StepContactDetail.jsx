/* eslint-disable react/no-unescaped-entities */
import { US_STATES } from "@constants";
import classNames from "classnames";
import { Field } from "formik";
import { trim } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import Select2 from "react-select2-wrapper";
import { useAnalytics } from "use-analytics";
import PhoneInput from "./../phoneInputCmp";
import countryData from "./country.json";

function formatCountryOption(state) {
  if (!state.id) return state.text;

  return `<span class='wcf-country-option'>
      <img src='https://hatscripts.github.io/circle-flags/flags/${state.element.value.toLowerCase()}.svg' class='wcf-country-option__image'/>
      <span class='wcf-country-option__text'>${state.text}</span>
    </span>`;
}

function matchStart(params, data) {
  // If there are no search terms, return all of the data
  if (trim(params.term) === "") {
    return data;
  }

  // Do not display the item if there is no 'text' property
  if (typeof data.text === "undefined") {
    return null;
  }

  // `params.term` should be the term that is used for searching
  // `data.text` is the text that is displayed for the data object
  if (data.text.toUpperCase().startsWith(params.term.toUpperCase())) {
    return data;
  }

  // Return `null` if the term should not be displayed
  return null;
}

const CountryInput = ({ field, form, ...props }) => {
  const selectComp = useRef(null);
  const onChangeAction = () => {
    if (selectComp && selectComp.current && selectComp.current.el) {
      const val = selectComp.current.el.val();
      if (field.value !== val) {
        form.setFieldValue(field.name, val);
        form.setFieldValue("state", null);
        // form.setFieldValue("phoneNumber", field.value);
        form.setFieldValue("phoneCountry", field.value);
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
        matcher: matchStart,
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
  }).filter((s) => s.id !== "Other");
  return (
    <Select2
      ref={selectComp}
      {...field}
      {...props}
      data={data}
      options={{
        placeholder: "Select your state",
        dropdownParent: "#wcfSelect",
        matcher: matchStart,
      }}
      onChange={onChangeAction}
    />
  );
};

const PhoneNumberInputField = ({ field, form, ...props }) => {
  const onChangeAction = (value, data, event, formattedValue) => {
    form.setFieldValue("phoneCountry", data.countryCode.toUpperCase());
    form.setFieldValue(field.name, formattedValue);
  };
  return (
    <PhoneInput
      {...field}
      {...props}
      placeholder="Enter your phone number"
      country={form.values.country ? form.values.country.toLowerCase() : "us"}
      containerClass="wcf-select__field"
      inputClass={classNames("wcf-input__field", {
        error: form.errors.phoneNumber,
      })}
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
  const { track } = useAnalytics();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    track("view_screen", {
      screen_name: "wcf_registration_get_tickets_page",
      utm_parameters: JSON.stringify(router.query),
      sessions_attending_arr: JSON.stringify(values.sessionsAttending),
      number_of_tickets: values.ticketCount,
    });
  }, [router.isReady]);

  const onNextAction = () => {
    track("click_button", {
      screen_name: "wcf_registration_get_tickets_page",
      event_target: "get_tickets_button",
      sessions_attending_arr: JSON.stringify(values.sessionsAttending),
      number_of_tickets: values.ticketCount,
      utm_parameters: JSON.stringify(router.query),
    });
    handleNext();
  };
  return (
    <section className="world-culture-festival">
      <div className="world-culture-festival__background world-culture-festival__background_people-3">
        <img src="/img/wcf-bg-image.png" />
      </div>

      <div className="container world-culture-festival__container">
        <div className="world-culture-festival__column">
          <div className="wcf-form">
            <div className="wcf-form__fields">
              <div className="wcf-select wcf-form__field">
                <label
                  htmlFor="get-tickets-country"
                  className="wcf-select__label"
                >
                  Country
                </label>

                <div
                  className={classNames("wcf-select__field", {
                    error: errors.country,
                  })}
                >
                  <Field name="country" component={CountryInput} />
                  {errors.country && (
                    <label
                      for="welcome-sessions"
                      class="wcf-select__error-message"
                    >
                      {errors.country}
                    </label>
                  )}
                </div>
              </div>

              {values.country === "US" && (
                <div className="wcf-select wcf-form__field">
                  <label
                    htmlFor="get-tickets-state"
                    className="wcf-select__label"
                  >
                    State
                  </label>

                  <div
                    className={classNames("wcf-select__field", {
                      error: errors.state,
                    })}
                  >
                    <Field name="state" component={StateInput} />
                    {errors.state && (
                      <label
                        for="welcome-sessions"
                        class="wcf-select__error-message"
                      >
                        {errors.state}
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="wcf-combined-input wcf-form__field">
                <label
                  htmlFor="get-tickets-phone"
                  className="wcf-combined-input__label"
                >
                  Phone number
                </label>
                <Field name="phoneNumber" component={PhoneNumberInputField} />
                {errors.phoneNumber && (
                  <label
                    for="welcome-sessions"
                    class="wcf-select__error-message"
                  >
                    {errors.phoneNumber}
                  </label>
                )}
              </div>
            </div>

            <button
              className="wcf-button wcf-form__button"
              onClick={onNextAction}
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
  );
}
