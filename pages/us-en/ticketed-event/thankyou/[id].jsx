import { Loader } from "@components/loader";
import { api, tConvert } from "@utils";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { useQuery } from "react-query";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import { useLocalStorage } from "react-use";
import { useMemo } from "react";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const TicketCongratulations = () => {
  const router = useRouter();
  const { id: workshopId } = router.query;
  const formRef = useRef();
  const [value] = useLocalStorage("ticket-events");
  const {
    selectedTickets,
    delfee,
    totalPrice,
    discountResponse,
    totalDiscount,
  } = value;

  const { data: workshop, isLoading } = useQuery(
    "getTicketedEvent",
    async () => {
      const response = await api.get({
        path: "getTicketedEvent",
        param: {
          id: workshopId,
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!workshopId,
    },
  );

  const { title, phone1, email, eventStartTime, eventEndTime, eventStartDate } =
    workshop || {};

  if (isLoading) {
    return <Loader />;
  }
  let ticketType = [];
  let totalNoOfTickets = 0;

  selectedTickets.map((item) => {
    ticketType.push(item.pricingTierName);
    totalNoOfTickets = totalNoOfTickets + item.numberOfTickets;
  });

  return (
    <main class="course-filter calendar-online">
      <section class="calendar-top-section">
        <div class="container calendar-benefits-section">
          <h2 class="section-title">
            <strong>Congratulations</strong>
          </h2>
          <div class="section-description">
            <strong>You are going</strong> to the {title}
          </div>
        </div>

        <div class="container checkout-congratulations">
          <div class="calendar-benefits-wrapper row">
            <div class="col-12 col-lg-8 paddingRight">
              <h2 class="section-title">
                <i class="fa fa-list-alt" aria-hidden="true"></i> Order Details
              </h2>
              <div class="order-details-wrapper">
                <ul class="order-items-list">
                  <li class="order-item">
                    <i class="fa fa-ticket" aria-hidden="true"></i>{" "}
                    <span>Ticket Type: </span>
                    {ticketType?.toString()}
                  </li>
                  <li class="order-item">
                    <i class="fa fa-hand-peace-o" aria-hidden="true"></i>{" "}
                    <span>Number of Tickets: </span>
                    {totalNoOfTickets}
                  </li>
                  <li class="order-item">
                    <i class="fa fa-hashtag" aria-hidden="true"></i>{" "}
                    <span>Order Number: </span>208
                  </li>
                  <li class="order-item">
                    <i class="fa fa-money" aria-hidden="true"></i>{" "}
                    <span>Order Total: </span> ${parseInt(delfee).toFixed(2)}
                  </li>
                </ul>
                <div class="bottom-info">
                  <i class="fa fa-info-circle" aria-hidden="true"></i> You
                  should receive the tickets in your email
                </div>
              </div>
              <form class="attendee-info-form">
                <h2 class="section-title">
                  <i class="fa fa-user-o" aria-hidden="true"></i> Provide
                  Attendee Information
                </h2>
                <div class="attendee-info-wrapper">
                  <div class="subsection-title">
                    Ticket Holder #1 <span class="ticket-type">Gold</span>
                  </div>
                  <div class="attendee-details-form">
                    <div class="form-item required">
                      <label for="fname">First Name</label>
                      <input type="text" name="fname" />
                    </div>
                    <div class="form-item required">
                      <label for="lname required">Last Name</label>
                      <input type="text" name="lname" />
                    </div>
                    <div class="form-item required">
                      <label for="email">Email Address</label>
                      <input type="text" name="email" />
                    </div>
                    <div class="form-item required">
                      <label for="phone">Phone Number</label>
                      <input type="text" name="fname" />
                    </div>
                  </div>
                </div>
                <div class="attendee-info-wrapper">
                  <div class="subsection-title">
                    Ticket Holder #2 <span class="ticket-type">Platinum</span>
                  </div>
                  <div class="attendee-details-form">
                    <div class="form-item other">
                      <label for="other">Other Attendee</label>
                      <select name="other">
                        <option>Other Attendee</option>
                        <option>Attendee 1</option>
                      </select>
                    </div>
                    <div class="form-item required">
                      <label for="fname">First Name</label>
                      <input type="text" name="fname" />
                    </div>
                    <div class="form-item required">
                      <label for="lname required">Last Name</label>
                      <input type="text" name="lname" />
                    </div>
                    <div class="form-item required">
                      <label for="email">Email Address</label>
                      <input type="text" name="email" />
                    </div>
                    <div class="form-item required">
                      <label for="phone">Phone Number</label>
                      <input type="text" name="fname" />
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-submit">
                  Submit
                </button>
              </form>
            </div>
            <div class="col-12 col-lg-4 borderLeft">
              <div class="sidebar-banner">
                <img
                  src="https://cdn.emailacademy.com/user/unregistered/c5a85d22-0112-4999-94b4-c4f9e9c08eed2023_08_29_03_03_06_0800000031_03_03_12.webp"
                  alt="gurudev image"
                  class="w-full rounded-[12px]"
                />
              </div>
              <div class="event-details-wrapper">
                <h2 class="section-title">
                  <i class="fa fa-list-alt" aria-hidden="true"></i> Event
                  Details
                </h2>
                <ul class="event-items-list">
                  <li class="event-item">
                    <i class="fa fa-ticket" aria-hidden="true"></i>{" "}
                    <span>Event: </span>
                    {title}
                  </li>
                  <li class="event-item">
                    <i class="fa fa-sun-o" aria-hidden="true"></i>{" "}
                    <span>Day: </span>{" "}
                    {dayjs.utc(eventStartDate).format("dddd")}
                  </li>
                  <li class="event-item">
                    <i class="fa fa-calendar" aria-hidden="true"></i>{" "}
                    <span>Date: </span>
                    {dayjs.utc(eventStartDate).format("MMMM D")}
                  </li>
                  <li class="event-item">
                    <i class="fa fa-clock" aria-hidden="true"></i>{" "}
                    <span>Time: </span> {tConvert(eventStartTime, true)} -{" "}
                    {tConvert(eventEndTime, true)}
                  </li>
                </ul>
                <div class="contact-info">
                  <h2 class="section-title">
                    <i class="fa fa-address-book-o" aria-hidden="true"></i>{" "}
                    Contact Details:
                  </h2>
                  <ul class="event-items-list">
                    <li class="event-item">
                      <i class="fa fa-phone" aria-hidden="true"></i>{" "}
                      <span>Call: </span>
                      {phone1}
                    </li>
                    <li class="event-item">
                      <i class="fa fa-map-marker" aria-hidden="true"></i>{" "}
                      <span>Email: </span>
                      {email}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TicketCongratulations;
