import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import withUserInfo from '../../../src/hoc/withUserInfo';
import classNames from 'classnames';
import { COURSE_TYPES } from '@constants';

const CouponStack = dynamic(() =>
  import('@components/profile').then((mod) => mod.CouponStack),
);

const ReferAFriend = () => {
  const [selectedReward, setSelectedReward] = useState('earnReward');
  return (
    <div>
      <div className="profile-form-box">
        <div className="refer-section">
          <div className="top-logo">
            <img
              src="/img/ic-logo-2.svg"
              className="logo footer-logo"
              alt="logo"
              height="44"
            />
          </div>
          <h1 className="title">
            Journey Deeper:
            <br />
            Empower your life & your Friends!
          </h1>
          <div className="section-desc">
            Refer a friend to the Art of Living - Part 1 Course, you get a
            chance to WIN a transformative silence program
          </div>
          <div className="refer-section-items">
            <div className="refer-section-col">
              <CouponStack></CouponStack>
            </div>
          </div>
          <div id="talkable-offer"></div>
          <div className="accordion" id="accordionRefer">
            <div className="refer-accordion-item">
              <div className="refer-accordion-header" id="referHeadingOne">
                <h2 className="mb-0">
                  <button
                    className={classNames('btn btn-link btn-block text-left', {
                      collapsed: selectedReward !== 'earnReward',
                    })}
                    type="button"
                    data-toggle="collapse"
                    data-target="#referCollapseOne"
                    aria-expanded={selectedReward === 'earnReward'}
                    aria-controls="referCollapseOne"
                    onClick={() => setSelectedReward('earnReward')}
                  >
                    How To Earn Rewards
                    <span className="icon-aol iconaol-arrow-down"></span>
                  </button>
                </h2>
              </div>

              <div
                id="referCollapseOne"
                className={classNames('collapse', {
                  show: selectedReward === 'earnReward',
                })}
                aria-labelledby="referHeadingOne"
                data-parent="#accordionRefer"
              >
                <div className="reward-accordion-body">
                  <ol>
                    <li>
                      Invite your friends to take the{' '}
                      {COURSE_TYPES.SKY_BREATH_MEDITATION.name} course
                    </li>
                    <li>
                      For every friend that completes the course, you’ll be
                      entered into a Sweepstakes where you can win an{' '}
                      {COURSE_TYPES.SILENT_RETREAT.name} Course (Silence
                      Program) online or in-person up to a value of $700. The
                      winner will be announced at the end of every quarter. See
                      T&Cs for details.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="refer-accordion-item">
              <div className="refer-accordion-header" id="referHeadingTwo">
                <h2 className="mb-0">
                  <button
                    onClick={() => setSelectedReward('claimReward')}
                    className={classNames('btn btn-link btn-block text-left', {
                      collapsed: selectedReward !== 'claimReward',
                    })}
                    type="button"
                    data-toggle="collapse"
                    data-target="#referCollapseTwo"
                    aria-expanded={selectedReward === 'claimReward'}
                    aria-controls="referCollapseTwo"
                  >
                    How To Claim The Rewards
                    <span className="icon-aol iconaol-arrow-down"></span>
                  </button>
                </h2>
              </div>
              <div
                id="referCollapseTwo"
                className={classNames('collapse', {
                  show: selectedReward === 'claimReward',
                })}
                aria-labelledby="referHeadingTwo"
                data-parent="#accordionRefer"
              >
                <div className="reward-accordion-body">
                  <ol>
                    <li>
                      The winner of the Sweepstakes will receive an email with a
                      coupon code for the {COURSE_TYPES.SILENT_RETREAT.name}{' '}
                      Course.
                    </li>
                    <li>
                      Enter the coupon code when registering for the course and
                      enjoy a few days of deep calm & peace.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withUserInfo(ReferAFriend);
