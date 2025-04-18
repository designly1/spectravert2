import React from 'react';

const backgroundColors = [
	'#563886', // Deep Purple
	'#32328f', // Dark Blue
	'#20566a', // Teal Blue
	'#806d22', // Earthy Brown
	'#4a1d73', // Dark Violet
	'#821717', // Dark Red
];

interface CharacterButtonProps {
	name: string;
	onClick: () => void;
	index?: number;
}

export default function CharacterButton({
	name,
	onClick,
	index = 0,
}: CharacterButtonProps) {
	const backgroundColor = backgroundColors[index % backgroundColors.length];

	return (
		<button
			className="inline-block w-full max-w-[300px] p-6 text-2xl font-bold text-center text-white border-none rounded-xl cursor-pointer transition-all duration-200 shadow-lg hover:scale-105 hover:opacity-90 hover:shadow-xl active:scale-98"
			onClick={onClick}
			style={{ backgroundColor }}
		>
			{name}
		</button>
	);
}
