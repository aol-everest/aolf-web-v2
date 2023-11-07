import { api } from '@utils';
import { useRouter } from 'next/router';
import React from 'react';
import { useQuery } from 'react-query';

export default function Tickets() {
  const router = useRouter();

  const { id: workshopId } = router.query;

  const { data: attendees, isLoading } = useQuery(
    'getTicketedEvent',
    async () => {
      const response = await api.get({
        path: 'getTicketedEvent',
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
                <div class="ticket-box">
                  <div class="ticket-header">
                    <div class="ticket-title">TICKET HOLDER #1</div>
                    <div class="ticket-type">Gold</div>
                  </div>
                  <div class="ticket-body">
                    <div class="ticket-holder-name">Praveen Gupta</div>
                    <div class="ticket-holder-email">gupta758@gmail.com</div>
                    <div class="ticket-holder-mobile">6564645679</div>
                  </div>
                </div>
                <div class="ticket-box">
                  <div class="ticket-header">
                    <div class="ticket-title">TICKET HOLDER #2</div>
                    <div class="ticket-type">Platinum</div>
                  </div>
                  <div class="ticket-body">
                    <div class="ticket-holder-name">Praveen Gupta</div>
                    <div class="ticket-holder-email">gupta758@gmail.com</div>
                    <div class="ticket-holder-mobile">6564645679</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
