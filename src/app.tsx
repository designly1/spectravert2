// React root component

import React from 'react';
import { createRoot } from 'react-dom/client';
import MainView from './main-view';

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Failed to find the root element');
}
const root = createRoot(rootElement);

root.render(
	<>
		<MainView />
	</>,
);
