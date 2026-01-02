import { createRng, pickRandom } from '../seeds'
import { WeeklyRunParams, TRANSFORMS, getFlashGridParams, getSequenceForgeParams, getRotationRunParams } from '../tiers'
import { generateFlashGridChallenge, FlashGridChallenge } from './flashGrid'
import { generateSequenceForgeChallenge, SequenceForgeChallenge } from './sequenceForge'
import { generateRotationRunChallenge, RotationRunChallenge } from './rotationRun'

export interface WeeklyRunChallenge {
  mode: 'weekly_run'
  params: WeeklyRunParams
  stages: Array<FlashGridChallenge | SequenceForgeChallenge | RotationRunChallenge>
}

export function generateWeeklyRunChallenge(seed: string, tier: number): WeeklyRunChallenge {
  const rng = createRng(seed)

  // Pick a random transform for rotation run
  const transform = pickRandom([...TRANSFORMS], rng)

  // Create modified rotation run params with random transform
  const rotationParams = { ...getRotationRunParams(tier), transform }

  const stages: WeeklyRunParams['stages'] = [
    {
      mode: 'flash_grid',
      tier,
      params: getFlashGridParams(tier),
    },
    {
      mode: 'sequence_forge',
      tier,
      params: getSequenceForgeParams(tier),
    },
    {
      mode: 'rotation_run',
      tier,
      params: rotationParams,
    },
  ]

  // Generate actual challenge data for each stage
  const generatedStages = stages.map((stage, index) => {
    const stageSeed = `${seed}|stage${index}`
    switch (stage.mode) {
      case 'flash_grid':
        return generateFlashGridChallenge(stageSeed, tier)
      case 'sequence_forge':
        return generateSequenceForgeChallenge(stageSeed, tier)
      case 'rotation_run':
        return generateRotationRunChallenge(stageSeed, tier)
    }
  })

  return {
    mode: 'weekly_run',
    params: { stages },
    stages: generatedStages,
  }
}
