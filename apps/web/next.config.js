/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@repo/ui'],

    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
};

export default nextConfig;