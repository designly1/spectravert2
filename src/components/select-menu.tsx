import React from 'react';

type Option<T> = {
	label: string;
	value: T;
};

type SelectMenuProps<T> = {
	label?: string;
	options: Option<T>[];
	onChange: (value: T) => void;
	value?: T;
};

const SelectMenu = <T,>({ label, options, onChange, value }: SelectMenuProps<T>) => {
	return (
		<div className="flex flex-col gap-2 w-full">
			{label && <label className="font-bold text-sm">{label}</label>}
			<div className="relative">
				<select
					value={value as any}
					onChange={e =>
						onChange(
							options.find(opt => String(opt.value) === e.target.value)
								?.value as T,
						)
					}
					className="w-full p-2 border border-white/60 rounded bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
				>
					{options.map((option, index) => (
						<option
							key={index}
							value={String(option.value)}
						>
							{option.label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default SelectMenu;
