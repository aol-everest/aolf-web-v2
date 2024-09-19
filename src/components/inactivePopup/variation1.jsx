/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Popup from './popup';

export function PopVariation1({ closeAction }) {
  return (
    <Popup closeAction={closeAction}>
      <div class="section-left">
        <img src="/img/popup-cover1.webp" alt="Gurudev" class="cover-image" />
        <div class="review-rating-box">
          <div class="reviewers">
            <img src="/img/1-comments.png" alt="reviewer" />
            <img src="/img/1-sahaj-comment.png" alt="reviewer" />
            <img src="/img/1-silent-comments.png" alt="reviewer" />
            <img src="/img/4-comments.png" alt="reviewer" />
          </div>
          <div class="review-text">
            500M+ people have already transformed their lives with ArtOfLiving
            courses
          </div>
          <div class="rating-wrap">
            <img src="/img/rating-orange-4-7.webp" height="20" alt="rating" />
          </div>
          <div class="trustpilot-text">
            <strong>Excellent</strong> on Trustpilot
          </div>
        </div>
      </div>
      <div class="section-right">
        <h2 class="title">Did You Know?</h2>
        <div class="section-desc">
          SKY Breath Meditation offers{' '}
          <strong>scientifically proven benefits</strong> for your well-being.
        </div>
        <div class="course-features">
          <h4>
            Join the Art of Living Part 1 course
            <br />
            and enjoy:
          </h4>
          <ul>
            <li>Reduced anxiety and stress</li>
            <li>Lower cortisol levels</li>
            <li>Improved sleep, energy, and focus</li>
          </ul>
        </div>
        <div class="course-bonus">
          <h4>Bonus</h4>
          <ul>
            <li>Free "5 Keys to a Joyful Life" Toolkit!</li>
          </ul>
        </div>
        <div class="note">Limited Spots Available! Secure yours now.</div>
        <div class="popup-actions">
          <button class="btn btn-primary" type="button">
            Continue
          </button>
          <a class="maybe-link">Maybe later</a>
        </div>
      </div>
    </Popup>
  );
}
