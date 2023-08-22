import { COURSE_MODES } from "@constants";
import { pushRouteWithUTMQuery } from "@service";
import { api, tConvert } from "@utils";
import dayjs from "dayjs";
import { groupBy } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import Select2 from "react-select2-wrapper";

var advancedFormat = require("dayjs/plugin/advancedFormat");
dayjs.extend(advancedFormat);

const SchedulingRange = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [timezoneFilter, setTimezoneFilter] = useState("EST");
  const [selectedWorkshopId, setSelectedWorkshopId] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState({});

  const timezones = [
    {
      timezone: "US/Eastern",
      text: "Eastern Time - US & Canada",
      id: "EST",
    },
    {
      timezone: "US/Central",
      text: "Central Time - US & Canada",
      id: "CST",
    },
    {
      timezone: "US/Mountain",
      text: "Mountain Time - US & Canada",
      id: "MST",
    },
    {
      timezone: "America/Los_Angeles",
      text: "Pacific Time - US & Canada",
      id: "PST",
    },
  ];

  useEffect(() => {
    const getWorkshops = async () => {
      const response = await api.get({
        path: "workshops",
        param: {
          timeZone: timezoneFilter,
          sdate: selectedDates?.[0],
          org: "AOL",
          timingsRequired: true,
          mode: COURSE_MODES.ONLINE.value,
          ctype: 811569,
        },
      });
      if (response?.data) {
        const newData = groupBy(response?.data, "eventStartDateTimeGMT");
        setLoading(false);
        setWorkshops(newData);

        setTimeout(() => {
          const timeContainer = document.querySelector(
            ".scheduling-modal__content-option",
          );
          if (timeContainer) {
            timeContainer.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    };
    if (selectedDates?.length > 0) {
      setLoading(true);
      getWorkshops();
    }
  }, [selectedDates, timezoneFilter]);

  const handleDateChange = (date) => {
    const selectedDate = moment(date).format("YYYY-MM-DD");
    const tomorrowDate = moment(date).add(1, "days").format("YYYY-MM-DD");
    const dayAfterTomorrowDate = moment(date)
      .add(2, "days")
      .format("YYYY-MM-DD");
    setSelectedDates([selectedDate, tomorrowDate, dayAfterTomorrowDate]);
  };

  const handleWorkshopSelect = (workshop) => {
    setSelectedWorkshop(workshop);
    setSelectedWorkshopId(workshop?.id);
  };

  const goToPaymentModal = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course/scheduling/${selectedWorkshopId}`,
    });
  };

  return (
    <>
      <header class="checkout-header">
        <img class="checkout-header__logo" src="/img/ic-logo.svg" alt="" />
      </header>
      <main className="main">
        <div className="scheduling-modal__step">
          <div id="modal-header" className="scheduling-modal__header">
            <svg
              fill="none"
              height="40"
              viewBox="0 0 40 40"
              width="40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.97338 37.5C6.97338 37.5 5.84838 37.125 5.09838 36.375C3.97338 35.5 3.34838 34.125 3.34838 32.75C3.34838 32.25 3.47338 31.75 3.59838 31.375C2.72338 31.125 2.09838 30.5 1.59838 29.625C0.848379 28.125 1.34838 26.375 2.72338 25.5C4.18413 24.6426 7.07961 22.925 8.29299 22.2048C8.6583 21.9879 8.9647 21.686 9.18735 21.3241L11.8484 17C13.0984 15 14.9734 13.625 17.2234 13.125C15.7234 12 14.7234 10.375 14.7234 8.375C14.7234 5.125 17.3484 2.5 20.5984 2.5C23.8484 2.5 26.4734 5.125 26.4734 8.375C26.4734 10.25 25.5984 12 24.0984 13C26.2234 13.5 28.0984 14.875 29.2234 16.75L32.0984 21.625C32.2234 21.75 32.2234 21.875 32.4734 22L38.2234 25.375C39.5984 26.125 40.2234 28 39.4734 29.5C39.0984 30.25 38.3484 30.875 37.5984 31.125C37.8484 31.625 37.8484 32.25 37.8484 32.75C37.8484 34.125 37.2234 35.375 36.2234 36.25C35.2234 37.125 33.8484 37.625 32.4734 37.375L20.4734 35.75L8.72338 37.375C8.47338 37.5 8.22338 37.5 7.97338 37.5ZM20.7234 30.5H7.97338C6.84838 30.5 5.84838 31.625 5.84838 32.75C5.84838 33.375 6.09838 34 6.59838 34.5C7.09838 34.875 7.72338 35 8.22338 35L20.4734 33.375C20.5984 33.375 20.7234 33.375 20.8484 33.375L32.9734 35C33.5984 35.125 34.2234 34.875 34.7234 34.5C35.2234 34.125 35.4734 33.5 35.4734 32.875C35.4734 31.75 34.4734 30.625 33.3484 30.625L20.7234 30.5ZM22.0984 15.25L19.0984 15.375C16.8484 15.375 15.0984 16.375 13.9734 18.125L11.0984 22.875C10.8484 23.375 10.3484 23.875 9.72338 24.25L4.09838 27.5C3.84838 27.625 3.59838 28 3.84838 28.375C3.97338 28.625 4.22338 28.875 4.47338 28.875H4.59838L4.84838 28.75L11.0984 26C12.0984 25.5 12.7234 24.375 13.3484 23C13.5984 22.5 13.8484 22 14.0984 21.5C14.3484 21 14.9734 20.75 15.4734 20.875C15.9734 21 16.4734 21.5 16.4734 22.125V27.875H20.7234H24.8484V22.125C24.8484 21.5 25.2234 21.125 25.7234 20.875C26.2234 20.75 26.8484 21 27.0984 21.5C27.3484 22 27.5984 22.5 27.9734 23.125C28.5984 24.375 29.0984 25.625 30.2234 26.125L36.4734 28.625C36.5984 28.625 36.5984 28.75 36.7234 28.75C36.7234 28.75 36.7234 28.75 36.8484 28.75C37.0984 28.75 37.3484 28.625 37.4734 28.25C37.5984 27.875 37.4734 27.5 37.2234 27.375L31.5984 24C30.9734 23.75 30.4734 23.25 30.2234 22.625L27.3484 17.875C26.0984 16.375 24.0984 15.25 22.0984 15.25ZM13.8484 27.125C13.5984 27.5 13.2234 27.75 12.8484 28H13.8484V27.125ZM27.3484 28H28.3484C27.9734 27.75 27.5984 27.375 27.3484 27V28ZM20.5984 5C18.7234 5 17.2234 6.5 17.2234 8.375C17.2234 10.25 18.7234 11.75 20.5984 11.75C22.4734 11.75 23.9734 10.25 23.9734 8.375C23.9734 6.5 22.4734 5 20.5984 5Z"
                fill="#FCA248"
              />
            </svg>
            <div className="scheduling-modal__header-text">
              <h3> {selectedWorkshop.title || "SKY Breath Meditation"}</h3>
              <p>9 hours meditation course</p>
            </div>
          </div>

          <div id="first-step" className="scheduling-modal__template">
            <div className="scheduling-modal__content-wrapper">
              <h3>Select a Date Range & Times</h3>
              <p>
                Courses are three days and start every Friday, as well as other
                days during the week. Choose your preferred start date and time
                zone
              </p>
              <div className="scheduling-modal__content-calendar">
                <label>
                  <Flatpickr
                    data-enable-time
                    onChange={(selectedDates) => {
                      const lastItem =
                        selectedDates?.length > 0
                          ? selectedDates[selectedDates?.length - 1]
                          : selectedDates[0];
                      handleDateChange(lastItem);
                    }}
                    value={selectedDates}
                    options={{
                      allowInput: false,
                      inline: true,
                      mode: "multiple",
                      enableTime: false,
                      monthSelectorType: "static",
                      dateFormat: "Y-m-d",
                      defaultDate: [],
                    }}
                  />
                </label>
              </div>
              <div className="scheduling-modal__content-country-select">
                <label>
                  <Select2
                    name="timezone"
                    id="timezone"
                    className="timezone"
                    defaultValue={"EST"}
                    multiple={false}
                    data={timezones}
                    onSelect={(ev) => setTimezoneFilter(ev?.target?.value)}
                    value={timezoneFilter}
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="scheduling-modal__content-wrapper">
                <h3>Available Class Times</h3>
                <p>Based on the selected date range</p>

                {/* <div class="scheduling-types__container">
                  <label
                    class="scheduling-types__label"
                    for="online-type-course"
                  >
                    <input
                      type="radio"
                      class="scheduling-types__input"
                      id="online-type-course"
                      name="type-course"
                      value="online"
                    />
                    <span class="scheduling-types__background">Online</span>
                  </label>

                  <label
                    class="scheduling-types__label"
                    for="person-type-course"
                  >
                    <input
                      type="radio"
                      class="scheduling-types__input"
                      id="person-type-course"
                      name="type-course"
                      value="in-person"
                    />
                    <span class="scheduling-types__background">In-person</span>
                  </label>

                  <label class="scheduling-types__label" for="both-type-course">
                    <input
                      type="radio"
                      class="scheduling-types__input"
                      id="both-type-course"
                      name="type-course"
                      value="both"
                      checked
                    />
                    <span class="scheduling-types__background">Both</span>
                  </label>
                </div> */}

                <ul className="scheduling-modal__content-options">
                  {!loading && Object.keys(workshops).length ? (
                    Object.keys(workshops)?.map((workshop, index) => {
                      const items = workshops[workshop];
                      const firstItem = items?.[0];
                      const randomWorkshop = Math.floor(
                        Math.random() * items.length,
                      );
                      return (
                        <li
                          className="scheduling-modal__content-option"
                          key={firstItem.id}
                        >
                          <p className="scheduling-modal__content-option-title">
                            <input
                              type="radio"
                              id={`time-range-${index + 1}`}
                              value={selectedWorkshopId}
                              name="scheduling-options"
                              checked={selectedWorkshopId === firstItem.id}
                              onChange={() =>
                                handleWorkshopSelect(items[randomWorkshop])
                              }
                            />
                            <label htmlFor="time-range-1">
                              Time ranges #{index + 1}
                            </label>
                          </p>

                          <p className="scheduling-modal__content-option-text-with-clock">
                            Daily
                          </p>

                          <ul className="scheduling-modal__content-option-variants">
                            {firstItem?.timings &&
                              firstItem.timings.map((time, i) => {
                                return (
                                  <li
                                    className="scheduling-modal__content-option-row"
                                    key={i}
                                  >
                                    <div className="scheduling-modal__content-option-row-date">
                                      {dayjs
                                        .utc(time.startDate)
                                        .format("ddd, D")}
                                    </div>
                                    <div className="scheduling-modal__content-option-row-time">
                                      {tConvert(time.startTime, true)} -{" "}
                                      {tConvert(time.endTime, true)}
                                    </div>
                                  </li>
                                );
                              })}
                          </ul>

                          {/* <p className="scheduling-modal__content-option-footer">
                            <span className="scheduling-modal__content-option-footer-text-with-icon">
                              Instructor
                            </span>
                            <span>{firstItem.primaryTeacherName}</span>
                          </p> */}
                        </li>
                      );
                    })
                  ) : loading ? (
                    <li>
                      <div className="cover-spin"></div>
                    </li>
                  ) : (
                    Object.keys(workshops).length === 0 && (
                      <li className="scheduling-modal__content-option scheduling-no-data">
                        No Workshop Found
                      </li>
                    )
                  )}
                </ul>
              </div>

              <button
                className="scheduling-modal__apple-pay d-lg-none"
                type="button"
              >
                <svg
                  fill="none"
                  height="18"
                  viewBox="0 0 15 18"
                  width="15"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.97991 3.43337C10.545 2.72649 10.9285 1.77746 10.8274 0.807617C10.0002 0.848773 8.99066 1.35343 8.40622 2.06077C7.88141 2.66658 7.41697 3.65537 7.53809 4.58452C8.46659 4.66505 9.39444 4.12037 9.97991 3.43337Z"
                    fill="white"
                  />
                  <path
                    d="M10.8168 4.76588C9.46824 4.68554 8.32159 5.53125 7.67752 5.53125C7.03318 5.53125 6.04693 4.80638 4.98024 4.82588C3.5919 4.84632 2.30368 5.63129 1.59915 6.87975C0.150056 9.37735 1.21674 13.0822 2.6259 15.1163C3.31018 16.1226 4.13499 17.2307 5.22165 17.1908C6.2484 17.1505 6.65087 16.526 7.89887 16.526C9.14602 16.526 9.50856 17.1908 10.5954 17.1707C11.7226 17.1505 12.4272 16.1638 13.1115 15.1565C13.8965 14.0093 14.2179 12.9016 14.2381 12.8408C14.2178 12.8206 12.0646 11.9946 12.0447 9.51779C12.0243 7.44394 13.7352 6.45741 13.8157 6.39629C12.8497 4.96754 11.3401 4.80638 10.8168 4.76588Z"
                    fill="white"
                  />
                </svg>
                Pay
              </button>

              <button
                className="scheduling-modal__continue"
                id="go-to-second-step"
                type="button"
                disabled={!selectedWorkshopId}
                onClick={goToPaymentModal}
              >
                continue
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

SchedulingRange.noHeader = true;
SchedulingRange.hideFooter = true;

export default SchedulingRange;
