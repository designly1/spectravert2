import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react';
import Loading from '@/components/loading';
import Splash from '@/layout/splash';
import Dialog from '@/components/dialog';

import { ToastContainer, toast } from 'react-toastify';

type Screen = 'main' | 'merge-clips' | 'convert-format';

export interface DialogProps {
	title: string;
	message: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
	hideCancel?: boolean;
}

interface AppContextType {
	screen: Screen;
	setScreen: React.Dispatch<React.SetStateAction<Screen>>;
	error: string | null;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
	dialog: DialogProps | null;
	openDialog: (dialogProps: DialogProps) => void;
	closeDialog: () => void;
	elec: typeof window.electronAPI;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [screen, setScreen] = useState<Screen>('main');
	const [error, setError] = useState<string | null>(null);
	const [dialog, setDialog] = useState<DialogProps | null>(null);
	const [showSplash, setShowSplash] = useState(true);

	const elec = window.electronAPI;

	useEffect(() => {
		setError(null);
	}, [screen]);

	useEffect(() => {
		setTimeout(() => {
			setShowSplash(false);
		}, 1000);
	}, []);

	const openDialog = (dialogProps: DialogProps) => {
		setDialog(dialogProps);
	};

	const closeDialog = () => {
		setDialog(null);
	};

	return (
		<AppContext.Provider
			value={{
				screen,
				setScreen,
				error,
				setError,
				elec,
				dialog,
				openDialog,
				closeDialog,
			}}
		>
			<>
				{children}
				<ToastContainer
					position="bottom-right"
					theme="dark"
					closeOnClick
				/>
				<Loading />
				<Splash show={showSplash} />
				{dialog && <Dialog />}
			</>
		</AppContext.Provider>
	);
};

export function useApp() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useApp must be used within an AppProvider');
	}
	return context;
}
