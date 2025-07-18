import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',

  // Удаляем basePath и assetPrefix полностью
  // т.к. ты деплоишь в корень (https://logvisor228.github.io/)

  trailingSlash: true, // важно для корректной генерации ссылок при export

  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
