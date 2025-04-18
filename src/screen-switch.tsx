import React from 'react';
import MainScreen from '@/screens/main';
import MergeClipsScreen from '@/screens/merge-clips';
import ConvertFormatScreen from '@/screens/convert-format';

import { useApp } from '@/context/app-provider';

export default function ScreenSwitch() {
	const { screen } = useApp();

	switch (screen) {
		case 'merge-clips':
			return <MergeClipsScreen />;
		case 'convert-format':
			return <ConvertFormatScreen />;
		case 'main':
		default:
			return <MainScreen />;
	}
}
