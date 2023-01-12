import Script from "next/script";

export default function ClevertapAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        id="clevertap-script"
        src="https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js"
      />
      <Script id="clevertap-analytics" strategy="afterInteractive">
        {`var clevertap = {event:[], profile:[], account:[], onUserLogin:[], notifications:[], privacy:[]};
        clevertap.account.push({"id": "${process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID}"});
        clevertap.privacy.push({optOut: false}); 
        clevertap.privacy.push({useIP: true});
        clevertap.spa = true`}
      </Script>
    </>
  );
}
