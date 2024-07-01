import React from 'react';
// import dynamic from 'next/dynamic';
import { withAuth, withUserInfo } from '@hoc';

// const PastCoursesComp = dynamic(() =>
//   import('@components/profile').then((mod) => mod.PastCourses),
// );

const Preferences = () => {
  return (
    <div>
      <div className="profile-form-box">
        <div className="user-preferences">
          <div className="preferred-centers">
            <h2 className="title">Preferred Centers</h2>
            <div className="desc">You can add up to 3</div>
            <div className="centers-listing">
              <div className="center-item">
                <div className="item-top-row">
                  <div className="number">1</div>
                  <div className="city">New York</div>
                  <button className="delete-item">
                    <span className="icon-aol iconaol-trash"></span>
                  </button>
                </div>
                <div className="center-other-info">
                  <span className="icon-aol iconaol-location"></span>
                  1901 Thornridge Cir. Shiloh, Hawaii 81063
                </div>
                <div className="center-other-info">
                  <span className="icon-aol iconaol-call-calling"></span>
                  (808) 555-0111
                </div>
                <div className="center-other-info">
                  <span className="icon-aol iconaol-sms"></span>
                  felicia.reid@example.com
                </div>
              </div>
              <div className="center-item">
                <div className="item-top-row">
                  <div className="number">2</div>
                  <div className="city">New York</div>
                  <button className="delete-item">
                    <span className="icon-aol iconaol-trash"></span>
                  </button>
                </div>
                <div className="center-other-info">
                  <span className="icon-aol iconaol-location"></span>
                  1901 Thornridge Cir. Shiloh, Hawaii 81063
                </div>
                <div className="center-other-info">
                  <span className="icon-aol iconaol-call-calling"></span>
                  (808) 555-0111
                </div>
                <div className="center-other-info">
                  <span className="icon-aol iconaol-sms"></span>
                  felicia.reid@example.com
                </div>
              </div>
              <div
                className="center-item add-new"
                data-toggle="modal"
                data-target="#addNewModal"
              >
                <span className="icon-aol iconaol-add-square"></span>
                <div>Add New Center</div>
              </div>
            </div>
          </div>
          <div className="preferred-teachers">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(withUserInfo(Preferences));
