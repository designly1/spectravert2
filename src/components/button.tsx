import React from 'react';

type ButtonVariant = 'default' | 'destructive' | 'info' | 'warning' | 'muted' | 'success';

interface ButtonProps {
	children: React.ReactNode;
	onClick: () => void;
	variant?: ButtonVariant;
	className?: string;
	style?: React.CSSProperties;
	disabled?: boolean;
}

export default function Button({
	children,
	onClick,
	variant = 'default',
	className = '',
	style,
	disabled,
}: ButtonProps) {
	const baseClasses =
		'bg-blue-500 text-white border-none px-4 py-2 rounded cursor-pointer transition-colors duration-300 min-w-[5rem] flex justify-center items-center text-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-white disabled:border disabled:border-gray-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-gray-400';

	const variantClasses = {
		default: '',
		destructive: 'bg-red-500 hover:bg-red-700',
		info: 'bg-cyan-500 hover:bg-cyan-700',
		warning: 'bg-yellow-500 text-black hover:bg-yellow-600',
		muted: 'bg-gray-500 hover:bg-gray-600',
		success: 'bg-green-500 hover:bg-green-700',
	};

	return (
		<button
			style={style}
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
}
