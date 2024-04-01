import ErrorPage from 'next/error';

export const getServerSideProps = async (context) => {
  return {
    redirect: {
      permanent: false,
      destination: `/us-en/courses`,
    },
    props: {},
  };
};

export default function WorkshopRedirect() {
  return <ErrorPage statusCode={404} />;
}
