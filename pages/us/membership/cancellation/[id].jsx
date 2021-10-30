import React, { useState } from "react";
import { api } from "@utils";
import { withSSRContext } from "aws-amplify";
import { useRouter } from "next/router";
import classNames from "classnames";
import { useQueryString } from "@hooks";
import Style from "./MembershipCancellation.module.scss";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { id: subscriptionId } = router.query;
  const { data, status, error: errorMessage, isError } = cancelSubscription;
  const { totalAmountWillBeDeducted } = data || [];

  const { subscriptions = [] } = profile || {};

  const userSubscriptions = subscriptions.find((subscription) => {
    return subscription.sfid === subscriptionId;
  });

  if (!userSubscriptions) {
    return <div>Invalid subscription Id</div>;
  }

  const backToProfileAction = (e) => {
    if (e) e.preventDefault();
    router.push({
      pathname: `/us/profile`,
    });
  };

  const payAndCancel = async (subsciptionId) => {
    if (loading) {
      return false;
    }

    setLoading(true);

    try {
      if (!subsciptionId) {
        throw new Error("Invalid subsciptionId Id");
      }
      const {
        data,
        status,
        error: errorMessage,
        isError,
      } = await api.post({
        path: "cancelSubscriptionStep2",
        body: {
          id: subsciptionId,
          amountDue: totalAmountWillBeDeducted,
        },
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }
      router.push({
        pathname: `/us/profile`,
        query: {
          request: 2,
        },
      });
    } catch (error) {
      console.log(error);

      router.push({
        pathname: `/us/profile`,
        query: {
          request: 1,
        },
      });
    }
  };

  return (
    <main>
      <section
        className={classNames(
          "journey-cancellation",
          Style.journeyCancellation,
        )}
      >
        <div className="container">
          <div className="col-10 m-auto">
            <div className="journey-cancellation__card mx-auto">
              <div className="journey-cancellation__card-info">
                <h1 className="journey-cancellation__card-title section-title">
                  {userSubscriptions.name} Cancellation
                </h1>
                <p className="journey-cancellation__card-text">
                  We are sorry to see you go. Is there anything we could do to
                  support your journey? Please reach out to our team at{" "}
                  <a href="tel:8442735500">(844) 273-5500</a> or
                </p>
                <p className="journey-cancellation__card-text">
                  <a
                    href="mailto:support@us.artofliving.org"
                    className="journey-cancellation__card-link link_orange"
                  >
                    support@us.artofliving.org
                  </a>
                  .
                </p>
                {totalAmountWillBeDeducted > 0 && (
                  <>
                    <p className="journey-cancellation__card-text">
                      If you cancel your {userSubscriptions.name} Membership
                      today, you’ll be charged for the remainder of your annual
                      commitment.
                    </p>
                    <h2 className="journey-cancellation__card-subtitle">
                      Cancellation Details:
                    </h2>
                    <ul className="journey-cancellation__card-details">
                      <li className="journey-cancellation__card-details-item">
                        <span>
                          You have used your $400 tuition waiver for a Silent
                          Retreat as part of a 12-month commitment.
                        </span>
                      </li>
                      <li className="journey-cancellation__card-details-item">
                        <span>
                          You will be charged{" "}
                          <strong>${totalAmountWillBeDeducted}</strong>
                        </span>
                      </li>
                    </ul>
                  </>
                )}
                {totalAmountWillBeDeducted === 0 && (
                  <p className="journey-cancellation__card-text pt-4">
                    You can cancel your membership by clicking the link below.
                  </p>
                )}
              </div>
              <div className="journey-cancellation__card-bottom-info">
                <div className="btn-wrapper">
                  {totalAmountWillBeDeducted > 0 && (
                    <button className="btn-outline" onClick={payAndCancel}>
                      {loading && (
                        <div className="loaded" style={{ padding: "0px 58px" }}>
                          <div className="loader">
                            <div className="loader-inner ball-clip-rotate">
                              <div />
                            </div>
                          </div>
                        </div>
                      )}
                      {!loading &&
                        `Pay $${totalAmountWillBeDeducted} and cancel`}
                    </button>
                  )}
                  {totalAmountWillBeDeducted === 0 && (
                    <a
                      href="#"
                      className="link link_dark"
                      onClick={payAndCancel}
                    >
                      {loading && (
                        <div className="loaded" style={{ padding: "0px 58px" }}>
                          <div className="loader">
                            <div className="loader-inner ball-clip-rotate">
                              <div />
                            </div>
                          </div>
                        </div>
                      )}
                      {!loading && `No thanks, I’ll cancel`}
                    </a>
                  )}
                  <button
                    className="btn-secondary v2"
                    onClick={backToProfileAction}
                  >
                    {loading && (
                      <div className="loaded" style={{ padding: "0px 58px" }}>
                        <div className="loader">
                          <div className="loader-inner ball-clip-rotate">
                            <div />
                          </div>
                        </div>
                      </div>
                    )}
                    {!loading && `Keep my membership`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="journey-cancellation_mobile">
        <div className="container">
          <div className="col-lg-10 col-12 h-100 m-auto">
            <div className="h-100 w-100 position-relative">
              <div className="journey-cancellation_mobile__info">
                <h1 className="journey-cancellation_mobile__title section-title">
                  {userSubscriptions.name} Cancellation
                </h1>
                <p className="journey-cancellation_mobile__text">
                  We are sorry to see you go. Is there anything we could do to
                  support your journey? Please reach out to our team at{" "}
                  <a href="tel:8442735500">(844) 273-5500</a> or
                </p>
                <p className="journey-cancellation_mobile__text">
                  <a
                    className="journey-cancellation_mobile__link link_orange"
                    href="mailto:support@us.artofliving.org"
                  >
                    support@us.artofliving.org
                  </a>
                  .
                </p>

                {totalAmountWillBeDeducted > 0 && (
                  <>
                    <p className="journey-cancellation_mobile__text">
                      If you cancel your {userSubscriptions.name} Membership
                      today, you’ll be charged for the remainder of your annual
                      commitment.
                    </p>
                    <h2 className="journey-cancellation_mobile__subtitle">
                      Cancellation Details:
                    </h2>
                    <ul className="journey-cancellation_mobile__details">
                      <li className="journey-cancellation_mobile__details-item">
                        <span>
                          You have used your $400 tuition waiver for a Silent
                          Retreat as part of a 12-month commitment.
                        </span>
                      </li>
                      <li className="journey-cancellation_mobile__details-item">
                        <span>
                          You will be charged{" "}
                          <strong>${totalAmountWillBeDeducted}</strong>
                        </span>
                      </li>
                    </ul>
                  </>
                )}
                {totalAmountWillBeDeducted === 0 && (
                  <p className="journey-cancellation_mobile__text">
                    You can cancel your membership by clicking the link below.
                  </p>
                )}
              </div>
              <div className="btn-wrapper">
                <button
                  className="btn-secondary v2"
                  onClick={backToProfileAction}
                >
                  {loading && (
                    <div className="loaded" style={{ padding: "0px 58px" }}>
                      <div className="loader">
                        <div className="loader-inner ball-clip-rotate">
                          <div />
                        </div>
                      </div>
                    </div>
                  )}
                  {!loading && `Keep my membership`}
                </button>
                {totalAmountWillBeDeducted > 0 && (
                  <button className="btn-outline" onClick={payAndCancel}>
                    {loading && (
                      <div className="loaded" style={{ padding: "0px 58px" }}>
                        <div className="loader">
                          <div className="loader-inner ball-clip-rotate">
                            <div />
                          </div>
                        </div>
                      </div>
                    )}
                    {!loading && `Pay $${totalAmountWillBeDeducted} and cancel`}
                  </button>
                )}
                {totalAmountWillBeDeducted === 0 && (
                  <a href="#" className="link link_dark" onClick={payAndCancel}>
                    {loading && (
                      <div className="loaded" style={{ padding: "0px 58px" }}>
                        <div className="loader">
                          <div className="loader-inner ball-clip-rotate">
                            <div />
                          </div>
                        </div>
                      </div>
                    )}
                    {!loading && `No thanks, I’ll cancel`}
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
