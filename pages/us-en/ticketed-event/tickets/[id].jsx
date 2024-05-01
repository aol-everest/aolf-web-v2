import { api } from '@utils';
import { useRouter } from 'next/router';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageLoading } from '@components';
import ErrorPage from 'next/error';

export default function Tickets() {
  const router = useRouter();
  const { id: attendeeId } = router.query;

  const {
    data: attendeeDetail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'getTicketedEventAttendees',
    queryFn: async () => {
      const response = await api.get({
        path: 'getTicketedEventAttendees',
        param: {
          orderId: attendeeId,
        },
      });
      return response.data;
    },
    enabled: !!attendeeId,
  });

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  return (
    <main className="course-filter calendar-online">
      <section className="calendar-top-section">
        <div className="container checkout-congratulations">
          <div className="calendar-benefits-wrapper row">
            <div className="col-12 col-lg-12">
              <h2 className="section-title">Thank You!!</h2>
              <p>Attendee Information is accepted.</p>
              <div className="tickets-accepted">
                {attendeeDetail.attendees.map((item, index) => {
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
