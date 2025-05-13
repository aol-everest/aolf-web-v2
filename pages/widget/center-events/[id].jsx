/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useState, useRef, useEffect } from 'react';
import { api, tConvert, concatenateStrings } from '@utils';
import Slider from 'react-slick';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ABBRS, COURSE_TYPES_MASTER, COURSE_TYPES } from '@constants';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { orgConfig } from '@org';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { iframeRouteWithUTMQuery } from '@service';

dayjs.extend(utc);

const settings = {
  slidesToShow: 4,
  slidesToScroll: 4,
  centerMode: false,
  arrows: true,
  dots: false,
  speed: 300,
  centerPadding: '24px',
  infinite: false,
  autoplaySpeed: 5000,
  autoplay: false,
  draggable: true,
  //adaptiveHeight: true,
  responsive: [
    {
      breakpoint: 1279,
      settings: {
        arrows: false,
        centerMode: false,
        centerPadding: '20px',
        slidesToShow: 3,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 991,
      settings: {
        arrows: false,
        centerMode: false,
        centerPadding: '10px',
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 768,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '10px',
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

function convertUndefinedToNull(obj) {
  // Check if the input is an object
  if (obj && typeof obj === 'object') {
    // Iterate over each key in the object
    for (const key in obj) {
      if (obj[key] === undefined) {
        // Convert undefined to null
        obj[key] = null;
      } else if (typeof obj[key] === 'object') {
        // Recursively call the function for nested objects
        convertUndefinedToNull(obj[key]);
      }
    }
  }
  return obj;
}

const WorkShopTile = ({ workshop }) => {
  const {
    mode,
    eventStartDate,
    eventEndDate,
    sfid,
    locationPostalCode,
    locationCity,
    locationProvince,
    locationStreet,
    timings,
    listPrice,
    productTypeId,
    title,
    eventPricing,
  } = workshop || {};
  const router = useRouter();
  const getCourseDeration = () => {
    const start = dayjs.utc(eventStartDate);
    const end = dayjs.utc(eventEndDate);
    if (start.isSame(end, 'day')) {
      return <>{start.format('DD MMM')}</>;
    }
    return <>{`${start.format('DD MMM')} - ${end.format('DD MMM')}`}</>;
  };

  const enrollAction = () => {
    const isOnline = mode === 'Online';
    iframeRouteWithUTMQuery(router, {
      pathname: `/us-en/ticketed-event/${sfid}`,
      query: { ctype: productTypeId },
    });
  };
  return (
    <div class="slide">
      <div class="course-item-box">
        <div class="course-item-top">
          <div class="row">
            <div class="course-item-date">{getCourseDeration()}</div>
            <div className="course-item-price">
              {eventPricing === 'Free' ? '$ 0' : 'Paid'}
            </div>
          </div>
          <div class="payment-details">
            <div class="tw-text-xl tw-mt-2 tw-mx-2 tw-font-bold tw-text-center">
              {title}
            </div>
          </div>
        </div>
        <div class="course-item-content">
          <div class="course-date">
            <div>
              <label>Timing:</label>
              {timings?.length > 0 &&
                timings.map((time, i) => {
                  return (
                    <div key={i}>
                      {dayjs.utc(time.startDate).format('dd: ')}
                      {`${tConvert(time.startTime)}-${tConvert(time.endTime)} ${
                        ABBRS[time.timeZone]
                      }`}
                    </div>
                  );
                })}
            </div>
          </div>
          <div class="course-location">
            <div>
              <label>Location:</label>
              {mode !== 'Online' && locationCity && (
                <div>
                  {concatenateStrings([
                    locationStreet,
                    locationCity,
                    locationProvince,
                    locationPostalCode,
                  ])}
                </div>
              )}
              {mode === 'Online' && <div>Online</div>}
            </div>
          </div>
        </div>
        <div class="course-actions">
          <button class="btn-primary" onClick={enrollAction}>
            Save Your Spot
          </button>
        </div>
      </div>
    </div>
  );
};

const CenterEventsCarousel = () => {
  const router = useRouter();
  const sliderRef = useRef(null);
  const [sliderKey, setSliderKey] = useState(0); // force re-mount
  const { id: centerId, ctype: courseType } = router.query;
  const courseTypeFilter = null;

  const [isReadyForSelection, setReadyForSelection] = useState(true);

  const { data: centerDetail } = useQuery({
    queryKey: ['centerId', centerId],
    queryFn: async () => {
      const response = await api.get({
        path: 'getCenter',
        param: {
          id: centerId,
        },
      });
      return response.data;
    },
    enabled: router.isReady && !!centerId,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['nearbyTicketedEvent', centerId],
    queryFn: async () => {
      let param = {
        center: centerId,
        timingsRequired: true,
        ctype: courseType,
      };

      const res = await api.get({
        path: 'ticketedEvents',
        param,
      });
      return res.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const moreDatesAction = () => {
    iframeRouteWithUTMQuery(router, {
      pathname: `/us-en/centers/events/${centerId}`,
    });
  };

  // Force re-mount Slider when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setSliderKey((prev) => prev + 1);
    }
  }, [data]);

  // Call slickSetPosition after render and on resize
  useEffect(() => {
    function setPosition() {
      if (
        sliderRef.current &&
        sliderRef.current.innerSlider &&
        typeof sliderRef.current.innerSlider.slickSetPosition === 'function'
      ) {
        sliderRef.current.innerSlider.slickSetPosition();
      }
    }
    const t = setTimeout(setPosition, 50);
    window.addEventListener('resize', setPosition);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', setPosition);
    };
  }, [data]);

  return (
    <section className="courses-nearby">
      <div className="container">
        <h2 className="courses-nearby__title section-title text-center">
          Informational Sessions happening now
        </h2>

        <Slider
          {...settings}
          className="courses-slider"
          ref={sliderRef}
          key={sliderKey}
        >
          {(data || []).map((workshop, index) => (
            <WorkShopTile workshop={workshop} key={index} />
          ))}
        </Slider>

        <div className="courses-nearby-actions">
          <button className="btn-primary" onClick={moreDatesAction}>
            More Dates
          </button>
        </div>
      </div>
    </section>
  );
};
CenterEventsCarousel.noHeader = true;
CenterEventsCarousel.hideFooter = true;

export default CenterEventsCarousel;
