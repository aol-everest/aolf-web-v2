// components/HubSpotForm.js
import { useEffect } from 'react';

const HubSpotForm = ({ formId, sfdcCampaignId }) => {
  useEffect(() => {
    // Load the HubSpot script
    const script = document.createElement('script');
    script.src = 'https://js.hsforms.net/forms/embed/v2.js';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.onload = () => {
      window.hbspt.forms.create({
        region: 'na1',
        portalId: '4157581',
        formId: formId,
        sfdcCampaignId: sfdcCampaignId,
        target: '#hubspotForm',
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="hubspotForm"></div>;
};

export default HubSpotForm;
