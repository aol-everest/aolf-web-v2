import React, { useEffect, useState } from 'react';
import { withAuth, withUserInfo } from '@hoc';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@components/loader';
import { api, createCompleteAddress, joinPhoneNumbers } from '@utils';
import { MODAL_TYPES } from '@constants';
import { useGlobalModalContext } from '@contexts';
import { useGeolocation } from '@uidotdev/usehooks';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import ContentLoader from 'react-content-loader';
import classNames from 'classnames';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';

const MAX_CENTER_PREFERENCE_LIMIT = 3;

const CenterItem = ({ index, center, removeCenterAction, goFindCourse }) => {
  const phoneNumber = joinPhoneNumbers(
    center.centerPhone1,
    center.centerPhone2,
  );

  return (
    <div className="center-item">
      <div className="item-top-row">
        <div className="number">{index + 1}</div>
        <div className="city">{center.centerName}</div>
        <button className="delete-item" onClick={removeCenterAction}>
          <span className="icon-aol iconaol-trash"></span>
        </button>
      </div>
      <div className="center-other-info">
        <span className="icon-aol iconaol-location"></span>
        {createCompleteAddress({
          streetAddress1: center.streetAddress1,
          streetAddress2: center.streetAddress2,
          city: center.city,
          zipCode: center.postalOrZipCode,
          state: center.stateProvince,
        })}
      </div>
      <div className="center-other-info">
        <span className="icon-aol iconaol-call-calling"></span>
        {phoneNumber}
      </div>
      <div className="center-other-info">
        <span className="icon-aol iconaol-sms"></span>
        {center.centerEmail}
      </div>
      <div class="action-btn">
        <button class="submit-btn" onClick={goFindCourse}>
          Find Courses
        </button>
      </div>
    </div>
  );
};

const AddCenterItem = ({ center, isSelected, selectCenterAction }) => {
  const phoneNumber = joinPhoneNumbers(center.phone1, center.phone2);
  return (
    <div class={classNames('center-item', { selected: isSelected })}>
      <div className="item-top-row">
        {center.isNationalCenter && (
          <span className="icon-aol iconaol-hindu-temple"></span>
        )}

        <div className="city">{center.centerName}</div>
      </div>
      <div className="center-other-info">
        <span className="icon-aol iconaol-location"></span>
        {createCompleteAddress({
          streetAddress1: center.streetAddress1,
          streetAddress2: center.streetAddress2,
          city: center.city,
          zipCode: center.postalOrZipCode,
          state: center.stateProvince,
        })}
      </div>
      {phoneNumber && (
        <div className="center-other-info">
          <span className="icon-aol iconaol-call-calling"></span>
          {phoneNumber}
        </div>
      )}
      {center.email && (
        <div className="center-other-info">
          <span className="icon-aol iconaol-sms"></span>
          {center.email}
        </div>
      )}
      <div className="center-select-actions">
        <button className="center-select" onClick={selectCenterAction}>
          Select
        </button>
      </div>
    </div>
  );
};

const AddCenterModel = ({ hideModal, addCenterAction, oldPreference }) => {
  const { latitude, longitude, loading } = useGeolocation();
  const [selectedCenter, setSelectedCenter] = useState([]);
  const allowedSelectionLimit =
    MAX_CENTER_PREFERENCE_LIMIT - oldPreference.length;

  const [location, setLocation] = useState({
    address: '',
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    setLocation((prevState) => ({
      ...prevState,
      latitude: latitude || null,
      longitude: longitude || null,
    }));
  }, [latitude, longitude]);
  const placeholder = location.address || 'Search...';

  const handleChange = (address) => {
    setLocation((prevLocation) => ({
      ...prevLocation,
      address: address,
    }));
  };

  const [isItemSelected, setIsItemSelected] = useState(false);

  const selectCenterAction = (id) => () => {
    if (selectedCenter.includes(id)) {
      // If id exists, remove it
      setSelectedCenter(selectedCenter.filter((centerId) => centerId !== id));
    } else {
      // If id does not exist, add it
      if (selectedCenter.length < allowedSelectionLimit) {
        setSelectedCenter([...selectedCenter, id]);
      }
    }
  };

  const handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        const { lat, lng } = latLng;
        setLocation((prevLocation) => ({
          ...prevLocation,
          address: address,
          latitude: lat,
          longitude: lng,
        }));
        setIsItemSelected(true);
      })
      .catch((error) => console.error('Error', error));
  };
  const clearSearch = () => {
    setLocation({
      address: '',
      latitude: latitude || null,
      longitude: longitude || null,
    });
  };
  const { data: allCenters, isLoading } = useQuery({
    queryKey: ['allCenters', location.latitude, location.longitude],
    queryFn: async () => {
      const response = await api.get({
        path: 'getAllCenters',
        param: {
          lat: location.latitude || 40.73061,
          lng: location.longitude || -73.935242,
        },
      });
      const data = (response.data || []).filter((center) => {
        return center.email || center.phone1 || center.phone2;
      });
      return data;
    },
  });

  const addNewCenters = () => {
    hideModal();
    addCenterAction(selectedCenter);
  };

  const renderLoader = () => {
    return (
      <>
        {Array.from({ length: 9 }, (_, index) => (
          <div className="center-item" key={index}>
            <ContentLoader
              backgroundColor="#f3f3f3"
              foregroundColor="#c2c2c2"
              viewBox="0 0 320 170"
            >
              <rect x="14" y="14" rx="3" ry="3" width="180" height="13" />
              <rect x="14" y="30" rx="3" ry="3" width="10" height="10" />
              <rect x="29" y="30" rx="3" ry="3" width="74" height="10" />

              <circle cx="305" cy="27" r="8" />
              <rect x="0" y="53" rx="0" ry="0" width="320" height="1" />
              <rect x="219" y="146" rx="0" ry="0" width="0" height="0" />
              <rect x="34" y="70" rx="3" ry="3" width="250" height="13" />
              <rect x="0" y="103" rx="0" ry="0" width="320" height="1" />
              <rect x="34" y="120" rx="3" ry="3" width="250" height="13" />
              <rect x="34" y="140" rx="3" ry="3" width="250" height="13" />
              <rect x="34" y="160" rx="3" ry="3" width="250" height="13" />
            </ContentLoader>
          </div>
        ))}
      </>
    );
  };

  const allCentersFiltered = (allCenters || []).filter((center) => {
    return !oldPreference.some((pc) => pc.locationId === center.sfid);
  });

  return (
    <div
      className="modal-dialog modal-dialog-centered modal-lg"
      role="document"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="title">Add New Center</h2>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={hideModal}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="desc">
            You can add{' '}
            <strong>{allowedSelectionLimit - selectedCenter.length}</strong>{' '}
            more
          </div>
          <div className="input-search-wrap">
            <PlacesAutocomplete
              value={location.address}
              onChange={handleChange}
              onSelect={handleSelect}
              searchOptions={{
                types: ['(regions)'],
                componentRestrictions: { country: 'us' },
              }}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <div className="search-input-wrap">
                  <input
                    id="search-field"
                    value={location.address}
                    className="search-input"
                    {...getInputProps({
                      placeholder,
                    })}
                  />
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

                  {!!suggestions.length && (
                    <div className="tw-z-10">
                      {suggestions.map((suggestion) => {
                        const className = suggestion.active
                          ? 'suggestion-item--active smart-input--list-item'
                          : 'suggestion-item smart-input--list-item';
                        // inline style for demonstration purpose
                        const style = suggestion.active
                          ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                          : { backgroundColor: '#ffffff', cursor: 'pointer' };
                        return (
                          <>
                            <div
                              {...getSuggestionItemProps(suggestion, {
                                className,
                                style,
                              })}
                            >
                              <strong>
                                {suggestion.formattedSuggestion.mainText}
                              </strong>{' '}
                              <small>
                                {suggestion.formattedSuggestion.secondaryText}
                              </small>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </PlacesAutocomplete>
          </div>
          <div className="centers-listing">
            {(isLoading || loading) && renderLoader()}
            {!isLoading &&
              !loading &&
              allCentersFiltered &&
              allCentersFiltered.map((center) => {
                const isSelected =
                  (selectedCenter || []).indexOf(center.sfid) >= 0;
                return (
                  <AddCenterItem
                    key={center.sfid}
                    center={center}
                    isSelected={isSelected}
                    selectCenterAction={selectCenterAction(center.sfid)}
                  />
                );
              })}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              data-dismiss="modal"
              className="btn btn-primary submit-btn"
              onClick={addNewCenters}
            >
              Add New Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Preferences = () => {
  const { showModal, hideModal } = useGlobalModalContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    data = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: 'getAllPreference',
    queryFn: async () => {
      const response = await api.get({
        path: 'getAllPreference',
      });
      return response.data;
    },
  });

  const addCenterAction = async (centerIds) => {
    if (centerIds && centerIds.length > 0) {
      setLoading(true);
      const { error: errorMessage, isError } = await api.post({
        path: 'preferredLocation',
        body: {
          locationIds: centerIds,
          operation: 'add',
        },
      });
      await refetch();
      setLoading(false);
    }
  };

  const removeCenterAction = (centerId) => async (e) => {
    if (centerId) {
      setLoading(true);
      const { error: errorMessage, isError } = await api.post({
        path: 'preferredLocation',
        body: {
          locationIds: [centerId],
          operation: 'delete',
        },
      });
      await refetch();
      setLoading(false);
    }
  };

  const showAddCenterModel = () => {
    showModal(MODAL_TYPES.NEW_MODAL, {
      children: (
        <AddCenterModel
          hideModal={hideModal}
          addCenterAction={addCenterAction}
          oldPreference={data.locationPref}
        />
      ),
    });
  };

  const goFindCourse = (center) => () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/centers/courses/${center.locationId}`,
    });
  };

  return (
    <div>
      {(isLoading || loading) && <Loader />}
      <div className="profile-form-box">
        <div className="user-preferences">
          <div className="preferred-centers">
            <h2 className="title">Preferred Centers</h2>
            <div className="desc">
              You can add up to {MAX_CENTER_PREFERENCE_LIMIT}
            </div>
            <div className="centers-listing">
              {data.locationPref &&
                data.locationPref.map((center, index) => {
                  return (
                    <CenterItem
                      key={center.externalId}
                      index={index}
                      center={center}
                      removeCenterAction={removeCenterAction(
                        center.prefLocation,
                      )}
                      goFindCourse={goFindCourse(center)}
                    ></CenterItem>
                  );
                })}

              {data.locationPref &&
                data.locationPref.length < MAX_CENTER_PREFERENCE_LIMIT && (
                  <div
                    className="center-item add-new"
                    onClick={showAddCenterModel}
                  >
                    <span className="icon-aol iconaol-add-square"></span>
                    <div>Add New Center</div>
                  </div>
                )}
            </div>
          </div>
          {/* <div className="preferred-teachers">
            <h2 className="title">Preferred Advanced Course Teachers</h2>
            <div className="desc">You can add up to 3</div>
            <div className="teachers-listing">
              <div className="teachers-item">
                <div className="teacher-photo">CM</div>
                <div className="teacher-name">Cameron Williamson</div>
                <button className="delete-item">
                  <span className="icon-aol iconaol-trash"></span>
                </button>
              </div>
              <div className="teachers-item">
                <div className="teacher-photo">CM</div>
                <div className="teacher-name">Cameron Williamson</div>
                <button className="delete-item">
                  <span className="icon-aol iconaol-trash"></span>
                </button>
              </div>
              <div className="teachers-item">
                <div className="teacher-photo">CM</div>
                <div className="teacher-name">Cameron Williamson</div>
                <button className="delete-item">
                  <span className="icon-aol iconaol-trash"></span>
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default withAuth(withUserInfo(Preferences));
