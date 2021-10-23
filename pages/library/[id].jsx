import { useRouter } from "next/router";
import { api } from "@utils";
import { DesignOne, DesignTwo } from "@components/content";
import { withSSRContext } from "aws-amplify";
import { NextSeo } from "next-seo";
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
import "swiper/components/pagination/pagination.min.css";
import "swiper/components/a11y/a11y.min.css";
import "swiper/components/scrollbar/scrollbar.min.css";

export const getServerSideProps = async (context) => {
  const { id } = context.query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
    props = {
      authenticated: true,
      username: user.username,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }
  const { data } = await api.get({
    path: "library",
    token,
    param: {
      folderId: id,
    },
  });
  console.log(data);
  if (data.folder.length === 0) {
    throw new Error("Invalid Folder Id");
  }
  props = {
    ...props,
    data,
  };
  // Pass data to the page via props
  return { props };
};

export default function Library({ data, ...rest }) {
  console.log(data);
  const [rootFolder] = data.folder;
  switch (rootFolder.screenDesign) {
    case "Design 1":
      return <DesignOne data={rootFolder} {...rest} />;
    case "Design 2":
      return <DesignTwo data={rootFolder} {...rest} />;
    default:
      return null;
  }
}
