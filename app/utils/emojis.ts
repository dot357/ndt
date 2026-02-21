export interface ReactionEmoji {
  key: string
  icon: string
  label: string
}

export const REACTION_EMOJIS: ReactionEmoji[] = [
  { key: 'fire', icon: 'i-noto-fire', label: 'Fire' },
  { key: 'laughing', icon: 'i-noto-rolling-on-the-floor-laughing', label: 'LOL' },
  { key: 'mind-blown', icon: 'i-noto-exploding-head', label: 'Mind Blown' },
  { key: 'clapping', icon: 'i-noto-clapping-hands', label: 'Clap' },
  { key: 'heart-eyes', icon: 'i-noto-smiling-face-with-heart-eyes', label: 'Love' },
  { key: 'skull', icon: 'i-noto-skull', label: 'Dead' }
]

export function getEmojiByKey(key: string): ReactionEmoji | undefined {
  return REACTION_EMOJIS.find(e => e.key === key)
}
