import type { VocabularyCourse } from '@/lib/courses/types';

export const alphabetCourse: VocabularyCourse = {
	id: 'alphabet',
	slug: 'alphabet',
	title: 'Hungarian alphabet',
	subtitle:
		'Learn the 44 letters of the Hungarian alphabet and how they sound. Tap the speaker to hear each example word.',
	lessons: [
		{
			id: 'short-vowels',
			title: 'Short vowels',
			description:
				'Hungarian has seven short vowels. Length matters — short and long vowels can change the meaning of a word.',
			entries: [
				{ label: 'A', hungarian: 'alma', english: 'like "o" in hot or "a" in father' },
				{ label: 'E', hungarian: 'egér', english: 'like "e" in bed' },
				{ label: 'I', hungarian: 'igen', english: 'like "i" in sit' },
				{ label: 'O', hungarian: 'orvos', english: 'like "aw" in law' },
				{ label: 'Ö', hungarian: 'öt', english: 'like "ur" in fur (lips rounded)' },
				{ label: 'U', hungarian: 'uborka', english: 'like "oo" in boot' },
				{ label: 'Ü', hungarian: 'üveg', english: 'like "u" in June (lips rounded)' },
			],
		},
		{
			id: 'long-vowels',
			title: 'Long vowels',
			description:
				'Long vowels are written with an acute accent (á, é, í, ó, ú) or double dots (ő, ű). Hold the sound roughly twice as long.',
			entries: [
				{ label: 'Á', hungarian: 'árpa', english: 'like "a" in father (held longer)' },
				{ label: 'É', hungarian: 'édes', english: 'like "ay" in day' },
				{ label: 'Í', hungarian: 'író', english: 'like "ee" in see' },
				{ label: 'Ó', hungarian: 'óra', english: 'like "o" in go' },
				{ label: 'Ő', hungarian: 'ősz', english: 'like a longer "ur" in fur' },
				{ label: 'Ú', hungarian: 'új', english: 'like "oo" in food' },
				{ label: 'Ű', hungarian: 'űrhajó', english: 'like a longer "u" in June' },
			],
		},
		{
			id: 'familiar-consonants',
			title: 'Familiar consonants',
			description: 'These consonants sound much like their English counterparts.',
			entries: [
				{ label: 'B', hungarian: 'busz', english: 'like "b" in bus' },
				{ label: 'D', hungarian: 'dob', english: 'like "d" in dog' },
				{ label: 'F', hungarian: 'fa', english: 'like "f" in fish' },
				{ label: 'G', hungarian: 'gép', english: 'like "g" in go (always hard)' },
				{ label: 'H', hungarian: 'ház', english: 'like "h" in house' },
				{ label: 'K', hungarian: 'kék', english: 'like "k" in kite' },
				{ label: 'L', hungarian: 'lámpa', english: 'like "l" in lamp' },
				{ label: 'M', hungarian: 'mama', english: 'like "m" in mom' },
				{ label: 'N', hungarian: 'nem', english: 'like "n" in no' },
				{ label: 'P', hungarian: 'piros', english: 'like "p" in pen' },
				{ label: 'R', hungarian: 'rózsa', english: 'rolled "r", like Spanish "perro"' },
				{ label: 'T', hungarian: 'torta', english: 'like "t" in top' },
				{ label: 'V', hungarian: 'víz', english: 'like "v" in van' },
				{ label: 'Z', hungarian: 'zene', english: 'like "z" in zoo' },
			],
		},
		{
			id: 'different-consonants',
			title: 'Consonants that sound different',
			description:
				'Watch out — several Hungarian letters look familiar but sound quite different from English.',
			entries: [
				{ label: 'C', hungarian: 'cica', english: 'like "ts" in cats (not "k"!)' },
				{ label: 'J', hungarian: 'jó', english: 'like "y" in yes (not "j" in jam!)' },
				{ label: 'S', hungarian: 'sajt', english: 'like "sh" in ship (not "s" in sun!)' },
				{ label: 'Sz', hungarian: 'szék', english: 'like "s" in sun' },
				{ label: 'Ly', hungarian: 'lyuk', english: 'same as j — like "y" in yes' },
			],
		},
		{
			id: 'digraphs',
			title: 'Letter pairs (digraphs)',
			description:
				'Some sounds are written with two or three letters. Each pair is a single sound in Hungarian.',
			entries: [
				{ label: 'Cs', hungarian: 'csiga', english: 'like "ch" in church' },
				{ label: 'Gy', hungarian: 'gyerek', english: 'like "d" in dew (soft, palatal)' },
				{ label: 'Ny', hungarian: 'nyúl', english: 'like "ni" in onion' },
				{ label: 'Ty', hungarian: 'tyúk', english: 'like "t" in tune (soft, palatal)' },
				{ label: 'Zs', hungarian: 'zsiráf', english: 'like "s" in pleasure / "zh"' },
				{ label: 'Dz', hungarian: 'edz', english: 'like "ds" in kids' },
				{ label: 'Dzs', hungarian: 'dzsungel', english: 'like "j" in judge' },
			],
		},
	],
};
