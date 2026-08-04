import type { VocabularyCourse } from '@/lib/courses/types';

export const numbersCourse: VocabularyCourse = {
	id: 'numbers',
	slug: 'numbers',
	title: 'Hungarian numbers',
	subtitle:
		'A reference guide to counting in Hungarian. Work through each section in order — basics first, then teens, tens, compounds, and larger numbers.',
	lessons: [
		{
			id: 'basics',
			title: '0–10',
			description: 'The foundation — learn these by heart before moving on.',
			entries: [
				{ label: '0', hungarian: 'nulla', english: 'zero' },
				{ label: '1', hungarian: 'egy', english: 'one' },
				{ label: '2', hungarian: 'kettő', english: 'two' },
				{ label: '3', hungarian: 'három', english: 'three' },
				{ label: '4', hungarian: 'négy', english: 'four' },
				{ label: '5', hungarian: 'öt', english: 'five' },
				{ label: '6', hungarian: 'hat', english: 'six' },
				{ label: '7', hungarian: 'hét', english: 'seven' },
				{ label: '8', hungarian: 'nyolc', english: 'eight' },
				{ label: '9', hungarian: 'kilenc', english: 'nine' },
				{ label: '10', hungarian: 'tíz', english: 'ten' },
			],
		},
		{
			id: 'teens',
			title: '11–19',
			description:
				'Teens use the prefix tizen- (or tizenn- before vowels) plus the unit: tizen + egy = tizenegy (11).',
			entries: [
				{ label: '11', hungarian: 'tizenegy', english: 'eleven' },
				{ label: '12', hungarian: 'tizenkettő', english: 'twelve' },
				{ label: '13', hungarian: 'tizenhárom', english: 'thirteen' },
				{ label: '14', hungarian: 'tizennégy', english: 'fourteen' },
				{ label: '15', hungarian: 'tizenöt', english: 'fifteen' },
				{ label: '16', hungarian: 'tizenhat', english: 'sixteen' },
				{ label: '17', hungarian: 'tizenhét', english: 'seventeen' },
				{ label: '18', hungarian: 'tizennyolc', english: 'eighteen' },
				{ label: '19', hungarian: 'tizenkilenc', english: 'nineteen' },
			],
		},
		{
			id: 'tens',
			title: 'Tens',
			description: 'Round tens from twenty to ninety.',
			entries: [
				{ label: '20', hungarian: 'húsz', english: 'twenty' },
				{ label: '30', hungarian: 'harminc', english: 'thirty' },
				{ label: '40', hungarian: 'negyven', english: 'forty' },
				{ label: '50', hungarian: 'ötven', english: 'fifty' },
				{ label: '60', hungarian: 'hatvan', english: 'sixty' },
				{ label: '70', hungarian: 'hetven', english: 'seventy' },
				{ label: '80', hungarian: 'nyolcvan', english: 'eighty' },
				{ label: '90', hungarian: 'kilencven', english: 'ninety' },
			],
		},
		{
			id: 'compounds',
			title: 'Compounds',
			description:
				'Combine a ten and a unit without “and”: 21 = huszonegy, 35 = harmincöt. Note spelling changes (e.g. húsz → huszon-, öt → öt).',
			entries: [
				{ label: '21', hungarian: 'huszonegy', english: 'twenty-one' },
				{ label: '22', hungarian: 'huszonkettő', english: 'twenty-two' },
				{ label: '35', hungarian: 'harmincöt', english: 'thirty-five' },
				{ label: '47', hungarian: 'negyvenhét', english: 'forty-seven' },
				{ label: '58', hungarian: 'ötvennyolc', english: 'fifty-eight' },
				{ label: '99', hungarian: 'kilencvenkilenc', english: 'ninety-nine' },
			],
		},
		{
			id: 'larger',
			title: 'Larger numbers',
			description: 'Hundred and thousand follow the same compounding logic.',
			entries: [
				{ label: '100', hungarian: 'száz', english: 'one hundred' },
				{ label: '101', hungarian: 'százegy', english: 'one hundred one' },
				{ label: '200', hungarian: 'kettőszáz', english: 'two hundred' },
				{ label: '365', hungarian: 'háromszázhatvanöt', english: 'three hundred sixty-five' },
				{ label: '1000', hungarian: 'ezer', english: 'one thousand' },
				{ label: '2024', hungarian: 'kétezer-huszonnégy', english: 'two thousand twenty-four' },
			],
		},
	],
};
