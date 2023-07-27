import { Footer, Header, NoHeader, WCFHeader } from "@components";

export const Layout = ({
  hideHeader = false,
  hideFooter = false,
  wcfHeader = false,
  children,
}) => (
  <>
    {!hideHeader && <Header />}
    {hideHeader && !wcfHeader && <NoHeader />}
    {hideHeader && wcfHeader && <WCFHeader />}
    {children}
    {!hideFooter && <Footer />}
  </>
);
