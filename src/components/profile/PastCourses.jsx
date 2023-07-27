import { api } from "@utils";
import { useState } from "react";
import { useQuery } from "react-query";

export const PastCourses = ({ isMobile }) => {
  const [pastWorkshops, setPastWorkshops] = useState([]);
  const [workshopOrderAsc, setWorkshopOrderAsc] = useState(true);

  const { data = [], isSuccess } = useQuery(
    "userPastCourses",
    async () => {
      const response = await api.get({
        path: "getUserPastCourses",
      });
      const updatedResponse = response.pastWorkshops.sort((a, b) => {
        return (
          new Date(a.eventStartDateTimeGMT) - new Date(b.eventStartDateTimeGMT)
        );
      });
      setPastWorkshops(updatedResponse);
      return updatedResponse;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const handleOrderChange = () => {
    setWorkshopOrderAsc(!workshopOrderAsc);
    const pastWorkshopsReversed = pastWorkshops.reverse();
    setPastWorkshops(pastWorkshopsReversed);
  };

  const skyBreathMeditationCount = pastWorkshops.filter((item) => {
    return item.courseType === "sky";
  }).length;
  const SilentRetreatCount = pastWorkshops.filter((item) => {
    return item.courseType === "silent";
  }).length;
  const SahajSamadhiCount = pastWorkshops.filter((item) => {
    return item.courseType === "sahaj";
  }).length;

  if (!isMobile) {
    return (
      <div
        className="tab-pane past-courses fade active show"
        id="profile-past-courses"
        role="tabpanel"
        aria-labelledby="profile-past-courses-tab"
      >
        <div className="past-courses__cards">
          <div className="past-courses__cards__item">
            <h4 className="past-courses__cards__item-title mr-2">
              SKY Breath Meditation
            </h4>
            <div className="past-courses__cards__item-counter">
              <span>{skyBreathMeditationCount}</span> times
            </div>
          </div>
          <img src="/img/Arrow.svg" className="past-courses__cards__arrow" />
          <div className="past-courses__cards__item">
            <h4 className="past-courses__cards__item-title mr-2">
              Silent Retreat
            </h4>
            <div className="past-courses__cards__item-counter">
              <span>{SilentRetreatCount}</span> times
            </div>
          </div>
          <img src="/img/Arrow.svg" className="past-courses__cards__arrow" />
          <div className="past-courses__cards__item">
            <h4 className="past-courses__cards__item-title mr-2">
              Sahaj Samadhi Meditation
            </h4>
            <div className="past-courses__cards__item-counter">
              <span>{SahajSamadhiCount}</span> time
            </div>
          </div>
        </div>
        <div className="past-courses__table table-responsive-lg">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Course</th>
                <th>Teacher</th>
                <th>Teacher Email</th>
                <th>
                  <button
                    type="button"
                    className="table__sort-button tw-flex"
                    data-order={workshopOrderAsc ? "asc" : "desc"}
                    onClick={handleOrderChange}
                  >
                    <span className="table__sort-button__text">Start Date</span>
                    <span className="tw-pt-1">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="table__sort-button__icon"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9 3.44444C9 3.56481 8.95052 3.66898 8.85156 3.75694L5.35156 6.86806C5.2526 6.95602 5.13542 7 5 7C4.86458 7 4.7474 6.95602 4.64844 6.86806L1.14844 3.75694C1.04948 3.66898 1 3.56481 1 3.44444C1 3.32407 1.04948 3.21991 1.14844 3.13194C1.2474 3.04398 1.36458 3 1.5 3H8.5C8.63542 3 8.7526 3.04398 8.85156 3.13194C8.95052 3.21991 9 3.32407 9 3.44444Z"
                          fill="#C4C5CC"
                        ></path>
                      </svg>
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pastWorkshops.map((workshop, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{workshop.title}</td>
                  <td>{workshop.primaryTeacherName}</td>
                  <td>{workshop.primaryTeacherEmail}</td>
                  <td className="text-right">{workshop.eventStartDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="past-courses__cards">
        <div className="past-courses__cards__item">
          <h4 className="past-courses__cards__item-title">SKY</h4>
          <div className="past-courses__cards__item-counter">
            <span>{skyBreathMeditationCount}</span> times
          </div>
        </div>
        <img src="/img/Arrow.svg" className="past-courses__cards__arrow" />
        <div className="past-courses__cards__item">
          <h4 className="past-courses__cards__item-title">Silent Retreat</h4>
          <div className="past-courses__cards__item-counter">
            <span>{SilentRetreatCount}</span> times
          </div>
        </div>
        <img src="/img/Arrow.svg" className="past-courses__cards__arrow" />
        <div className="past-courses__cards__item">
          <h4 className="past-courses__cards__item-title">Sahaj</h4>
          <div className="past-courses__cards__item-counter">
            <span>{SahajSamadhiCount}</span> time
          </div>
        </div>
      </div>
      <div className="past-courses__data">
        <div className="past-courses__data__items">
          {pastWorkshops.map((workshop, index) => (
            <div className="past-course" key={index}>
              <div className="past-course__meta">
                <span>#{index + 1}</span>
                <span>{workshop.eventStartDate}</span>
              </div>
              <p className="past-course__course">{workshop.title}</p>
              <p className="past-course__teacher">
                {workshop.primaryTeacherName}
              </p>
              <p className="past-course__email">
                {workshop.primaryTeacherEmail}
              </p>
            </div>
          ))}
        </div>
        {/* <button type="button" className="btn btn-outline">
          Load More
        </button> */}
      </div>
    </>
  );
};
