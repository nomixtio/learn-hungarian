import type { VocabularyCourse } from '@/lib/courses/types';

export const phrasesCourse: VocabularyCourse = {
	id: 'phrases',
	slug: 'phrases',
	title: 'Essential phrases',
	subtitle:
		'Polite expressions, phrases for when you do not understand, and useful travel vocabulary.',
	lessons: [
		{
			id: 'politeness',
			title: 'Politeness',
			description: 'Core courtesy words you will use every day.',
			entries: [
				{ hungarian: 'kérem', english: 'please' },
				{ hungarian: 'köszönöm', english: 'thank you' },
				{ hungarian: 'szívesen', english: 'you are welcome' },
				{ hungarian: 'bocsánat', english: 'sorry / excuse me' },
				{ hungarian: 'elnézést', english: 'excuse me (formal)' },
				{ hungarian: 'igen', english: 'yes' },
				{ hungarian: 'nem', english: 'no' },
			],
		},
		{
			id: 'communication',
			title: 'Communication',
			description: 'When you need help understanding or speaking.',
			entries: [
				{ hungarian: 'nem értem', english: 'I do not understand' },
				{ hungarian: 'beszél angolul?', english: 'do you speak English?' },
				{ hungarian: 'lassan kérem', english: 'slowly, please' },
				{ hungarian: 'megismételné?', english: 'could you repeat that?' },
				{ hungarian: 'mit jelent ez?', english: 'what does this mean?' },
				{ hungarian: 'hogyan mondod magyarul?', english: 'how do you say it in Hungarian?' },
			],
		},
		{
			id: 'travel',
			title: 'Travel & help',
			description: 'Handy phrases when you are out and about.',
			entries: [
				{ hungarian: 'hol van …?', english: 'where is …?' },
				{ hungarian: 'mennyibe kerül?', english: 'how much does it cost?' },
				{ hungarian: 'segítség', english: 'help' },
				{ hungarian: 'segítsenek!', english: 'help! (calling for help)' },
				{ hungarian: 'tudna segíteni?', english: 'can you help me?' },
				{ hungarian: 'hol van a mosdó?', english: 'where is the restroom?' },
			],
		},
	],
};
