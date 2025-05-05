import React from 'react';
import {
  FEATURES_DATA,
  FEATURES_DATA_SAHAJ,
  FEATURES_DATA_SILENT,
} from './featuresData';

const FeaturesList = React.memo(
  ({ className = '', isSahajSamadhiMeditationType, isSilentRetreatType }) => {
    const featuredData = isSahajSamadhiMeditationType
      ? FEATURES_DATA_SAHAJ
      : isSilentRetreatType
        ? FEATURES_DATA_SILENT
        : FEATURES_DATA;
    return (
      <div className={`features ${className}`}>
        {featuredData.map((feature, index) => (
          <div key={feature.title} className="feature__box">
            <div className="feature__title">
              <img src={feature.icon} width="24" height="24" alt="" />
              {feature.title}
            </div>
            <div className="feature__content">{feature.content}</div>
          </div>
        ))}
      </div>
    );
  },
);

FeaturesList.displayName = 'FeaturesList';

export default FeaturesList;
