const messages = [
  'Loading...',
  'Please wait...',
  'Loading data...',
  'Please wait a moment...',
  'Please wait a few seconds...',
];
export const PageLoading = () => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  return (
    <main>
      <section className="section-login-register">
        <div className="loading-overlay no-bg">
          <div className="overlay-loader"></div>
          <div className="loading-text">
            <p className="tw-font-bold tw-py-5">{message}</p>
            {/* <p>We appreciate your patience during this time!</p> */}
          </div>
        </div>
      </section>
    </main>
  );
};
