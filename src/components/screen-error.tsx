import React from 'react';
import Alert from '../components/alert';

interface Props {
	message: string;
}

export default function ScreenError({ message }: Props) {
	return (
		<div className="mx-auto">
			<Alert
				message={message}
				variant="destructive"
			/>
		</div>
	);
}
