/* eslint-disable react/no-unescaped-entities */
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

function LoginPage() {
  const router = useRouter();

  return (
    <main class="login-register-page">
      <section class="section-login-register">
        <div class="container">
          <h1 class="page-title">Log in to your account</h1>
          <div class="page-description">
            Welcome back! Please enter your details.
          </div>
          <div class="login-options">
            <button class="google-icon">
              <img src="/img/google-icon.svg" />
            </button>
            <button class="facebook-icon">
              <img src="/img/facebook-icon.svg" />
            </button>
            <button
              class="apple-icon"
              data-toggle="modal"
              data-target="#login-appleID"
            >
              <img src="/img/apple-icon.svg" />
            </button>
          </div>
          <div class="or-separator">
            <span>OR</span>
          </div>
          <div class="form-login-register">
            <div class="form-item">
              <label for="email">Email address</label>
              <input
                id="email"
                type="email"
                class="input-field"
                placeholder="Email address"
              />
            </div>
            <div class="form-item password">
              <label for="pass">Password</label>
              <input
                id="email"
                type="password"
                class="input-field password"
                placeholder="Password"
              />
              <button class="showPassBtn">
                <img
                  src="/img/PasswordEye.svg"
                  width="16"
                  height="16"
                  alt="Show Password"
                />
              </button>
            </div>
            <div class="form-item">
              <a href="#" class="forgot-pass">
                Forgot password
              </a>
            </div>
            <div class="form-action">
              <button class="submit-btn">Log in</button>
            </div>
            <div class="form-other-info">
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
