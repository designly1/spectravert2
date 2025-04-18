import React, { useState, useEffect } from 'react';
import Container from '@/components/container';
import Button from '@/components/button';
import { useApp } from '@/context/app-provider';
import {
	List,
	ListItem,
	ListItemText,
	Paper,
	Box,
	IconButton,
	Typography,
	TextField,
} from '@mui/material';
import { BsGripVertical, BsTrash } from 'react-icons/bs';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DroppableProvided,
	DraggableProvided,
	DropResult,
} from 'react-beautiful-dnd';
import { T_VideoFormat } from '@/lib/ffmpeg';

interface VideoFile {
	id: string;
	name: string;
	path: string;
	format: string;
}

export default function MergeClipsScreen() {
	const { setScreen, openDialog, elec } = useApp();
	const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
	const [outputDir, setOutputDir] = useState<string>('');
	const [outputFileName, setOutputFileName] = useState<string>('merged_video');
	const [isMerging, setIsMerging] = useState<boolean>(false);

	// Load saved output directory from store when component mounts
	useEffect(() => {
		const loadSavedOutputDir = async () => {
			const savedDir = await elec.getStore('mergeOutputPath');
			if (savedDir) {
				setOutputDir(savedDir);
			}
		};

		loadSavedOutputDir();

		// Debug: Check if elec object is properly defined
		console.log('elec object:', elec);
		console.log('elec.mergeClips available:', typeof elec.mergeClips === 'function');
	}, [elec]);

	const getFileFormat = (filename: string): string => {
		return filename.split('.').pop()?.toLowerCase() || '';
	};

	const handleFileSelect = async () => {
		try {
			console.log('Selecting files...');
			const selectedFiles = await elec.selectFile('Select Video Files', true);
			console.log('Selected files:', selectedFiles);

			if (
				!selectedFiles ||
				(Array.isArray(selectedFiles) && selectedFiles.length === 0)
			) {
				console.log('No files selected');
				return;
			}

			const filePaths = Array.isArray(selectedFiles)
				? selectedFiles
				: [selectedFiles];
			console.log('File paths:', filePaths);

			// Check if we have valid file paths
			if (filePaths.some(path => !path)) {
				console.error('Some file paths are undefined or empty');
				openDialog({
					title: 'Error',
					message:
						'Some file paths are invalid. Please try selecting the files again.',
					confirmLabel: 'OK',
					hideCancel: true,
				});
				return;
			}

			const newFiles: VideoFile[] = filePaths.map((filePath: string) => {
				const name = filePath.split('/').pop() || filePath;
				const format = getFileFormat(filePath);
				console.log(
					`Processing file: ${name}, path: ${filePath}, format: ${format}`,
				);

				return {
					id: Math.random().toString(36).substring(2, 9),
					name,
					path: filePath,
					format,
				};
			});

			console.log('New files:', newFiles);

			// Check if all files have the same format
			const allFormats = [...videoFiles, ...newFiles].map(f => f.format);
			const uniqueFormats = new Set(allFormats);

			if (uniqueFormats.size > 1) {
				openDialog({
					title: 'Format Mismatch',
					message:
						'All video files must be in the same format. Please select files with matching formats.',
					confirmLabel: 'OK',
					hideCancel: true,
				});
				return;
			}

			setVideoFiles(prev => [...prev, ...newFiles]);
		} catch (error) {
			console.error('Error selecting files:', error);
			openDialog({
				title: 'Error',
				message: `Failed to select files: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
				confirmLabel: 'OK',
				hideCancel: true,
			});
		}
	};

	const handleOutputDirSelect = async () => {
		try {
			console.log('Selecting folder...');
			const selectedDir = await elec.selectFolder('Select Output Directory');
			console.log('Selected directory:', selectedDir);

			if (!elec?.selectFolder) {
				console.error('selectFolder function is not available');
				openDialog({
					title: 'Error',
					message: 'The folder selection feature is not available.',
					confirmLabel: 'OK',
					hideCancel: true,
				});
				return;
			}

			if (selectedDir) {
				console.log('Setting output directory:', selectedDir);
				setOutputDir(selectedDir);
				// Save the selected directory to the store
				await elec.setStore('mergeOutputPath', selectedDir);
				console.log('Directory saved to store');
			} else {
				console.log('No directory was selected');
			}
		} catch (error) {
			console.error('Error selecting directory:', error);
			openDialog({
				title: 'Error',
				message: `Failed to select output directory: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
				confirmLabel: 'OK',
				hideCancel: true,
			});
		}
	};

	const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setOutputFileName(event.target.value);
	};

	const handleRemoveFile = (fileId: string) => {
		setVideoFiles(prev => prev.filter(file => file.id !== fileId));
	};

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const items = Array.from(videoFiles);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setVideoFiles(items);
	};

	const handleMerge = async () => {
		console.log('Merge button clicked');

		if (videoFiles.length < 2) {
			console.log('Not enough files selected');
			openDialog({
				title: 'Not Enough Files',
				message: 'Please select at least 2 video files to merge.',
				confirmLabel: 'OK',
			});
			return;
		}

		if (!outputDir) {
			console.log('No output directory selected');
			openDialog({
				title: 'No Output Location',
				message: 'Please select an output directory for the merged video.',
				confirmLabel: 'OK',
			});
			return;
		}

		try {
			console.log('Starting merge process');
			console.log('Video files:', videoFiles);

			// Validate all files have paths
			const filesWithMissingPaths = videoFiles.filter(file => !file.path);
			if (filesWithMissingPaths.length > 0) {
				console.error('Files with missing paths:', filesWithMissingPaths);
				openDialog({
					title: 'Error',
					message: `Some files are missing paths. Please try selecting the files again.`,
					confirmLabel: 'OK',
					hideCancel: true,
				});
				return;
			}

			// Get the file paths from the video files
			const clipPaths = videoFiles.map(file => {
				console.log('File object:', file);
				return file.path;
			});
			console.log('Clip paths:', clipPaths);

			// Get the format from the first video file
			const format = getOutputFormat() as T_VideoFormat;
			console.log('Output format:', format);
			console.log('Output directory:', outputDir);

			// Set merging state
			setIsMerging(true);

			// Call the IPC merge function
			console.log('Calling elec.mergeClips');
			const result = await elec.mergeClips(clipPaths, outputDir, format);
			console.log('Merge result:', result);

			// Reset merging state
			setIsMerging(false);

			if (result) {
				openDialog({
					title: 'Merge Successful',
					message: `Videos merged successfully!\nOutput: ${result}`,
					confirmLabel: 'OK',
					hideCancel: true,
				});
			} else {
				openDialog({
					title: 'Merge Failed',
					message: 'Failed to merge videos. Please try again.',
					confirmLabel: 'OK',
					hideCancel: true,
				});
			}
		} catch (error) {
			// Reset merging state in case of error
			setIsMerging(false);

			console.error('Error merging videos:', error);
			openDialog({
				title: 'Error',
				message: `An error occurred while merging videos: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
				confirmLabel: 'OK',
				hideCancel: true,
			});
		}
	};

	// Get the format from the first video file if available
	const getOutputFormat = () => {
		if (videoFiles.length > 0) {
			return videoFiles[0].format;
		}
		return 'mp4'; // Default format
	};

	// Generate the full output path
	const getFullOutputPath = () => {
		if (!outputDir) return '';
		const format = getOutputFormat();
		return `${outputDir}/${outputFileName}.${format}`;
	};

	return (
		<Container>
			<div className="flex flex-col items-center gap-6">
				<div className="flex justify-between items-center w-full">
					<h1 className="font-bold text-2xl">Merge Clips</h1>
					<Button
						onClick={() => setScreen('main')}
						variant="muted"
					>
						Back
					</Button>
				</div>
				<div className="w-full max-w-2xl">
					<p className="mb-4 text-gray-100 text-center">
						Select the clips you want to merge together
					</p>

					<Box sx={{ mb: 3 }}>
						<Button
							variant="default"
							onClick={handleFileSelect}
						>
							Select Video Files
						</Button>
					</Box>

					<Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
						<Button
							variant="default"
							onClick={handleOutputDirSelect}
						>
							Select Output Directory
						</Button>
						{outputDir && (
							<Typography
								variant="body1"
								sx={{
									color: 'text.primary',
									backgroundColor: 'background.paper',
									padding: '8px 12px',
									borderRadius: 1,
									border: '1px solid',
									borderColor: 'divider',
									flex: 1,
									wordBreak: 'break-all',
								}}
							>
								{outputDir}
							</Typography>
						)}
					</Box>

					{videoFiles.length > 0 && (
						<Paper sx={{ bgcolor: 'background.paper', p: 2 }}>
							<DragDropContext onDragEnd={handleDragEnd}>
								<Droppable
									droppableId="video-list"
									isDropDisabled={false}
								>
									{(provided: DroppableProvided) => (
										<List
											{...provided.droppableProps}
											ref={provided.innerRef}
											sx={{
												display: 'flex',
												flexDirection: 'column',
												gap: 1,
											}}
										>
											{videoFiles.map((file, index) => (
												<Draggable
													key={file.id}
													draggableId={file.id}
													index={index}
												>
													{(provided: DraggableProvided) => (
														<ListItem
															ref={provided.innerRef}
															{...provided.draggableProps}
															sx={{
																border: '1px solid',
																borderColor: 'divider',
																borderRadius: 1,
																bgcolor:
																	'background.paper',
																display: 'flex',
																alignItems: 'center',
																width: '100%',
															}}
														>
															<IconButton
																{...provided.dragHandleProps}
																size="small"
															>
																<BsGripVertical />
															</IconButton>
															<ListItemText
																primary={file.name}
																sx={{ flex: 1 }}
															/>
															<IconButton
																size="small"
																onClick={() =>
																	handleRemoveFile(
																		file.id,
																	)
																}
																sx={{
																	color: 'error.main',
																}}
															>
																<BsTrash />
															</IconButton>
														</ListItem>
													)}
												</Draggable>
											))}
											{provided.placeholder}
										</List>
									)}
								</Droppable>
							</DragDropContext>
						</Paper>
					)}

					{videoFiles.length > 0 && (
						<Box
							sx={{
								mt: 3,
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
							}}
						>
							<Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'column',
										gap: 2,
									}}
								>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 2,
										}}
									>
										<Typography variant="body2">
											Output Filename:
										</Typography>
										<TextField
											size="small"
											value={outputFileName}
											onChange={handleFileNameChange}
											variant="outlined"
											sx={{ width: '200px' }}
										/>
										<Typography variant="body2">
											.{getOutputFormat()}
										</Typography>
									</Box>

									{outputDir && outputFileName && (
										<Typography
											variant="body2"
											sx={{ color: 'text.secondary' }}
										>
											Full path: {getFullOutputPath()}
										</Typography>
									)}
								</Box>
							</Paper>

							<Box
								sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}
							>
								<Button
									onClick={handleMerge}
									disabled={
										videoFiles.length < 2 || !outputDir || isMerging
									}
									variant="default"
								>
									{isMerging ? 'Merging...' : 'Merge Videos'}
								</Button>
								<Button
									onClick={() => {
										setVideoFiles([]);
										// Don't clear the output directory when clearing the list
									}}
									variant="destructive"
									disabled={isMerging}
								>
									Clear List
								</Button>
							</Box>
						</Box>
					)}
				</div>
			</div>
		</Container>
	);
}
