import { useEffect } from 'react';

export default function ClevertapAnalytics() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID) {
      window.clevertap = {
        event: [],
        profile: [],
        account: [],
        onUserLogin: [],
        region: 'us1',
        notifications: [],
        privacy: [],
      };
      window.clevertap.account.push({
        id: process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID,
      });
      window.clevertap.privacy.push({ optOut: false }); //set the flag to true, if the user of the device opts out of sharing their data
      window.clevertap.privacy.push({ useIP: false }); //set the flag to true, if the user agrees to share their IP data
      (function () {
        var wzrk = document.createElement('script');
        wzrk.type = 'text/javascript';
        wzrk.async = true;
        wzrk.src =
          ('https:' == document.location.protocol
            ? 'https://d2r1yp2w7bby2u.cloudfront.net'
            : 'http://static.clevertap.com') + '/js/clevertap.min.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wzrk, s);
      })();
    }
  }, []);
  //   if (process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID) {
  //     return (
  //       <>
  //         {/* <Script
  //           strategy="afterInteractive"
  //           id="clevertap-script"
  //           src="https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js"
  //         /> */}
  //         <Script id="clevertap-analytics" strategy="afterInteractive">
  //           {`var clevertap = {event:[], profile:[], account:[], onUserLogin:[], notifications:[], privacy:[]};
  //         clevertap.account.push({"id": "${process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID}"});
  //         clevertap.privacy.push({optOut: false});
  //         clevertap.privacy.push({useIP: false});
  //         (function () {
  //         var wzrk = document.createElement('script');
  //         wzrk.type = 'text/javascript';
  //         wzrk.async = true;
  //         wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/clevertap.min.js';
  //         var s = document.getElementsByTagName('script')[0];
  //         s.parentNode.insertBefore(wzrk, s);
  //     })();
  // `}
  //         </Script>
  //       </>
  //     );
  //   }
  return null;
}
