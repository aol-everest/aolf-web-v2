import ErrorPage from "next/error";

export const getServerSideProps = async (context) => {
  return {
    redirect: {
      permanent: false,
      destination: `/us-en/meetup`,
    },
    props: {},
  };
};

export default function MeetupRedirect() {
  return <ErrorPage statusCode={404} />;
}
