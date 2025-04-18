import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import * as os from 'os';
import path from 'path';
import fs from 'fs';

const buildVersion =
	String(new Date().getFullYear()) +
	String(new Date().getMonth()) +
	String(new Date().getDate()) +
	String(new Date().getHours()) +
	String(new Date().getMinutes()) +
	String(new Date().getSeconds()) +
	String(new Date().getMilliseconds());

const platform = os.platform();
const arch = os.arch();

// Determine the executable path based on platform and architecture
const getExecutablePaths = () => {
	const basePath = './bin';
	const isWindows = platform === 'win32';
	const executables = [
		path.join(basePath, platform, arch, isWindows ? 'ffmpeg.exe' : 'ffmpeg'),
		path.join(basePath, platform, arch, isWindows ? 'ffprobe.exe' : 'ffprobe'),
	];

	return executables;
};

const config: ForgeConfig = {
	packagerConfig: {
		asar: true,
		name: 'Spectravert',
		appVersion: '2.0.0',
		buildVersion,
		appBundleId: 'com.spectravert.app',
		appCategoryType: 'utility',
		appCopyright: `Copyright © ${new Date().getFullYear()} Jay Simons`,
		executableName: 'spectravert2',
		icon: path.join(
			__dirname,
			'assets',
			platform === 'win32' ? 'icon.ico' : 'icon.icns',
		),
		extraResource: getExecutablePaths(),
	},
	rebuildConfig: {},
	makers: [new MakerZIP({}, ['win32', 'darwin']), new MakerRpm({}), new MakerDeb({})],
	plugins: [
		new VitePlugin({
			// `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
			// If you are familiar with Vite configuration, it will look really familiar.
			build: [
				{
					// `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
					entry: 'src/main.ts',
					config: 'vite.main.config.ts',
					target: 'main',
				},
				{
					entry: 'src/preload.ts',
					config: 'vite.preload.config.ts',
					target: 'preload',
				},
			],
			renderer: [
				{
					name: 'main_window',
					config: 'vite.renderer.config.ts',
				},
			],
		}),
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};

export default config;
