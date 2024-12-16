/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Popup from './popup';

export function PopVariation2({ closeAction, acceptAction, show }) {
  return (
    <Popup closeAction={closeAction} show={show}>
      <div class="section-left">
        <img src="/img/popup-cover2.webp" alt="Gurudev" class="cover-image" />
        <div class="review-rating-box">
          <div class="reviewers">
            <img src="/img/1-comments.png" alt="reviewer" />
            <img src="/img/1-sahaj-comment.png" alt="reviewer" />
            <img src="/img/1-silent-comments.png" alt="reviewer" />
            <img src="/img/4-comments.png" alt="reviewer" />
          </div>
          <div class="review-text">
            800M+ people have already transformed their lives with ArtOfLiving
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
        <div class="review-rating-box">
          <div class="reviewers">
            <img src="/img/1-comments.png" alt="reviewer" />
            <img src="/img/1-sahaj-comment.png" alt="reviewer" />
          </div>
          <div class="review-text">
            800M+ people have already transformed their lives with ArtOfLiving
            courses
          </div>
        </div>
        <h2 class="title">Secure Your Spot Now!</h2>
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
          <h4>Bonuses</h4>
          <ul>
            <li>Access to 6 day #SleepBetter Challenge</li>
            <li>Extra guided meditation from Gurudev</li>
            <li>Inspirational Quotes E-book</li>
          </ul>
        </div>
        <div class="note">Limited Spots Available! Secure yours now.</div>
        <div class="popup-actions">
          <button class="btn btn-primary" type="button" onClick={acceptAction}>
            Continue
          </button>
          <a class="maybe-link" onClick={closeAction}>
            Maybe later
          </a>
        </div>
      </div>
    </Popup>
  );
}
