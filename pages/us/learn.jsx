import { CONTENT_FOLDER_IDS } from '@constants';
import ErrorPage from 'next/error';

export const getServerSideProps = async (context) => {
  return {
    redirect: {
      permanent: false,
      destination: `/us-en/library/${CONTENT_FOLDER_IDS.WISDOM_FOLDER_ID}`,
    },
    props: {},
  };
};

export default function LearnRedirect() {
  return <ErrorPage statusCode={404} />;
}
