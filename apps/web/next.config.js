/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@repo/ui'],

    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    async rewrites() {
        return [{ source: "/api/:path*", destination: `${process.env.NEXT_PUBLIC_HTTP_BACKEND_URL}/api/:path*` }]
    }
};

export default nextConfig;