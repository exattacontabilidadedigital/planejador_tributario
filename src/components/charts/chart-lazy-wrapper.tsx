/**
 * 📊 CHART.JS LAZY LOADING WRAPPER
 * 
 * Componente otimizado para carregamento lazy do Chart.js
 * Mantém Chart.js em chunk separado até ser necessário
 */

import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

// Loading skeleton específico para gráficos Chart.js
const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 animate-pulse" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4 animate-pulse" />
          <Skeleton className="h-4 w-32 mx-auto mb-2" />
          <Skeleton className="h-3 w-24 mx-auto" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Lazy loading do componente Chart.js
export const LazyTaxCompositionChart = dynamic(
  () => import('@/components/dashboard/tax-composition-chart').then(mod => ({
    default: mod.TaxCompositionChart
  })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // Chart.js não precisa de SSR
  }
)

// Hook para carregar Chart.js dinamicamente (simplified)
export const useChartJS = async () => {
  const { Chart } = await import('chart.js')
  return Chart
}

// Wrapper genérico para qualquer gráfico Chart.js
interface LazyChartProps {
  children: React.ReactNode
  fallback?: React.ComponentType
}

export const LazyChartWrapper = ({ children, fallback: Fallback = ChartSkeleton }: LazyChartProps) => {
  const ChartComponent = dynamic(
    () => Promise.resolve({ default: () => <>{children}</> }),
    {
      loading: () => <Fallback />,
      ssr: false
    }
  )
  
  return <ChartComponent />
}

// Configuração específica para Chart.js
export const CHARTJS_CONFIG = {
  // Configuração de performance
  responsive: true,
  maintainAspectRatio: false,
  
  // Animações otimizadas
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  },
  
  // Plugins essenciais
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }
  }
}

/**
 * Função para registrar apenas os componentes Chart.js necessários
 * Reduz o bundle size carregando apenas o que é usado
 */
export const registerChartComponents = async (components: string[]) => {
  const { Chart } = await import('chart.js')
  
  const componentMap: Record<string, any> = {
    'ArcElement': () => import('chart.js').then(mod => mod.ArcElement),
    'BarElement': () => import('chart.js').then(mod => mod.BarElement),
    'LineElement': () => import('chart.js').then(mod => mod.LineElement),
    'PointElement': () => import('chart.js').then(mod => mod.PointElement),
    'CategoryScale': () => import('chart.js').then(mod => mod.CategoryScale),
    'LinearScale': () => import('chart.js').then(mod => mod.LinearScale),
    'Title': () => import('chart.js').then(mod => mod.Title),
    'Tooltip': () => import('chart.js').then(mod => mod.Tooltip),
    'Legend': () => import('chart.js').then(mod => mod.Legend),
  }
  
  const loadedComponents = await Promise.all(
    components.map(name => componentMap[name]?.())
  )
  
  Chart.register(...loadedComponents.filter(Boolean))
  
  return Chart
}