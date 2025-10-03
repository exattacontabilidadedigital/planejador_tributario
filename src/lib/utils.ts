import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata número para moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata número para percentual
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse valor monetário string para número
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
}

/**
 * Trunca número para N casas decimais
 */
export function truncate(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}
