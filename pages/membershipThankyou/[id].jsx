import React from "react";
import { api } from "@utils";
import { withSSRContext } from "aws-amplify";
import Style from "./MembershipThankyou.module.scss";
import classNames from "classnames";

const MembershipThankyou = ({ workshop }) => {
  return (
    <main>
      <section className={classNames(Style.congratulations, "congratulations")}>
        <div class="container">
          <div class="row">
            <div class="col-12 col-md-10 mx-auto">
              <h1 class="congratulations__title section-title">
                Congratulations!
              </h1>
              <div class="congratulations__card mx-auto">
                <div class="congratulations__info">
                  <p class="congratulations__info-text">
                    Welcome to the digital membership. We hope you enjoy the
                    journey! Click here to get started with online guided
                    meditations and insights.
                  </p>
                  <div class="congratulations__info_bottom">
                    <button class="btn-secondary">Explore Meditations</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

MembershipThankyou.hideHeader = true;

export default MembershipThankyou;
