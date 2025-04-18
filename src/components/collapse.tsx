import React, { useState } from 'react';

interface CollapseProps {
	title: string;
	middle?: string;
	end?: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
	className?: string;
	openIndexes?: number[];
	setOpenIndexes?: React.Dispatch<React.SetStateAction<number[]>>;
	index?: number;
}

export default function Collapse({
	title,
	middle,
	end,
	children,
	defaultOpen = false,
	className = '',
	openIndexes = [],
	index = 0,
	setOpenIndexes,
}: CollapseProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const isOpenOverride = openIndexes.length > 0 ? openIndexes.includes(index) : isOpen;

	const handleClick = () => {
		if (setOpenIndexes) {
			if (openIndexes.includes(index)) {
				setOpenIndexes(prev => prev.filter(i => i !== index));
			} else {
				setOpenIndexes(prev => [...prev, index]);
			}
		} else {
			setIsOpen(!isOpen);
		}
	};

	return (
		<div className={`border rounded-lg overflow-hidden ${className}`}>
			<button
				onClick={handleClick}
				className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
			>
				<span className="font-medium text-gray-900">{title}</span>
				{middle && <span className="font-medium text-blue-500">{middle}</span>}
				{end && <span className="font-medium text-gray-900">{end}</span>}
				<svg
					className={`w-5 h-5 transform transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
			<div
				className={`transition-all duration-300 ease-in-out ${
					isOpenOverride ? 'opacity-100' : 'opacity-0 overflow-hidden max-h-0'
				}`}
			>
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
}
