import path from 'path';
import os from 'os';
import { app } from 'electron';

const appPath = app.getAppPath();
const platform = os.platform();

export function getPlatform() {
	switch (platform) {
		case 'aix':
		case 'freebsd':
		case 'linux':
		case 'openbsd':
		case 'android':
			return 'linux';
		case 'darwin':
		case 'sunos':
			return 'mac';
		case 'win32':
			return 'win';
		default:
			throw new Error('Unknown platform');
	}
}

export const getFFmpegPath = () => {
	return path.join(
		appPath,
		process.env.NODE_ENV === 'development' ? '' : '..',
		'bin',
		platform,
		os.arch() === 'x64' ? 'x64' : 'arm64',
		platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
	);
};

export const getFFprobePath = () => {
	return path.join(
		appPath,
		process.env.NODE_ENV === 'development' ? '' : '..',
		'bin',
		platform,
		os.arch() === 'x64' ? 'x64' : 'arm64',
		platform === 'win32' ? 'ffprobe.exe' : 'ffprobe',
	);
};
