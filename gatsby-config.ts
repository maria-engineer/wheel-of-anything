import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Wheel of Anything`,
    description: `A digital version of the usually paper based Wheel of Anything`,
    siteUrl: `https://wheel.maria.engineer/`,
    author: `Maria Mateescu <github@maria.engineer>`,
  },
  plugins: ["gatsby-plugin-styled-components"],
};

export default config;
