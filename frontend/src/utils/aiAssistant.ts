import type { WeatherData } from '../services/weather';

const weatherCodeMap: Record<number, { vi: string; en: string; adviceVi: string; adviceEn: string }> = {
    0: { vi: 'Trời quang đãng', en: 'Clear sky', adviceVi: 'Thời tiết rất đẹp để đi dạo!', adviceEn: 'Great weather for a walk!' },
    1: { vi: 'Trời ít mây', en: 'Mainly clear', adviceVi: 'Nắng nhẹ, rất dễ chịu.', adviceEn: 'Sunny and pleasant.' },
    2: { vi: 'Có mây', en: 'Partly cloudy', adviceVi: 'Trời mát mẻ.', adviceEn: 'It feels cool.' },
    3: { vi: 'Nhiều mây', en: 'Overcast', adviceVi: 'Trời âm u, có thể mưa.', adviceEn: 'It looks gloomy, might rain.' },
    45: { vi: 'Sương mù', en: 'Foggy', adviceVi: 'Tầm nhìn hạn chế, hãy lái xe cẩn thận.', adviceEn: 'Low visibility, drive carefully.' },
    48: { vi: 'Sương muối', en: 'Depositing rime fog', adviceVi: 'Trời lạnh, hãy giữ ấm.', adviceEn: 'It is cold, keep warm.' },
    51: { vi: 'Mưa phùn nhẹ', en: 'Light drizzle', adviceVi: 'Có mưa nhỏ, bạn nên mang theo ô.', adviceEn: 'Light rain, bring an umbrella.' },
    53: { vi: 'Mưa phùn', en: 'Moderate drizzle', adviceVi: 'Đừng quên mang áo mưa nhé.', adviceEn: 'Don\'t forget your raincoat.' },
    55: { vi: 'Mưa phùn dày', en: 'Dense drizzle', adviceVi: 'Mưa khá dày, hãy cẩn thận khi ra ngoài.', adviceEn: 'Dense rain, be careful outside.' },
    61: { vi: 'Mưa nhẹ', en: 'Slight rain', adviceVi: 'Nhớ mang theo dù khi ra ngoài.', adviceEn: 'Remember your umbrella.' },
    63: { vi: 'Mưa trừa', en: 'Moderate rain', adviceVi: 'Mưa vừa, đường có thể trơn.', adviceEn: 'Moderate rain, roads might be slippery.' },
    65: { vi: 'Mưa to', en: 'Heavy rain', adviceVi: 'Mưa lớn, hạn chế ra ngoài nếu không cần thiết.', adviceEn: 'Heavy rain, stay inside if possible.' },
    71: { vi: 'Tuyết rơi nhẹ', en: 'Slight snow', adviceVi: 'Trời có tuyết, hãy mặc ấm.', adviceEn: 'It\'s snowing, dress warmly.' },
    80: { vi: 'Mưa rào', en: 'Rain showers', adviceVi: 'Cẩn thận những cơn mưa bất chợt.', adviceEn: 'Watch out for sudden showers.' },
    95: { vi: 'Dông', en: 'Thunderstorm', adviceVi: 'Có dông, hãy tìm nơi trú ẩn an toàn.', adviceEn: 'Thunderstorm, stay safe indoors.' },
};

function getGreeting(hour: number, lang: 'vi' | 'en'): string {
    if (hour < 12) return lang === 'vi' ? 'Chào buổi sáng' : 'Good morning';
    if (hour < 18) return lang === 'vi' ? 'Chào buổi chiều' : 'Good afternoon';
    return lang === 'vi' ? 'Chào buổi tối' : 'Good evening';
}

export function generateDailyBriefing(weather: WeatherData, lang: 'vi' | 'en' = 'vi'): string {
    const hour = new Date().getHours();
    const greeting = getGreeting(hour, lang);
    const info = weatherCodeMap[weather.weatherCode] || weatherCodeMap[0];
    const condition = lang === 'vi' ? info.vi : info.en;
    const advice = lang === 'vi' ? info.adviceVi : info.adviceEn;
    const temp = Math.round(weather.temperature);

    if (lang === 'vi') {
        return `${greeting}! Nhiệt độ hiện tại là ${temp} độ C. ${condition}. ${advice} Chúc bạn một ngày tốt lành!`;
    } else {
        return `${greeting}! Current temperature is ${temp} degrees Celsius. ${condition}. ${advice} Have a nice day!`;
    }
}

export interface MedicationStatus {
    name: string;
    dosage: string;
    time: string;
}

export function generateMedicationReport(medications: MedicationStatus[], lang: 'vi' | 'en'): string {
    if (medications.length === 0) {
        return lang === 'vi'
            ? 'Hôm nay bạn không có lịch uống thuốc nào.'
            : 'You have no medication scheduled for today.';
    }

    const list = medications.map(m => `${m.name} (${m.dosage}) ${lang === 'vi' ? 'lúc' : 'at'} ${m.time}`).join(', ');
    return lang === 'vi'
        ? `Hôm nay bạn cần uống: ${list}.`
        : `Today you need to take: ${list}.`;
}

export function processCommand(command: string, weather: WeatherData, medications: MedicationStatus[], lang: 'vi' | 'en' = 'vi'): string {
    const lowerCommand = command.toLowerCase();

    // Common misrecognitions for Vietnamese greetings
    const greetingPatterns = [
        'chào', 'hello', 'hi', 'tổng quan',
        'tower song', 'tau song', 'chao', // Common misrecognitions of "chào buổi sáng"
        'buổi sáng', 'buoi sang', 'sang'
    ];

    // Check for greeting/briefing keywords
    if (greetingPatterns.some(pattern => lowerCommand.includes(pattern))) {
        const briefing = generateDailyBriefing(weather, lang);
        const medReport = generateMedicationReport(medications, lang);
        return `${briefing}\n\n${medReport}`;
    }

    // Medication query patterns
    const medicationPatterns = [
        'thuốc', 'medicine', 'uống', 'thuoc', 'uong',
        'medication', 'pill', 'drug', 'take'
    ];
    if (medicationPatterns.some(pattern => lowerCommand.includes(pattern))) {
        return generateMedicationReport(medications, lang);
    }

    // Weather query patterns
    const weatherPatterns = [
        'thời tiết', 'weather', 'thoi tiet', 'nhiệt độ', 'nhiet do'
    ];
    if (weatherPatterns.some(pattern => lowerCommand.includes(pattern))) {
        return generateDailyBriefing(weather, lang);
    }

    // Polite responses
    if (lowerCommand.includes('cảm ơn') || lowerCommand.includes('thank') || lowerCommand.includes('cam on')) {
        return lang === 'vi' ? 'Không có gì! Chúc bạn sức khỏe.' : 'You are welcome! Stay healthy.';
    }

    return lang === 'vi'
        ? `Tôi đã nghe: "${command}". Bạn có thể hỏi về thời tiết hoặc lịch uống thuốc của mình.`
        : `I heard: "${command}". You can ask about the weather or your medication schedule.`;
}
