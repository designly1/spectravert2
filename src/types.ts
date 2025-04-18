import { FFProbeResult } from 'ffprobe';

export type T_LoadedFile = {
	path: string;
	fileName: string;
	url: string;
	info: FFProbeResult;
	fileSize: number;
	tempFile: string;
};
