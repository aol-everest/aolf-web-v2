/* eslint-disable react/no-unescaped-entities */
import Select2 from "react-select2-wrapper";
import { Field, ErrorMessage } from "formik";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAnalytics } from "use-analytics";
import classNames from "classnames";

const NoOfTicketInput = ({ field, form, ...props }) => {
  const selectComp = useRef(null);
  const onChangeAction = () => {
    if (selectComp && selectComp.current && selectComp.current.el) {
      const val = selectComp.current.el.val();
      if (field.value !== val) {
        form.setFieldValue(field.name, parseInt(val));
      }
    }
  };
  return (
    <Select2
      ref={selectComp}
      {...field}
      {...props}
      data={[
        { text: "1 (one)", id: 1 },
        { text: "2 (two)", id: 2 },
        { text: "3 (three)", id: 3 },
        { text: "4 (four)", id: 4 },
      ]}
      options={{
        placeholder: "1 (one)",
        dropdownParent: "#wcfSelect",
      }}
      onChange={onChangeAction}
    />
  );
};

function formatSessionsOption(state) {
  if (!state.id || state.id === "Full") return state.text;

  const txt = state.text.slice(0, 4);

  return `<span class="select2-selection__choice__display">${txt}</span>`;
}

const WelcomeSessionsInput = ({ field, form, ...props }) => {
  const selectComp = useRef(null);
  const onChangeAction = () => {
    if (selectComp && selectComp.current && selectComp.current.el) {
      const val = selectComp.current.el.val();
      // if (val.length > 1 && val.find((v) => v === "Full")) {
      //   selectComp.current.el.val(["Full"]);
      //   selectComp.current.el.trigger("change");
      // } else if (JSON.stringify(field.value) !== JSON.stringify(val)) {
      //   form.setFieldValue(field.name, val);
      // }
      if (JSON.stringify(field.value) !== JSON.stringify(val)) {
        form.setFieldValue(field.name, val);
      }
    }
  };
  return (
    <Select2
      ref={selectComp}
      {...field}
      {...props}
      multiple
      data={[
        {
          children: [{ text: "Full 3-Day pass", id: "Full" }],
        },
        {
          children: [
            {
              text: "Fri. (evening Sep 29 2023)",
              id: "Friday",
            },
            {
              text: "Sat. (evening Sep 30 2023)",
              id: "Saturday",
            },
            {
              text: "Sun. (evening Oct 1 2023)",
              id: "Sunday",
            },
          ],
        },
      ]}
      options={{
        placeholder: "Choose the session",
        dropdownParent: "#wcfSelect",
        templateSelection: formatSessionsOption,
        escapeMarkup: function (m) {
          return m;
        },
      }}
      onChange={onChangeAction}
    />
  );
};

export function StepWelcome({ errors, handleNext, values, ...props }) {
  const router = useRouter();
  const { track } = useAnalytics();
  useEffect(() => {
    if (!router.isReady) return;
    track("view_screen", {
      screen_name: "wcf_registration_landing",
      utm_parameters: router.query,
    });
  }, [router.isReady]);

  const onNextAction = () => {
    track("click_button", {
      screen_name: "wcf_registration_landing",
      event_target: "next_button",
      sessions_attending_arr: values.sessionsAttending,
      number_of_tickets: values.ticketCount,
      utm_parameters: router.query,
    });
    handleNext();
  };

  return (
    <main>
      <section className="world-culture-festival">
        <div className="world-culture-festival__background world-culture-festival__background_people-3">
          <img src="/img/wcf-bg-image.png" />
        </div>

        <div className="container world-culture-festival__container">
          <div className="world-culture-festival__column">
            <h2 className="wcf-h2 world-culture-festival__title mb-0">
              Welcome
            </h2>
            <p className="wcf-body world-culture-festival__subtitle text-center">
              General Admission Festival Passes (FREE)
            </p>

            <div className="wcf-form">
              <div className="wcf-form__fields">
                <div className="wcf-select wcf-form__field">
                  <label
                    htmlFor="welcome-tickets"
                    className="wcf-select__label"
                  >
                    Choose the number of passes
                  </label>

                  <div
                    className={classNames("wcf-select__field", {
                      error: errors.ticketCount,
                    })}
                  >
                    <Field name="ticketCount" component={NoOfTicketInput} />
                    {errors.ticketCount && (
                      <label
                        for="welcome-sessions"
                        class="wcf-select__error-message"
                      >
                        {errors.ticketCount}
                      </label>
                    )}
                  </div>

                  <label htmlFor="welcome-tickets" className="wcf-select__info">
                    *4 passes maximum
                  </label>
                </div>

                <div className="wcf-select wcf-form__field">
                  <label
                    htmlFor="welcome-attending"
                    className="wcf-select__label"
                  >
                    Sessions attending
                  </label>

                  <div
                    className={classNames("wcf-select__field", {
                      error: errors.sessionsAttending,
                    })}
                  >
                    <Field
                      name="sessionsAttending"
                      component={WelcomeSessionsInput}
                    />
                  </div>
                  {errors.sessionsAttending && (
                    <label
                      for="welcome-sessions"
                      class="wcf-select__error-message"
                    >
                      {errors.sessionsAttending}
                    </label>
                  )}
                </div>
              </div>

              <button
                className="wcf-button wcf-form__button"
                onClick={onNextAction}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
