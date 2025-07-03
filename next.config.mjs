/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true,
      bodySizeLimit: "10mb" // Add size limit for server actions
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@node-rs/argon2");
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com", // Allow all subdomains of vercel-storage.com
      },
    ],
  },
  pageExtensions: ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;