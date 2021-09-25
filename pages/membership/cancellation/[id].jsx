import React from "react";
import { api } from "@utils";
import { withSSRContext } from "aws-amplify";
import classNames from "classnames";
import { useQueryString } from "@hooks";

export async function getServerSideProps({ req, res, query }) {
  const { Auth } = withSSRContext({ req });
  let props = {};
  try {
    const user = await Auth.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const result = await api.get({
      path: "profile",
      token,
    });
    props = {
      authenticated: true,
      token,
      profile: result,
    };
  } catch (err) {
    console.error(err);
    res.writeHead(302, { Location: "/login" });
    res.end();
    return { props: {} };
  }
  try {
    const user = await Auth.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const result = await api.get({
      path: "cancelSubscriptionStep1",
      param: {
        id: query.id,
      },
      token,
    });
    props = {
      ...props,
      cancelSubscription: result,
    };
  } catch (err) {
    console.error(err);
    res.writeHead(302, { Location: "/login" });
    res.end();
  }
  return { props };
}

const MembershipCancellation = ({ cancelSubscription, profile, query }) => {
  console.log(cancelSubscription);
  const [subscriptionId] = useQueryString("id");
  const { data, status, error: errorMessage, isError } = cancelSubscription;
  const { totalAmountWillBeDeducted } = data || [];

  const { subscriptions = [] } = profile || {};

  const userSubscriptions = subscriptions.find((subscription) => {
    return subscription.sfid === subscriptionId;
  });

  if (!userSubscriptions) {
    return <div>Invalid subscription Id</div>;
  }
  return (
    <main>
      <section class="journey-cancellation v3">
        <div class="container">
          <div class="col-10 m-auto">
            <div class="journey-cancellation__card mx-auto">
              <div class="journey-cancellation__card-info">
                <h1 class="journey-cancellation__card-title section-title">
                  {userSubscriptions.name} Cancellation
                </h1>
                <p class="journey-cancellation__card-text">
                  We are sorry to see you go. Is there anything we could do to
                  support your journey? Please reach out to our team at{" "}
                  <a href="tel:8442735500">(844) 273-5500</a> or
                </p>
                <p class="journey-cancellation__card-text">
                  <a
                    href="mailto:support@us.artofliving.org"
                    class="journey-cancellation__card-link link_orange"
                  >
                    support@us.artofliving.org
                  </a>
                  .
                </p>
                {totalAmountWillBeDeducted > 0 && (
                  <>
                    <p class="journey-cancellation__card-text">
                      If you cancel your {userSubscriptions.name} Membership
                      today, you’ll be charged for the remainder of your annual
                      commitment.
                    </p>
                    <h2 class="journey-cancellation__card-subtitle">
                      Cancellation Details:
                    </h2>
                    <ul class="journey-cancellation__card-details">
                      <li class="journey-cancellation__card-details-item">
                        <span>
                          You have used your $400 tuition waiver for a Silent
                          Retreat as part of a 12-month commitment.
                        </span>
                      </li>
                      <li class="journey-cancellation__card-details-item">
                        <span>
                          You will be charged{" "}
                          <strong>${totalAmountWillBeDeducted}</strong>
                        </span>
                      </li>
                    </ul>
                  </>
                )}
                {totalAmountWillBeDeducted === 0 && (
                  <p class="journey-cancellation__card-text pt-4">
                    You can cancel your membership by clicking the link below.
                  </p>
                )}
              </div>
              <div class="journey-cancellation__card-bottom-info">
                <div class="btn-wrapper">
                  {totalAmountWillBeDeducted > 0 && (
                    <button class="btn-outline" onClick={this.payAndCancel}>
                      {inlineLoading && (
                        <div className="loaded" style={{ padding: "0px 58px" }}>
                          <div className="loader">
                            <div className="loader-inner ball-clip-rotate">
                              <div />
                            </div>
                          </div>
                        </div>
                      )}
                      {!inlineLoading &&
                        `Pay $${totalAmountWillBeDeducted} and cancel`}
                    </button>
                  )}
                  {totalAmountWillBeDeducted === 0 && (
                    <a
                      href="#"
                      class="link link_dark"
                      onClick={this.payAndCancel}
                    >
                      {inlineLoading && (
                        <div className="loaded" style={{ padding: "0px 58px" }}>
                          <div className="loader">
                            <div className="loader-inner ball-clip-rotate">
                              <div />
                            </div>
                          </div>
                        </div>
                      )}
                      {!inlineLoading && `No thanks, I’ll cancel`}
                    </a>
                  )}
                  <button
                    class="btn-secondary v2"
                    onClick={this.backToProfileAction}
                  >
                    {inlineLoading && (
                      <div className="loaded" style={{ padding: "0px 58px" }}>
                        <div className="loader">
                          <div className="loader-inner ball-clip-rotate">
                            <div />
                          </div>
                        </div>
                      </div>
                    )}
                    {!inlineLoading && `Keep my membership`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="journey-cancellation_mobile">
        <div class="container">
          <div class="col-lg-10 col-12 h-100 m-auto">
            <div class="h-100 w-100 position-relative">
              <div class="journey-cancellation_mobile__info">
                <h1 class="journey-cancellation_mobile__title section-title">
                  {userSubscriptions.name} Cancellation
                </h1>
                <p class="journey-cancellation_mobile__text">
                  We are sorry to see you go. Is there anything we could do to
                  support your journey? Please reach out to our team at{" "}
                  <a href="tel:8442735500">(844) 273-5500</a> or
                </p>
                <p class="journey-cancellation_mobile__text">
                  <a
                    class="journey-cancellation_mobile__link link_orange"
                    href="mailto:support@us.artofliving.org"
                  >
                    support@us.artofliving.org
                  </a>
                  .
                </p>

                {totalAmountWillBeDeducted > 0 && (
                  <>
                    <p class="journey-cancellation_mobile__text">
                      If you cancel your {userSubscriptions.name} Membership
                      today, you’ll be charged for the remainder of your annual
                      commitment.
                    </p>
                    <h2 class="journey-cancellation_mobile__subtitle">
                      Cancellation Details:
                    </h2>
                    <ul class="journey-cancellation_mobile__details">
                      <li class="journey-cancellation_mobile__details-item">
                        <span>
                          You have used your $400 tuition waiver for a Silent
                          Retreat as part of a 12-month commitment.
                        </span>
                      </li>
                      <li class="journey-cancellation_mobile__details-item">
                        <span>
                          You will be charged{" "}
                          <strong>${totalAmountWillBeDeducted}</strong>
                        </span>
                      </li>
                    </ul>
                  </>
                )}
                {totalAmountWillBeDeducted === 0 && (
                  <p class="journey-cancellation_mobile__text">
                    You can cancel your membership by clicking the link below.
                  </p>
                )}
              </div>
              <div class="btn-wrapper">
                <button
                  class="btn-secondary v2"
                  onClick={this.backToProfileAction}
                >
                  {inlineLoading && (
                    <div className="loaded" style={{ padding: "0px 58px" }}>
                      <div className="loader">
                        <div className="loader-inner ball-clip-rotate">
                          <div />
                        </div>
                      </div>
                    </div>
                  )}
                  {!inlineLoading && `Keep my membership`}
                </button>
                {totalAmountWillBeDeducted > 0 && (
                  <button class="btn-outline" onClick={this.payAndCancel}>
                    {inlineLoading && (
                      <div className="loaded" style={{ padding: "0px 58px" }}>
                        <div className="loader">
                          <div className="loader-inner ball-clip-rotate">
                            <div />
                          </div>
                        </div>
                      </div>
                    )}
                    {!inlineLoading &&
                      `Pay $${totalAmountWillBeDeducted} and cancel`}
                  </button>
                )}
                {totalAmountWillBeDeducted === 0 && (
                  <a
                    href="#"
                    class="link link_dark"
                    onClick={this.payAndCancel}
                  >
                    {inlineLoading && (
                      <div className="loaded" style={{ padding: "0px 58px" }}>
                        <div className="loader">
                          <div className="loader-inner ball-clip-rotate">
                            <div />
                          </div>
                        </div>
                      </div>
                    )}
                    {!inlineLoading && `No thanks, I’ll cancel`}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

MembershipCancellation.hideHeader = true;

export default MembershipCancellation;
