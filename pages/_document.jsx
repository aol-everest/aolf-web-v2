/* eslint-disable @next/next/no-css-tags */
/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable @next/next/no-sync-scripts */

import { orgConfig } from '@org';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { getStructuredData } from '../next-seo.config';

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    const structuredData = getStructuredData(orgConfig);

    return (
      <Html lang="en">
        <Head>
          {/* Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />

          {/* Meta Tags */}
          <meta name="referrer" content="no-referrer-when-downgrade" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content={orgConfig.title} />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#da532c" />

          {/* Favicons */}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={`/assets/${orgConfig.favicon180}`}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={`/assets/${orgConfig.favicon32}`}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={`/assets/${orgConfig.favicon16}`}
          />
          <link rel="shortcut icon" href={`/assets/${orgConfig.favicon}`} />
          <link rel="manifest" href="/assets/site.webmanifest" />
          <link
            rel="mask-icon"
            href="/assets/safari-pinned-tab.svg"
            color="#5bbad5"
          />

          {/* Fonts */}
          <link rel="stylesheet" href="/fonts/poppins/poppins.css" />
          <link rel="stylesheet" href="/fonts/metropolis/metropolis.css" />
          <link rel="stylesheet" href="/fonts/worksans/worksans.css" />
          <link
            href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* Bootstrap */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css"
            integrity="sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn"
            crossOrigin="anonymous"
          />

          {/* Analytics */}
          <Script id="google-analytics" strategy="beforeInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
            `}
          </Script>

          {/* External Scripts */}
          <script
            async
            src="https://amazon-cognito-assets.us-east-2.amazoncognito.com/amazon-cognito-advanced-security-data.min.js"
          />
          <script defer src="https://www.dwin1.com/51621.js" />
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&libraries=geometry,drawing,places&loading=async`}
          />
          <script
            async
            defer
            crossOrigin="anonymous"
            src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v10.0"
          />
          <script async src="https://www.instagram.com/embed.js" />

          {/* Post-Robot for cross-domain communication */}
          <script
            src="https://unpkg.com/post-robot@8.0.32/dist/post-robot.min.js"
            crossOrigin="anonymous"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          {process.env.NEXT_PUBLIC_TALKABLE_INSTANCE_URL && (
            <script async src={process.env.NEXT_PUBLIC_TALKABLE_INSTANCE_URL} />
          )}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
