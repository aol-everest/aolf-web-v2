import ErrorPage from "next/error";
import { CONTENT_FOLDER_IDS } from "@constants";

export const getServerSideProps = async (context) => {
  return {
    redirect: {
      permanent: false,
      destination: `/us-en/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
    },
    props: {},
  };
};

export default function MeditateRedirect() {
  return <ErrorPage statusCode={404} />;
}
