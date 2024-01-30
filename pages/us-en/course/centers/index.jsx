import React, { useEffect, useState } from 'react';
import ContentLoader from 'react-content-loader';
import { useInfiniteQuery, useQuery } from 'react-query';
import { useUIDSeed } from 'react-uid';
import { useAnalytics } from 'use-analytics';
import { useEffectOnce } from 'react-use';
import { api } from '@utils';
import GoogleMapComponent from '@components/googleMap';

const GOOGLE_URL = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&v=3.exp&libraries=geometry,drawing,places`;

const Centers = () => {
  const {
    data: allCenters,
    isLoading,
    isError,
    error,
  } = useQuery(
    'allCenters',
    async () => {
      const response = await api.get({
        path: 'getAllCenters',
        param: {
          lat: 43.4142989,
          lng: -124.2301242,
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );
  return (
    <main class="local-centers">
      <section class="title-header">
        <h1 class="page-title">Local Centers</h1>
        <div class="page-description">
          Lorem ipsum dolor sit amet consectetur.
        </div>
      </section>
      <section class="map-section">
        <div class="center-search-box" id="mobile-handler">
          <div class="mobile-handler"></div>
          <div class="search-input-wrap">
            <input type="text" placeholder="Search..." class="search-input" />
          </div>
          <div class="search-listing">
            <div class="search-list-item">
              <div class="title">Online</div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-call-icon.svg"
                  alt="call"
                />
                (808) 555-0111
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-email-icon.svg"
                  alt="email"
                />
                felicia.reid@example.com
              </div>
              <div class="action-btn">
                <button class="submit-btn">Find Courses</button>
              </div>
            </div>
            <div class="search-list-item">
              <div class="title">Online</div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-call-icon.svg"
                  alt="call"
                />
                (808) 555-0111
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-email-icon.svg"
                  alt="email"
                />
                felicia.reid@example.com
              </div>
              <div class="action-btn">
                <button class="submit-btn">Find Courses</button>
              </div>
            </div>
            <div class="search-list-item">
              <div class="title">New York</div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-location-icon.svg"
                  alt="call"
                />
                1901 Thornridge Cir. Shiloh, Hawaii 81063
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-call-icon.svg"
                  alt="call"
                />
                (808) 555-0111
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-email-icon.svg"
                  alt="email"
                />
                felicia.reid@example.com
              </div>
              <div class="action-btn">
                <button class="submit-btn">Find Courses</button>
              </div>
            </div>
            <div class="search-list-item">
              <div class="title">New York</div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-location-icon.svg"
                  alt="call"
                />
                1901 Thornridge Cir. Shiloh, Hawaii 81063
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-call-icon.svg"
                  alt="call"
                />
                (808) 555-0111
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-email-icon.svg"
                  alt="email"
                />
                felicia.reid@example.com
              </div>
              <div class="action-btn">
                <button class="submit-btn">Find Courses</button>
              </div>
            </div>
            <div class="search-list-item">
              <div class="title">Online</div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-call-icon.svg"
                  alt="call"
                />
                (808) 555-0111
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-email-icon.svg"
                  alt="email"
                />
                felicia.reid@example.com
              </div>
              <div class="action-btn">
                <button class="submit-btn">Find Courses</button>
              </div>
            </div>
            <div class="search-list-item">
              <div class="title">Online</div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-call-icon.svg"
                  alt="call"
                />
                (808) 555-0111
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-email-icon.svg"
                  alt="email"
                />
                felicia.reid@example.com
              </div>
              <div class="action-btn">
                <button class="submit-btn">Find Courses</button>
              </div>
            </div>
            <div class="search-list-item">
              <div class="title">New York</div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-location-icon.svg"
                  alt="call"
                />
                1901 Thornridge Cir. Shiloh, Hawaii 81063
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-call-icon.svg"
                  alt="call"
                />
                (808) 555-0111
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-email-icon.svg"
                  alt="email"
                />
                felicia.reid@example.com
              </div>
              <div class="action-btn">
                <button class="submit-btn">Find Courses</button>
              </div>
            </div>
            <div class="search-list-item">
              <div class="title">New York</div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-location-icon.svg"
                  alt="call"
                />
                1901 Thornridge Cir. Shiloh, Hawaii 81063
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-call-icon.svg"
                  alt="call"
                />
                (808) 555-0111
              </div>
              <div class="info">
                <img
                  class="icon"
                  src="/img/map-search-email-icon.svg"
                  alt="email"
                />
                felicia.reid@example.com
              </div>
              <div class="action-btn">
                <button class="submit-btn">Find Courses</button>
              </div>
            </div>
          </div>
        </div>
        <GoogleMapComponent
          googleMapURL={GOOGLE_URL}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div id="map" />}
          mapElement={<div style={{ height: `100%` }} />}
        ></GoogleMapComponent>
      </section>
    </main>
  );
};

// Course.requiresAuth = true;
// Course.redirectUnauthenticated = "/login";

export default Centers;
