// InstallAppBanner - Redesigned to match mobile app style (2026-01-21)
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function InstallAppBanner() {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Detect if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

        // Check if user dismissed it in this session
        const isDismissed = sessionStorage.getItem('installBannerDismissed');

        if (isMobile && !isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const dismissBanner = () => {
        setIsVisible(false);
        sessionStorage.setItem('installBannerDismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-lg border border-blue-400/20 mb-6 relative animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Close button - top right */}
            <button
                onClick={dismissBanner}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="flex items-center space-x-3 pr-8">
                <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                    <Download className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-base leading-tight">{t('install_app.title')}</h3>
                    <p className="text-sm text-blue-100 mt-0.5">{t('install_app.description')}</p>
                </div>
            </div>

            {/* Download button - bottom full width */}
            <a
                href="https://expo.dev/artifacts/eas/nzqs47ULbAQN7Ghmk9xjuG.apk"
                className="flex items-center justify-center space-x-2 bg-white text-blue-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors mt-3 w-full shadow-md"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span>{t('install_app.download_button')}</span>
            </a>
        </div>
    );
}
