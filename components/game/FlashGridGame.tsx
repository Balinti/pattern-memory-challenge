'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { generateFlashGridChallenge, getColorHex } from '@/lib/game/generators/flashGrid'
import { GameHUD } from './GameHUD'
import { TimerBar } from './TimerBar'
import { PatternGrid } from './PatternGrid'

interface FlashGridGameProps {
  params: {
    gridSize: number
    colors: number
    tiles: number
    exposureMs: number
  }
  seed: string
  onComplete: (answers: number[][], events: Array<{ t: number; type: string }>) => void
}

type GamePhase = 'ready' | 'memorize' | 'input' | 'submitted'

export function FlashGridGame({ params, seed, onComplete }: FlashGridGameProps) {
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [challenge, setChallenge] = useState(() => generateFlashGridChallenge(seed, 3))
  const [userAnswers, setUserAnswers] = useState<number[][]>(() =>
    Array(params.gridSize).fill(null).map(() => Array(params.gridSize).fill(-1))
  )
  const [selectedColor, setSelectedColor] = useState(0)
  const [events, setEvents] = useState<Array<{ t: number; type: string }>>([])
  const [startTime, setStartTime] = useState(0)

  useEffect(() => {
    setChallenge(generateFlashGridChallenge(seed, 3))
  }, [seed])

  const handleStart = () => {
    const now = Date.now()
    setStartTime(now)
    setEvents([{ t: 0, type: 'start' }])
    setPhase('memorize')

    // Auto-transition to input phase after exposure time
    setTimeout(() => {
      setPhase('input')
      setEvents(prev => [...prev, { t: Date.now() - now, type: 'hide' }])
    }, params.exposureMs)
  }

  const handleCellClick = (row: number, col: number) => {
    if (phase !== 'input') return

    setUserAnswers(prev => {
      const newAnswers = prev.map(r => [...r])
      // Toggle: if already selected color, clear it; otherwise set to selected color
      if (newAnswers[row][col] === selectedColor) {
        newAnswers[row][col] = -1
      } else {
        newAnswers[row][col] = selectedColor
      }
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

  const colorPalette = Array.from({ length: params.colors }, (_, i) => i)

  return (
    <div className="space-y-6">
      <GameHUD
        mode="flash_grid"
        phase={phase}
        gridSize={params.gridSize}
        tiles={params.tiles}
      />

      {phase === 'ready' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <h2 className="text-2xl font-bold">Flash Grid</h2>
          <p className="text-muted-foreground">
            Memorize the colored tiles, then recreate the pattern
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Grid: {params.gridSize}x{params.gridSize}</p>
            <p>Tiles to remember: {params.tiles}</p>
            <p>Exposure time: {params.exposureMs}ms</p>
          </div>
          <Button size="lg" onClick={handleStart}>
            Start Challenge
          </Button>
        </motion.div>
      )}

      {phase === 'memorize' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <TimerBar durationMs={params.exposureMs} />
          <PatternGrid
            grid={challenge.grid}
            gridSize={params.gridSize}
            interactive={false}
            showColors={true}
          />
          <p className="text-center text-muted-foreground">Memorize the pattern!</p>
        </motion.div>
      )}

      {phase === 'input' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Color Palette */}
          <div className="flex justify-center gap-2">
            {colorPalette.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-lg transition-all ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                }`}
                style={{ backgroundColor: getColorHex(color) }}
              />
            ))}
          </div>

          <PatternGrid
            grid={userAnswers}
            gridSize={params.gridSize}
            interactive={true}
            showColors={true}
            onCellClick={handleCellClick}
          />

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
