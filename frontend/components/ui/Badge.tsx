// components/ui/Badge.tsx
import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'sev1' | 'sev2' | 'sev3' | 'sev4' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const variants = {
    sev1: 'badge-sev1',
    sev2: 'badge-sev2',
    sev3: 'badge-sev3',
    sev4: 'badge-sev4',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  }

  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
