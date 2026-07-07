import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  X,
  Loader2,
  Wind,
  Navigation,
  ArrowUpRight,
  History,
  Sparkles,
  Thermometer,
  CloudSun
} from 'lucide-react';

import { GeocodingResult, ProcessedWeatherData, PlanningRecommendation } from './types';
import { mapWeatherCode } from './utils/weatherMapper';
import { generateRecommendations } from './utils/recommendationEngine';
import ForecastCard from './components/ForecastCard';
import PlanningCard from './components/PlanningCard';
import PopularCities from './components/PopularCities';

export default function App() {
  // Search & Autocomplete State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const selectInProgress = useRef(false);

  // Core Weather App States
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<PlanningRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recent Searches State
  const [recentSearches, setRecentSearches] = useState<Array<{
    name: string;
    country: string;
    countryCode?: string;
    latitude: number;
    longitude: number;
  }>>([]);

  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    // Default to London, United Kingdom on initial load
    fetchWeatherDataByCoords(51.5074, -0.1278, 'London', 'United Kingdom', 'GB', 'England');

    // Load recent searches from localStorage
    try {
      const stored = localStorage.getItem('weather_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Click outside to dismiss autocomplete suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced geocoding search for autocomplete suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setWithShowSuggestions(false);
      return;
    }

    if (selectInProgress.current) {
      selectInProgress.current = false;
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSuggestionLoading(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data && data.results) {
          setSuggestions(data.results);
          setWithShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionLoading(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Safe setter to avoid showing empty results boxes
  const setWithShowSuggestions = (show: boolean) => {
    setShowSuggestions(show && (suggestions.length > 0 || suggestionLoading));
  };

  // Main weather fetch core
  const fetchWeatherDataByCoords = async (
    lat: number,
    lon: number,
    cityName: string,
    countryName: string,
    countryCode?: string,
    regionName?: string
  ) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      if (!response.ok) {
        throw new Error('Weather service could not retrieve current forecast data.');
      }

      const data = await response.json();

      if (!data || !data.current_weather || !data.daily) {
        throw new Error('Incomplete data received from the weather service.');
      }

      const current = data.current_weather;
      const daily = data.daily;

      // Process forecast arrays
      const forecastList = daily.time.map((timeStr: string, idx: number) => ({
        date: timeStr,
        weatherCode: daily.weathercode[idx],
        tempMax: daily.temperature_2m_max[idx],
        tempMin: daily.temperature_2m_min[idx],
        description: mapWeatherCode(daily.weathercode[idx]).description
      }));

      const mappedCondition = mapWeatherCode(current.weathercode);

      const processed: ProcessedWeatherData = {
        city: {
          name: cityName,
          country: countryName,
          countryCode: countryCode,
          region: regionName,
          latitude: lat,
          longitude: lon
        },
        current: {
          temperature: current.temperature,
          windSpeed: current.windspeed,
          windDirection: current.winddirection,
          weatherCode: current.weathercode,
          description: mappedCondition.description,
          time: current.time
        },
        forecast: forecastList
      };

      setWeatherData(processed);

      // Generate smart planning recommendations
      const recs = generateRecommendations(
        current.weathercode,
        current.temperature,
        daily.temperature_2m_max[0],
        daily.temperature_2m_min[0],
        current.windspeed
      );
      setRecommendations(recs);

      // Manage Recent Searches list
      updateRecentSearches({
        name: cityName,
        country: countryName,
        countryCode: countryCode,
        latitude: lat,
        longitude: lon
      });

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while loading weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add search to list of recents (limit to 5)
  const updateRecentSearches = (newCity: {
    name: string;
    country: string;
    countryCode?: string;
    latitude: number;
    longitude: number;
  }) => {
    setRecentSearches((prev) => {
      // Filter out duplicate entries
      const filtered = prev.filter(
        (c) => !(c.name.toLowerCase() === newCity.name.toLowerCase() && c.country === newCity.country)
      );
      const updated = [newCity, ...filtered].slice(0, 5);
      
      try {
        localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
      } catch {
        // Ignore storage constraints
      }
      return updated;
    });
  };

  // Manual Trigger for input field lookup
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setShowSuggestions(false);

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      );
      if (!res.ok) throw new Error('Geocoding service unavailable.');
      
      const data = await res.json();
      if (!data || !data.results || data.results.length === 0) {
        throw new Error(`Could not find a city named "${query}". Please check spelling and try again.`);
      }

      const match = data.results[0];
      selectInProgress.current = true;
      setQuery(match.name);
      await fetchWeatherDataByCoords(
        match.latitude,
        match.longitude,
        match.name,
        match.country || '',
        match.country_code,
        match.admin1
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'City geocoding search failed.');
      setLoading(false);
    }
  };

  // Clicking an Autocomplete suggestion card
  const handleSelectSuggestion = (city: GeocodingResult) => {
    selectInProgress.current = true;
    setQuery(city.name);
    setShowSuggestions(false);
    fetchWeatherDataByCoords(
      city.latitude,
      city.longitude,
      city.name,
      city.country || '',
      city.country_code,
      city.admin1
    );
  };

  // Geolocation button
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setShowSuggestions(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Labeling as "Current Location" but fetching coordinates directly
          await fetchWeatherDataByCoords(
            latitude,
            longitude,
            'Your Location',
            'Local Coordinates',
            undefined,
            `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`
          );
        } catch (err) {
          setErrorMsg('Failed to fetch weather for your exact device coordinates.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        let msg = 'Location permission denied. Please search for a city manually.';
        if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable. Please search manually.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try searching manually.';
        }
        setErrorMsg(msg);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Formatter for wind direction degrees
  const getWindDirectionText = (degrees: number) => {
    const directions = ['North (N)', 'North-East (NE)', 'East (E)', 'South-East (SE)', 'South (S)', 'South-West (SW)', 'West (W)', 'North-West (NW)'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Scrolling screen to top smoothly
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Popular city selection handler
  const handleSelectPopularCity = (city: {
    name: string;
    country: string;
    countryCode?: string;
    latitude: number;
    longitude: number;
  }) => {
    selectInProgress.current = true;
    setQuery(city.name);
    fetchWeatherDataByCoords(
      city.latitude,
      city.longitude,
      city.name,
      city.country,
      city.countryCode,
      undefined
    );
    scrollToTop();
  };

  const activeCondition = weatherData ? mapWeatherCode(weatherData.current.weatherCode) : null;
  const ActiveIcon = activeCondition ? activeCondition.icon : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans text-slate-900" id="main-root-container">
      
      {/* Sleek Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" id="header-wrapper">
          <div className="flex items-center gap-2" id="header-logo-section">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200" id="header-icon-box">
              <CloudSun className="w-5 h-5" id="header-logo-icon" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight font-display text-slate-900 leading-none" id="header-app-title">
                Weather Intelligence
              </h1>
              <span className="text-[10px] text-slate-400 font-medium font-sans mt-0.5 block" id="header-app-tagline">
                Responsive Client-Side Weather Planning
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-slate-500 text-xs font-medium font-mono shadow-xs" id="header-time-badge">
            <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse" id="header-clock-icon" />
            <span id="header-clock-text">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6" id="app-main-content">
        
        {/* Search and Input Toolbar Section */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4" id="search-container-box">
          <div className="relative flex-1" ref={autocompleteRef} id="search-input-ref-box">
            <form onSubmit={handleSearchSubmit} className="flex gap-2" id="search-form">
              <div className="relative flex-1" id="search-input-wrapper">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" id="search-lens-icon" />
                <input
                  type="text"
                  placeholder="Enter city name... (e.g. New York, Tokyo)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(suggestions.length > 0 || suggestionLoading)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none transition-all duration-200 text-sm font-medium font-sans"
                  id="search-text-input"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSuggestions([]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    id="search-clear-button"
                  >
                    <X className="w-4 h-4" id="search-clear-icon" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-2xl shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                id="search-submit-button"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" id="submit-spinner" />
                ) : (
                  <Search className="w-4 h-4" id="submit-lens" />
                )}
                <span>Search</span>
              </button>
            </form>

            {/* Autocomplete Suggestion Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-150 shadow-xl z-50 overflow-hidden divide-y divide-slate-50" id="autocomplete-dropdown">
                {suggestionLoading && (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2" id="autocomplete-loading-box">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" id="autocomplete-spinner" />
                    <span>Querying matching cities...</span>
                  </div>
                )}
                
                {!suggestionLoading && suggestions.map((city) => (
                  <div
                    key={city.id}
                    id={`autocomplete-item-${city.id}`}
                    onClick={() => handleSelectSuggestion(city)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5" id={`suggestion-left-${city.id}`}>
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" id={`suggestion-pin-${city.id}`} />
                      <div>
                        <span className="font-semibold text-sm text-slate-800 font-sans" id={`suggestion-city-name-${city.id}`}>
                          {city.name}
                        </span>
                        {city.admin1 && (
                          <span className="text-xs text-slate-400 font-sans ml-1.5" id={`suggestion-city-region-${city.id}`}>
                            ({city.admin1})
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium font-sans block" id={`suggestion-city-country-${city.id}`}>
                          {city.country}
                        </span>
                      </div>
                    </div>
                    {city.country_code && (
                      <img
                        src={`https://open-meteo.com/images/country-flags/${city.country_code.toLowerCase()}.svg`}
                        alt={city.country}
                        className="w-5 h-4 object-cover rounded-xs border border-slate-100 shadow-xs"
                        id={`suggestion-city-flag-${city.id}`}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick GPS Geolocation Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-2xl transition-all cursor-pointer focus:outline-none"
            id="gps-location-button"
          >
            <Navigation className="w-4 h-4 text-indigo-600 rotate-45" id="gps-icon" />
            <span>Use Device Location</span>
          </button>
        </div>

        {/* User-friendly Error Alert Banner inside UI */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 shadow-xs animate-fadeIn" id="error-banner">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" id="error-banner-icon" />
            <div className="flex-1" id="error-banner-text-box">
              <h4 className="font-bold text-sm text-red-900 font-sans" id="error-banner-title">
                Weather Lookup Unsuccessful
              </h4>
              <p className="text-xs text-red-700 font-sans mt-0.5 leading-relaxed" id="error-banner-desc">
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100/50"
              id="error-banner-dismiss"
            >
              <X className="w-4.5 h-4.5" id="error-dismiss-icon" />
            </button>
          </div>
        )}

        {/* Main Weather Dashboard Grid Layout */}
        {loading ? (
          <SkeletonDashboard />
        ) : (
          weatherData && activeCondition && ActiveIcon && (
            <div className="space-y-6" id="weather-dashboard-active">
              
              {/* Top Row: Current Weather & Metrics + Recent searches */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-top-row">
                
                {/* 1. Hero Current Weather Card (col-span-2) */}
                <div 
                  className={`lg:col-span-2 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden bg-gradient-to-br ${activeCondition.gradientClass} shadow-xl border border-white/10`} 
                  id="hero-weather-card"
                >
                  {/* Atmospheric soft decorative background circles */}
                  <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-black/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative flex flex-col justify-between h-full space-y-8 z-10" id="hero-card-layout">
                    
                    {/* Header: Location & Country */}
                    <div className="flex items-start justify-between" id="hero-card-header">
                      <div id="hero-location-text">
                        <div className="flex items-center gap-2" id="hero-city-row">
                          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display" id="hero-city-name">
                            {weatherData.city.name}
                          </h2>
                          {weatherData.city.countryCode && (
                            <img
                              src={`https://open-meteo.com/images/country-flags/${weatherData.city.countryCode.toLowerCase()}.svg`}
                              alt={weatherData.city.country}
                              className="w-7 h-5 object-cover rounded shadow-md mt-1 border border-white/20"
                              id="hero-flag"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <p className="text-sm text-white/80 font-semibold font-sans mt-0.5" id="hero-region">
                          {weatherData.city.region ? `${weatherData.city.region}, ` : ''}
                          {weatherData.city.country}
                        </p>
                      </div>

                      {/* Current Climate Icon */}
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20" id="hero-icon-box">
                        <ActiveIcon className="w-10 h-10 text-white" id="hero-weather-icon" />
                      </div>
                    </div>

                    {/* Middle: Temperatures & Description */}
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4" id="hero-middle-stats">
                      <div id="hero-temps">
                        <div className="flex items-start" id="hero-degrees-box">
                          <span className="text-6xl md:text-8xl font-black tracking-tighter font-mono" id="hero-current-temp">
                            {Math.round(weatherData.current.temperature)}
                          </span>
                          <span className="text-3xl md:text-5xl font-bold font-sans mt-2" id="hero-degree-symbol">°C</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-sm font-semibold font-sans text-white/90" id="hero-high-low">
                          <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1" id="hero-high-temp">
                            High: {Math.round(weatherData.forecast[0].tempMax)}°C
                          </span>
                          <span className="bg-black/10 px-2.5 py-1 rounded-lg border border-black/5 flex items-center gap-1" id="hero-low-temp">
                            Low: {Math.round(weatherData.forecast[0].tempMin)}°C
                          </span>
                        </div>
                      </div>

                      <div className="text-left md:text-right" id="hero-desc-box">
                        <span className="text-lg md:text-2xl font-bold tracking-tight block uppercase" id="hero-desc-title">
                          {weatherData.current.description}
                        </span>
                        <span className="text-xs text-white/80 font-medium font-sans mt-1 block" id="hero-observed-time">
                          Observed at: {new Date(weatherData.current.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Footer sub-grid: wind details */}
                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5 mt-4" id="hero-metrics-subgrid">
                      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10" id="metric-wind-speed">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <Wind className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-[10px] text-white/75 font-semibold block uppercase tracking-wider font-sans">
                            Wind Velocity
                          </span>
                          <span className="text-sm font-bold font-mono text-white">
                            {weatherData.current.windSpeed.toFixed(1)} km/h
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10" id="metric-wind-direction">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <Navigation 
                            className="w-5 h-5 text-white transition-transform" 
                            style={{ transform: `rotate(${weatherData.current.windDirection}deg)` }} 
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-white/75 font-semibold block uppercase tracking-wider font-sans">
                            Wind Direction
                          </span>
                          <span className="text-sm font-bold font-sans text-white line-clamp-1">
                            {getWindDirectionText(weatherData.current.windDirection)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Side Panel: Recent Searches */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between" id="recent-searches-panel">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4" id="recents-header">
                      <History className="w-5 h-5 text-slate-400" id="recents-header-icon" />
                      <h3 className="font-bold text-sm text-slate-800 tracking-tight font-sans" id="recents-header-title">
                        Recent Inquiries
                      </h3>
                    </div>

                    {recentSearches.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200" id="recent-searches-empty">
                        <p className="text-xs text-slate-400 font-sans">No previous searches</p>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">Your query history will store here.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5" id="recents-list-wrapper">
                        {recentSearches.map((city, idx) => (
                          <div
                            key={`${city.name}-${idx}`}
                            id={`recent-item-${idx}`}
                            onClick={() => handleSelectPopularCity(city)}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 cursor-pointer transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-2" id={`recent-item-left-${idx}`}>
                              <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" id={`recent-item-pin-${idx}`} />
                              <div>
                                <span className="text-xs font-semibold text-slate-700 font-sans group-hover:text-indigo-950 transition-colors" id={`recent-item-name-${idx}`}>
                                  {city.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-sans block" id={`recent-item-country-${idx}`}>
                                  {city.country}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5" id={`recent-item-right-${idx}`}>
                              {city.countryCode && (
                                <img
                                  src={`https://open-meteo.com/images/country-flags/${city.country_code || city.countryCode.toLowerCase()}.svg`}
                                  alt={city.country}
                                  className="w-4 h-3 rounded shadow-xs"
                                  id={`recent-item-flag-${idx}`}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              )}
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" id={`recent-item-arrow-${idx}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 text-center" id="recents-footer-box">
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed" id="recents-disclaimer">
                      Weather Intelligence securely saves your recent queries using the browser's local sandbox storage.
                    </p>
                  </div>
                </div>

              </div>

              {/* Middle Row: Planning Recommendations Component */}
              <div id="planning-card-wrapper">
                <PlanningCard recommendations={recommendations} />
              </div>

              {/* Bottom Row: 7-Day Extended Forecast Component */}
              <div id="forecast-card-wrapper">
                <ForecastCard forecast={weatherData.forecast} />
              </div>

            </div>
          )
        )}

        {/* Global Exploration Section (Lazy loaded cities grid) */}
        <div id="global-exploration-wrapper">
          <PopularCities onSelectCity={handleSelectPopularCity} />
        </div>

      </main>

      {/* Aesthetic Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center border-t border-slate-200/60 pt-8 text-slate-400 text-xs" id="app-footer">
        <p className="font-sans" id="footer-copyright">
          © 2026 Weather Intelligence. Standard forecast values provided by Open-Meteo.
        </p>
        <p className="font-sans text-[11px] text-slate-400 mt-1" id="footer-tech">
          Configured completely on client-side (no background server dependencies or credentials required).
        </p>
      </footer>
    </div>
  );
}

// Beautiful skeleton placeholder screens during weather state transitions
function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse" id="skeleton-dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="skeleton-top-row">
        
        {/* Skeleton Hero Weather Card */}
        <div className="lg:col-span-2 rounded-3xl p-6 md:p-8 bg-slate-200 h-96 flex flex-col justify-between" id="skeleton-hero-card">
          <div className="flex justify-between" id="skeleton-hero-header">
            <div className="space-y-2">
              <div className="h-7 bg-slate-300 rounded-lg w-48" />
              <div className="h-4 bg-slate-300 rounded-lg w-32" />
            </div>
            <div className="w-16 h-16 bg-slate-300 rounded-2xl" />
          </div>

          <div className="space-y-4" id="skeleton-hero-mid">
            <div className="h-20 bg-slate-300 rounded-2xl w-40" />
            <div className="flex gap-2">
              <div className="h-6 bg-slate-300 rounded-lg w-20" />
              <div className="h-6 bg-slate-300 rounded-lg w-20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-300/30 pt-5" id="skeleton-hero-footer">
            <div className="h-12 bg-slate-300 rounded-2xl" />
            <div className="h-12 bg-slate-300 rounded-2xl" />
          </div>
        </div>

        {/* Skeleton Recent Searches */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col justify-between h-96" id="skeleton-recent-searches">
          <div className="space-y-4" id="skeleton-recents-top">
            <div className="h-5 bg-slate-200 rounded-lg w-36 mb-2" />
            <div className="h-11 bg-slate-100 rounded-xl w-full" />
            <div className="h-11 bg-slate-100 rounded-xl w-full" />
            <div className="h-11 bg-slate-100 rounded-xl w-full" />
          </div>
          <div className="h-10 bg-slate-100 rounded-xl w-full" />
        </div>

      </div>

      {/* Skeleton Recommendation Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4" id="skeleton-planning-card">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-slate-200 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded-lg w-44" />
            <div className="h-3 bg-slate-200 rounded-lg w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {/* Skeleton Forecast Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4" id="skeleton-forecast-card">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-slate-200 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded-lg w-44" />
            <div className="h-3 bg-slate-200 rounded-lg w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 pt-2">
          <div className="h-36 bg-slate-100 rounded-2xl" />
          <div className="h-36 bg-slate-100 rounded-2xl" />
          <div className="h-36 bg-slate-100 rounded-2xl" />
          <div className="h-36 bg-slate-100 rounded-2xl" />
          <div className="h-36 bg-slate-100 rounded-2xl" />
          <div className="h-36 bg-slate-100 rounded-2xl" />
          <div className="h-36 bg-slate-100 rounded-2xl" />
        </div>
      </div>

    </div>
  );
}
