import React, { useState } from 'react';

import { cn } from '../lib/utils';

type AlertVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

interface AlertProps {
	message: string;
	variant?: AlertVariant;
	onClose?: () => void;
	className?: string;
}

export default function Alert({
	message,
	variant = 'default',
	onClose,
	className = '',
}: AlertProps) {
	const [visible, setVisible] = useState(true);

	if (!visible) return null;

	const variantStyles = {
		default: 'bg-gray-600 text-white',
		success: 'bg-green-600 text-white',
		info: 'bg-cyan-600 text-white',
		warning: 'bg-yellow-500 text-black',
		destructive: 'bg-red-600 text-white',
	};

	return (
		<div
			className={cn(
				'flex justify-between items-center p-4 rounded-lg font-bold shadow-lg transition-opacity duration-300 relative w-[90%] max-w-[400px] mx-auto animate-[fadeIn_0.4s_ease-out]',
				variantStyles[variant],
				className,
			)}
			role="alert"
		>
			<span>{message}</span>
			{onClose && (
				<button
					className={cn(
						'bg-transparent border-none text-white text-2xl cursor-pointer ml-4 leading-none hover:opacity-80',
						variant === 'warning' && 'text-black',
					)}
					onClick={() => {
						setVisible(false);
						onClose();
					}}
					aria-label="Close alert"
				>
					&times;
				</button>
			)}
		</div>
	);
}
