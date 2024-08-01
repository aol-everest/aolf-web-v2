// components/HubSpotForm.js
import { useEffect } from 'react';

const HubSpotForm = () => {
  useEffect(() => {
    // Load the HubSpot script
    const script = document.createElement('script');
    script.src = 'http://js.hsforms.net/forms/embed/v2.js';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.onload = () => {
      window.hbspt.forms.create({
        region: 'na1',
        portalId: '4157581',
        formId: '38e9752d-78df-4079-b18f-c90e579b0969',
        sfdcCampaignId: '7011I000000CWMgQAO',
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
