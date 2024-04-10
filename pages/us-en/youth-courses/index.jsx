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
    <div className="course-item">
      <div className="course-img">
        <img
          // src={`/img/courses/${courseType.slug}.webp`}
          src={`/img/courses/art-of-living-part-1.webp`}
          alt="course"
          width="642"
          height="240"
        />
      </div>
      <div className="course-info">
        <div className="course-title">{courseType.name}</div>
        <div className="course-desc">{courseType.description}</div>
        <div className="course-action">
          <a className="course-link" href="#" onClick={findCourseAction}>
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
  const sections = YOUTH_EVENTS_MASTER[orgConfig.name] || [];
  return (
    <main className="all-courses">
      {sections.map((section, i) => (
        <SectionComponent key={i} section={section}></SectionComponent>
      ))}
    </main>
  );
};

export default Home;
