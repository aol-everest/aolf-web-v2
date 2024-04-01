/* eslint-disable react/no-unescaped-entities */
import { YOUTH_EVENTS_MASTER, YOUTH_EVENTS_TYPES } from '@constants';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import { orgConfig } from '@org';

const CourseTypeTile = ({ courseType }) => {
  const router = useRouter();

  const findCourseAction = (e) => {
    if (e) e.preventDefault();
    if (courseType.isExternal) {
      router.push(courseType.link);
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/courses/${courseType.slug}`,
      });
    }
  };

  return (
    <div class="course-item">
      <div class="course-img">
        <img
          // src={`/img/courses/${courseType.slug}.webp`}
          src={`/img/courses/art-of-living-part-1.webp`}
          alt="course"
          width="642"
          height="240"
        />
      </div>
      <div class="course-info">
        <div class="course-title">{courseType.name}</div>
        <div class="course-desc">{courseType.description}</div>
        <div class="course-action">
          <a class="course-link" href="#" onClick={findCourseAction}>
            Find a course
          </a>
        </div>
      </div>
    </div>
  );
};

const SectionComponent = ({ section }) => {
  const courses = Object.entries(section.courseTypes).reduce(
    (accumulator, [key, value]) => {
      if (YOUTH_EVENTS_TYPES[key]) {
        accumulator = [
          ...accumulator,
          { ...YOUTH_EVENTS_TYPES[key], ...value },
        ];
      } else {
        accumulator = [...accumulator, { ...value }];
      }
      return accumulator;
    },
    [],
  );

  return (
    <section class="beginner-courses">
      <h1 class="section-title">{section.name}</h1>
      <div class="courses-listing">
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
    <main class="all-courses">
      {YOUTH_EVENTS_MASTER[orgConfig.name] &&
        YOUTH_EVENTS_MASTER[orgConfig.name].map((section, i) => {
          return (
            <SectionComponent key={i} section={section}></SectionComponent>
          );
        })}
    </main>
  );
};

export default Home;
