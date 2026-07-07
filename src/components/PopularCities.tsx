import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ArrowRight, Loader2, Compass } from 'lucide-react';
import { mapWeatherCode } from '../utils/weatherMapper';

interface CityConfig {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
}

const POPULAR_CITIES: CityConfig[] = [
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522 },
  { name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.006 },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.076, lon: 72.8777 },
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.0444, lon: 31.2357 },
  { name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', lat: -22.9068, lon: -43.1729 },
  { name: 'Reykjavik', country: 'Iceland', countryCode: 'IS', lat: 64.1466, lon: -21.9426 },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198 },
  { name: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.2827, lon: -123.1207 },
  { name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.9249, lon: 18.4241 },
  { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.2921, lon: 36.8219 },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lon: 12.4964 },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lon: 55.2708 }
];

interface PopularCitiesProps {
  onSelectCity: (city: {
    name: string;
    country: string;
    countryCode?: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export default function PopularCities({ onSelectCity }: PopularCitiesProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100" id="explore-cities-container">
      <div className="flex items-center gap-3 mb-6" id="explore-cities-header">
        <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-sm" id="explore-cities-icon-container">
          <Compass className="w-6 h-6 animate-spin-slow" id="explore-cities-icon" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight font-display text-slate-950" id="explore-cities-title">
            Explore Global Climates
          </h2>
          <p className="text-xs text-slate-500 font-sans" id="explore-cities-subtitle">
            Lazy-loaded current temperatures and conditions of major cities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="explore-cities-grid">
        {POPULAR_CITIES.map((city, idx) => (
          <LazyCityCard
            key={`${city.name}-${city.countryCode}`}
            city={city}
            idx={idx}
            onSelect={onSelectCity}
          />
        ))}
      </div>
    </div>
  );
}

interface LazyCityCardProps {
  key?: string;
  city: CityConfig;
  idx: number;
  onSelect: PopularCitiesProps['onSelectCity'];
}

function LazyCityCard({ city, idx, onSelect }: LazyCityCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [weather, setWeather] = useState<{
    temp: number;
    code: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Only load once
          }
        });
      },
      {
        rootMargin: '100px', // Load weather slightly before entering the screen for smooth UX
        threshold: 0.01,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&timezone=auto`
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (data && data.current_weather) {
          setWeather({
            temp: data.current_weather.temperature,
            code: data.current_weather.weathercode,
          });
        } else {
          throw new Error();
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [isVisible, city.lat, city.lon]);

  const condition = weather ? mapWeatherCode(weather.code) : null;
  const WeatherIcon = condition ? condition.icon : null;

  const handleCardClick = () => {
    onSelect({
      name: city.name,
      country: city.country,
      countryCode: city.countryCode,
      latitude: city.lat,
      longitude: city.lon
    });
  };

  return (
    <div
      ref={cardRef}
      id={`city-card-${idx}`}
      onClick={handleCardClick}
      className="group cursor-pointer p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between"
    >
      <div className="flex items-center gap-3" id={`city-card-left-${idx}`}>
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors" id={`city-card-pin-box-${idx}`}>
          <MapPin className="w-5 h-5" id={`city-card-pin-${idx}`} />
        </div>
        <div id={`city-card-info-${idx}`}>
          <div className="flex items-center gap-1.5" id={`city-card-name-row-${idx}`}>
            <h3 className="font-semibold text-sm text-slate-800 tracking-tight font-sans" id={`city-card-name-${idx}`}>
              {city.name}
            </h3>
            <img
              src={`https://open-meteo.com/images/country-flags/${city.countryCode.toLowerCase()}.svg`}
              alt={city.country}
              className="w-4 h-3.5 object-cover rounded-sm shadow-xs"
              id={`city-card-flag-${idx}`}
              onError={(e) => {
                // If flag service is unavailable or code fails, hide flag
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-sans" id={`city-card-country-${idx}`}>
            {city.country}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5" id={`city-card-right-${idx}`}>
        {loading && (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" id={`city-card-spinner-${idx}`} />
        )}
        
        {error && (
          <span className="text-xs text-slate-400 font-sans" id={`city-card-err-${idx}`}>--</span>
        )}

        {!loading && !error && weather && condition && WeatherIcon && (
          <div className="flex items-center gap-2" id={`city-card-weather-${idx}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${condition.cardBgClass}`} id={`city-card-icon-box-${idx}`}>
              <WeatherIcon className={`w-4 h-4 ${condition.accentColorClass}`} id={`city-card-icon-${idx}`} />
            </div>
            <div className="text-right" id={`city-card-temp-box-${idx}`}>
              <div className="text-sm font-bold text-slate-800 font-mono leading-none" id={`city-card-temp-${idx}`}>
                {Math.round(weather.temp)}°C
              </div>
              <div className="text-[9px] text-slate-400 font-sans font-medium line-clamp-1 max-w-[70px] leading-tight" id={`city-card-desc-${idx}`}>
                {condition.description}
              </div>
            </div>
          </div>
        )}

        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" id={`city-card-arrow-${idx}`} />
      </div>
    </div>
  );
}
