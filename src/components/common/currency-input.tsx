"use client"

import * as React from "react"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency, parseCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { DEBOUNCE_DELAYS } from "@/lib/constants"

interface CurrencyInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
  required?: boolean
}

export function CurrencyInput({
  label,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(formatCurrency(value))
  const [isFocused, setIsFocused] = React.useState(false)

  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value))
    }
  }, [value, isFocused])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Remove formatação para edição
    const numericValue = value.toString().replace('.', ',')
    setDisplayValue(numericValue)
    e.target.select()
  }

  // Debounce do onChange para reduzir cálculos durante digitação
  const debouncedOnChange = useDebouncedCallback((newValue: number) => {
    onChange(newValue)
  }, DEBOUNCE_DELAYS.INPUT)

  const handleBlur = () => {
    setIsFocused(false)
    const parsed = parseCurrency(displayValue)
    debouncedOnChange(parsed)
    setDisplayValue(formatCurrency(parsed))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Permite apenas números, vírgula e ponto
    const sanitized = input.replace(/[^\d,.-]/g, '')
    setDisplayValue(sanitized)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          R$
        </span>
        <Input
          id={label}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pl-10 text-right font-mono"
          placeholder="0,00"
          aria-label={label}
          aria-required={required}
        />
      </div>
    </div>
  )
}
