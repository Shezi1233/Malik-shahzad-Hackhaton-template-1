/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.sanity.io',
            },
            {
                protocol: 'https',
                hostname: '**.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: '**.gstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'encrypted-tbn0.gstatic.com',
            },
            // Railway backend for uploaded images
            {
                protocol: 'https',
                hostname: 'malik-shahzad-hackhaton-template-1-production.up.railway.app',
            },
        ],
        // Allow unoptimized images for local product images
        unoptimized: false,
    },
};

export default nextConfig;
