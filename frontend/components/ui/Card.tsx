// components/ui/Card.tsx
import React from 'react'

interface CardProps {
  children: React.ReactNode
  hover?: boolean
  interactive?: boolean
  className?: string
}

export function Card({ 
  children, 
  hover = false, 
  interactive = false,
  className = '' 
}: CardProps) {
  const baseClass = hover ? 'card-hover' : interactive ? 'card-interactive' : 'card'
  
  return (
    <div className={`${baseClass} ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
}

export function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <div className="mb-4">
      <h3 className="text-h3 text-apple-text-primary">{title}</h3>
      {subtitle && (
        <p className="text-body text-apple-text-secondary mt-1">{subtitle}</p>
      )}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
}

export function CardContent({ children }: CardContentProps) {
  return <div className="text-body text-apple-text-primary">{children}</div>
}
