'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TimerBarProps {
  durationMs: number
  onComplete?: () => void
}

export function TimerBar({ durationMs, onComplete }: TimerBarProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100)
      setProgress(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [durationMs, onComplete])

  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: '100%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />
    </div>
  )
}
