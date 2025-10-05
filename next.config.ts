import type { NextConfig } from 'next'

// Bundle analyzer - ativa com ANALYZE=true
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Otimizações de performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Optimização de webpack para bundle splitting
  webpack: (config, { dev, isServer }) => {
    // Otimizações apenas em produção
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Chart.js isolado em chunk próprio
          chartjs: {
            name: 'chartjs',
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
            priority: 40,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
          },
          // Recharts em chunk separado
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            priority: 35,
            chunks: 'all',
            reuseExistingChunk: true,
          },
          // PDF e Excel em chunk separado
          documents: {
            name: 'documents',
            test: /[\\/]node_modules[\\/](jspdf|xlsx)[\\/]/,
            priority: 25,
            reuseExistingChunk: true,
          },
          // Ícones Lucide em chunk separado para melhor tree shaking
          lucideIcons: {
            name: 'lucide-icons',
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // UI libraries (Radix UI)
          ui: {
            name: 'ui-libs',
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          // Vendor libraries
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      }
    }
    return config
  },
}

export default withBundleAnalyzer(nextConfig)
