/* eslint-disable react/no-unescaped-entities */
import { COURSE_TYPES_MASTER, COURSE_TYPES } from '@constants';
import { orgConfig } from '@org';
import Link from '@components/linkWithUTM';
import { NextSeo } from 'next-seo';
import Script from 'next/script';
import { useEffect } from 'react';

const CourseTypeTile = ({ courseType }) => {
  const findCourseAction = () => {
    if (courseType.isExternal) {
      return courseType.link;
    } else {
      return `/us-en/courses/${courseType.slug}`;
    }
  };

  useEffect(() => {
    window.iticks = window.iticks || {};
  }, []);

  return (
    <div className="course-item">
      <Script
        id="intelliticks-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(I, L, T, i, c, k, s) {
            if(I.iticks) return;
            I.iticks = {host: c, settings: s, clientId: k, cdn: L, queue: []};
            var h = T.head || T.documentElement;
            var e = T.createElement(i);
            var l = I.location;
            e.async = true;
            e.src = (L || c) + '/client/inject-v2.min.js';
            h.insertBefore(e, h.firstChild);
            I.iticks.call = function(a, b) { I.iticks.queue.push([a, b]); };
          })(window, 'https://cdn-v1.intelliticks.com/prod/common', document, 'script', 'https://app.intelliticks.com', 'LZ8KCvfnuX6wbRgga_c', {});
          `,
        }}
      />
      <div className="course-img">
        <img
          src={`/img/courses/${courseType.slug}.webp`}
          alt="course"
          width="642"
          height="240"
        />
      </div>
      <div className="course-info">
        <div className="course-title">{courseType.name}</div>
        <div className="course-desc">{courseType.description}</div>
        <div className="course-action">
          <Link href={findCourseAction()} legacyBehavior>
            <a
              className={`${orgConfig.name === 'PWHT' ? 'course-link-pwht' : 'course-link'}`}
              href="#"
            >
              Find a course
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

const SectionComponent = ({ section }) => {
  const courses = Object.entries(section.courseTypes).reduce(
    (accumulator, [key, value]) => {
      if (COURSE_TYPES[key]) {
        accumulator = [...accumulator, { ...COURSE_TYPES[key], ...value }];
      } else {
        accumulator = [...accumulator, { ...value }];
      }
      return accumulator;
    },
    [],
  );

  return (
    <section className="beginner-courses">
      <h1 className="section-title">{section.name}</h1>
      <div className="courses-listing">
        {courses.map((courseType, i) => {
          return (
            <CourseTypeTile courseType={courseType} key={i}></CourseTypeTile>
          );
        })}
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <main className="all-courses">
      <NextSeo
        defaultTitle="Art of Living Courses Overview"
        description="A brief overview of the Art of Living course offerings including beginners, advanced and training courses"
      />
      {COURSE_TYPES_MASTER[orgConfig.name] &&
        COURSE_TYPES_MASTER[orgConfig.name].map((section, i) => {
          return (
            <SectionComponent key={i} section={section}></SectionComponent>
          );
        })}
    </main>
  );
};
Home.sideGetStartedAction = true;
Home.hideFooter = orgConfig.name === 'PWHT' ?? false;
export default Home;
