import Document, { Html, Head, Main, NextScript } from "next/document";
import { orgConfig } from "@org";

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={`/assets/${orgConfig.favicon180}`}
          ></link>
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={`/assets/${orgConfig.favicon32}`}
          ></link>
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={`/assets/${orgConfig.favicon16}`}
          ></link>
          <link rel="manifest" href="/assets/site.webmanifest"></link>
          <link
            rel="mask-icon"
            href="/assets/safari-pinned-tab.svg"
            color="#5bbad5"
          ></link>
          <link
            rel="shortcut icon"
            href={`/assets/${orgConfig.favicon}`}
          ></link>
          <meta name="msapplication-TileColor" content="#da532c"></meta>
          <meta name="theme-color" content="#ffffff"></meta>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content={orgConfig.title} />
          <link
            href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&amp;display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&amp;display=swap"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css"
            integrity="sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn"
            crossOrigin="anonymous"
          />
          {/* Talkable script */}
          <script
            async
            src="//d2jjzw81hqbuqv.cloudfront.net/integration/clients/art-of-living-staging.min.js"
            type="text/javascript"
          ></script>
          {/* <script
            strategy="lazyOnload"
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&libraries=places`}
          ></script> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
