/* eslint-disable prefer-destructuring */
import { dialog, BrowserWindow, app } from 'electron';
import path from 'path';
import fs from 'fs';
import ffprobe from 'ffprobe';
import { pathToFileURL } from 'url';
import { exec } from 'child_process';
import os from 'os';
import qualityRanges from '../constants/qualityRanges';
import { getPlatform } from './helpers';
import Store from 'electron-store';

const appPath = app.getAppPath();
const platform = getPlatform();

import type { T_LoadedFile } from '@/types';

export type T_VideoFormat =
	| 'mp4'
	| 'mkv'
	| 'avi'
	| 'webm'
	| 'mpg'
	| 'mpg'
	| 'wmv'
	| 'flv'
	| 'mov';

const formats: T_VideoFormat[] = [
	'mp4',
	'mkv',
	'avi',
	'webm',
	'mpg',
	'mpg',
	'wmv',
	'flv',
	'mov',
];

export interface I_ConvertVideoProps {
	filePath: string;
	format: T_VideoFormat;
	outputDir: string;
	quality?: number; // Universal quality from 1 (highest) to 100 (lowest)
	mainWindow?: BrowserWindow | null;
}

export interface I_ConvertVideoReturn {
	status: 'success' | 'error';
	message?: string;
	filePath?: string;
}

export function getFFmpegPath(): string {
	// In development, look for binaries in the project's bin directory
	if (process.env.NODE_ENV === 'development') {
		const platform = process.platform;
		const arch = process.arch;
		const ffmpegPath = path.join(
			process.cwd(),
			'bin',
			platform,
			arch,
			platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
		);

		if (!fs.existsSync(ffmpegPath)) {
			console.error('FFmpeg binary not found at:', ffmpegPath);
			throw new Error(`FFmpeg binary not found at: ${ffmpegPath}`);
		}

		return ffmpegPath;
	}

	// In production, look in the Resources directory
	const resourcePath = process.resourcesPath;

	const ffmpegPath = path.join(resourcePath, 'ffmpeg');

	if (!fs.existsSync(ffmpegPath)) {
		console.error('FFmpeg binary not found at:', ffmpegPath);
		throw new Error(`FFmpeg binary not found at: ${ffmpegPath}`);
	}

	return ffmpegPath;
}

export function getFFprobePath(): string {
	// In development, look for binaries in the project's bin directory
	if (process.env.NODE_ENV === 'development') {
		const platform = process.platform;
		const arch = process.arch;
		const ffprobePath = path.join(
			process.cwd(),
			'bin',
			platform,
			arch,
			platform === 'win32' ? 'ffprobe.exe' : 'ffprobe',
		);

		if (!fs.existsSync(ffprobePath)) {
			console.error('FFprobe binary not found at:', ffprobePath);
			throw new Error(`FFprobe binary not found at: ${ffprobePath}`);
		}

		return ffprobePath;
	}

	// In production, look in the Resources directory
	const resourcePath = process.resourcesPath;

	const ffprobePath = path.join(resourcePath, 'ffprobe');

	if (!fs.existsSync(ffprobePath)) {
		console.error('FFprobe binary not found at:', ffprobePath);
		throw new Error(`FFprobe binary not found at: ${ffprobePath}`);
	}

	return ffprobePath;
}

export const getVideoInfo = async (filePath: string) => {
	const ffprobePath = getFFprobePath();
	const info = await ffprobe(filePath, { path: ffprobePath });
	return info;
};

export const selectVideoFile = async () => {
	try {
		const result = await dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [
				{
					name: 'Videos',
					extensions: ['mkv', 'mp4', 'avi', 'webm', 'mpg', 'mpeg', 'mov'],
				},
			],
		});
		if (result) {
			if (!result.canceled) {
				const file = result.filePaths[0];
				const info = await getVideoInfo(file);

				const fileName = path.basename(file);
				const fileExt = path.extname(file);
				const url = pathToFileURL(file).href;
				const fileSize = fs.statSync(file).size;

				// Copy file to userDataPath
				const userDataPath = app.getPath('userData');
				const tempFileName = 'videoTemp';
				const userDataFilePath = path.join(
					userDataPath,
					`${tempFileName}.${fileExt}`,
				);
				fs.copyFileSync(file, userDataFilePath);

				const loadedFile: T_LoadedFile = {
					path: file,
					fileName,
					url,
					info,
					fileSize,
					tempFile: userDataFilePath,
				};

				return loadedFile;
			}
		}

		return null;
	} catch (err) {
		console.error(err);
	}

	return null;
};

export async function selectOutputDirectory() {
	try {
		const result = await dialog.showOpenDialog({
			properties: ['openDirectory'],
		});
		if (result) {
			if (!result.canceled) {
				const file = result.filePaths[0];
				return file;
			}
		}

		return null;
	} catch (err) {
		console.error(err);
	}

	return null;
}

const convertSuccess = (mainWindow: BrowserWindow | null, filePath: string) => {
	if (mainWindow) {
		mainWindow.webContents.send('convert-done', {
			status: 'success',
			filePath,
		});
	}
};

const convertError = (mainWindow: BrowserWindow | null, message = 'Unknown error') => {
	if (mainWindow) {
		mainWindow.webContents.send('convert-done', {
			status: 'error',
			message,
		});
	}
};

const makeFilePaths = (filePath: string, outputDir: string, format: string) => {
	const fileName = path.basename(filePath);
	const fileDir = path.dirname(filePath);
	const fileExt = path.extname(filePath);
	let fileBase = path.basename(filePath, fileExt);
	const newExt = `.${format}`;
	if (fileExt === newExt) fileBase += '_converted';
	const newFilePath = path.join(outputDir, `${fileBase}.${format}`);

	return {
		fileName,
		fileDir,
		fileExt,
		fileBase,
		newFilePath,
	};
};

function translateUniversalQualityToFormat(
	quality: number,
	format: T_VideoFormat,
): number {
	let min_value: number;
	let max_value: number;

	switch (format) {
		case 'mp4':
		case 'mkv':
			min_value = qualityRanges.crf[0];
			max_value = qualityRanges.crf[1];
			break;
		case 'webm':
			min_value = qualityRanges.webm[0];
			max_value = qualityRanges.webm[1];
			break;
		case 'mpg':
		case 'wmv':
		case 'flv':
			min_value = qualityRanges.bitrate[0];
			max_value = qualityRanges.bitrate[1];
			break;
		case 'avi':
			min_value = qualityRanges.qscale[0];
			max_value = qualityRanges.qscale[1];
			break;
		case 'mov':
			min_value = qualityRanges.crf[0];
			max_value = qualityRanges.crf[1];
			break;
		default:
			throw new Error('Unknown format');
	}

	if (format === 'wmv') {
		const translated_value =
			min_value + ((max_value - min_value) * (100 - quality)) / 99;
		return Math.round(translated_value);
	}

	// Linear interpolation
	const translated_value = min_value + ((max_value - min_value) * (quality - 1)) / 99;

	// Round the value to get an integer
	return Math.round(translated_value);
}

const getDiscardPath = () => {
	return os.platform() === 'win32' ? 'NUL' : '/dev/null';
};

const getProgressTempFilePath = () => {
	const userDataPath = app.getPath('userData');
	const ffmpegProgressFilePath = path.join(userDataPath, 'convert-progress.txt');

	return ffmpegProgressFilePath;
};

export const convertVideo = async (props: I_ConvertVideoProps) => {
	const { mainWindow = null, filePath, format, outputDir, quality = 1 } = props;
	const useFFmpeg = getFFmpegPath();
	const progressTempFilePath = getProgressTempFilePath();

	try {
		// Make sure format is in the list
		if (!formats.includes(format)) {
			throw new Error('Invalid format');
		}

		// Delete existing progress file
		try {
			await fs.promises.unlink(progressTempFilePath);
		} catch (err) {
			// Do nothing
		}

		const { newFilePath } = makeFilePaths(filePath, outputDir, format);
		const translatedQuality = translateUniversalQualityToFormat(quality, format);

		let command = '';

		switch (format) {
			case 'mp4':
			case 'mkv':
				command = `${useFFmpeg} -i "${filePath}" -c:v libx264 -crf ${translatedQuality} -progress "${progressTempFilePath}" -c:a aac -y "${newFilePath}"`;
				break;
			case 'webm':
				{
					// First pass
					const passLogfile = path.join(os.tmpdir(), 'ffmpeg2pass.log');
					const firstPassCmd = `${useFFmpeg} -i "${filePath}" -c:v libvpx -b:v 1M -crf ${translatedQuality} -pass 1 -an -f webm -y -progress "${progressTempFilePath}" -passlogfile "${passLogfile}" ${getDiscardPath()}`;

					exec(firstPassCmd, error => {
						if (error) {
							console.error(`exec error on first pass: ${error}`);
							convertError(mainWindow, error.message);
							return;
						}

						// Second pass
						const secondPassCmd = `${useFFmpeg} -i "${filePath}" -c:v libvpx -b:v 1M -crf ${translatedQuality} -pass 2 -c:a libvorbis -y -progress "${progressTempFilePath}" -passlogfile "${passLogfile}" "${newFilePath}"`;
						exec(secondPassCmd, error => {
							if (error) {
								console.error(`exec error on second pass: ${error}`);
								convertError(mainWindow, error.message);
								return;
							}
							convertSuccess(mainWindow, newFilePath);
						});
					});
				}
				break;
			case 'mpg':
			case 'avi':
				command = `${useFFmpeg} -i "${filePath}" -c:v mpeg4 -q:v ${translatedQuality} -progress "${progressTempFilePath}" -c:a mp3 -y "${newFilePath}"`;
				break;
			case 'wmv':
				command = `${useFFmpeg} -i "${filePath}" -c:v wmv2 -b:v ${translatedQuality}k -progress "${progressTempFilePath}" -c:a wmav2 -y "${newFilePath}"`;
				break;
			case 'flv':
				command = `${useFFmpeg} -i "${filePath}" -c:v flv -b:v ${translatedQuality}k -progress "${progressTempFilePath}" -c:a mp3 -y "${newFilePath}"`;
				break;
			case 'mov':
				command = `${useFFmpeg} -i "${filePath}" -c:v libx264 -crf ${translatedQuality} -progress "${progressTempFilePath}" -c:a aac -y "${newFilePath}"`;
				break;
			default:
				return null;
		}

		// Execute the command if it's not the 'webm' case
		if (command) {
			try {
				exec(command, error => {
					if (error) {
						console.error(`exec error: ${error}`);
						convertError(mainWindow, error.message);
						return;
					}
					convertSuccess(mainWindow, newFilePath);
				});
			} catch (err: unknown) {
				let message = 'Unknown error';
				if (err instanceof Error) {
					message = err.message;
				}
				console.error('conversion error', err);
				convertError(mainWindow, message);
			}
		}

		return newFilePath;
	} catch (err: unknown) {
		let message = 'Unknown error';
		if (err instanceof Error) {
			message = err.message;
		}
		console.error('conversion error', err);
		convertError(mainWindow, message);
	}
};

export interface I_MergeClipsProps {
	clipPaths: string[];
	outputDir: string;
	format: T_VideoFormat;
	mainWindow?: BrowserWindow | null;
}

export const mergeClips = async (props: I_MergeClipsProps): Promise<string | null> => {
	const { clipPaths, outputDir, format, mainWindow = null } = props;
	const useFFmpeg = getFFmpegPath();
	const progressTempFilePath = getProgressTempFilePath();

	try {
		// Log the FFmpeg path being used
		console.log(`Using FFmpeg at path: ${useFFmpeg}`);

		// Make sure format is in the list
		if (!formats.includes(format)) {
			throw new Error('Invalid format');
		}

		// Delete existing progress file
		try {
			await fs.promises.unlink(progressTempFilePath);
		} catch (err) {
			// Do nothing
		}

		// Save the progress file path to the store
		const store = new Store();
		(store as any).set('ffmpegProgressFilePath', progressTempFilePath);

		// Create a temporary file with the list of clips to merge
		const userDataPath = app.getPath('userData');
		const concatListPath = path.join(userDataPath, 'concat-list.txt');

		// Write the list of files to the concat file
		const fileList = clipPaths
			.map(filePath => `file '${filePath.replace(/'/g, "'\\''")}'`)
			.join('\n');
		await fs.promises.writeFile(concatListPath, fileList);

		// Log the concat list for debugging
		console.log(`Concat list written to: ${concatListPath}`);
		console.log(`Concat list contents: ${fileList}`);

		// Generate output file path
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const outputFileName = `merged_${timestamp}.${format}`;
		const outputFilePath = path.join(outputDir, outputFileName);

		console.log(`Output file path: ${outputFilePath}`);

		// Build the FFmpeg command for merging
		const command = `${useFFmpeg} -f concat -safe 0 -i "${concatListPath}" -c copy -progress "${progressTempFilePath}" -y "${outputFilePath}"`;
		console.log(`Executing FFmpeg command: ${command}`);

		// Execute the command with stdout/stderr capture
		return new Promise((resolve, reject) => {
			const process = exec(command, (error, stdout, stderr) => {
				// Clean up the temporary concat list file
				try {
					fs.unlinkSync(concatListPath);
				} catch (err) {
					// Ignore cleanup errors
				}

				if (error) {
					console.error(`Merge error: ${error}`);
					console.error(`FFmpeg stderr: ${stderr}`);
					console.error(`FFmpeg stdout: ${stdout}`);
					convertError(mainWindow, `FFmpeg error: ${error.message}\n${stderr}`);
					reject(error);
					return;
				}

				console.log(`FFmpeg stdout: ${stdout}`);
				if (stderr) {
					console.log(`FFmpeg stderr: ${stderr}`);
				}

				convertSuccess(mainWindow, outputFilePath);
				resolve(outputFilePath);
			});

			// Log process events
			process.on('error', err => {
				console.error(`Process error: ${err.message}`);
			});

			process.on('exit', (code, signal) => {
				console.log(
					`FFmpeg process exited with code ${code} and signal ${signal}`,
				);
			});
		});
	} catch (err: unknown) {
		let message = 'Unknown error';
		if (err instanceof Error) {
			message = err.message;
		}
		console.error('merge error', err);
		convertError(mainWindow, message);
		return null;
	}
};
