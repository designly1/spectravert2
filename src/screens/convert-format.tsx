import React from 'react';
import Container from '@/components/container';
import Button from '@/components/button';

import { useApp } from '@/context/app-provider';

export default function ConvertFormatScreen() {
	const { setScreen } = useApp();

	return (
		<Container>
			<div className="flex flex-col items-center gap-6">
				<div className="flex justify-between items-center w-full">
					<h1 className="font-bold text-2xl">Convert Format</h1>
					<Button
						onClick={() => setScreen('main')}
						variant="muted"
					>
						Back
					</Button>
				</div>
				<div className="w-full max-w-md">
					<p className="mb-4 text-gray-100 text-center">
						Select a file and choose the format you want to convert it to
					</p>
					{/* TODO: Add file selection and format conversion functionality */}
				</div>
			</div>
		</Container>
	);
}
