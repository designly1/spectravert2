import React from 'react';

import Logo from '@/components/logo';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashProps {
	show: boolean;
}

export default function Splash({ show }: SplashProps) {
	return (
		<AnimatePresence>
			{show && (
				<motion.div
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
					className="z-50 fixed inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-sm"
				>
					<Logo width={500} />
				</motion.div>
			)}
		</AnimatePresence>
	);
}
