import type { VocabularyCourse } from '@/lib/courses/types';

export const foodCourse: VocabularyCourse = {
	id: 'food',
	slug: 'food',
	title: 'Food & drink',
	subtitle: 'Everyday food vocabulary, meal names, and useful restaurant phrases.',
	lessons: [
		{
			id: 'basics',
			title: 'Basics',
			description: 'Common food and drink items.',
			entries: [
				{ hungarian: 'víz', english: 'water' },
				{ hungarian: 'kenyér', english: 'bread' },
				{ hungarian: 'sajt', english: 'cheese' },
				{ hungarian: 'kávé', english: 'coffee' },
				{ hungarian: 'tea', english: 'tea' },
				{ hungarian: 'sör', english: 'beer' },
				{ hungarian: 'bor', english: 'wine' },
				{ hungarian: 'alma', english: 'apple' },
			],
		},
		{
			id: 'meals',
			title: 'Meals',
			description: 'Names for meals and eating.',
			entries: [
				{ hungarian: 'reggeli', english: 'breakfast' },
				{ hungarian: 'ebéd', english: 'lunch' },
				{ hungarian: 'vacsora', english: 'dinner' },
				{ hungarian: 'éhes vagyok', english: 'I am hungry' },
				{ hungarian: 'szomjas vagyok', english: 'I am thirsty' },
				{ hungarian: 'jó étvágyat', english: 'enjoy your meal' },
			],
		},
		{
			id: 'restaurant',
			title: 'At the restaurant',
			description: 'Phrases for ordering and paying.',
			entries: [
				{ hungarian: 'étlapot kérek', english: 'menu, please' },
				{ hungarian: 'ezt kérem', english: 'I would like this' },
				{ hungarian: 'számlát kérek', english: 'the bill, please' },
				{ hungarian: 'finom volt', english: 'it was delicious' },
				{ hungarian: 'asztalt kérek két főre', english: 'a table for two, please' },
			],
		},
	],
};
