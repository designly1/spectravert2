import React from 'react';

import { cn } from '@/lib/utils';

interface ContainerProps {
	className?: string;
	children: React.ReactNode;
}

export default function Container({ className, children }: ContainerProps) {
	return (
		<div
			className={cn(
				'flex flex-col w-full max-w-7xl mx-auto p-10 rounded-xl bg-white/20',
				className,
			)}
		>
			{children}
		</div>
	);
}
