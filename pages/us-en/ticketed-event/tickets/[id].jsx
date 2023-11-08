import { api } from '@utils';
// import { useRouter } from 'next/router';
import React from 'react';
import { useQuery } from 'react-query';
import { useLocalStorage } from 'react-use';

export default function Tickets() {
  // const router = useRouter();
  const [value] = useLocalStorage('ticket-events');

  const { data } = useQuery(
    'getTicketedEvent',
    async () => {
      const response = await api.get({
        path: 'geticketedEventAttendees',
        param: {
          orderId: value?.orderId,
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!value?.orderId,
    },
  );
  const { attendees } = data;

  console.log('attendees', attendees);

  return (
    <main class="course-filter calendar-online">
      <section class="calendar-top-section">
        <div class="container checkout-congratulations">
          <div class="calendar-benefits-wrapper row">
            <div class="col-12 col-lg-12">
              <h2 class="section-title">Thank You!!</h2>
              <p>Attendee Information is accepted.</p>
              <div class="tickets-accepted">
                {attendees.map((item, index) => {
                  return (
                    <div class="ticket-box" key={item.attendeeRecordExternalId}>
                      <div class="ticket-header">
                        <div class="ticket-title">
                          TICKET HOLDER #{index + 1}
                        </div>
                        <div class="ticket-type">{item.pricingTierName}</div>
                      </div>
                      <div class="ticket-body">
                        <div class="ticket-holder-name">{item.name}</div>
                        <div class="ticket-holder-email">{item.email}</div>
                        <div class="ticket-holder-mobile">
                          {item.contactPhone}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
