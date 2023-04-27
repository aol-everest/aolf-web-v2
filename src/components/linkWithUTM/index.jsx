import NextLink from "next/link";
import { useRouter } from "next/router";
import queryString from "query-string";
import appendQuery from "append-query";
import { filterAllowedParams } from "@utils/utmParam";

export default function Link({ children, href, ...rest }) {
  const router = useRouter();

  const filteredParams = filterAllowedParams(router.query);
  const allParams = {
    ...filteredParams,
  };
  const urlWithUTM = appendQuery(href, queryString.stringify(allParams));

  return (
    <NextLink {...rest} href={urlWithUTM} passHref>
      {children}
    </NextLink>
  );
}
