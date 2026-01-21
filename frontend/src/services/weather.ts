import axios from 'axios';

export interface WeatherData {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    isDay: number;
}

export type { WeatherData };

export const getCurrentWeather = async (lat: number, lon: number): Promise<WeatherData> => {
    try {
        const response = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const current = response.data.current_weather;
        return {
            temperature: current.temperature,
            weatherCode: current.weathercode,
            windSpeed: current.windspeed,
            isDay: current.is_day,
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};
