/* eslint-disable react/no-unescaped-entities */
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

function LoginPage() {
  const router = useRouter();

  return (
    <main class="login-register-page">
      <section class="section-login-register">
        <div class="container">
          <h1 class="page-title">Create an account</h1>
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
              <label for="fname">First name</label>
              <input
                id="fname"
                type="text"
                class="input-field"
                placeholder="First name"
              />
            </div>
            <div class="form-item">
              <label for="lname">Last name</label>
              <input
                id="lname"
                type="text"
                class="input-field"
                placeholder="Last name"
              />
            </div>
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
            <div class="form-item checkbox">
              <input type="checkbox" id="toc" />
              <label class="toc" for="toc">
                By signing up, I agree to <a href="">Terms of Service</a> and{' '}
                <a href="">Privacy Policy</a>
              </label>
            </div>
            <div class="form-action">
              <button class="submit-btn">Sign up</button>
            </div>
            <div class="form-other-info">
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
