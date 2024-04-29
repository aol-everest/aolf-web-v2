/* eslint-disable react/no-unescaped-entities */
import { COURSE_TYPES_MASTER, COURSE_TYPES } from '@constants';
import { orgConfig } from '@org';
import Link from '@components/linkWithUTM';

const CourseTypeTile = ({ courseType }) => {
  const findCourseAction = () => {
    if (courseType.isExternal) {
      return courseType.link;
    } else {
      return `/us-en/courses/${courseType.slug}`;
    }
  };

  return (
    <div className="course-item">
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
            <a className="course-link" href="#">
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
export default Home;
