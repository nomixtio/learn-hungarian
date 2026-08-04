export type VocabularyEntry = {
	hungarian: string;
	english: string;
	label?: string;
};

export type VocabularyLesson = {
	id: string;
	title: string;
	description?: string;
	entries: VocabularyEntry[];
};

export type VocabularyCourse = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	lessons: VocabularyLesson[];
};

// STT foundation — not wired to course UI yet.
// Future: attach SpeakingExercise[] to VocabularyLesson (e.g. `exercises?: SpeakingExercise[]`)
// so each lesson can offer "listen and repeat" prompts checked against expectedHungarian.
export type SpeakingExercise = {
	id: string;
	promptEnglish: string;
	expectedHungarian: string;
	hints?: string[];
};
