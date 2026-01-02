'use client'

import { getLeague, getProgressToNextLeague } from '@/lib/game/leagues'
import { cn } from '@/lib/utils/format'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface LeagueBadgeProps {
  pr: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LeagueBadge({ pr, showProgress = false, size = 'md' }: LeagueBadgeProps) {
  const league = getLeague(pr)
  const progress = getProgressToNextLeague(pr)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex flex-col items-start gap-1">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full font-medium',
                sizeClasses[size],
                league.bgClass,
                league.textClass
              )}
            >
              <span>{league.icon}</span>
              <span>{league.name}</span>
            </span>

            {showProgress && progress.next && (
              <div className="w-full space-y-1">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress.prNeeded} PR to {progress.next.name}
                </p>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Pattern Rating: {pr.toLocaleString()}</p>
          {progress.next && (
            <p className="text-muted-foreground">
              {progress.prNeeded} PR until {progress.next.name}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
