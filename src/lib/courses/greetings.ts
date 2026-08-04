import type { VocabularyCourse } from '@/lib/courses/types';

export const greetingsCourse: VocabularyCourse = {
	id: 'greetings',
	slug: 'greetings',
	title: 'Greetings & introductions',
	subtitle:
		'Everyday hellos, polite greetings for different times of day, and phrases for meeting someone new.',
	lessons: [
		{
			id: 'informal',
			title: 'Informal',
			description: 'Casual greetings used with friends, family, and peers.',
			entries: [
				{ hungarian: 'szia', english: 'hi / bye (informal)' },
				{ hungarian: 'helló', english: 'hello' },
				{ hungarian: 'viszlát', english: 'goodbye (informal)' },
				{ hungarian: 'viszontlátásra', english: 'goodbye (more formal)' },
				{ hungarian: 'szia szia', english: 'bye-bye' },
				{ hungarian: 'sziasztok', english: 'hi everyone (plural)' },
			],
		},
		{
			id: 'formal',
			title: 'Formal & time of day',
			description: 'Polite greetings — use with strangers, in shops, or at work.',
			entries: [
				{ hungarian: 'jó napot', english: 'good day (formal hello)' },
				{ hungarian: 'jó reggelt', english: 'good morning' },
				{ hungarian: 'jó estét', english: 'good evening' },
				{ hungarian: 'jó éjszakát', english: 'good night' },
				{ hungarian: 'üdvözletem', english: 'greetings (formal)' },
			],
		},
		{
			id: 'meeting',
			title: 'Meeting people',
			description: 'Introduce yourself and respond when you meet someone.',
			entries: [
				{ hungarian: 'a nevem …', english: 'my name is …' },
				{ hungarian: 'hogy hívnak?', english: 'what is your name?' },
				{ hungarian: 'örülök', english: 'nice to meet you (short)' },
				{ hungarian: 'örülök, hogy megismerhetlek', english: 'nice to meet you' },
				{ hungarian: 'én vagyok …', english: 'I am …' },
				{ hungarian: 'honnan jössz?', english: 'where are you from?' },
			],
		},
	],
};
