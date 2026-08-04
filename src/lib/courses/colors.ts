import type { VocabularyCourse } from '@/lib/courses/types';

export const colorsCourse: VocabularyCourse = {
	id: 'colors',
	slug: 'colors',
	title: 'Colors',
	subtitle: 'Common color words in Hungarian — basics first, then a wider palette.',
	lessons: [
		{
			id: 'basic',
			title: 'Basic colors',
			description: 'The six most common colors to start with.',
			entries: [
				{ hungarian: 'piros', english: 'red' },
				{ hungarian: 'kék', english: 'blue' },
				{ hungarian: 'zöld', english: 'green' },
				{ hungarian: 'sárga', english: 'yellow' },
				{ hungarian: 'fekete', english: 'black' },
				{ hungarian: 'fehér', english: 'white' },
			],
		},
		{
			id: 'more',
			title: 'More colors',
			description: 'Additional shades and hues.',
			entries: [
				{ hungarian: 'narancssárga', english: 'orange' },
				{ hungarian: 'lila', english: 'purple' },
				{ hungarian: 'rózsaszín', english: 'pink' },
				{ hungarian: 'barna', english: 'brown' },
				{ hungarian: 'szürke', english: 'grey' },
				{ hungarian: 'arany', english: 'gold' },
				{ hungarian: 'ezüst', english: 'silver' },
			],
		},
	],
};
