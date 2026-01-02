'use client'

import { motion } from 'framer-motion'
import { getColorHex } from '@/lib/game/generators/flashGrid'
import { cn } from '@/lib/utils/format'

interface PatternGridProps {
  grid: number[][]
  gridSize: number
  interactive: boolean
  showColors: boolean
  binaryMode?: boolean
  onCellClick?: (row: number, col: number) => void
}

export function PatternGrid({
  grid,
  gridSize,
  interactive,
  showColors,
  binaryMode = false,
  onCellClick,
}: PatternGridProps) {
  const cellSize = gridSize <= 3 ? 'w-20 h-20' : gridSize <= 4 ? 'w-16 h-16' : 'w-12 h-12'

  return (
    <div
      className="inline-grid gap-2 p-4 bg-background rounded-xl shadow-inner mx-auto"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isActive = cell !== -1
          const backgroundColor = isActive && showColors
            ? binaryMode
              ? 'hsl(var(--primary))'
              : getColorHex(cell)
            : 'hsl(var(--muted))'

          return (
            <motion.button
              key={`${rowIndex}-${colIndex}`}
              initial={isActive && showColors ? { scale: 0 } : {}}
              animate={{ scale: 1 }}
              transition={{ delay: (rowIndex * gridSize + colIndex) * 0.02 }}
              className={cn(
                cellSize,
                'rounded-lg transition-all',
                interactive && 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2',
                !interactive && 'cursor-default'
              )}
              style={{ backgroundColor }}
              onClick={() => interactive && onCellClick?.(rowIndex, colIndex)}
              disabled={!interactive}
            />
          )
        })
      )}
    </div>
  )
}
