/* eslint-disable react/no-unescaped-entities */

export function StepAuth({ errors, handleNext, ...props }) {
  return (
    <section className="world-culture-festival">
      <div className="world-culture-festival__background world-culture-festival__background_people-1">
        <img src="/img/joel-reyer-QlYwXbFeymE-unsplash.png" />
      </div>

      <div className="container world-culture-festival__container">
        <div className="world-culture-festival__column">
          <p className="wcf-body world-culture-festival__subtitle">
            <span>Sign in</span> with your Journey account or log in below:
          </p>

          <div className="wcf-auth-selector world-culture-festival__selector">
            <button
              className="wcf-auth-selector__button wcf-auth-selector__button_active"
              type="button"
              data-target="sign-up-form"
            >
              Sign Up
            </button>
            <button
              className="wcf-auth-selector__button"
              type="button"
              data-target="log-in-form"
            >
              Log in
            </button>
          </div>

          <form className="wcf-form" id="sign-up-form">
            <div className="wcf-form__fields">
              <div className="wcf-input wcf-form__field">
                <label for="sign-up-email" className="wcf-input__label">
                  Email
                </label>
                <input
                  type="email"
                  id="sign-up-email"
                  className="wcf-input__field"
                  placeholder="Enter your email"
                />
              </div>

              <div className="wcf-input wcf-form__field">
                <label for="sign-up-password" className="wcf-input__label">
                  Password
                </label>
                <input
                  type="password"
                  id="sign-up-password"
                  className="wcf-input__field"
                  placeholder="Enter your password"
                />
              </div>

              <div className="wcf-input wcf-form__field">
                <label for="sign-up-first-name" className="wcf-input__label">
                  First name
                </label>
                <input
                  type="text"
                  id="sign-up-first-name"
                  className="wcf-input__field"
                  placeholder="Enter your first name"
                />
              </div>

              <div className="wcf-input wcf-form__field">
                <label for="sign-up-last-name" className="wcf-input__label">
                  Last name
                </label>
                <input
                  type="text"
                  id="sign-up-last-name"
                  className="wcf-input__field"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <button
              className="wcf-button wcf-form__button"
              onClick={handleNext}
            >
              Sign up
            </button>
          </form>

          {false && (
            <form className="wcf-form" id="log-in-form">
              <div className="wcf-form__fields">
                <div className="wcf-input wcf-form__field">
                  <label for="log-in-email" className="wcf-input__label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="log-in-email"
                    className="wcf-input__field"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="wcf-input wcf-form__field">
                  <label for="log-in-password" className="wcf-input__label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="log-in-password"
                    className="wcf-input__field"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button className="wcf-button wcf-form__button" type="submit">
                Log in
              </button>
            </form>
          )}

          <p className="wcf-body-small world-culture-festival__policy">
            By signing in, I agree to{" "}
            <a className="wcf-link" href="/">
              Terms and Service
            </a>{" "}
            and{" "}
            <a className="wcf-link" href="/">
              Privacy Policy
            </a>
          </p>

          <div className="world-culture-festival__divider">OR</div>

          <div className="world-culture-festival__third-party-auth">
            <button className="wcf-icon-button" type="button">
              <img src="/img/google.png" alt="Sign in with Google" />
            </button>

            <button className="wcf-icon-button" type="button">
              <img src="/img/fb-icon.png" alt="Sign in with Facebook" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
