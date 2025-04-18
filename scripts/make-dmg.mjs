import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const platform = os.platform();
const arch = os.arch();

const appName = 'Spectravert';
const projectRoot = path.join(__dirname, '..');
const appPath = path.join(
	projectRoot,
	'out',
	`${appName}-${platform}-${arch}/${appName}.app`,
);
const dmgOutputDir = path.join(projectRoot, 'dist');
const dmgOutputPath = path.join(dmgOutputDir, `${appName}-${platform}-${arch}.dmg`);
const volName = `${appName} Installer`;
const iconPath = path.join(projectRoot, 'assets', 'icon.icns');
const bgPath = path.join(projectRoot, 'assets', 'dmg-background.png');

// Ensure output directory exists
if (!fs.existsSync(dmgOutputDir)) {
	fs.mkdirSync(dmgOutputDir);
}

// Create a temporary directory to use as the source folder
const tempDir = path.join(os.tmpdir(), `${appName}-dmg-source`);
if (fs.existsSync(tempDir)) {
	fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir);

// Copy the app to the temporary directory
fs.cpSync(appPath, path.join(tempDir, `${appName}.app`), { recursive: true });

const command = [
	'create-dmg',
	`--volname "${volName}"`,
	`--volicon "${iconPath}"`,
	`--background "${bgPath}"`,
	'--window-pos 200 120',
	'--window-size 600 400',
	'--icon-size 100',
	`--icon "${appName}.app" 150 150`,
	'--app-drop-link 450 150',
	`"${dmgOutputPath}"`,
	`"${tempDir}"`,
].join(' ');

console.log('Running create-dmg...');
execSync(command, { stdio: 'inherit' });

// Clean up the temporary directory
fs.rmSync(tempDir, { recursive: true, force: true });
