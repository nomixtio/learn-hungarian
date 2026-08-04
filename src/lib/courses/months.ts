import type { VocabularyCourse } from '@/lib/courses/types';

export const monthsCourse: VocabularyCourse = {
	id: 'months',
	slug: 'months',
	title: 'Months & seasons',
	subtitle: 'The twelve months of the year and the four seasons.',
	lessons: [
		{
			id: 'months',
			title: 'Months',
			description: 'Month names are not capitalized in Hungarian unless they start a sentence.',
			entries: [
				{ label: '1', hungarian: 'január', english: 'January' },
				{ label: '2', hungarian: 'február', english: 'February' },
				{ label: '3', hungarian: 'március', english: 'March' },
				{ label: '4', hungarian: 'április', english: 'April' },
				{ label: '5', hungarian: 'május', english: 'May' },
				{ label: '6', hungarian: 'június', english: 'June' },
				{ label: '7', hungarian: 'július', english: 'July' },
				{ label: '8', hungarian: 'augusztus', english: 'August' },
				{ label: '9', hungarian: 'szeptember', english: 'September' },
				{ label: '10', hungarian: 'október', english: 'October' },
				{ label: '11', hungarian: 'november', english: 'November' },
				{ label: '12', hungarian: 'december', english: 'December' },
			],
		},
		{
			id: 'seasons',
			title: 'Seasons',
			description: 'The four seasons.',
			entries: [
				{ hungarian: 'tavasz', english: 'spring' },
				{ hungarian: 'nyár', english: 'summer' },
				{ hungarian: 'ősz', english: 'autumn' },
				{ hungarian: 'tél', english: 'winter' },
			],
		},
	],
};
