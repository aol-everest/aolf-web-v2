import React from 'react';
import {
  FEATURES_DATA,
  FEATURES_DATA_SAHAJ,
  FEATURES_DATA_SILENT,
  FEATURES_DATA_SLEEP_ENXIETY,
} from './featuresData';

const FeaturesList = React.memo(
  ({
    className = '',
    isSahajSamadhiMeditationType,
    isSilentRetreatType,
    isSleepAnxietyType,
  }) => {
    const featuredData = () => {
      if (isSahajSamadhiMeditationType) {
        return FEATURES_DATA_SAHAJ;
      } else if (isSilentRetreatType) {
        return FEATURES_DATA_SILENT;
      } else if (isSleepAnxietyType) {
        return FEATURES_DATA_SLEEP_ENXIETY;
      } else {
        return FEATURES_DATA;
      }
    };

    return (
      <div className={`features ${className}`}>
        {featuredData().map((feature, index) => (
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
