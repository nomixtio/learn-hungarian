import type { RealtimeToken } from '@soniox/client';

export type TranslationChunk = {
  id: string;
  speaker: string;
  originalText: string;
  translationText: string;
  originalPartial: string;
  translationPartial: string;
};

type MutableChunk = {
  speaker: string;
  originalText: string;
  translationText: string;
  hasTranslation: boolean;
  startMs?: number;
};

function isTranslationToken(token: RealtimeToken): boolean {
  return token.translation_status === 'translation';
}

function appendTokenText(existing: string, tokenText: string): string {
  return existing + tokenText;
}

function hasChunkContent(chunk: TranslationChunk): boolean {
  return !!(
    chunk.originalText ||
    chunk.translationText ||
    chunk.originalPartial ||
    chunk.translationPartial
  );
}

function createMutableChunk(speaker: string, startMs?: number): MutableChunk {
  return {
    speaker,
    originalText: '',
    translationText: '',
    hasTranslation: false,
    startMs,
  };
}

function toTranslationChunk(chunk: MutableChunk, index: number): TranslationChunk {
  const id =
    chunk.startMs != null ? `${chunk.speaker}-${chunk.startMs}` : `${chunk.speaker}-${index}`;

  return {
    id,
    speaker: chunk.speaker,
    originalText: chunk.originalText,
    translationText: chunk.translationText,
    originalPartial: '',
    translationPartial: '',
  };
}

function applyPartialTokens(
  chunks: TranslationChunk[],
  partialTokens: readonly RealtimeToken[],
): TranslationChunk[] {
  if (partialTokens.length === 0) {
    return chunks;
  }

  let originalPartial = '';
  let translationPartial = '';
  const speaker = partialTokens[0]?.speaker ?? 'unknown';

  for (const token of partialTokens) {
    if (isTranslationToken(token)) {
      translationPartial = appendTokenText(translationPartial, token.text);
    } else {
      originalPartial = appendTokenText(originalPartial, token.text);
    }
  }

  const lastChunk = chunks.at(-1);
  if (lastChunk && lastChunk.speaker === speaker) {
    return chunks.map((chunk, index) =>
      index === chunks.length - 1
        ? {
            ...chunk,
            id: `${speaker}-partial`,
            originalPartial,
            translationPartial,
          }
        : chunk,
    );
  }

  const openChunk: TranslationChunk = {
    id: `${speaker}-partial`,
    speaker,
    originalText: '',
    translationText: '',
    originalPartial,
    translationPartial,
  };

  return hasChunkContent(openChunk) ? [...chunks, openChunk] : chunks;
}

export function buildTranslationChunks(
  finalTokens: readonly RealtimeToken[],
  partialTokens: readonly RealtimeToken[],
): TranslationChunk[] {
  const chunks: TranslationChunk[] = [];
  let current: MutableChunk | null = null;
  let chunkIndex = 0;

  for (const token of finalTokens) {
    const speaker = token.speaker ?? 'unknown';

    if (current !== null && speaker !== current.speaker) {
      if (current.originalText || current.translationText) {
        chunks.push(toTranslationChunk(current, chunkIndex));
        chunkIndex += 1;
      }
      current = null;
    }

    if (isTranslationToken(token)) {
      if (current === null) {
        current = createMutableChunk(speaker, token.start_ms);
      }
      current.hasTranslation = true;
      current.translationText = appendTokenText(current.translationText, token.text);
      continue;
    }

    if (current !== null && current.hasTranslation) {
      chunks.push(toTranslationChunk(current, chunkIndex));
      chunkIndex += 1;
      current = null;
    }

    if (current === null) {
      current = createMutableChunk(speaker, token.start_ms);
    }

    if (current.originalText === '' && token.start_ms != null) {
      current.startMs = token.start_ms;
    }

    current.originalText = appendTokenText(current.originalText, token.text);
  }

  if (current !== null && (current.originalText || current.translationText)) {
    chunks.push(toTranslationChunk(current, chunkIndex));
  }

  return applyPartialTokens(chunks, partialTokens).filter(hasChunkContent);
}

function finalizedFieldsEqual(a: TranslationChunk, b: TranslationChunk): boolean {
  return (
    a.id === b.id &&
    a.speaker === b.speaker &&
    a.originalText === b.originalText &&
    a.translationText === b.translationText &&
    a.originalPartial === '' &&
    a.translationPartial === '' &&
    b.originalPartial === '' &&
    b.translationPartial === ''
  );
}

export function splitTranslationChunks(chunks: readonly TranslationChunk[]): {
  stableChunks: TranslationChunk[];
  liveChunk: TranslationChunk | null;
} {
  const lastChunk = chunks.at(-1);
  if (lastChunk === undefined) {
    return { stableChunks: [], liveChunk: null };
  }

  const hasLivePartial = !!(lastChunk.originalPartial || lastChunk.translationPartial);
  if (!hasLivePartial) {
    return { stableChunks: [...chunks], liveChunk: null };
  }

  return {
    stableChunks: chunks.slice(0, -1),
    liveChunk: lastChunk,
  };
}

export function reuseStableChunkReferences(
  previousStable: readonly TranslationChunk[],
  nextChunks: readonly TranslationChunk[],
): TranslationChunk[] {
  const { stableChunks, liveChunk } = splitTranslationChunks(nextChunks);

  const reusedStable = stableChunks.map((chunk, index) => {
    const previous = previousStable[index];
    if (previous !== undefined && finalizedFieldsEqual(previous, chunk)) {
      return previous;
    }
    return chunk;
  });

  return liveChunk !== null ? [...reusedStable, liveChunk] : reusedStable;
}
