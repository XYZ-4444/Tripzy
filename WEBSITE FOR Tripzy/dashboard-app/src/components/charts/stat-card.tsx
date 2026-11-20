'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { StatCard as StatCardType } from '@/types'

interface StatCardProps extends StatCardType {
  className?: string
}

export function StatCard({ title, value, change, changeLabel, icon: IconName, trend, className }: StatCardProps) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    TrendingUp,
    TrendingDown,
    Minus,
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          {icons[IconName] && <icons[IconName] className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {getTrendIcon()}
          {change !== undefined && (
            <span className={cn(
              change >= 0 ? 'text-green-500' : 'text-red-500',
              'font-medium'
            )}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          )}
          {changeLabel && <span>{changeLabel}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
