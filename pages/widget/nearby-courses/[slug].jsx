/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useState } from 'react';
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

async function getTimezone(lat, lng) {
  console.log(lat, lng);
  try {
    const response = await fetch(`/api/timezone?lat=${lat}&lng=${lng}`);
    const data = await response.json();

    if (data.status === 'OK') {
      const timezone = getMappedTimezone(data.timeZoneId);
      return timezone;
    } else {
      console.error('Time Zone API failed:', data.status);
      return getMappedTimezone(); // Default to EST
    }
  } catch (error) {
    console.error('Error fetching Time Zone API:', error);
    return getMappedTimezone(); // Default to EST
  }
}

// Map Google Time Zone API's timeZoneId to your custom TIME_ZONE
function getMappedTimezone(timeZoneId) {
  // Mapping timeZoneId to your predefined values
  const timeZoneMap = {
    'America/New_York': 'EST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'Pacific/Honolulu': 'HST',
  };

  // Return the mapped timezone or default to EST
  return timeZoneMap[timeZoneId] || 'EST';
}

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

const COURSE_TYPES_OPTIONS = COURSE_TYPES_MASTER[orgConfig.name].reduce(
  (accumulator, currentValue) => {
    const courseTypes = Object.entries(currentValue.courseTypes).reduce(
      (courseTypes, [key, value]) => {
        if (COURSE_TYPES[key]) {
          return {
            ...courseTypes,
            [COURSE_TYPES[key].slug]: {
              ...COURSE_TYPES[key],
              ...value,
              key: key,
            },
          };
        } else {
          return courseTypes;
        }
      },
      {},
    );
    return { ...accumulator, ...courseTypes };
  },
  {},
);

export async function getServerSideProps(context) {
  let initialLocation = {};
  let nearbyWorkshops = [];
  const ip =
    context.req.headers['x-forwarded-for'] ||
    context.req.connection.remoteAddress;

  try {
    const res = await fetch(
      `${process.env.IP_INFO_API_URL}/${ip}?token=${process.env.IP_INFO_API_TOKEN}`,
    );
    const {
      postal = null,
      loc = null,
      city = null,
      region = null,
      country = null,
    } = convertUndefinedToNull(await res.json());

    const [lat = null, lng = null] = loc ? loc.split(',') : [];
    let timezone = 'EST';

    if (lat) {
      const timestamp = Math.floor(Date.now() / 1000); // Current time in seconds since the epoch
      const apiKey = process.env.GOOGLE_API_KEY; // Store your API key in an environment variable

      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;

      const response = await fetch(url);
      const timeZoneData = await await response.json();

      if (timeZoneData.status === 'OK') {
        timezone = getMappedTimezone(timeZoneData.timeZoneId);
      }
    }

    initialLocation = {
      lat,
      lng,
      postal,
      locationName: [city, region, country, postal].filter(Boolean).join(', '),
      timezone,
    };

    const courseTypeFilter = COURSE_TYPES_OPTIONS[context.params.slug];

    const { data } = await api.get({
      path: 'nearbyWorkshops',
      param: {
        lat: lat,
        lng: lng,
        dist: 50,
        size: 12,
        timingsRequired: true,
        ctype: courseTypeFilter.value,
        timeZone: timezone,
      },
    });
    nearbyWorkshops = data;
  } catch (error) {
    console.error('Failed to fetch ZIP code by IP');
  }

  return {
    props: { initialLocation, nearbyWorkshops },
  };
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
  } = workshop || {};
  const router = useRouter();
  const getCourseDeration = () => {
    return (
      <>
        {`${dayjs.utc(eventStartDate).format('DD MMM')} - ${dayjs
          .utc(eventEndDate)
          .format('DD MMM')}`}
      </>
    );
  };

  const enrollAction = () => {
    const isOnline = mode === 'Online';
    iframeRouteWithUTMQuery(router, {
      pathname: `/us-en/course/scheduling/${sfid}`,
      query: {
        mode: isOnline ? 'online' : 'inPerson',
        ctype: productTypeId,
      },
    });
  };
  return (
    <div class="slide">
      <div class="course-item-box">
        <div class="course-item-top">
          <div class="row">
            <div class="course-item-date">{getCourseDeration()}</div>
            <div className="course-item-price">$ {listPrice}</div>
          </div>
          <div class="payment-details">
            <div class="payby">
              Pay As Low As <img src="/img/logo-affirm.webp" height="22" />
            </div>
            <div class="price-breakup">
              <div class="price-per-month">
                $27/<span>mon</span>
              </div>
              <div class="payment-tenure">for 12 months</div>
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
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
};

const NearbyCoursesCarousel = ({ initialLocation = null, nearbyWorkshops }) => {
  const router = useRouter();
  const { slug } = router.query;
  const courseTypeFilter = COURSE_TYPES_OPTIONS[slug];
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    options: {
      types: ['(regions)'],
      componentRestrictions: { country: 'us' },
    },
  });
  const [isReadyForSelection, setReadyForSelection] = useState(true);

  const [location, setLocation] = useState({
    address: initialLocation.locationName,
    latitude: initialLocation?.lat,
    longitude: initialLocation?.lng,
    isInputAllowed: !initialLocation.locationName,
    timezone: initialLocation.timezone,
  });

  console.log(location);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'nearbyWorkshops',
      location.latitude,
      location.longitude,
      courseTypeFilter,
      location.timezone,
    ],
    queryFn: async () => {
      let param = {
        lat: location.latitude,
        lng: location.longitude,
        dist: 50,
        size: 12,
        timingsRequired: true,
        ctype: courseTypeFilter.value,
        timeZone: location.timezone,
      };

      console.log('fetching data');

      const response = await api.get({
        path: 'nearbyWorkshops',
        param,
      });
      return response.data;
    },
    enabled: !!location.latitude && !!location.longitude,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
    initialData: nearbyWorkshops,
  });

  const placeholder = location.address || 'location';

  const handleChange = (address) => {
    setReadyForSelection(true);
    setLocation((prevLocation) => ({
      ...prevLocation,
      address: address,
    }));
  };

  const selectAddressAction = (item) => async () => {
    try {
      setReadyForSelection(false);
      placesService?.getDetails(
        {
          fields: ['geometry'],
          placeId: item.place_id,
        },
        async (placeDetails) => {
          const lat = placeDetails.geometry.location.lat();
          const lng = placeDetails.geometry.location.lng();
          const timezone = await getTimezone(lat, lng);
          setLocation({
            latitude: lat,
            longitude: lng,
            address: item.description,
            timezone: timezone,
            isInputAllowed: false,
          });
        },
      );
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
    }
  };

  const renderItem = (placePrediction) => {
    const { structured_formatting } = placePrediction;
    return (
      <>
        <div
          class="suggestion-item smart-input--list-item"
          role="option"
          aria-selected="false"
          onClick={selectAddressAction(placePrediction)}
        >
          <strong>{structured_formatting.main_text}</strong>{' '}
          <small>{structured_formatting.secondary_text}</small>
        </div>
      </>
    );
  };

  const clearSearch = () => {
    setReadyForSelection(false);
    setLocation({
      address: '',
      latitude: null,
      longitude: null,
      isInputAllowed: true,
    });
  };

  const handleAddressClick = () => {
    if (!location.isInputAllowed) {
      setLocation({
        ...location,
        isInputAllowed: true,
      });
    }
  };

  const moreDatesAction = () => {
    iframeRouteWithUTMQuery(router, {
      pathname: `/us-en/course/scheduling`,
      query: {
        courseType: courseTypeFilter.key,
      },
    });
  };

  return (
    <section class="courses-nearby">
      <div class="container">
        <h2 class="courses-nearby__title section-title text-center">
          Courses happening near you
        </h2>

        <div class="course-location-select">
          <div class="form-item">
            <div className="input-search-wrap">
              <div className="search-input-wrap">
                {!location.isInputAllowed ? (
                  <span
                    className="schedule-location-input scheduling-address"
                    onClick={handleAddressClick}
                  >
                    <span className="schedule-location-value">
                      {location.address}
                    </span>
                  </span>
                ) : (
                  <input
                    id="search-field"
                    className="search-input"
                    value={location.address}
                    autoComplete="off"
                    onChange={(evt) => {
                      getPlacePredictions({ input: evt.target.value });
                      handleChange(evt.target.value);
                    }}
                    placeholder={placeholder}
                    loading={isPlacePredictionsLoading}
                  />
                )}

                {location.address && (
                  <button className="search-clear" onClick={clearSearch}>
                    <svg
                      fill="#9698a6"
                      height="16px"
                      width="16px"
                      version="1.1"
                      id="Capa_1"
                      viewBox="0 0 490 490"
                    >
                      <polygon
                        points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490
              489.292,457.678 277.331,245.004 489.292,32.337 "
                      />
                    </svg>
                  </button>
                )}
                {!isPlacePredictionsLoading &&
                  isReadyForSelection &&
                  placePredictions &&
                  placePredictions.length > 0 && (
                    <div
                      style={{
                        zIndex: 9,
                      }}
                    >
                      {placePredictions.map(renderItem)}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
        <Slider {...settings} className="courses-slider">
          {(data || []).map((workshop, index) => {
            return <WorkShopTile workshop={workshop} key={index} />;
          })}
        </Slider>

        <div class="courses-nearby-actions">
          <button class="btn-primary" onClick={moreDatesAction}>
            More Dates
          </button>
        </div>
      </div>
    </section>
  );
};
NearbyCoursesCarousel.noHeader = true;
NearbyCoursesCarousel.hideFooter = true;

export default NearbyCoursesCarousel;
