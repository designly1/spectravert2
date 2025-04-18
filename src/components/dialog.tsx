import React from 'react';
import Button from '../components/button';

import { useApp } from '@/context/app-provider';

export default function Dialog() {
	const { dialog, closeDialog } = useApp();
	if (!dialog) return null;

	const {
		title,
		message,
		onConfirm,
		onCancel,
		confirmLabel,
		cancelLabel,
		hideCancel = false,
	} = dialog;

	const handleConfirm = () => {
		onConfirm && onConfirm();
		closeDialog();
	};

	const handleCancel = () => {
		onCancel && onCancel();
		closeDialog();
	};

	return (
		<div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm text-zinc-700">
			<div className="bg-white shadow-xl mx-4 p-6 rounded-lg w-full max-w-md">
				<h2 className="mb-4 font-bold text-xl">{title}</h2>
				<p className="mb-6">{message}</p>
				<div className="flex justify-end gap-2">
					{!hideCancel && (
						<Button
							variant="muted"
							onClick={handleCancel}
						>
							{cancelLabel || 'Cancel'}
						</Button>
					)}
					<Button
						variant="default"
						onClick={handleConfirm}
					>
						{confirmLabel || 'OK'}
					</Button>
				</div>
			</div>
		</div>
	);
}
