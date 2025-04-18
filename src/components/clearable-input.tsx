import React from 'react';

import { cn } from '../lib/utils';

interface ClearableInputProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onClear: () => void;
	placeholder?: string;
	disabled?: boolean;
	showButtonWhenEmpty?: boolean;
	maxLength?: number;
	className?: string;
}

export default function ClearableInput({
	value,
	onChange,
	onClear,
	placeholder = 'Enter text...',
	disabled = false,
	showButtonWhenEmpty = true,
	maxLength = 1000,
	className,
}: ClearableInputProps) {
	return (
		<div className={cn('relative flex items-center w-full', className)}>
			<input
				type="text"
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				disabled={disabled}
				className="bg-white/60 disabled:opacity-50 p-2 pr-8 border border-white/60 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full disabled:cursor-not-allowed"
				maxLength={maxLength}
			/>
			{(showButtonWhenEmpty || value) && (
				<button
					type="button"
					className="right-2 absolute disabled:opacity-50 p-1 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
					onClick={onClear}
					disabled={disabled}
				>
					&times;
				</button>
			)}
		</div>
	);
}
