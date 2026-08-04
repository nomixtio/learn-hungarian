export type SpeakerColorPair = {
  text: string;
  highlight: string;
};

export const SpeakerColors = {
  light: [
    { text: '#0B6E99', highlight: '#BAE6FD' },
    { text: '#B45309', highlight: '#FDE68A' },
    { text: '#047857', highlight: '#A7F3D0' },
    { text: '#6D28D9', highlight: '#DDD6FE' },
    { text: '#BE185D', highlight: '#FBCFE8' },
    { text: '#0F766E', highlight: '#99F6E4' },
  ],
  dark: [
    { text: '#38BDF8', highlight: '#0C4A6E' },
    { text: '#FBBF24', highlight: '#78350F' },
    { text: '#4ADE80', highlight: '#064E3B' },
    { text: '#A78BFA', highlight: '#4C1D95' },
    { text: '#F472B6', highlight: '#831843' },
    { text: '#2DD4BF', highlight: '#134E4A' },
  ],
} as const satisfies Record<'light' | 'dark', SpeakerColorPair[]>;

function hashSpeaker(speaker: string): number {
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) {
    hash = (hash * 31 + speaker.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getSpeakerIndex(speaker: string): number {
  const paletteSize = SpeakerColors.light.length;
  if (speaker === 'unknown') {
    return 0;
  }

  const numericSpeaker = parseInt(speaker, 10);
  if (!Number.isNaN(numericSpeaker)) {
    return ((numericSpeaker - 1) % paletteSize + paletteSize) % paletteSize;
  }

  return hashSpeaker(speaker) % paletteSize;
}

export function getSpeakerColor(speaker: string, scheme: 'light' | 'dark'): SpeakerColorPair {
  return SpeakerColors[scheme][getSpeakerIndex(speaker)]!;
}
