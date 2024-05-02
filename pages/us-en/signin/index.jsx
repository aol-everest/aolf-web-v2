/* eslint-disable react/no-unescaped-entities */
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

function LoginPage() {
  const router = useRouter();

  return (
    <main className="login-register-page">
      <section className="section-login-register">
        <div className="container">
          <h1 className="page-title">Log in to your account</h1>
          <div className="page-description">
            Welcome back! Please enter your details.
          </div>
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
            <div className="form-item">
              <a href="#" className="forgot-pass">
                Forgot password
              </a>
            </div>
            <div className="form-action">
              <button className="submit-btn">Log in</button>
            </div>
            <div className="form-other-info">
              Don't have an account? <a href="#">Sign up</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
LoginPage.hideFooter = true;

export default LoginPage;
