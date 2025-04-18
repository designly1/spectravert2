import { ipcMain, dialog } from 'electron';
import Store from 'electron-store';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import log from 'electron-log/main';
import os from 'os';
import type { StoreValues } from './globals';
import { mergeClips, T_VideoFormat } from './lib/ffmpeg';

// Create store instance
const store = new Store();

// Create a wrapper that implements our interface
const storeWrapper = {
	get: <T>(key: keyof StoreValues): T => {
		return (store as any).get(key);
	},
	set: <T>(key: keyof StoreValues, value: T): void => {
		(store as any).set(key, value);
	},
	clear: (): void => {
		(store as any).clear();
	},
};

/**
 * Gets the path to the executable based on the environment.
 */
const getExecutablePath = (executableName: string): string => {
	const isDev = process.env.NODE_ENV === 'development';
	return isDev
		? path.join(__dirname, '..\\..', 'bin', executableName)
		: path.join(process.resourcesPath, executableName);
};

/**
 * Registers IPC handlers for Electron main process.
 */
export const registerHandlers = () => {
	log.initialize();

	// Remove previous handlers to prevent duplicate bindings
	ipcMain.removeHandler('select-folder');
	ipcMain.removeHandler('store:set');
	ipcMain.removeHandler('store:get');
	ipcMain.removeHandler('store:clear');
	ipcMain.removeHandler('store:getAll');
	ipcMain.removeHandler('read-file');

	ipcMain.handle(
		'select-folder',
		async (_event, title: string): Promise<string | null> => {
			log.info('Opening folder selection dialog with title:', title);
			try {
				const result = await dialog.showOpenDialog({
					title,
					properties: ['openDirectory', 'createDirectory'],
					buttonLabel: 'Select Folder',
					message: 'Please select an output directory',
					defaultPath: os.homedir(),
					securityScopedBookmarks: true,
				});

				log.info('Dialog result:', result);
				log.info('Selected paths:', result.filePaths);

				if (result.filePaths.length === 0) {
					log.info('No folder selected');
					return null;
				}

				const selectedPath = result.filePaths[0];
				log.info('Selected folder path:', selectedPath);
				return selectedPath;
			} catch (error) {
				log.error('Error in folder selection:', error);
				return null;
			}
		},
	);

	ipcMain.handle(
		'select-file',
		async (_event, title: string, multiple: boolean): Promise<string | string[]> => {
			const properties = multiple
				? (['openFile', 'multiSelections'] as ('openFile' | 'multiSelections')[])
				: (['openFile'] as 'openFile'[]);
			const { filePaths } = await dialog.showOpenDialog({
				title,
				properties,
			});

			if (filePaths.length === 0) return multiple ? [] : '';

			return multiple ? filePaths : filePaths[0];
		},
	);

	/**
	 * Saves a key-value pair persistently in the Electron store.
	 */
	ipcMain.handle('store:set', (_event, key: keyof StoreValues, value: any): boolean => {
		try {
			storeWrapper.set(key, value);
			return true;
		} catch (error) {
			return false;
		}
	});

	/**
	 * Retrieves a value from the Electron store by key.
	 */
	ipcMain.handle('store:get', (_event, key: keyof StoreValues): any => {
		return storeWrapper.get(key);
	});

	/**
	 * Clears all stored values from the Electron store.
	 */
	ipcMain.handle('store:clear', (): boolean => {
		try {
			storeWrapper.clear();
			return true;
		} catch (error) {
			return false;
		}
	});

	ipcMain.handle(
		'merge-clips',
		async (_event, clipPaths: string[], outputDir: string, format: T_VideoFormat) => {
			try {
				log.info(
					`Starting merge operation with ${clipPaths.length} clips to ${outputDir} in format ${format}`,
				);
				const outputFilePath = await mergeClips({
					clipPaths,
					outputDir,
					format,
				});
				if (outputFilePath) {
					log.info(`Merge completed successfully: ${outputFilePath}`);
				} else {
					log.error('Merge operation returned null result');
				}
				return outputFilePath;
			} catch (error) {
				log.error('Error in merge-clips handler:', error);
				return null;
			}
		},
	);

	/**
	 * Reads the contents of a file.
	 */
	ipcMain.handle(
		'read-file',
		async (_event, filePath: string): Promise<string | null> => {
			try {
				if (!fs.existsSync(filePath)) {
					log.error(`File does not exist: ${filePath}`);
					return null;
				}

				const data = await fs.promises.readFile(filePath, 'utf8');
				return data;
			} catch (error) {
				log.error(`Error reading file ${filePath}:`, error);
				return null;
			}
		},
	);
};
