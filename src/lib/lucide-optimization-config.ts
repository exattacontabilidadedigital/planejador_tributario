/**
 * 🚀 CONFIGURAÇÃO AVANÇADA DE TREE SHAKING - LUCIDE REACT
 * 
 * Otimizações específicas para reduzir bundle size dos ícones
 */

// Adicione ao next.config.ts
export const lucideOptimizations = {
  // Configuração experimental para tree shaking otimizado
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog'
    ],
    // Tree shaking mais agressivo
    turbotrace: {
      logLevel: 'error'
    }
  },
  
  // Webpack customizado para ícones
  webpack: (config: any, { dev, isServer }: any) => {
    if (!dev && !isServer) {
      // Splitting específico para ícones Lucide
      config.optimization.splitChunks.cacheGroups.lucideIcons = {
        name: 'lucide-icons',
        test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
        priority: 30,
        chunks: 'all',
        enforce: true,
        reuseExistingChunk: true,
        // Apenas incluir no chunk se usado em múltiplos lugares
        minChunks: 2
      }
      
      // Otimização para imports diretos de ícones específicos
      config.resolve.alias = {
        ...config.resolve.alias,
        // Mapear imports específicos para reduzir bundle
        '^lucide-react/dist/esm/icons/(.*)$': 'lucide-react/dist/esm/icons/$1'
      }
    }
    
    return config
  }
}

// Padrões recomendados para imports
export const RECOMMENDED_PATTERNS = {
  // ✅ RECOMENDADO - Import específico
  good: `import { ArrowLeft, Save } from 'lucide-react'`,
  
  // ❌ EVITAR - Import genérico
  bad: `import * as Icons from 'lucide-react'`,
  
  // 🚀 OTIMIZADO - Lazy loading para muitos ícones
  optimized: `
    import dynamic from 'next/dynamic'
    const LazyIcon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.ArrowLeft })))
  `
}

// Configuração para tsconfig.json
export const TS_CONFIG_OPTIMIZATION = {
  compilerOptions: {
    // Tree shaking mais eficiente
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    // Otimização para imports de bibliotecas
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true
  }
}

// Bundle analyzer - configuração específica para ícones
export const BUNDLE_ANALYZER_CONFIG = {
  // Comando para análise específica de ícones
  analyzeIcons: 'ANALYZE=true BUNDLE_ANALYZE=browser npm run build',
  
  // Métricas esperadas após otimização
  targets: {
    lucideChunk: '<50KB',    // Chunk específico de ícones
    vendorChunk: '<200KB',   // Chunk principal sem ícones
    totalReduction: '15-25%' // Redução esperada no bundle total
  }
}