declare global {}

import { T_VideoFormat } from '@/lib/ffmpeg';

export interface ElectronAPI {
	setStore: <K extends keyof StoreValues>(
		key: K,
		value: StoreValues[K],
	) => Promise<boolean>;
	getStore: <K extends keyof StoreValues>(
		key: K,
	) => Promise<StoreValues[K] | undefined>;
	getAllStore: () => Promise<StoreValues>;
	clearStore: () => Promise<void>;
	selectFolder: (title: string) => Promise<string | null>;
	selectFile: (title: string, multiple?: boolean) => Promise<string | string[] | null>;
	readMacros: (path: string) => Promise<string>;
	writeMacros: (macros: MacroItem[]) => Promise<string>;
	readBooks: (dataFolder: string) => Promise<string | string[]>;
	listDirectories: (dirPath: string) => Promise<string | string[]>;
	readBooks: (dataFolder: string) => Promise<string | string[]>;
	mergeClips: (
		clipPaths: string[],
		outputDir: string,
		format: T_VideoFormat,
	) => Promise<string | null>;
	readFile: (filePath: string) => Promise<string | null>;
}

declare global {
	interface Window {
		electronAPI: ElectronAPI;
		logAPI: LogAPI;
		loadingMessage: string | undefined;
	}
}

export {};
