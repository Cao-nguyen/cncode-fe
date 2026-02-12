/** @type {import('next').NextConfig} */
const nextConfig = {
    onDemandEntries: {
        maxInactiveAge: 60 * 1000,
        pagesBufferLength: 5,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.runtimeChunk = 'single'
        }
        return config
    },
}

module.exports = nextConfig
