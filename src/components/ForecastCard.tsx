import React from 'react';
import { Calendar } from 'lucide-react';
import { ProcessedWeatherData } from '../types';
import { mapWeatherCode } from '../utils/weatherMapper';

interface ForecastCardProps {
  forecast: ProcessedWeatherData['forecast'];
}

export default function ForecastCard({ forecast }: ForecastCardProps) {
  // Format dates nicely, e.g. "Mon, Jul 7"
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Return original or fallback if parsing fails
        return dateStr;
      }
      return {
        weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayMonth: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    } catch {
      return { weekday: dateStr, dayMonth: '' };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100" id="forecast-container">
      <div className="flex items-center gap-3 mb-6" id="forecast-header">
        <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-sky-600 rounded-2xl text-white shadow-sm" id="forecast-header-icon-container">
          <Calendar className="w-6 h-6" id="forecast-header-icon" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight font-display text-slate-950" id="forecast-title">
            7-Day Extended Forecast
          </h2>
          <p className="text-xs text-slate-500 font-sans" id="forecast-subtitle">
            Next week weather outlook and temperature ranges
          </p>
        </div>
      </div>

      {/* Responsive layout: scrollbar on mobile, flex/grid on desktop */}
      <div 
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar md:grid md:grid-cols-7 md:overflow-visible md:pb-0" 
        id="forecast-scroller"
      >
        {forecast.map((day, idx) => {
          const dateInfo = formatDate(day.date);
          const condition = mapWeatherCode(day.weatherCode);
          const IconComponent = condition.icon;

          return (
            <div
              key={day.date}
              id={`forecast-day-card-${idx}`}
              className="flex-shrink-0 w-36 snap-start bg-slate-50 hover:bg-white rounded-2xl p-4 flex flex-col items-center text-center border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 md:w-auto md:flex-shrink"
            >
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans" id={`forecast-day-weekday-${idx}`}>
                {typeof dateInfo === 'object' ? dateInfo.weekday : dateInfo}
              </span>
              <span className="text-xs text-slate-500 font-medium font-sans mt-0.5" id={`forecast-day-date-${idx}`}>
                {typeof dateInfo === 'object' ? dateInfo.dayMonth : ''}
              </span>

              {/* Weather Icon container */}
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center my-4 ${condition.cardBgClass} shadow-inner transition-transform duration-300 hover:scale-110`}
                id={`forecast-day-icon-box-${idx}`}
              >
                <IconComponent className={`w-6 h-6 ${condition.accentColorClass}`} id={`forecast-day-icon-${idx}`} />
              </div>

              <span className="text-[11px] font-medium text-slate-700 font-sans line-clamp-1 h-4 mb-3" title={day.description} id={`forecast-day-desc-${idx}`}>
                {day.description}
              </span>

              {/* Temperatures */}
              <div className="flex items-baseline justify-center gap-1.5 mt-auto w-full border-t border-slate-200/60 pt-2" id={`forecast-day-temps-${idx}`}>
                <span className="text-sm font-bold text-slate-800 font-mono" id={`forecast-day-temp-max-${idx}`}>
                  {Math.round(day.tempMax)}°
                </span>
                <span className="text-xs text-slate-400 font-mono" id={`forecast-day-temp-min-${idx}`}>
                  {Math.round(day.tempMin)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
