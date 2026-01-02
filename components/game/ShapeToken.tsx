'use client'

import { getColorHex } from '@/lib/game/generators/sequenceForge'

interface ShapeTokenProps {
  shape: number
  color: number
  size?: 'sm' | 'md' | 'lg'
}

export function ShapeToken({ shape, color, size = 'md' }: ShapeTokenProps) {
  const colorHex = getColorHex(color)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const renderShape = () => {
    const className = `${sizeClasses[size]} flex items-center justify-center`

    switch (shape % 6) {
      case 0: // Circle
        return (
          <div className={className}>
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: colorHex }}
            />
          </div>
        )
      case 1: // Square
        return (
          <div className={className}>
            <div
              className="w-full h-full rounded-sm"
              style={{ backgroundColor: colorHex }}
            />
          </div>
        )
      case 2: // Triangle
        return (
          <div className={className}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,10 90,90 10,90"
                fill={colorHex}
              />
            </svg>
          </div>
        )
      case 3: // Diamond
        return (
          <div className={className}>
            <div
              className="w-3/4 h-3/4 rotate-45"
              style={{ backgroundColor: colorHex }}
            />
          </div>
        )
      case 4: // Star
        return (
          <div className={className}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
                fill={colorHex}
              />
            </svg>
          </div>
        )
      case 5: // Hexagon
        return (
          <div className={className}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 93,25 93,75 50,95 7,75 7,25"
                fill={colorHex}
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className={className}>
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: colorHex }}
            />
          </div>
        )
    }
  }

  return renderShape()
}
