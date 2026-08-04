import type { VocabularyCourse } from '@/lib/courses/types';

export const daysCourse: VocabularyCourse = {
	id: 'days',
	slug: 'days',
	title: 'Days of the week',
	subtitle: 'Learn the seven days — in Hungary the week starts on Monday.',
	lessons: [
		{
			id: 'weekdays',
			title: 'Monday to Sunday',
			description:
				'The Hungarian week starts on Monday (hétfő). Days are not capitalized unless they begin a sentence.',
			entries: [
				{ label: 'Mon', hungarian: 'hétfő', english: 'Monday' },
				{ label: 'Tue', hungarian: 'kedd', english: 'Tuesday' },
				{ label: 'Wed', hungarian: 'szerda', english: 'Wednesday' },
				{ label: 'Thu', hungarian: 'csütörtök', english: 'Thursday' },
				{ label: 'Fri', hungarian: 'péntek', english: 'Friday' },
				{ label: 'Sat', hungarian: 'szombat', english: 'Saturday' },
				{ label: 'Sun', hungarian: 'vasárnap', english: 'Sunday' },
			],
		},
		{
			id: 'related',
			title: 'Related words',
			description: 'Useful time words that go with days of the week.',
			entries: [
				{ hungarian: 'ma', english: 'today' },
				{ hungarian: 'holnap', english: 'tomorrow' },
				{ hungarian: 'tegnap', english: 'yesterday' },
				{ hungarian: 'a héten', english: 'this week' },
				{ hungarian: 'hétvége', english: 'weekend' },
				{ hungarian: 'hétköznap', english: 'weekday' },
			],
		},
	],
};
