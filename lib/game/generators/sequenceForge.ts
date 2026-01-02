import { createRng } from '../seeds'
import { SequenceForgeParams, getSequenceForgeParams } from '../tiers'

export interface SequenceToken {
  shape: number // 0-n
  color: number // 0-n
}

export interface SequenceForgeChallenge {
  mode: 'sequence_forge'
  params: SequenceForgeParams
  sequence: SequenceToken[]
}

const SHAPES = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'star',
  'hexagon',
]

const COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#22C55E', // green
  '#EAB308', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
]

export function getShapeName(shapeIndex: number): string {
  return SHAPES[shapeIndex % SHAPES.length]
}

export function getColorHex(colorIndex: number): string {
  return COLORS[colorIndex % COLORS.length]
}

export function generateSequenceForgeChallenge(seed: string, tier: number): SequenceForgeChallenge {
  const rng = createRng(seed)
  const params = getSequenceForgeParams(tier)

  const sequence: SequenceToken[] = []

  for (let i = 0; i < params.steps; i++) {
    sequence.push({
      shape: Math.floor(rng() * params.shapes),
      color: Math.floor(rng() * params.colors),
    })
  }

  return {
    mode: 'sequence_forge',
    params,
    sequence,
  }
}

export function validateSequenceForgeAnswer(
  challenge: SequenceForgeChallenge,
  answers: SequenceToken[]
): { correct: number; total: number; accuracy: number; firstError: number | null } {
  const { sequence } = challenge
  let correct = 0
  let firstError: number | null = null

  for (let i = 0; i < sequence.length; i++) {
    const expected = sequence[i]
    const answer = answers[i]

    if (answer && expected.shape === answer.shape && expected.color === answer.color) {
      correct++
    } else if (firstError === null) {
      firstError = i
    }
  }

  return {
    correct,
    total: sequence.length,
    accuracy: (correct / sequence.length) * 100,
    firstError,
  }
}
