/* eslint-disable react/no-unescaped-entities */
import Select2 from "react-select2-wrapper";

function WorldCultureFestival() {
  const logChange = (val) => {
    console.log("Selected: " + val);
  };

  return (
    <main>
      <div id="wcfSelect" className="wcf-select__dropdown"></div>
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

            <form className="wcf-form" id="welcome-form">
              <div className="wcf-form__fields">
                <div className="wcf-select wcf-form__field">
                  <label
                    htmlFor="welcome-tickets"
                    className="wcf-select__label"
                  >
                    Choose the number of tickets
                  </label>

                  <div className="wcf-select__field">
                    <Select2
                      name="welcome-tickets"
                      data={[
                        { text: "1 (one)", id: 1 },
                        { text: "2 (two)", id: 2 },
                        { text: "3 (three)", id: 3 },
                        { text: "4 (four)", id: 4 },
                      ]}
                      options={{
                        placeholder: "0 (zero)",
                        dropdownParent: "#wcfSelect",
                      }}
                    />
                  </div>

                  <label htmlFor="welcome-tickets" className="wcf-select__info">
                    *4 tickets maximum
                  </label>
                </div>

                <div className="wcf-select wcf-form__field">
                  <label for="welcome-attending" className="wcf-select__label">
                    Sessions attending
                  </label>

                  <div className="wcf-select__field">
                    <Select2
                      name="welcome-sessions[]"
                      multiple
                      data={[
                        {
                          children: [{ text: "Full 3-day pass", id: "Full" }],
                          class: "select2-results__option--group",
                        },
                        {
                          class: "select2-results__option--group",
                          children: [
                            {
                              text: "FRI (evening 24 Feb 2023)",
                              id: "Friday",
                            },
                            {
                              text: "SAT (evening 25 Feb 2023)",
                              id: "Saturday",
                            },
                            {
                              text: "SUN (evening 26 Feb 2023)",
                              id: "Sunday",
                            },
                          ],
                        },
                      ]}
                      options={{
                        placeholder: "Choose the session",
                        dropdownParent: "#wcfSelect",
                      }}
                    />
                  </div>
                </div>
              </div>

              <button className="wcf-button wcf-form__button" type="submit">
                Next
              </button>
            </form>

            <div className="wcf-checkbox world-culture-festival__agreement">
              <input
                type="checkbox"
                className="wcf-checkbox__field"
                id="agreement"
                name="agreement"
                checked
              />
              <label for="agreement" className="wcf-checkbox__label">
                I agree to receive event information and communications from the
                event organizer. I understand that I can opt out anytime.
              </label>
            </div>

            <p className="wcf-body text-center">
              Don't have an account? <span>Sign up here</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
WorldCultureFestival.hideHeader = true;
WorldCultureFestival.hideFooter = true;
WorldCultureFestival.wcfHeader = true;

export default WorldCultureFestival;
