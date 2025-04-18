import React from 'react';
import Container from '@/components/container';
import Button from '@/components/button';

import { useApp } from '@/context/app-provider';

export default function MainScreen() {
	const { elec, setScreen } = useApp();

	return (
		<Container>
			<div className="flex flex-col items-center gap-6">
				<h1 className="mb-4 font-bold text-2xl">Welcome to Spectravert</h1>
				<div className="flex flex-col gap-4 w-full max-w-md">
					<Button
						onClick={() => setScreen('merge-clips')}
						className="py-4 w-full text-lg"
					>
						Merge Clips
					</Button>
					<Button
						onClick={() => setScreen('convert-format')}
						className="py-4 w-full text-lg"
					>
						Convert Format
					</Button>
				</div>
			</div>
		</Container>
	);
}
