import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function Loading() {
	const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);

	useEffect(() => {
		setLoadingMessage(window.loadingMessage);

		const intervalId = setInterval(() => {
			const newMessage = window.loadingMessage;
			if (newMessage !== loadingMessage) {
				setLoadingMessage(newMessage);
			}
		}, 100);

		return () => clearInterval(intervalId);
	}, [loadingMessage]);

	return (
		<AnimatePresence mode="wait">
			{loadingMessage && (
				<motion.div
					className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
					initial={{ opacity: 0, y: 100 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -100 }}
					transition={{ duration: 0.3 }}
				>
					<div className="flex flex-col items-center justify-center gap-4">
						<AiOutlineLoading3Quarters className="size-36 text-white animate-spin" />
						<p className="text-lg text-gray-100 animate-pulse">
							{loadingMessage}
						</p>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
