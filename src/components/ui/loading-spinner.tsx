/**
 * Loading Spinner Component
 * Reusable loading indicator with different sizes and variants
 */

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'muted'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const variantClasses = {
  default: 'text-foreground',
  primary: 'text-primary',
  muted: 'text-muted-foreground'
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
  text
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {text && (
        <span className={cn('text-sm', variantClasses[variant])}>
          {text}
        </span>
      )}
    </div>
  )
}

export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" variant="primary" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

export function LoadingCard({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-3">
        <LoadingSpinner size="lg" variant="muted" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner