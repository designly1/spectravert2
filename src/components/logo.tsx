import React from 'react';

import logo from '@/assets/svg/logo.svg';

const ORIG_WIDTH = 872;
const ORIG_HEIGHT = 206;

interface LogoProps {
	width?: number;
}

export default function Logo(props: LogoProps) {
	const { width = ORIG_WIDTH } = props;

	const height = (width / ORIG_WIDTH) * ORIG_HEIGHT;

	return (
		<img
			src={logo}
			alt="logo"
			width={width}
			height={height}
		/>
	);
}
