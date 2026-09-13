/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8055", pathname: "/assets/**" },
      { protocol: "https", hostname: "cms.reelshub.pro", pathname: "/assets/**" },
    ],
  },
};

module.exports = nextConfig;
