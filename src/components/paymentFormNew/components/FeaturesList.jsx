import React from 'react';
import { FEATURES_DATA } from './featuresData';

const FeaturesList = React.memo(({ className = '' }) => (
  <div className={`features ${className}`}>
    {FEATURES_DATA.map((feature, index) => (
      <div key={feature.title} className="feature__box">
        <div className="feature__title">
          <img src={feature.icon} width="24" height="24" alt="" />
          {feature.title}
        </div>
        <div className="feature__content">{feature.content}</div>
      </div>
    ))}
  </div>
));

FeaturesList.displayName = 'FeaturesList';

export default FeaturesList;
