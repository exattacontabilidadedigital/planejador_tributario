"use client"

import * as React from "react"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { DEBOUNCE_DELAYS } from "@/lib/constants"

interface PercentageInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
  required?: boolean
  showSlider?: boolean
  helpText?: string
}

export function PercentageInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.01,
  className,
  disabled = false,
  required = false,
  showSlider = false,
  helpText,
}: PercentageInputProps) {
  // Debounce para otimizar performance
  const debouncedOnChange = useDebouncedCallback((newValue: number) => {
    onChange(newValue)
  }, DEBOUNCE_DELAYS.INPUT)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0
    const clamped = Math.min(Math.max(newValue, min), max)
    debouncedOnChange(clamped)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <span className="text-sm font-semibold text-primary">
          {value.toFixed(2)}%
        </span>
      </div>
      
      {showSlider ? (
        <div className="space-y-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            disabled={disabled}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      ) : (
        <div className="relative">
          <Input
            id={label}
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="pr-8 text-right font-mono"
            aria-label={label}
            aria-required={required}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            %
          </span>
        </div>
      )}
      
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1">
          {helpText}
        </p>
      )}
    </div>
  )
}
