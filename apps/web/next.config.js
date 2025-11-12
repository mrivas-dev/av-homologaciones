const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@av/ui', '@av/types', '@av/config'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = withNextIntl(nextConfig);
