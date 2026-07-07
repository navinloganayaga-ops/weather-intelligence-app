/**
 * Weather Mapper Utility for WMO Weather Codes
 */

import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Snowflake,
  LucideIcon
} from 'lucide-react';

export interface WeatherCondition {
  description: string;
  icon: LucideIcon;
  gradientClass: string; // Background gradient for main weather view
  cardBgClass: string;   // Card background color
  accentColorClass: string; // Tailored color (e.g. text-amber-500)
}

const weatherMap: Record<number, WeatherCondition> = {
  0: {
    description: 'Clear Sky',
    icon: Sun,
    gradientClass: 'from-amber-400 via-orange-400 to-amber-500 text-white',
    cardBgClass: 'bg-gradient-to-br from-amber-50 to-orange-100 text-orange-950 border-amber-200',
    accentColorClass: 'text-amber-600'
  },
  1: {
    description: 'Mainly Clear',
    icon: CloudSun,
    gradientClass: 'from-amber-300 via-sky-400 to-sky-500 text-white',
    cardBgClass: 'bg-gradient-to-br from-amber-50/50 to-sky-100/50 text-sky-950 border-sky-200',
    accentColorClass: 'text-amber-500'
  },
  2: {
    description: 'Partly Cloudy',
    icon: CloudSun,
    gradientClass: 'from-sky-400 via-blue-400 to-slate-400 text-white',
    cardBgClass: 'bg-gradient-to-br from-sky-50 to-slate-100 text-slate-900 border-slate-200',
    accentColorClass: 'text-blue-500'
  },
  3: {
    description: 'Overcast',
    icon: Cloud,
    gradientClass: 'from-slate-400 via-slate-500 to-slate-600 text-white',
    cardBgClass: 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900 border-slate-300',
    accentColorClass: 'text-slate-600'
  },
  45: {
    description: 'Foggy',
    icon: CloudFog,
    gradientClass: 'from-zinc-300 via-slate-400 to-slate-500 text-white',
    cardBgClass: 'bg-gradient-to-br from-zinc-50 to-slate-200 text-slate-900 border-slate-200',
    accentColorClass: 'text-zinc-600'
  },
  48: {
    description: 'Depositing Rime Fog',
    icon: CloudFog,
    gradientClass: 'from-teal-200 via-slate-400 to-slate-500 text-slate-900',
    cardBgClass: 'bg-gradient-to-br from-teal-50 to-slate-150 text-slate-900 border-teal-200',
    accentColorClass: 'text-teal-600'
  },
  51: {
    description: 'Light Drizzle',
    icon: CloudDrizzle,
    gradientClass: 'from-sky-300 via-blue-400 to-indigo-400 text-white',
    cardBgClass: 'bg-gradient-to-br from-sky-50 to-blue-100 text-blue-950 border-sky-200',
    accentColorClass: 'text-sky-500'
  },
  53: {
    description: 'Moderate Drizzle',
    icon: CloudDrizzle,
    gradientClass: 'from-sky-400 via-indigo-400 to-indigo-500 text-white',
    cardBgClass: 'bg-gradient-to-br from-sky-50 to-indigo-100 text-indigo-950 border-indigo-200',
    accentColorClass: 'text-indigo-500'
  },
  55: {
    description: 'Dense Drizzle',
    icon: CloudDrizzle,
    gradientClass: 'from-blue-400 via-indigo-500 to-indigo-600 text-white',
    cardBgClass: 'bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-950 border-indigo-300',
    accentColorClass: 'text-indigo-600'
  },
  56: {
    description: 'Light Freezing Drizzle',
    icon: CloudSnow,
    gradientClass: 'from-blue-200 via-sky-300 to-blue-400 text-slate-900',
    cardBgClass: 'bg-gradient-to-br from-blue-50 to-sky-100 text-slate-900 border-blue-200',
    accentColorClass: 'text-blue-500'
  },
  57: {
    description: 'Dense Freezing Drizzle',
    icon: CloudSnow,
    gradientClass: 'from-blue-300 via-sky-400 to-blue-500 text-white',
    cardBgClass: 'bg-gradient-to-br from-blue-100 to-sky-200 text-sky-950 border-blue-300',
    accentColorClass: 'text-blue-600'
  },
  61: {
    description: 'Slight Rain',
    icon: CloudRain,
    gradientClass: 'from-sky-400 via-blue-500 to-indigo-500 text-white',
    cardBgClass: 'bg-gradient-to-br from-sky-50 to-blue-100 text-blue-950 border-sky-300',
    accentColorClass: 'text-sky-600'
  },
  63: {
    description: 'Moderate Rain',
    icon: CloudRain,
    gradientClass: 'from-blue-400 via-blue-500 to-indigo-600 text-white',
    cardBgClass: 'bg-gradient-to-br from-blue-50 to-indigo-150 text-indigo-950 border-blue-300',
    accentColorClass: 'text-blue-600'
  },
  65: {
    description: 'Heavy Rain',
    icon: CloudRain,
    gradientClass: 'from-blue-500 via-indigo-600 to-slate-700 text-white',
    cardBgClass: 'bg-gradient-to-br from-blue-100 to-indigo-100 text-indigo-950 border-indigo-400',
    accentColorClass: 'text-indigo-700'
  },
  66: {
    description: 'Light Freezing Rain',
    icon: CloudSnow,
    gradientClass: 'from-sky-300 via-indigo-400 to-cyan-500 text-white',
    cardBgClass: 'bg-gradient-to-br from-sky-50 to-cyan-100 text-cyan-950 border-sky-300',
    accentColorClass: 'text-cyan-600'
  },
  67: {
    description: 'Heavy Freezing Rain',
    icon: CloudSnow,
    gradientClass: 'from-blue-400 via-cyan-500 to-indigo-600 text-white',
    cardBgClass: 'bg-gradient-to-br from-blue-100 to-cyan-100 text-indigo-950 border-blue-400',
    accentColorClass: 'text-indigo-600'
  },
  71: {
    description: 'Slight Snowfall',
    icon: Snowflake,
    gradientClass: 'from-sky-200 via-blue-300 to-slate-400 text-slate-800',
    cardBgClass: 'bg-gradient-to-br from-sky-50 to-blue-50 text-blue-950 border-sky-200',
    accentColorClass: 'text-sky-500'
  },
  73: {
    description: 'Moderate Snowfall',
    icon: Snowflake,
    gradientClass: 'from-sky-100 via-blue-200 to-slate-300 text-slate-900',
    cardBgClass: 'bg-gradient-to-br from-slate-50 to-blue-100 text-slate-900 border-blue-200',
    accentColorClass: 'text-blue-400'
  },
  75: {
    description: 'Heavy Snowfall',
    icon: Snowflake,
    gradientClass: 'from-white via-slate-200 to-slate-400 text-slate-900 border border-slate-300',
    cardBgClass: 'bg-white text-slate-950 border-slate-300',
    accentColorClass: 'text-slate-500'
  },
  77: {
    description: 'Snow Grains',
    icon: Snowflake,
    gradientClass: 'from-slate-200 via-slate-300 to-blue-200 text-slate-900',
    cardBgClass: 'bg-gradient-to-br from-slate-100 to-blue-50 text-slate-900 border-slate-200',
    accentColorClass: 'text-slate-400'
  },
  80: {
    description: 'Slight Rain Showers',
    icon: CloudRain,
    gradientClass: 'from-sky-400 via-blue-500 to-indigo-400 text-white',
    cardBgClass: 'bg-gradient-to-br from-sky-50 to-blue-100 text-blue-950 border-blue-200',
    accentColorClass: 'text-blue-500'
  },
  81: {
    description: 'Moderate Rain Showers',
    icon: CloudRain,
    gradientClass: 'from-blue-400 via-indigo-500 to-indigo-600 text-white',
    cardBgClass: 'bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-950 border-indigo-200',
    accentColorClass: 'text-indigo-500'
  },
  82: {
    description: 'Violent Rain Showers',
    icon: CloudRain,
    gradientClass: 'from-indigo-600 via-indigo-800 to-slate-800 text-white',
    cardBgClass: 'bg-gradient-to-br from-indigo-100 to-slate-200 text-indigo-950 border-indigo-400',
    accentColorClass: 'text-indigo-800'
  },
  85: {
    description: 'Slight Snow Showers',
    icon: CloudSnow,
    gradientClass: 'from-sky-200 via-blue-300 to-slate-400 text-slate-800',
    cardBgClass: 'bg-gradient-to-br from-sky-50 to-blue-50/50 text-slate-900 border-blue-200',
    accentColorClass: 'text-blue-400'
  },
  86: {
    description: 'Heavy Snow Showers',
    icon: CloudSnow,
    gradientClass: 'from-slate-100 via-slate-200 to-slate-400 text-slate-900',
    cardBgClass: 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-950 border-slate-300',
    accentColorClass: 'text-slate-600'
  },
  95: {
    description: 'Thunderstorm',
    icon: CloudLightning,
    gradientClass: 'from-slate-700 via-indigo-900 to-slate-900 text-white',
    cardBgClass: 'bg-gradient-to-br from-slate-800 to-indigo-950 text-slate-100 border-indigo-900',
    accentColorClass: 'text-amber-400'
  },
  96: {
    description: 'Thunderstorm with Slight Hail',
    icon: CloudLightning,
    gradientClass: 'from-slate-800 via-indigo-950 to-purple-950 text-white',
    cardBgClass: 'bg-gradient-to-br from-slate-900 to-indigo-950 text-slate-100 border-purple-900',
    accentColorClass: 'text-amber-400'
  },
  99: {
    description: 'Thunderstorm with Heavy Hail',
    icon: CloudLightning,
    gradientClass: 'from-slate-950 via-purple-950 to-black text-white border-b border-indigo-900',
    cardBgClass: 'bg-gradient-to-br from-purple-950 to-slate-950 text-slate-100 border-indigo-800',
    accentColorClass: 'text-red-400'
  }
};

const defaultCondition: WeatherCondition = {
  description: 'Unknown Conditions',
  icon: Cloud,
  gradientClass: 'from-slate-400 via-slate-500 to-slate-600 text-white',
  cardBgClass: 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900 border-slate-200',
  accentColorClass: 'text-slate-500'
};

export function mapWeatherCode(code: number): WeatherCondition {
  return weatherMap[code] || defaultCondition;
}
