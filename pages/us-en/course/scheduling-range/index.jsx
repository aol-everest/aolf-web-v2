import { MODAL_TYPES } from "@constants";
import { api, tConvert } from "@utils";
import { groupBy } from "lodash";
import dayjs from "dayjs";
import moment from "moment";
import { useGlobalModalContext } from "@contexts";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import { pushRouteWithUTMQuery } from "@service";

const SchedulingRange = () => {
  const { showModal, hideModal } = useGlobalModalContext();
  const router = useRouter();
  const [timezoneFilter, setTimezoneFilter] = useState("EST");
  const [selectedWorkshopId, setSelectedWorkshopId] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState({});

  const timezones = [
    {
      timezone: "US/Eastern",
      text: "Eastern Time - US & Canada",
      filterValue: "EST",
    },
    {
      timezone: "US/Central",
      text: "Central Time - US & Canada",
      filterValue: "CST",
    },
    {
      timezone: "US/Mountain",
      text: "Mountain Time - US & Canada",
      filterValue: "MST",
    },
    {
      timezone: "America/Los_Angeles",
      text: "Pacific Time - US & Canada",
      filterValue: "PST",
    },
  ];

  useEffect(() => {
    const getWorshops = async () => {
      const response = await api.get({
        path: "workshops",
        param: {
          timeZone: timezoneFilter,
          sdate: selectedDates?.[0],
          org: "AOL",
        },
      });
      if (response?.data) {
        const newData = groupBy(response?.data, "eventStartDateTimeGMT");
        setWorkshops(newData);
      }
    };
    if (selectedDates?.length > 0) {
      getWorshops();
    }
  }, [selectedDates, timezoneFilter]);

  function changeTimeZone(date, timeZone) {
    if (typeof date === "string") {
      return new Date(
        new Date(date).toLocaleString("en-US", {
          timeZone,
        }),
      );
    }
    const finalDate = date.toLocaleString("en-US", {
      timeZone,
      timeStyle: "short",
    });

    return finalDate;
  }

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
      pathname: "/us-en/course/scheduling-payment",
      query: {
        workshopId: selectedWorkshopId,
      },
    });
  };

  return (
    <div id="widget-modal" className="overlaying-popup_active" role="dialog">
      <div className="scheduling-modal">
        <div
          role="button"
          aria-label="Close modal"
          className="scheduling-modal__btn-close"
          onClick={hideModal}
        >
          <img src="/img/ic-close-talk.svg" alt="close icon" />
        </div>
        <div id="scheduling-step-2" className="scheduling-modal__body">
          <div className="scheduling__content w-100">
            <div className="row no-gutters">
              <div className="col-12 col-md-4 col-lg-3  scheduling-second--border">
                <div className="scheduling-second__course d-flex flex-column justify-content-center d-lg-block ">
                  <img
                    src={
                      selectedWorkshop?.coverImage
                        ? selectedWorkshop.coverImage.url
                        : "/img/skybreath-meditation_large.jpg"
                    }
                    alt="skybreath meditation photo"
                  />
                  {selectedWorkshop.title && (
                    <div className="text-center text-lg-left">
                      <h2 className="scheduling-second__title scheduling-second__title--large mt-2">
                        {selectedWorkshop.title}
                      </h2>
                      <p className="scheduling-second__text mt-2">
                        {selectedWorkshop.workshopTotalHours} Hour Meditation
                        Course
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-8 col-lg-9 ">
                <div className="scheduling-second__date">
                  <h2 className="text-center text-lg-left scheduling__padding scheduling-second__title">
                    Select a Date Range & Times
                  </h2>

                  <div className="row mt-3">
                    <div className="col-12 col-lg-7 ">
                      <div className="justify-content-center  justify-content-lg-start scheduling__padding scheduling__timezone talk-datepicker__timezone">
                        <img
                          className="talk-datepicker__timezone-earth"
                          src="/img/ic-datepicker-earth.svg"
                          alt="timezone-earth"
                        />
                        <select
                          name="timezone"
                          className="timezone"
                          value={timezoneFilter}
                          onChange={(ev) =>
                            setTimezoneFilter(ev?.target?.value)
                          }
                        >
                          {timezones?.map((item) => {
                            return (
                              <option
                                key={item.timezone}
                                value={item.filterValue}
                              >
                                {item.text}
                                {" ("}
                                {changeTimeZone(new Date(), item.timezone)}
                                {") "}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <label className="d-flex flex-column justify-content-center align-items-center">
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
                    <div className="col-12 col-lg-5 text-center text-lg-left mt-2 mt-lg-0">
                      <h3 className="scheduling-second__text scheduling-second__text--black">
                        Available Class Times
                      </h3>
                      <p className="scheduling-second__text scheduling-second__text--small">
                        Based on the selected date range
                      </p>

                      <div className="scheduling-second__available mt-3">
                        <ul className="scheduling-second__options">
                          {Object.keys(workshops)?.map((workshop, index) => {
                            const items = workshops[workshop];
                            const firstItem = items?.[0];
                            const startDateValue =
                              dayjs
                                .utc(firstItem.eventStartDate)
                                ?.format("ddd DD") +
                              " " +
                              tConvert(firstItem.eventStartTime) +
                              " - " +
                              tConvert(firstItem.eventEndTime);
                            const endDateValue =
                              dayjs
                                .utc(firstItem.eventEndDate)
                                ?.format("ddd DD") +
                              " " +
                              tConvert(firstItem.eventStartTime) +
                              " - " +
                              tConvert(firstItem.eventEndTime);
                            const randomWorkshop = Math.floor(
                              Math.random() * items.length,
                            );
                            return (
                              <li
                                className="scheduling-second__item"
                                key={firstItem.id}
                              >
                                <input
                                  className="custom-radio"
                                  type="radio"
                                  id={`option-${index + 1}`}
                                  value={selectedWorkshopId}
                                  name="scheduling-options"
                                  onChange={() =>
                                    handleWorkshopSelect(items[randomWorkshop])
                                  }
                                />
                                <label
                                  className="scheduling-second__option"
                                  htmlFor={`option-${index + 1}`}
                                >
                                  <h4 className="scheduling-second__title scheduling-second__title--small">
                                    {`Option ${index + 1}`}
                                  </h4>
                                  <ul className={`list-option${index + 1}`}>
                                    <li>{startDateValue}</li>
                                    <li>{endDateValue}</li>
                                  </ul>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <button
                        type="button"
                        className="scheduling__button"
                        disabled={!selectedWorkshopId}
                        onClick={goToPaymentModal}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SchedulingRange.hideHeader = true;
SchedulingRange.hideFooter = true;

export default SchedulingRange;
