import { Header, NoHeader, Footer } from "@components";

export const Layout = ({
  hideHeader = false,
  hideFooter = false,
  children,
}) => (
  <>
    {!hideHeader && <Header />}
    {hideHeader && <NoHeader />}
    {children}
    {!hideFooter && <Footer />}
  </>
);
