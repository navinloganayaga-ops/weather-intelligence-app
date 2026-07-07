/**
 * Types for Weather Intelligence App
 */

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code?: string;
  country?: string;
  admin1?: string; // State / Region
  timezone?: string;
}

export interface RawWeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export interface ProcessedWeatherData {
  city: {
    name: string;
    country: string;
    countryCode?: string;
    region?: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    description: string;
    time: string;
  };
  forecast: Array<{
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    description: string;
  }>;
}

export interface PlanningRecommendation {
  id: string;
  category: 'clothing' | 'activity' | 'protection' | 'alert';
  title: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'danger';
}
