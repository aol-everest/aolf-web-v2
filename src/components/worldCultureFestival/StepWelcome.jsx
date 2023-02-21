/* eslint-disable react/no-unescaped-entities */
import Select2 from "react-select2-wrapper";
import { Field, ErrorMessage } from "formik";
import { useRef } from "react";

const NoOfTicketInput = ({ field, form, ...props }) => {
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

const WelcomeSessionsInput = ({ field, form, ...props }) => {
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
      }}
      onChange={onChangeAction}
    />
  );
};

export function StepWelcome({ errors, handleNext, ...props }) {
  return (
    <main>
      <section className="world-culture-festival">
        <div className="world-culture-festival__background world-culture-festival__background_people-2">
          <img src="/img/group-friends-dancing.png" />
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

                  <div className="wcf-select__field">
                    <Field name="ticketCount" component={NoOfTicketInput} />
                    {errors.ticketCount && (
                      <p className="validation-input">{errors.ticketCount}</p>
                    )}
                  </div>

                  <label htmlFor="welcome-tickets" className="wcf-select__info">
                    *4 passes maximum
                  </label>
                </div>

                <div className="wcf-select wcf-form__field">
                  <label for="welcome-attending" className="wcf-select__label">
                    Sessions attending
                  </label>

                  <div className="wcf-select__field">
                    <Field
                      name="sessionsAttending"
                      component={WelcomeSessionsInput}
                    />
                    {errors.sessionsAttending && (
                      <p className="validation-input">
                        {errors.sessionsAttending}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="wcf-button wcf-form__button"
                onClick={handleNext}
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
