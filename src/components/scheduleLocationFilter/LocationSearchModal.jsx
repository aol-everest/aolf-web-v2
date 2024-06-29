/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { ScheduleLocationFilterNew } from '@components/scheduleLocationFilter/ScheduleLocationFilterNew';
import { useAnalytics } from 'use-analytics';

const LocationSearchModal = React.memo(
  ({
    handleModalToggle,
    showLocationModal,
    locationFilter,
    handleLocationFilterChange,
  }) => {
    const { track } = useAnalytics();
    const [selectedLocation, setSelectedLocation] = useState(locationFilter);
    useEffect(() => {
      setSelectedLocation(locationFilter);
    }, [locationFilter]);
    const findCourses = () => {
      handleLocationFilterChange(selectedLocation);
      track('cmodal_zip_first_continue');
      handleModalToggle();
    };

    const handleLocationChange = (location) => {
      setSelectedLocation(location);
      track('cmodal_zip_first');
    };

    return (
      <Modal
        show={showLocationModal}
        onHide={handleModalToggle}
        backdrop="static"
        keyboard={false}
        className="location-search bd-example-modal-lg"
        dialogClassName="modal-dialog modal-dialog-centered modal-lg"
      >
        <Modal.Header>Find courses near you</Modal.Header>
        <Modal.Body>
          <div className="form-item">
            <ScheduleLocationFilterNew
              handleLocationChange={handleLocationChange}
              value={selectedLocation}
              listClassName="result-list"
            />
          </div>
          <button
            type="button"
            data-dismiss="modal"
            disabled={!selectedLocation}
            className="btn btn-primary find-courses submit-btn"
            onClick={findCourses}
          >
            Continue
          </button>
        </Modal.Body>
      </Modal>
    );
  },
);

export default LocationSearchModal;
