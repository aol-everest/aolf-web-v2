import ErrorPage from 'next/error';

export const getServerSideProps = async (context) => {
  return {
    redirect: {
      permanent: false,
      destination: `/us-en/course-finder`,
    },
    props: {},
  };
};

export default function CourseFinderWelcome() {
  return <ErrorPage statusCode={404} />;
}
