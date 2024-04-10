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
    <div class="course-item">
      <div class="course-img">
        <img
          src={`/img/courses/${courseType.slug}.webp`}
          alt="course"
          width="642"
          height="240"
        />
      </div>
      <div class="course-info">
        <div class="course-title">{courseType.name}</div>
        <div class="course-desc">{courseType.description}</div>
        <div class="course-action">
          <Link href={findCourseAction()} legacyBehavior>
            <a class="course-link" href="#">
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
      {COURSE_TYPES_MASTER[orgConfig.name] &&
        COURSE_TYPES_MASTER[orgConfig.name].map((section, i) => {
          return (
            <SectionComponent key={i} section={section}></SectionComponent>
          );
        })}
    </main>
  );
};

export default Home;
