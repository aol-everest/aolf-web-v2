import { Header, NoHeader, Footer } from "@components";

const Layout = ({ hideHeader = false, children }) => (
  <>
    {!hideHeader && <Header />}
    {hideHeader && <NoHeader />}
    {children}
  </>
);

export default Layout;
