import { useRouter } from "next/router";
import { BuilderComponent, Builder, builder } from "@builder.io/react";
import DefaultErrorPage from "next/error";
import Head from "next/head";
import "@builder.io/widgets";
import { NextSeo } from "next-seo";

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
    return <h1>Loading...</h1>;
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

  return (
    <>
      <NextSeo title={page.data.title} />
      <BuilderComponent model="page" content={page} />
    </>
  );
}
