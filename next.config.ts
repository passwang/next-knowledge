import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // ppr 部分预渲染
  experimental: {
    ppr: 'incremental'
  }
};

export default nextConfig;
