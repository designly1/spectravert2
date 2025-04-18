import { T_VideoFormat } from '@/lib/ffmpeg';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
	setStore: <K extends keyof StoreValues>(
		key: K,
		value: StoreValues[K],
	): Promise<boolean> => ipcRenderer.invoke('store:set', key, value),

	getStore: <T, K extends keyof StoreValues>(key: K): Promise<T> =>
		ipcRenderer.invoke('store:get', key),

	clearStore: (): Promise<void> => ipcRenderer.invoke('store:clear'),

	selectFolder: (title: string): Promise<string | null> =>
		ipcRenderer.invoke('select-folder', title),

	selectFile: (title: string, multiple: boolean): Promise<string | string[] | null> =>
		ipcRenderer.invoke('select-file', title, multiple),

	mergeClips: (
		clipPaths: string[],
		outputDir: string,
		format: T_VideoFormat,
	): Promise<string | null> =>
		ipcRenderer.invoke('merge-clips', clipPaths, outputDir, format),

	readFile: (filePath: string): Promise<string | null> =>
		ipcRenderer.invoke('read-file', filePath),
});
