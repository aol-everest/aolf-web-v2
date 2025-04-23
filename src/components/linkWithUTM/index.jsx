import { filterAllowedParams } from '@utils/utmParam';
import appendQuery from 'append-query';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { forwardRef } from 'react';

const Link = forwardRef(({ children, href, ...rest }, ref) => {
  const router = useRouter();

  const filteredParams = filterAllowedParams(router.query);
  const allParams = {
    ...filteredParams,
  };
  const urlWithUTM = appendQuery(href, queryString.stringify(allParams));

  return (
    <NextLink {...rest} href={urlWithUTM} passHref ref={ref}>
      {children}
    </NextLink>
  );
});

Link.displayName = 'Link';

export default Link;
