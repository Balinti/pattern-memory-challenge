import { z } from 'zod'

// Flash Grid answer schema
const flashGridAnswerSchema = z.object({
  mode: z.literal('flash_grid'),
  answers: z.array(z.array(z.number())), // 2D array of color indices (-1 for empty)
  events: z.array(z.object({
    t: z.number(),
    type: z.string(),
  })),
})

// Sequence Forge answer schema
const sequenceForgeAnswerSchema = z.object({
  mode: z.literal('sequence_forge'),
  answers: z.array(z.object({
    shape: z.number(),
    color: z.number(),
  })),
  events: z.array(z.object({
    t: z.number(),
    type: z.string(),
  })),
})

// Rotation Run answer schema
const rotationRunAnswerSchema = z.object({
  mode: z.literal('rotation_run'),
  answers: z.array(z.array(z.boolean())), // 2D array of filled cells
  events: z.array(z.object({
    t: z.number(),
    type: z.string(),
  })),
})

// Weekly Run answer schema
const weeklyRunAnswerSchema = z.object({
  mode: z.literal('weekly_run'),
  stages: z.array(z.union([
    flashGridAnswerSchema,
    sequenceForgeAnswerSchema,
    rotationRunAnswerSchema,
  ])),
})

export const attemptResultSchema = z.union([
  flashGridAnswerSchema,
  sequenceForgeAnswerSchema,
  rotationRunAnswerSchema,
  weeklyRunAnswerSchema,
])

export const submitAttemptSchema = z.object({
  challenge_issue_id: z.string().uuid(),
  result: attemptResultSchema,
  client_meta: z.object({
    tz: z.string().optional(),
    ua: z.string().optional(),
  }).optional(),
})

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>
export type AttemptResult = z.infer<typeof attemptResultSchema>

export function validateSubmitAttempt(data: unknown): SubmitAttemptInput {
  return submitAttemptSchema.parse(data)
}

export function getDurationFromEvents(events: Array<{ t: number; type: string }>): number {
  const start = events.find(e => e.type === 'start')?.t ?? 0
  const end = events.find(e => e.type === 'submit')?.t ?? events[events.length - 1]?.t ?? 0
  return Math.max(0, end - start)
}

export function validateChallengeNotExpired(expiresAt: Date): boolean {
  return new Date() < expiresAt
}

export function validateChallengeNotConsumed(consumedAt: Date | null): boolean {
  return consumedAt === null
}
