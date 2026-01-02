'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { getCountdownParts } from '@/lib/utils/dates'

interface CountdownToResetProps {
  targetDate: Date
  label?: string
  onExpire?: () => void
}

export function CountdownToReset({
  targetDate,
  label = 'Resets in',
  onExpire,
}: CountdownToResetProps) {
  const [countdown, setCountdown] = useState(() => getCountdownParts(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdown = getCountdownParts(targetDate)
      setCountdown(newCountdown)

      if (newCountdown.isExpired) {
        clearInterval(interval)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onExpire])

  if (countdown.isExpired) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Refreshing...</span>
      </div>
    )
  }

  const formatPart = (value: number) => value.toString().padStart(2, '0')

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>{label}</span>
      <span className="font-mono font-medium text-foreground">
        {formatPart(countdown.hours)}:{formatPart(countdown.minutes)}:
        {formatPart(countdown.seconds)}
      </span>
    </div>
  )
}
