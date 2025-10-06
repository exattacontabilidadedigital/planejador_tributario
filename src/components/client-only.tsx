"use client"

import { useState, useEffect, ReactNode } from "react"

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Durante SSR e antes da hidratação, sempre mostrar o fallback
  if (!hasMounted) {
    return <>{fallback}</>
  }

  // Após hidratação, mostrar o conteúdo real
  return <>{children}</>
}