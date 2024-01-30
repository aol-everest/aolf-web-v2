import React, { useEffect, useState } from 'react';
import { PageLoading } from '@components';
import ContentLoader from 'react-content-loader';
import { useInfiniteQuery, useQuery } from 'react-query';
import { useUIDSeed } from 'react-uid';
import { useAnalytics } from 'use-analytics';
import { useEffectOnce } from 'react-use';
import ErrorPage from 'next/error';
import { api, createCompleteAddress } from '@utils';
import GoogleMapComponent from '@components/googleMap';

const GOOGLE_URL = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&v=3.exp&libraries=geometry,drawing,places`;

const CenterListItem = ({ center }) => {
  return (
    <div class="search-list-item">
      <div class="title">
        <img src="/img/center-icon.svg" alt="icon" class="icon" />
        {center.centerName}
      </div>
      <div class="info">
        <img class="icon" src="/img/map-search-location-icon.svg" alt="call" />
        {createCompleteAddress({
          streetAddress1: center.streetAddress1,
          streetAddress2: center.streetAddress2,
          city: center.city,
          zipCode: center.postalOrZipCode,
          state: center.stateProvince,
        })}
      </div>
      <div class="info">
        <img class="icon" src="/img/map-search-call-icon.svg" alt="call" />
        {center.phone1 || center.phone2}
      </div>
      <div class="info">
        <img class="icon" src="/img/map-search-email-icon.svg" alt="email" />
        {center.email}
      </div>
      <div class="action-btn">
        <button class="submit-btn">Find Courses</button>
      </div>
    </div>
  );
};

const Centers = () => {
  const [filterCenters, setFilterCenters] = useState([]);
  //     set search query to empty string
  const [q, setQ] = useState('');
  //     set search parameters
  //     we only what to search countries by capital and name
  //     this list can be longer if you want
  //     you can search countries even by their population
  // just add it to this array
  const [searchParam] = useState(['centerName', 'streetAddress1']);
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
      setFilterCenters(response.data);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const search = (items) => {
    return items.filter((item) => {
      return searchParam.some((newItem) => {
        return (
          item[newItem]?.toString().toLowerCase().indexOf(q.toLowerCase()) > -1
        );
      });
    });
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading) return <PageLoading />;
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
            <input
              type="text"
              placeholder="Search..."
              class="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div class="search-listing">
            {search(allCenters).map((center) => {
              return <CenterListItem key={center.sfid} center={center} />;
            })}
          </div>
        </div>
        <GoogleMapComponent
          allCenters={search(allCenters)}
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
