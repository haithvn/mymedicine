import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useApiStatus } from '../context/ApiStatusContext';
import { api } from '../services/api';

const AUTO_RETRY_INTERVAL = 5000; // 5 seconds

export function ApiStatusBanner() {
    const { t } = useTranslation();
    const { status, errorMessage, setConnected, setDisconnected } = useApiStatus();
    const [isRetrying, setIsRetrying] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const handleRetry = useCallback(async () => {
        setIsRetrying(true);
        try {
            // Try to ping the API
            await api.get('/health');
            setConnected();
        } catch {
            setDisconnected();
        } finally {
            setIsRetrying(false);
            setCountdown(5);
        }
    }, [setConnected, setDisconnected]);

    // Auto-retry every 5 seconds when disconnected
    useEffect(() => {
        if (status === 'connected') return;

        // Countdown timer
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => (prev > 1 ? prev - 1 : 5));
        }, 1000);

        // Auto-retry timer
        const retryInterval = setInterval(() => {
            handleRetry();
        }, AUTO_RETRY_INTERVAL);

        return () => {
            clearInterval(countdownInterval);
            clearInterval(retryInterval);
        };
    }, [status, handleRetry]);

    if (status === 'connected') return null;

    return (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl shadow-lg border border-orange-400/20 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                        <WifiOff className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base leading-tight">{t('api_error.title')}</h3>
                        <p className="text-sm text-orange-100 mt-0.5">
                            {errorMessage || t('api_error.message')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-orange-200">
                        {t('api_error.auto_retry', { seconds: countdown })}
                    </span>
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="flex items-center space-x-2 bg-white text-orange-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-md disabled:opacity-70"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>{t('api_error.retry')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
