import React from 'react';
import ScreenSwitch from '@/screen-switch';
import Header from '@/layout/header';

import { AppProvider } from '@/context/app-provider';

export default function MainView() {
	return (
		<AppProvider>
			<div className="flex flex-col h-screen">
				<Header />
				<div className="flex flex-col flex-1 px-10 py-20 overflow-y-auto">
					<ScreenSwitch />
				</div>
			</div>
		</AppProvider>
	);
}
