import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Uploads (logo, page-section media, property images) go through
      // Server Actions and are allowed up to 100MB for video — the 1MB
      // default here would reject those long before that check ever runs.
      bodySizeLimit: "110mb",
    },
  },
};

export default nextConfig;
