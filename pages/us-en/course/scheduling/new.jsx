import { ScheduleLocationFilterNew } from '@components/scheduleLocationFilter/ScheduleLocationFilterNew';
import { useSessionStorage } from '@uidotdev/usehooks';
import { getLatLangByZipCode, getZipCodeByLatLang } from '@utils';
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';

const New = () => {
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [locationFilter, setLocationFilter] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUserLocationShared, setIsUserLocationShared] = useState(false);
  const [value, setValue] = useSessionStorage('zipCode', '');

  const handleLocationFilterChange = (value) => {};

  const handleModalToggle = () => {
    if (showLocationModal) {
      setIsInitialLoad(true);
    }
    setShowLocationModal(!showLocationModal);
  };

  useEffect(() => {
    const getAddress = async () => {
      if (value) {
        const latLng = await getLatLangByZipCode(value);
        setZipCode(value);
        if (latLng?.locationName) {
          setLocationFilter(latLng);
        }
      }
    };
    getAddress();
  }, [value]);

  useEffect(() => {
    const getUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const [zipCode] = await Promise.all([
              getZipCodeByLatLang(latitude, longitude),
            ]);
            setIsUserLocationShared(true);
            setValue(zipCode);
            setZipCode(zipCode);
            setLocationFilter({ lat: latitude, lng: longitude, zipCode });
          },
          (error) => {
            console.error('Error getting location:', error.message);
          },
        );
      } else {
        console.error('Geolocation is not supported by your browser.');
      }
    };
    getUserLocation();
  }, []);

  const LocationSearchModal = ({
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
        <Modal.Header closeButton>Find courses near you</Modal.Header>
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
            className="btn btn-primary find-courses submit-btn"
            onClick={findCourses}
          >
            Continue
          </button>
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <main class="scheduling-page">
      <section class="scheduling-top">
        <div class="container">
          <h1 class="page-title">Art of Living Part 1</h1>
          <div class="page-description">
            Join the 45 million individuals across 180 countries who have
            experienced the benefits of this distinctive 3-day course (2.5 hours
            per day)
          </div>
        </div>
      </section>
      <section class="calendar-section">
        <div class="container">
          <div class="calendar-area-wrap">
            <div class="first-col">
              <div class="cal-filters">
                <div class="form-item">
                  <label>Course type</label>
                  <select
                    class="input-select"
                    id="courseType"
                    name="courseType"
                  ></select>
                </div>
                <div class="form-item">
                  <label>Enter a zip code of city</label>
                  <input
                    class="custom-input tw-mx-auto tw-mb-0 tw-mt-1 !tw-w-[85%] scheduling-address"
                    type="text"
                    autocomplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded="false"
                    placeholder="Filter by zip code or city"
                    value=""
                  />
                </div>
              </div>

              <div class="scheduling-modal__content-calendar">
                <label>
                  <input
                    data-input-style="box"
                    data-label-style="stacked"
                    id="calendar"
                    mbsc-input=""
                    placeholder="Please Select..."
                    type="text"
                    class="flatpickr-input"
                    readonly="readonly"
                  />
                </label>
                <div class="event-type-pills">
                  <div class="online">Online</div>
                  <div class="inPerson">In person</div>
                </div>
              </div>
            </div>
            <div class="second-col">
              <div class="payment-box">
                <div class="payment-total-box">
                  <label>Total:</label>
                  <div class="amount">$295</div>
                </div>
                <div class="payment-details">
                  <div class="payby">
                    Pay As Low As{' '}
                    <img src="/img/logo-affirm.webp" height="22" />
                  </div>
                  <div class="price-breakup">
                    <div class="price-per-month">
                      $27/<span>month</span>
                    </div>
                    <div class="payment-tenure">for 12 months</div>
                  </div>
                </div>
                <div class="offer-box">
                  <h2 class="title">
                    <span class="icon-wrap">
                      <img
                        src="/img/stars-02.svg"
                        width="20"
                        height="20"
                        alt=""
                      />
                    </span>
                    19,820 people took the course in this city
                  </h2>
                  <div class="offer-text">
                    You can become part of the community at our center!
                  </div>
                </div>
                <div class="checkout-details">
                  <div class="section__body">
                    <div class="detail-item row">
                      <div class="label col-5">
                        <svg class="detailsIcon icon-calendar"></svg> Date:
                      </div>
                      <div class="value col-7">August 01-03, 2023</div>
                    </div>
                    <div class="detail-item row">
                      <div class="label col-5">
                        <svg class="detailsIcon icon-calendar"></svg> Timing:
                      </div>
                      <div class="value col-7">
                        Tu: 12:00 PM-2:30 PM ET
                        <br />
                        We: 12:00 PM-2:30 PM ET
                        <br />
                        Th: 12:00 PM-2:30 PM ET
                      </div>
                    </div>
                    <div class="detail-item row">
                      <div class="label col-5">
                        <svg class="detailsIcon icon-calendar"></svg>{' '}
                        Instructor(s):
                      </div>
                      <div class="value col-7">
                        Nikhil Sole
                        <br />
                        Roopali Madan
                      </div>
                    </div>
                    <div class="detail-item row">
                      <div class="label col-5">
                        <svg class="detailsIcon icon-calendar"></svg> Location:
                      </div>
                      <div class="value col-7">
                        13473 Dolomite DR Frisko, TX 75035
                      </div>
                    </div>
                    <div class="detail-item row">
                      <div class="label col-5">
                        <svg class="detailsIcon icon-calendar"></svg> Contact
                        details:
                      </div>
                      <div class="value col-7">
                        (732) 476-4073
                        <br />
                        <a href="mailto:shravanb@artofliving.org">
                          shravanb@artofliving.org
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="payment-agreements">
                  <div class="form-item">
                    <input type="checkbox" id="agreement1" />
                    <label class="events-news" for="agreement1">
                      I agree to the{' '}
                      <a href="#">
                        Participant agreement including privacy and cancellation
                        policy
                      </a>
                    </label>
                  </div>
                  <div class="form-item">
                    <input type="checkbox" id="agreement2" />
                    <label class="events-news" for="agreement2">
                      I represent that I am in good physical and mental
                      condition, and fit to participate in this course. I
                      particularly acknowledge that, if I am diagnosed with any
                      mental and/or physical conditions (including complex PTSD,
                      schizophrenia; schizoaffective, bipolar, or seizure
                      disorders; pregnancy; or recent surgery), I will consult
                      with my medical provider prior to participating in the
                      course.
                    </label>
                  </div>
                </div>
                <div class="payment-actions">
                  <button class="submit-btn gpay">
                    Buy with{' '}
                    <img
                      src="/img/Gpay-Payment-icon.webp"
                      alt="gpay"
                      height="24"
                    />
                  </button>
                  <button
                    class="submit-btn"
                    data-toggle="modal"
                    data-target="#availableTimeModal"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="testimonials">
        <div class="container">
          <div class="top-text">TESTIMONIALS</div>
          <h2 class="section-title">What people are sharing</h2>
          <div class="testimonials-listing">
            <div class="testimonial-item">
              <div class="author-picutre">
                <img
                  src="/img/testimony-adinah.webp"
                  alt="Adinah"
                  height="70"
                  width="70"
                />
              </div>
              <div class="testimony-text">
                “Wow. It made a significant impression on me, was very very
                enjoyable, at times profound, and I plan to keep practicing.”
              </div>
              <div class="author-name">Adinah</div>
            </div>
            <div class="testimonial-item">
              <div class="author-picutre">
                <img
                  src="/img/testimony-joanna.webp"
                  alt="Joanna"
                  height="70"
                  width="70"
                />
              </div>
              <div class="testimony-text">
                “It was awesome! I regained my mental health. And I also feel so
                much lighter and happier. I got out of my funk that was getting
                me unmotivated.”
              </div>
              <div class="author-name">Joanna</div>
            </div>
            <div class="testimonial-item">
              <div class="author-picutre">
                <img
                  src="/img/testimony-vijitha.webp"
                  alt="Vijitha"
                  height="70"
                  width="70"
                />
              </div>
              <div class="testimony-text">
                “It was liberating. Any time my mind is wiggling between the
                past and the future, I notice it and have found a hack to bring
                myself back to the present.”
              </div>
              <div class="author-name">Vijitha</div>
            </div>
          </div>
        </div>
      </section>
      <LocationSearchModal
        handleModalToggle={handleModalToggle}
        showLocationModal={showLocationModal}
        locationFilter={locationFilter}
        handleLocationFilterChange={handleLocationFilterChange}
      />

      <div
        class="available-time modal fade bd-example-modal-lg"
        id="availableTimeModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="title">Available Time</h2>
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="time-slot-changer">
                <button class="prev-slot">
                  <img src="/img/chevron-left.svg" />
                </button>
                <div class="slot-info">January 18-21, 2024 PT</div>
                <button class="next-slot">
                  <img src="/img/chevron-right.svg" />
                </button>
              </div>
              <div class="slot-listing">
                <div class="slot-item">
                  <div class="slot-type">
                    <div class="slot-info">151W 30th Street, New York, NY</div>
                    <div class="slot-select form-item">
                      <input type="radio" />
                    </div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/18, Mon</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/19, Tue</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/20, Wed</div>
                    <div class="slot-time">12pm - 2:30pm ET</div>
                  </div>
                </div>
                <div class="slot-item">
                  <div class="slot-type">
                    <div class="slot-info">Online</div>
                    <div class="slot-select form-item">
                      <input type="radio" />
                    </div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/18, Mon</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/19, Tue</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/20, Wed</div>
                    <div class="slot-time">12pm - 2:30pm ET</div>
                  </div>
                </div>
                <div class="slot-item">
                  <div class="slot-type">
                    <div class="slot-info">151W 30th Street, New York, NY</div>
                    <div class="slot-select form-item">
                      <input type="radio" />
                    </div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/18, Mon</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/19, Tue</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/20, Wed</div>
                    <div class="slot-time">12pm - 2:30pm ET</div>
                  </div>
                </div>
                <div class="slot-item">
                  <div class="slot-type">
                    <div class="slot-info">151W 30th Street, New York, NY</div>
                    <div class="slot-select form-item">
                      <input type="radio" />
                    </div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/18, Mon</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/19, Tue</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/20, Wed</div>
                    <div class="slot-time">12pm - 2:30pm ET</div>
                  </div>
                </div>
                <div class="slot-item">
                  <div class="slot-type">
                    <div class="slot-info">151W 30th Street, New York, NY</div>
                    <div class="slot-select form-item">
                      <input type="radio" />
                    </div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/18, Mon</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/19, Tue</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/20, Wed</div>
                    <div class="slot-time">12pm - 2:30pm ET</div>
                  </div>
                </div>
                <div class="slot-item">
                  <div class="slot-type">
                    <div class="slot-info">151W 30th Street, New York, NY</div>
                    <div class="slot-select form-item">
                      <input type="radio" />
                    </div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/18, Mon</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/19, Tue</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/20, Wed</div>
                    <div class="slot-time">12pm - 2:30pm ET</div>
                  </div>
                </div>
                <div class="slot-item">
                  <div class="slot-type">
                    <div class="slot-info">151W 30th Street, New York, NY</div>
                    <div class="slot-select form-item">
                      <input type="radio" />
                    </div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/18, Mon</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/19, Tue</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/20, Wed</div>
                    <div class="slot-time">12pm - 2:30pm ET</div>
                  </div>
                </div>
                <div class="slot-item">
                  <div class="slot-type">
                    <div class="slot-info">151W 30th Street, New York, NY</div>
                    <div class="slot-select form-item">
                      <input type="radio" />
                    </div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/18, Mon</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/19, Tue</div>
                    <div class="slot-time">12pm - 2:30 pm ET</div>
                  </div>
                  <div class="slot-timing">
                    <div class="slot-date">1/20, Wed</div>
                    <div class="slot-time">12pm - 2:30pm ET</div>
                  </div>
                </div>
              </div>
              <div class="slot-action">
                <button
                  type="button"
                  data-dismiss="modal"
                  class="btn btn-primary find-courses submit-btn"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default New;
