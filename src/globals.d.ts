export interface ElectronAPI {
	setStore: <K extends keyof StoreValues>(
		key: K,
		value: StoreValues[K],
	) => Promise<boolean>;
	getStore: <K extends keyof StoreValues>(
		key: K,
	) => Promise<StoreValues[K] | undefined>;
	clearStore: () => Promise<void>;
	selectFolder: (title: string) => Promise<string | null>;
	selectFile: (title: string, multiple?: boolean) => Promise<string | string[] | null>;
	mergeClips: (
		clipPaths: string[],
		outputDir: string,
		format: T_VideoFormat,
	) => Promise<string | null>;
	readFile: (filePath: string) => Promise<string | null>;
}

declare global {
	interface StoreValues {
		exportPath: string;
		mergeOutputPath: string;
		ffmpegProgressFilePath: string;
	}

	interface LogAPI {
		onLogMessage(callback: (msg: string) => void): void;
	}

	interface Window {
		electronAPI: ElectronAPI;
		logAPI: LogAPI;
		loadingMessage: string | undefined;
	}
}

// Explicitly export the StoreValues interface
export interface StoreValues {
	exportPath: string;
	mergeOutputPath: string;
	ffmpegProgressFilePath: string;
}

export {};
