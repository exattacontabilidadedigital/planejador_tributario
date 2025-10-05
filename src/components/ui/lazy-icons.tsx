/**
 * 🎯 COMPONENTE DE ÍCONES OTIMIZADO - LUCIDE REACT
 * 
 * Lazy loading de ícones para otimizar bundle splitting
 * Reduz o bundle principal movendo ícones para chunks dinâmicos
 */

import dynamic from 'next/dynamic'
import { LucideProps } from 'lucide-react'
import { Loader2 } from 'lucide-react'

// Componente de loading para ícones
const IconLoader = ({ size = 16, className }: { size?: number; className?: string }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
)

// Lazy loading para ícones administrativos (dashboard, gerenciamento)
export const AdminIcons = {
  Building2: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Building2 })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Settings: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Settings })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Users: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Users })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Database: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Database })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
}

// Lazy loading para ícones de relatórios e gráficos
export const ChartIcons = {
  BarChart3: dynamic(() => import('lucide-react').then(mod => ({ default: mod.BarChart3 })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  PieChart: dynamic(() => import('lucide-react').then(mod => ({ default: mod.PieChart })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  TrendingUp: dynamic(() => import('lucide-react').then(mod => ({ default: mod.TrendingUp })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  TrendingDown: dynamic(() => import('lucide-react').then(mod => ({ default: mod.TrendingDown })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
}

// Lazy loading para ícones de ações (save, delete, edit)
export const ActionIcons = {
  Save: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Save })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Trash2: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Trash2 })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Edit2: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Edit2 })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Copy: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Copy })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Download: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Download })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Upload: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Upload })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
}

// Lazy loading para ícones de navegação
export const NavigationIcons = {
  ArrowLeft: dynamic(() => import('lucide-react').then(mod => ({ default: mod.ArrowLeft })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  ArrowRight: dynamic(() => import('lucide-react').then(mod => ({ default: mod.ArrowRight })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Plus: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Plus })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  Search: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Search })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
}

// Lazy loading para ícones de status
export const StatusIcons = {
  CheckCircle2: dynamic(() => import('lucide-react').then(mod => ({ default: mod.CheckCircle2 })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  AlertTriangle: dynamic(() => import('lucide-react').then(mod => ({ default: mod.AlertTriangle })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  AlertCircle: dynamic(() => import('lucide-react').then(mod => ({ default: mod.AlertCircle })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
  XCircle: dynamic(() => import('lucide-react').then(mod => ({ default: mod.XCircle })), {
    loading: () => <IconLoader />,
    ssr: false
  }),
}

// Wrapper genérico para ícones lazy-loaded
interface LazyIconProps extends LucideProps {
  iconName: string
  fallback?: React.ComponentType<LucideProps>
}

export const LazyIcon = dynamic(
  () => import('lucide-react').then(mod => {
    return ({ iconName, fallback: Fallback = Loader2, ...props }: LazyIconProps) => {
      const IconComponent = (mod as any)[iconName]
      
      if (!IconComponent && Fallback) {
        return <Fallback {...props} className={`animate-spin ${props.className}`} />
      }
      
      return IconComponent ? <IconComponent {...props} /> : null
    }
  }),
  {
    loading: () => <IconLoader />,
    ssr: false
  }
)

// Hook para carregar ícones dinamicamente
export const useLazyIcon = (iconName: string) => {
  return dynamic(
    () => import('lucide-react').then(mod => {
      const IconComponent = (mod as any)[iconName]
      return { default: IconComponent || (() => <IconLoader />) }
    }),
    {
      loading: () => <IconLoader />,
      ssr: false
    }
  )
}

/**
 * Configuração de webpack para otimizar chunks de ícones
 * Adicione ao next.config.ts:
 * 
 * webpack: (config) => {
 *   config.optimization.splitChunks.cacheGroups.lucideIcons = {
 *     test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
 *     name: 'lucide-icons',
 *     priority: 30,
 *     chunks: 'all'
 *   }
 *   return config
 * }
 */