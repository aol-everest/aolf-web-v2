/* eslint-disable react/no-unescaped-entities */
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

function LoginPage() {
  const router = useRouter();

  return (
    <main className="login-register-page">
      <section className="section-login-register">
        <div className="container">
          <h1 className="page-title">Create an account</h1>
          <div className="login-options">
            <button className="google-icon">
              <img src="/img/google-icon.svg" />
            </button>
            <button className="facebook-icon">
              <img src="/img/facebook-icon.svg" />
            </button>
            <button
              className="apple-icon"
              data-toggle="modal"
              data-target="#login-appleID"
            >
              <img src="/img/apple-icon.svg" />
            </button>
          </div>
          <div className="or-separator">
            <span>OR</span>
          </div>
          <div className="form-login-register">
            <div className="form-item">
              <label for="fname">First name</label>
              <input
                id="fname"
                type="text"
                className="input-field"
                placeholder="First name"
              />
            </div>
            <div className="form-item">
              <label for="lname">Last name</label>
              <input
                id="lname"
                type="text"
                className="input-field"
                placeholder="Last name"
              />
            </div>
            <div className="form-item">
              <label for="email">Email address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="Email address"
              />
            </div>
            <div className="form-item password">
              <label for="pass">Password</label>
              <input
                id="email"
                type="password"
                className="input-field password"
                placeholder="Password"
              />
              <button className="showPassBtn">
                <img
                  src="/img/PasswordEye.svg"
                  width="16"
                  height="16"
                  alt="Show Password"
                />
              </button>
            </div>
            <div className="form-item checkbox">
              <input type="checkbox" id="toc" />
              <label className="toc" for="toc">
                By signing up, I agree to <a href="">Terms of Service</a> and{' '}
                <a href="">Privacy Policy</a>
              </label>
            </div>
            <div className="form-action">
              <button className="submit-btn">Sign up</button>
            </div>
            <div className="form-other-info">
              Already have an account? <a href="login.html">Log in</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
LoginPage.hideFooter = true;

export default LoginPage;
