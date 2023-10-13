import { Footer, Header, NoHeader, WCFHeader } from '@components';

export const Layout = ({
  hideHeader = false,
  hideFooter = false,
  wcfHeader = false,
  noHeader = false,
  children,
}) => (
  <>
    {!hideHeader && !noHeader && <Header />}
    {hideHeader && !wcfHeader && !noHeader && <NoHeader />}
    {hideHeader && wcfHeader && <WCFHeader />}
    {children}
    {!hideFooter && <Footer />}
  </>
);
