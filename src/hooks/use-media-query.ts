import { useEffect, useState } from 'react'

/**
 * Hook para detectar breakpoints responsivos
 * 
 * @param query - Media query string (ex: '(max-width: 768px)')
 * @returns boolean indicando se a media query corresponde
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
 * const isDesktop = useMediaQuery('(min-width: 1025px)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    // Verificar se window está disponível (SSR safety)
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(query)
    
    // Atualizar estado inicial
    setMatches(media.matches)

    // Handler para mudanças na media query
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Adicionar listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query])

  return matches
}

/**
 * Hooks pré-configurados para breakpoints comuns
 */
export const useBreakpoints = () => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  const isMobileOrTablet = useMediaQuery('(max-width: 1024px)')
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  }
}
