import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Footballer pages rendered on demand read the explorer's derived files.
  outputFileTracingIncludes: { "/work/decoding-winger-playstyles/explore/players/[slug]": ["./public/winger/**/*"] },
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      { source: "/now", destination: "/about#now", permanent: false },
      { source: "/resume", destination: "/resume.pdf", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
      // Old draft address of the winger project.
      { source: "/work/winger-classification", destination: "/work/decoding-winger-playstyles", permanent: true },
    ];
  },
};

export default nextConfig;
