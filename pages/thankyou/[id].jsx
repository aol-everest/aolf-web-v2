import React from "react";
import { api } from "@utils";
import { withSSRContext } from "aws-amplify";

const Thankyou = ({ workshop }) => {
  return (
    <>
      <main>
        <section class="get-started">
          <div class="container-md">
            <div class="row align-items-center">
              <div class="col-lg-5 col-md-12 p-md-0">
                <div class="get-started__info">
                  <h3 class="get-started__subtitle">You’re going!</h3>
                  <h1 class="get-started__title section-title">
                    The Silent Retreat
                  </h1>
                  <p class="get-started__text">
                    You're registered for the Silent Retreat from Wed, October
                    23 - Fri, October 25, 2020
                  </p>
                  <a class="get-started__link" href="#">
                    Add to Calendar
                  </a>
                  <p class="get-started__text">
                    Next step: You will receive an email with details about your
                    Silent Retreat orientation.
                  </p>
                </div>
              </div>
              <div class="col-lg-6 col-md-12 offset-lg-1 p-0">
                <div class="get-started__video">
                  <iframe
                    src="https://player.vimeo.com/video/432237531"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    allow="autoplay; fullscreen"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="journey-starts">
          <div class="container">
            <div class="program-details">
              <h2 class="program-details__title">Program Details</h2>
              <ul class="program-details__list-schedule">
                <li class="program-details__schedule">
                  <span class="program-details__schedule-date">
                    October 23, 2020
                  </span>
                  <span class="program-details__schedule-time">
                    6:00 PM - 9:30 PM ET
                  </span>
                </li>
                <li class="program-details__schedule">
                  <span class="program-details__schedule-date">
                    October 24, 2020
                  </span>
                  <span class="program-details__schedule-time">
                    7:00 AM - 9:30 PM ET
                  </span>
                </li>
                <li class="program-details__schedule">
                  <span class="program-details__schedule-date">
                    October 25, 2020
                  </span>
                  <span class="program-details__schedule-time">
                    7:00 AM - 5:00 PM ET
                  </span>
                </li>
              </ul>
            </div>
            <h2 class="journey-starts__title section-title">
              Your journey starts here
            </h2>
            <div class="journey-starts__step">
              <div class="journey-starts__step-number">
                <span>1</span>
              </div>
              <div class="journey-starts__detail">
                <h3 class="journey-starts__step-title">This is you-time</h3>
                <p class="journey-starts__step-text">
                  Block your calendar to attend all the sessions via Zoom.
                  Before the session begins, you will receive your Zoom meeting
                  ID and password in your welcome email.
                </p>
              </div>
            </div>
            <div class="journey-starts__step">
              <div class="journey-starts__step-number">
                <span>2</span>
              </div>
              <div class="journey-starts__detail">
                <h3 class="journey-starts__step-title">
                  Getting your tech ready in advance
                </h3>
                <p class="journey-starts__step-text">
                  Download Zoom - When you clock on the zoom call link, it will
                  promp you to download the Zoom app.
                </p>
              </div>
            </div>
            <div class="journey-starts__step">
              <div class="journey-starts__step-number">
                <span>3</span>
              </div>
              <div class="journey-starts__detail">
                <h3 class="journey-starts__step-title">
                  Get comfy, set up your space
                </h3>
                <p class="journey-starts__step-text">
                  Find a qiet, comfortable space where you can enjoy your course
                  undisturbed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div class="course-bottom-card show">
        <div class="container">
          <div class="course-bottom-card__container">
            <div class="course-bottom-card__info-block">
              <div class="course-bottom-card__img d-none d-lg-block">
                <img src="/img/silent-card-img.png" alt="img" />
              </div>
              <div class="course-bottom-card__info">
                <p>October 23-35, 2020</p>
                <div>
                  <h3>Silent Retreat</h3>
                </div>
              </div>
            </div>
            <button id="register-button-2" class="btn-secondary">
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Thankyou;
