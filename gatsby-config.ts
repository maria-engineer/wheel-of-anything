import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: "The Wheel of Anything",
    siteUrl: "https://wheel.maria.engineer",
  },
  pathPrefix: "/",
  trailingSlash: "never",
  plugins: ["gatsby-plugin-emotion"],
};

export default config;
