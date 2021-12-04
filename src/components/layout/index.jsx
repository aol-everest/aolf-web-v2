import { Header, NoHeader, Footer } from "@components";

export const Layout = ({ hideHeader = false, children }) => (
  <>
    {!hideHeader && <Header />}
    {hideHeader && <NoHeader />}
    {children}
    <Footer />
  </>
);
