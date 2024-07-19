import ErrorPage from 'next/error';

export const getServerSideProps = async (context) => {
  return {
    redirect: {
      permanent: false,
      destination: `/us-en/profile/update-profile`,
    },
    props: {},
  };
};

export default function ProfileRedirect() {
  return <ErrorPage statusCode={404} />;
}
