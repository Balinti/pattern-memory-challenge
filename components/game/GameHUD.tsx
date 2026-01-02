'use client'

import { Badge } from '@/components/ui/badge'
import { formatModeName, getModeIcon } from '@/lib/utils/format'

interface GameHUDProps {
  mode: string
  phase: string
  gridSize?: number
  tiles?: number
  steps?: number
  currentStep?: number
  filled?: number
}

export function GameHUD({
  mode,
  phase,
  gridSize,
  tiles,
  steps,
  currentStep,
  filled,
}: GameHUDProps) {
  const phaseLabels: Record<string, string> = {
    ready: 'Ready',
    memorize: 'Memorizing',
    showing: 'Showing',
    input: 'Your Turn',
    submitted: 'Submitted',
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-xl">{getModeIcon(mode)}</span>
        <span className="font-medium">{formatModeName(mode)}</span>
      </div>

      <div className="flex items-center gap-4">
        {gridSize && (
          <span className="text-sm text-muted-foreground">
            {gridSize}x{gridSize}
          </span>
        )}
        {tiles && (
          <span className="text-sm text-muted-foreground">
            {tiles} tiles
          </span>
        )}
        {steps && (
          <span className="text-sm text-muted-foreground">
            {currentStep !== undefined ? `${currentStep}/${steps}` : `${steps} steps`}
          </span>
        )}
        {filled && (
          <span className="text-sm text-muted-foreground">
            {filled} cells
          </span>
        )}
      </div>

      <Badge variant="outline">
        {phaseLabels[phase] || phase}
      </Badge>
    </div>
  )
}
