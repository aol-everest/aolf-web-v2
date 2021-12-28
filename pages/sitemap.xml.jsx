import React from "react";
import fs from "fs";
import path from "path";

const Sitemap = () => {};

const getAllFiles = function (parent, dirPath = "", arrayOfFiles) {
  const files = fs.readdirSync(path.join(parent, dirPath));

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(path.join(parent, dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(
        parent,
        path.join(dirPath, file),
        arrayOfFiles,
      );
    } else {
      arrayOfFiles.push({
        name: file,
        path:
          file === "index.jsx"
            ? dirPath
            : path.join(dirPath, path.parse(file).name),
        ext: path.extname(file),
      });
    }
  });
  return arrayOfFiles;
};

export const getServerSideProps = ({ res }) => {
  const baseUrl = {
    development: "http://localhost:3000",
    production: "https://mydomain.com",
  }[process.env.NODE_ENV];

  const pages = getAllFiles("pages")
    .filter((staticPage) => {
      return (
        ![
          "[id].jsx",
          "404.jsx",
          "_app.jsx",
          "_document.jsx",
          "_error.jsx",
          "_offline.jsx",
          "__devonly.jsx",
          "sitemap.xml.jsx",
        ].includes(staticPage.name) &&
        staticPage.ext === ".jsx" &&
        staticPage.path !== "verify"
      );
    })
    .map((staticPage) => {
      return `${baseUrl}/${staticPage.path}`;
    });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
      </url>
      ${pages
        .map((url) => {
          return `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join("")}
    </urlset>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
