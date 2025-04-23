import React from 'react';

const TrustScore = React.memo(() => (
  <div className="trust-score">
    <div className="first-row">
      Excellent
      <img src="/img/Trustpilo_stars-5.png" alt="Trust Pilot" />
      <img src="/img/TrustPilot-logo2x.webp" alt="Trust Pilot" width="90" />
    </div>
    <div className="second-row">
      TrustScore <strong>4.7</strong>
    </div>
  </div>
));

TrustScore.displayName = 'TrustScore';

export default TrustScore;
