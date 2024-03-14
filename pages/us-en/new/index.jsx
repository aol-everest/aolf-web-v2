/* eslint-disable react/no-unescaped-entities */
import { COURSE_TYPES_MASTER, COURSE_TYPES } from '@constants';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';

const CourseTypeTile = ({ courseType }) => {
  const router = useRouter();

  const findCourseAction = (e) => {
    if (e) e.preventDefault();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course/new/${courseType.slug}`,
    });
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
          <a class="course-link" href="#" onClick={findCourseAction}>
            Find a course
          </a>
        </div>
      </div>
    </div>
  );
};

const SectionComponent = ({ section }) => {
  const courses = section.courseTypes.reduce((accumulator, currentValue) => {
    if (COURSE_TYPES[currentValue]) {
      accumulator = [...accumulator, COURSE_TYPES[currentValue]];
    }
    return accumulator;
  }, []);

  console.log(courses);

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
      {COURSE_TYPES_MASTER.map((section, i) => {
        return <SectionComponent key={i} section={section}></SectionComponent>;
      })}
    </main>
  );
};

export default Home;
