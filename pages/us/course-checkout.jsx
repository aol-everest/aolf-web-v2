import ErrorPage from "next/error";

export const getServerSideProps = async (context) => {
  const { id, ...rest } = context.query;
  const urlParameters =
    rest &&
    Object.entries(rest)
      .map((e) => e.join("="))
      .join("&");
  return {
    redirect: {
      permanent: false,
      destination: `/us-en/course/checkout/${id}?${
        urlParameters + "&page=c-o" || "page=c-o"
      }`,
    },
    props: {},
  };
};

export default function CourseCheckoutRedirect() {
  return <ErrorPage statusCode={404} />;
}
