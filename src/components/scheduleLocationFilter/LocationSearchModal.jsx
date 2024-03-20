/* eslint-disable react/display-name */
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { ScheduleLocationFilterNew } from '@components/scheduleLocationFilter/ScheduleLocationFilterNew';

const LocationSearchModal = React.memo(
  ({
    handleModalToggle,
    showLocationModal,
    locationFilter,
    handleLocationFilterChange,
  }) => {
    const [selectedLocation, setSelectedLocation] = useState(locationFilter);
    const findCourses = () => {
      handleLocationFilterChange(selectedLocation);
      handleModalToggle();
    };
    return (
      <Modal
        show={showLocationModal}
        onHide={handleModalToggle}
        backdrop="static"
        className="location-search bd-example-modal-lg"
        dialogClassName="modal-dialog modal-dialog-centered modal-lg"
      >
        <Modal.Header>Find courses near you</Modal.Header>
        <Modal.Body>
          <div className="form-item">
            <ScheduleLocationFilterNew
              handleLocationChange={setSelectedLocation}
              value={locationFilter}
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
