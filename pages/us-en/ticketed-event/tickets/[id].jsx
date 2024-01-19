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
        path: 'getTicketedEventAttendees',
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
  const { attendees = [] } = data || {};

  // console.log('attendees', attendees);

  return (
    <main className="course-filter calendar-online">
      <section className="calendar-top-section">
        <div className="container checkout-congratulations">
          <div className="calendar-benefits-wrapper row">
            <div className="col-12 col-lg-12">
              <h2 className="section-title">Thank You!!</h2>
              <p>Attendee Information is accepted.</p>
              <div className="tickets-accepted">
                {attendees.map((item, index) => {
                  return (
                    <div
                      className="ticket-box"
                      key={item.attendeeRecordExternalId}
                    >
                      <div className="ticket-header">
                        <div className="ticket-title">
                          TICKET HOLDER #{index + 1}
                        </div>
                        <div className="ticket-type">
                          {item.pricingTierName}
                        </div>
                      </div>
                      <div className="ticket-body">
                        <div className="ticket-holder-name">{item.name}</div>
                        <div className="ticket-holder-email">{item.email}</div>
                        <div className="ticket-holder-mobile">
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
