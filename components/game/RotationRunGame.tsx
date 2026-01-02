'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { generateRotationRunChallenge, getTransformLabel } from '@/lib/game/generators/rotationRun'
import { GameHUD } from './GameHUD'
import { TimerBar } from './TimerBar'
import { PatternGrid } from './PatternGrid'

interface RotationRunGameProps {
  params: {
    gridSize: number
    filled: number
    transform: string
    showMs: number
  }
  seed: string
  onComplete: (answers: boolean[][], events: Array<{ t: number; type: string }>) => void
}

type GamePhase = 'ready' | 'showing' | 'input' | 'submitted'

export function RotationRunGame({ params, seed, onComplete }: RotationRunGameProps) {
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [challenge, setChallenge] = useState(() => generateRotationRunChallenge(seed, 3))
  const [userAnswers, setUserAnswers] = useState<boolean[][]>(() =>
    Array(params.gridSize).fill(null).map(() => Array(params.gridSize).fill(false))
  )
  const [events, setEvents] = useState<Array<{ t: number; type: string }>>([])
  const [startTime, setStartTime] = useState(0)

  useEffect(() => {
    setChallenge(generateRotationRunChallenge(seed, 3))
  }, [seed])

  const handleStart = () => {
    const now = Date.now()
    setStartTime(now)
    setEvents([{ t: 0, type: 'start' }])
    setPhase('showing')

    // Auto-transition to input phase after show time
    setTimeout(() => {
      setPhase('input')
      setEvents(prev => [...prev, { t: Date.now() - now, type: 'hide' }])
    }, params.showMs)
  }

  const handleCellClick = (row: number, col: number) => {
    if (phase !== 'input') return

    setUserAnswers(prev => {
      const newAnswers = prev.map(r => [...r])
      newAnswers[row][col] = !newAnswers[row][col]
      return newAnswers
    })
  }

  const handleSubmit = () => {
    const submitTime = Date.now() - startTime
    const finalEvents = [...events, { t: submitTime, type: 'submit' }]
    setEvents(finalEvents)
    setPhase('submitted')
    onComplete(userAnswers, finalEvents)
  }

  // Convert boolean grid to number grid for PatternGrid
  const boolToNumberGrid = (grid: boolean[][]): number[][] => {
    return grid.map(row => row.map(cell => cell ? 0 : -1))
  }

  return (
    <div className="space-y-6">
      <GameHUD
        mode="rotation_run"
        phase={phase}
        gridSize={params.gridSize}
        filled={params.filled}
      />

      {phase === 'ready' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <h2 className="text-2xl font-bold">Rotation Run</h2>
          <p className="text-muted-foreground">
            See the pattern, predict what it looks like after transformation
          </p>
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Transform: {getTransformLabel(params.transform)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Grid: {params.gridSize}x{params.gridSize}</p>
            <p>Filled cells: {params.filled}</p>
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
          className="space-y-4"
        >
          <TimerBar durationMs={params.showMs} />

          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Original Pattern
            </Badge>
          </div>

          <PatternGrid
            grid={boolToNumberGrid(challenge.originalGrid)}
            gridSize={params.gridSize}
            interactive={false}
            showColors={true}
            binaryMode={true}
          />

          <div className="text-center">
            <p className="text-muted-foreground">
              Memorize this pattern. You'll need to show what it looks like after:
            </p>
            <Badge className="mt-2">{getTransformLabel(params.transform)}</Badge>
          </div>
        </motion.div>
      )}

      {phase === 'input' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              After: {getTransformLabel(params.transform)}
            </Badge>
          </div>

          <PatternGrid
            grid={boolToNumberGrid(userAnswers)}
            gridSize={params.gridSize}
            interactive={true}
            showColors={true}
            binaryMode={true}
            onCellClick={handleCellClick}
          />

          <p className="text-center text-sm text-muted-foreground">
            Click cells to mark them as filled
          </p>

          <div className="flex justify-center">
            <Button size="lg" onClick={handleSubmit}>
              Submit Answer
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
