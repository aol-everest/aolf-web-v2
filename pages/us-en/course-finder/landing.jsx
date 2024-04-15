import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import React from 'react';

const Home = () => {
  const router = useRouter();

  const NavigateToWelcome = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course-finder/welcome`,
    });
  };

  return (
    <main className="course-finder-questionnaire">
      <section className="banner-section">
        <div className="container">
          <div className="banner-title">
            Dramatically reduce
            <br />
            anxiety, stress, &<br />
            depression
          </div>
          <div className="banner-desc">
            Increase relaxation brain waves: Feel calm & clear
          </div>
          <div className="banner-register">
            <button className="btn-register" onClick={NavigateToWelcome}>
              Register Now
            </button>
          </div>
          <div className="banner-key-highlights">
            <div className="key-item">
              <div className="key-item--title">42</div>
              <div className="key-item--desc">Years of transforming lives</div>
            </div>
            <div className="key-item">
              <div className="key-item--title">180</div>
              <div className="key-item--desc">
                Countries where our programs made a difference
              </div>
            </div>
            <div className="key-item">
              <div className="key-item--title">10,000+</div>
              <div className="key-item--desc">
                Centers
                <br />
                worldwide
              </div>
            </div>
            <div className="key-item">
              <div className="key-item--title">500M+</div>
              <div className="key-item--desc">
                Lives touched through our courses & events
              </div>
            </div>
          </div>
          <div className="help-action">
            <ul>
              <li>
                <a href="javascript:void()" className="help-link">
                  Help me choose
                </a>
                <div className="find-course">
                  <div className="title">Find the right course for you</div>
                  <div className="desc">Answer a few quick questions...</div>
                  <div className="actions">
                    <button
                      className="btn btn-primary"
                      onClick={NavigateToWelcome}
                    >
                      Get started
                    </button>
                    <button className="btn btn-secondary">Not now</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

Home.hideFooter = true;

export default Home;
