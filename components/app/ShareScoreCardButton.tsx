'use client'

import { useState } from 'react'
import { Share2, Check, Copy, Twitter, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { captureEvent } from '@/lib/analytics/posthog-client'
import { EVENTS } from '@/lib/analytics/events'

interface ShareScoreCardButtonProps {
  attemptId: string
  score: number
  mode: string
}

export function ShareScoreCardButton({
  attemptId,
  score,
  mode,
}: ShareScoreCardButtonProps) {
  const [copied, setCopied] = useState(false)

  const scorecardUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/og/scorecard?attempt_id=${attemptId}`
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${attemptId}`
  const shareText = `I scored ${score.toLocaleString()} on Pattern League ${mode}! Can you beat me?`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      captureEvent(EVENTS.SHARE_SCORECARD, { method: 'copy', mode })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
    captureEvent(EVENTS.SHARE_SCORECARD, { method: 'twitter', mode })
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
    captureEvent(EVENTS.SHARE_SCORECARD, { method: 'facebook', mode })
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pattern League Score',
          text: shareText,
          url: shareUrl,
        })
        captureEvent(EVENTS.SHARE_SCORECARD, { method: 'native', mode })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }
  }

  // Use native share on mobile if available
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    return (
      <Button onClick={handleNativeShare} variant="outline" size="sm">
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
