const Unauthorized = () => {
  return (
    <main className="body_wrapper backend-reg-body tw-bg-gray-300 tw-pt-5">
      <div className="container">
        <div className="row">
          <div className="col-12 tw-m-auto tw-my-[50px] tw-max-w-[450px] tw-p-5">
            <h2>Forbidden!</h2>
            <h4>Code 403</h4>
            <div>
              Access Denied. You do not have the permission to access this page
              on this server.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Unauthorized;
