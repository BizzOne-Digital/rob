import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  typescript: {
    // Large mongoose InferSchemaType graphs can OOM local `tsc` during build;
    // run `npm run typecheck` with elevated heap separately when validating.
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/what-we-create",
        permanent: true,
      },
      {
        source: "/shop/:slug",
        destination: "/what-we-create/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
