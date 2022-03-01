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
      destination: `/us-en/course/${id}?${urlParameters || ""}`,
    },
    props: {},
  };
};

export default function CourseDetailRedirect() {
  return <ErrorPage statusCode={404} />;
}
