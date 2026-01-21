import { useState, useEffect } from 'react';
import { Mic, Volume2, Loader2, Square } from 'lucide-react';
import { getCurrentWeather } from '../services/weather';
import { processCommand, type MedicationStatus } from '../utils/aiAssistant';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

export function VoiceAssistant() {
    const { i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        const langCode = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
        const voice = voices.find(v => v.lang === langCode) || voices[0];

        utterance.voice = voice;
        utterance.lang = langCode;
        utterance.rate = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const handleActivate = async () => {
        if (isSpeaking) {
            stopSpeaking();
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            const msg = i18n.language === 'vi'
                ? 'Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.'
                : 'Your browser does not support speech recognition.';
            setMessage(msg);
            speak(msg);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsLoading(true);
            setMessage(i18n.language === 'vi' ? 'Đang nghe...' : 'Listening...');
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('Transcript:', transcript);

            // Process the transcript
            await handleCommand(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsLoading(false);
            if (event.error === 'not-allowed') {
                const msg = i18n.language === 'vi'
                    ? 'Vui lòng cấp quyền truy cập micro.'
                    : 'Please allow microphone access.';
                setMessage(msg);
                speak(msg);
            }
        };

        recognition.onend = () => {
            setIsLoading(false);
        };

        recognition.start();
    };

    const handleCommand = async (command: string) => {
        setIsLoading(true);
        try {
            // Fetch weather and medications in parallel
            const [weatherResult, medResult] = await new Promise<[any, any]>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const weather = await getCurrentWeather(latitude, longitude);
                            const meds = await api.get('/reminders/upcoming');
                            resolve([weather, meds.data]);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    (error) => reject(error)
                );
            });

            const medicationStatus: MedicationStatus[] = medResult.map((r: any) => ({
                name: r.medicine,
                dosage: r.dosage,
                time: r.time
            }));

            const responseText = processCommand(
                command,
                weatherResult,
                medicationStatus,
                i18n.language as 'vi' | 'en'
            );

            setMessage(`${i18n.language === 'vi' ? 'Bạn nói: ' : 'You said: '}"${command}"\n\n${responseText}`);
            speak(responseText);
        } catch (error) {
            console.error('Error in assistant:', error);
            const errorMsg = i18n.language === 'vi'
                ? 'Đã xảy ra lỗi khi xử lý yêu cầu.'
                : 'An error occurred while processing your request.';
            setMessage(errorMsg);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
            {message && (
                <div className="bg-white p-4 rounded-2xl shadow-xl max-w-xs mb-2 border border-blue-100 animate-in slide-in-from-bottom-2 fade-in whitespace-pre-wrap">
                    <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
                    <button
                        onClick={() => setMessage(null)}
                        className="mt-2 text-[10px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-wider"
                    >
                        {i18n.language === 'vi' ? 'Đóng' : 'Close'}
                    </button>
                </div>
            )}

            <button
                onClick={handleActivate}
                disabled={isLoading}
                className={`flex items-center space-x-2 px-5 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 relative ${isSpeaking
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                    }`}
            >
                {(isLoading || isSpeaking) && (
                    <>
                        <div className={`voice-ripple ${isSpeaking ? 'border-red-400' : 'border-blue-400'}`}></div>
                        <div className={`voice-ripple voice-ripple-delayed ${isSpeaking ? 'border-red-400' : 'border-blue-400'}`}></div>
                    </>
                )}
                <div className="relative z-10 flex items-center space-x-2">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isSpeaking ? (
                        <Square className="w-5 h-5 animate-pulse" />
                    ) : (
                        <Mic className="w-5 h-5" />
                    )}
                    <span>
                        {isLoading
                            ? (i18n.language === 'vi' ? 'Đang xử lý...' : 'Processing...')
                            : isSpeaking
                                ? (i18n.language === 'vi' ? 'Dừng nói' : 'Stop')
                                : (i18n.language === 'vi' ? 'Trợ lý ảo' : 'AI Assistant')
                        }
                    </span>
                </div>
            </button>
        </div>
    );
}
