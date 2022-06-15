import Link from "next/link";
import { orgConfig } from "@org";

export function Footer() {
  if (orgConfig.name === "HB") {
    return (
      <footer className="footer footer_courses">
        <nav className="footer-navbar">
          <p className="copyright order-2 order-md-1"></p>
          <ul className="footer-navbar--list order-1 order-md-2 mb-2 mb-md-0">
            <li className="footer-navbar--item">
              <a href="https://healingbreaths.org/sms-policy/">SMS Policy</a>
            </li>

            <li className="footer-navbar--item">
              <Link
                prefetch={false}
                href="https://healingbreaths.org/privacy-policy/"
              >
                <a target="_blank">Privacy Policy</a>
              </Link>
            </li>
            <li className="footer-navbar--item">
              <a href="https://healingbreaths.org/cookie-policy/">
                Cookie Policy
              </a>
            </li>
            <li className="footer-navbar--item">
              <Link
                prefetch={false}
                href="https://healingbreaths.org/terms-of-use/"
              >
                <a target="_blank">Terms of Use</a>
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    );
  }
  return (
    <footer className="footer footer_courses">
      <nav className="footer-navbar">
        <p className="copyright order-2 order-md-1">© 2021 Art of Living</p>
        <ul className="footer-navbar--list order-1 order-md-2 mb-2 mb-md-0">
          <li className="footer-navbar--item">
            <a href="#">SMS Policy</a>
          </li>

          <li className="footer-navbar--item">
            <Link prefetch={false} href="/policy/privacy">
              <a target="_blank">Privacy Policy</a>
            </Link>
          </li>
          <li className="footer-navbar--item">
            <a href="#">Cookie Policy</a>
          </li>
          <li className="footer-navbar--item">
            <Link prefetch={false} href="/policy/ppa-course">
              <a target="_blank">Terms of Use</a>
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
