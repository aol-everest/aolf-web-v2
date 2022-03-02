import { useRouter } from "next/router";
import { BuilderComponent, Builder, builder } from "@builder.io/react";
import DefaultErrorPage from "next/error";
import Head from "next/head";
import "@builder.io/widgets";
import { NextSeo } from "next-seo";
import ContentLoader from "react-content-loader";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);

export async function getStaticProps({ params }) {
  const page =
    (await builder
      .get("page", {
        userAttributes: {
          urlPath: "/" + (params?.page?.join("/") || ""),
        },
      })
      .toPromise()) || null;
  return {
    props: {
      page,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  };
}

export async function getStaticPaths() {
  const pages = await builder.getAll("page", {
    options: { noTargeting: true },
    // omit: "data.blocks",
  });

  return {
    paths: pages.map((page) => `/us-en/ex-page${page.data?.url}`),
    fallback: true,
  };
}

export default function Page({ page }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="tw-m-7">
        <ContentLoader
          viewBox="0 0 400 160"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="80" y="73" rx="3" ry="3" width="254" height="6" />
          <rect x="78" y="88" rx="3" ry="3" width="254" height="6" />
          <rect x="150" y="103" rx="3" ry="3" width="118" height="6" />
          <circle cx="210" cy="27" r="22" />
          <circle cx="181" cy="151" r="6" />
          <circle cx="211" cy="151" r="6" />
          <circle cx="241" cy="151" r="6" />
          <rect x="37" y="54" rx="32" ry="32" width="15" height="15" />
          <rect x="37" y="46" rx="0" ry="0" width="4" height="18" />
          <rect x="54" y="54" rx="32" ry="32" width="15" height="15" />
          <rect x="54" y="46" rx="0" ry="0" width="4" height="19" />
          <rect x="336" y="118" rx="32" ry="32" width="15" height="15" />
          <rect x="357" y="118" rx="32" ry="32" width="15" height="15" />
          <rect x="347" y="123" rx="0" ry="0" width="4" height="18" />
          <rect x="368" y="123" rx="0" ry="0" width="4" height="18" />
        </ContentLoader>
        <ContentLoader viewBox="0 0 400 160">
          <rect x="0" y="13" rx="4" ry="4" width="400" height="9" />
          <rect x="0" y="29" rx="4" ry="4" width="100" height="8" />
          <rect x="0" y="50" rx="4" ry="4" width="400" height="10" />
          <rect x="0" y="65" rx="4" ry="4" width="400" height="10" />
          <rect x="0" y="79" rx="4" ry="4" width="100" height="10" />
          <rect x="0" y="99" rx="5" ry="5" width="400" height="200" />
        </ContentLoader>
        <ContentLoader
          viewBox="0 0 1500 400"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="27" y="139" rx="4" ry="4" width="20" height="20" />
          <rect x="67" y="140" rx="10" ry="10" width="85" height="19" />
          <rect x="188" y="141" rx="10" ry="10" width="169" height="19" />
          <rect x="402" y="140" rx="10" ry="10" width="85" height="19" />
          <rect x="523" y="141" rx="10" ry="10" width="169" height="19" />
          <rect x="731" y="139" rx="10" ry="10" width="85" height="19" />
          <rect x="852" y="138" rx="10" ry="10" width="85" height="19" />
          <rect x="1424" y="137" rx="10" ry="10" width="68" height="19" />
          <rect x="26" y="196" rx="4" ry="4" width="20" height="20" />
          <rect x="66" y="197" rx="10" ry="10" width="85" height="19" />
          <rect x="187" y="198" rx="10" ry="10" width="169" height="19" />
          <rect x="401" y="197" rx="10" ry="10" width="85" height="19" />
          <rect x="522" y="198" rx="10" ry="10" width="169" height="19" />
          <rect x="730" y="196" rx="10" ry="10" width="85" height="19" />
          <rect x="851" y="195" rx="10" ry="10" width="85" height="19" />
          <circle cx="1456" cy="203" r="12" />
          <rect x="26" y="258" rx="4" ry="4" width="20" height="20" />
          <rect x="66" y="259" rx="10" ry="10" width="85" height="19" />
          <rect x="187" y="260" rx="10" ry="10" width="169" height="19" />
          <rect x="401" y="259" rx="10" ry="10" width="85" height="19" />
          <rect x="522" y="260" rx="10" ry="10" width="169" height="19" />
          <rect x="730" y="258" rx="10" ry="10" width="85" height="19" />
          <rect x="851" y="257" rx="10" ry="10" width="85" height="19" />
          <circle cx="1456" cy="265" r="12" />
          <rect x="26" y="316" rx="4" ry="4" width="20" height="20" />
          <rect x="66" y="317" rx="10" ry="10" width="85" height="19" />
          <rect x="187" y="318" rx="10" ry="10" width="169" height="19" />
          <rect x="401" y="317" rx="10" ry="10" width="85" height="19" />
          <rect x="522" y="318" rx="10" ry="10" width="169" height="19" />
          <rect x="730" y="316" rx="10" ry="10" width="85" height="19" />
          <rect x="851" y="315" rx="10" ry="10" width="85" height="19" />
          <circle cx="1456" cy="323" r="12" />
          <rect x="26" y="379" rx="4" ry="4" width="20" height="20" />
          <rect x="66" y="380" rx="10" ry="10" width="85" height="19" />
          <rect x="187" y="381" rx="10" ry="10" width="169" height="19" />
          <rect x="401" y="380" rx="10" ry="10" width="85" height="19" />
          <rect x="522" y="381" rx="10" ry="10" width="169" height="19" />
          <rect x="730" y="379" rx="10" ry="10" width="85" height="19" />
          <rect x="851" y="378" rx="10" ry="10" width="85" height="19" />
          <circle cx="1456" cy="386" r="12" />
          <rect x="978" y="138" rx="10" ry="10" width="169" height="19" />
          <rect x="977" y="195" rx="10" ry="10" width="169" height="19" />
          <rect x="977" y="257" rx="10" ry="10" width="169" height="19" />
          <rect x="977" y="315" rx="10" ry="10" width="169" height="19" />
          <rect x="977" y="378" rx="10" ry="10" width="169" height="19" />
          <rect x="1183" y="139" rx="10" ry="10" width="85" height="19" />
          <rect x="1182" y="196" rx="10" ry="10" width="85" height="19" />
          <rect x="1182" y="258" rx="10" ry="10" width="85" height="19" />
          <rect x="1182" y="316" rx="10" ry="10" width="85" height="19" />
          <rect x="1182" y="379" rx="10" ry="10" width="85" height="19" />
          <rect x="1305" y="137" rx="10" ry="10" width="85" height="19" />
          <rect x="1304" y="194" rx="10" ry="10" width="85" height="19" />
          <rect x="1304" y="256" rx="10" ry="10" width="85" height="19" />
          <rect x="1304" y="314" rx="10" ry="10" width="85" height="19" />
          <rect x="1304" y="377" rx="10" ry="10" width="85" height="19" />
          <circle cx="37" cy="97" r="11" />
          <rect x="26" y="23" rx="5" ry="5" width="153" height="30" />
          <circle cx="1316" cy="88" r="11" />
          <rect x="1337" y="94" rx="0" ry="0" width="134" height="3" />
          <circle cx="77" cy="96" r="11" />
        </ContentLoader>
      </div>
    );
  }
  const isLive = !Builder.isEditing && !Builder.isPreviewing;
  if (!page && isLive) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
          <meta name="title"></meta>
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  const { title, description, image } = page?.data || {};
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NextSeo
        title={title}
        description={description}
        openGraph={{
          type: "website",
          title,
          description,
          images: [
            {
              url: image,
              width: 800,
              height: 600,
              alt: title,
            },
          ],
        }}
      />
      <BuilderComponent model="page" content={page} />
    </>
  );
}
