import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ApiStatus = 'connected' | 'disconnected' | 'error';

interface ApiStatusContextType {
    status: ApiStatus;
    errorMessage: string | null;
    setConnected: () => void;
    setDisconnected: (message?: string) => void;
    setError: (message: string) => void;
}

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(undefined);

interface ApiStatusProviderProps {
    children: ReactNode;
}

export function ApiStatusProvider({ children }: ApiStatusProviderProps) {
    const [status, setStatus] = useState<ApiStatus>('connected');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const setConnected = useCallback(() => {
        setStatus('connected');
        setErrorMessage(null);
    }, []);

    const setDisconnected = useCallback((message?: string) => {
        setStatus('disconnected');
        setErrorMessage(message || null);
    }, []);

    const setError = useCallback((message: string) => {
        setStatus('error');
        setErrorMessage(message);
    }, []);

    return (
        <ApiStatusContext.Provider value={{ status, errorMessage, setConnected, setDisconnected, setError }}>
            {children}
        </ApiStatusContext.Provider>
    );
}

export function useApiStatus() {
    const context = useContext(ApiStatusContext);
    if (context === undefined) {
        throw new Error('useApiStatus must be used within an ApiStatusProvider');
    }
    return context;
}

// Singleton for axios interceptor to access context
let apiStatusSetter: {
    setConnected: () => void;
    setDisconnected: (message?: string) => void;
    setError: (message: string) => void;
} | null = null;

export function registerApiStatusSetter(setter: typeof apiStatusSetter) {
    apiStatusSetter = setter;
}

export function getApiStatusSetter() {
    return apiStatusSetter;
}
