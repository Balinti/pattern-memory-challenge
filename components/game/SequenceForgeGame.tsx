'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { generateSequenceForgeChallenge, getShapeName, getColorHex } from '@/lib/game/generators/sequenceForge'
import { GameHUD } from './GameHUD'
import { ShapeToken } from './ShapeToken'

interface SequenceForgeGameProps {
  params: {
    steps: number
    colors: number
    shapes: number
    showMs: number
  }
  seed: string
  onComplete: (answers: Array<{ shape: number; color: number }>, events: Array<{ t: number; type: string }>) => void
}

type GamePhase = 'ready' | 'showing' | 'input' | 'submitted'

export function SequenceForgeGame({ params, seed, onComplete }: SequenceForgeGameProps) {
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [challenge, setChallenge] = useState(() => generateSequenceForgeChallenge(seed, 3))
  const [currentShowIndex, setCurrentShowIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Array<{ shape: number; color: number }>>([])
  const [events, setEvents] = useState<Array<{ t: number; type: string }>>([])
  const [startTime, setStartTime] = useState(0)

  useEffect(() => {
    setChallenge(generateSequenceForgeChallenge(seed, 3))
  }, [seed])

  useEffect(() => {
    if (phase !== 'showing') return

    if (currentShowIndex >= challenge.sequence.length) {
      // All tokens shown, move to input phase
      setPhase('input')
      setEvents(prev => [...prev, { t: Date.now() - startTime, type: 'sequence_end' }])
      return
    }

    // Show next token after delay
    const timer = setTimeout(() => {
      setCurrentShowIndex(prev => prev + 1)
    }, params.showMs)

    return () => clearTimeout(timer)
  }, [phase, currentShowIndex, challenge.sequence.length, params.showMs, startTime])

  const handleStart = () => {
    const now = Date.now()
    setStartTime(now)
    setEvents([{ t: 0, type: 'start' }])
    setPhase('showing')
    setCurrentShowIndex(0)
  }

  const handleTokenSelect = (shape: number, color: number) => {
    if (phase !== 'input') return
    if (userAnswers.length >= challenge.sequence.length) return

    setUserAnswers(prev => [...prev, { shape, color }])
  }

  const handleUndo = () => {
    setUserAnswers(prev => prev.slice(0, -1))
  }

  const handleSubmit = () => {
    const submitTime = Date.now() - startTime
    const finalEvents = [...events, { t: submitTime, type: 'submit' }]
    setEvents(finalEvents)
    setPhase('submitted')
    onComplete(userAnswers, finalEvents)
  }

  // Generate all possible token combinations for selection
  const allTokens: Array<{ shape: number; color: number }> = []
  for (let shape = 0; shape < params.shapes; shape++) {
    for (let color = 0; color < params.colors; color++) {
      allTokens.push({ shape, color })
    }
  }

  return (
    <div className="space-y-6">
      <GameHUD
        mode="sequence_forge"
        phase={phase}
        steps={params.steps}
        currentStep={phase === 'showing' ? currentShowIndex : userAnswers.length}
      />

      {phase === 'ready' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <h2 className="text-2xl font-bold">Sequence Forge</h2>
          <p className="text-muted-foreground">
            Watch the sequence, then recreate it in order
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Sequence length: {params.steps}</p>
            <p>Token display time: {params.showMs}ms</p>
          </div>
          <Button size="lg" onClick={handleStart}>
            Start Challenge
          </Button>
        </motion.div>
      )}

      {phase === 'showing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <p className="text-muted-foreground">Watch the sequence...</p>
          <div className="h-32 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentShowIndex < challenge.sequence.length && (
                <motion.div
                  key={currentShowIndex}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShapeToken
                    shape={challenge.sequence[currentShowIndex].shape}
                    color={challenge.sequence[currentShowIndex].color}
                    size="lg"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentShowIndex + 1} / {params.steps}
          </p>
        </motion.div>
      )}

      {phase === 'input' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Current answer sequence */}
          <div className="min-h-16 flex items-center justify-center gap-2 p-4 bg-muted rounded-lg flex-wrap">
            {userAnswers.length === 0 ? (
              <p className="text-muted-foreground">Click tokens below to build your sequence</p>
            ) : (
              userAnswers.map((token, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <ShapeToken shape={token.shape} color={token.color} size="md" />
                </motion.div>
              ))
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {userAnswers.length} / {params.steps} tokens
          </p>

          {/* Token palette */}
          <div className="grid grid-cols-4 gap-2 justify-items-center max-w-xs mx-auto">
            {allTokens.map((token, i) => (
              <button
                key={i}
                onClick={() => handleTokenSelect(token.shape, token.color)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                disabled={userAnswers.length >= params.steps}
              >
                <ShapeToken shape={token.shape} color={token.color} size="sm" />
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={userAnswers.length === 0}
            >
              Undo
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={userAnswers.length !== params.steps}
            >
              Submit
            </Button>
          </div>
        </motion.div>
      )}

      {phase === 'submitted' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-muted-foreground">Submitting...</p>
        </motion.div>
      )}
    </div>
  )
}
