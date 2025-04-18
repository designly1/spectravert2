import React from 'react';
import Logo from '@/components/logo';

export default function Header() {
	return (
		<div className="flex justify-between items-center bg-blue-400 px-6 py-4">
			<Logo width={300} />
		</div>
	);
}
