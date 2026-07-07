import React from 'react';
import { 
  Shirt, 
  Shield, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  FlameKindling
} from 'lucide-react';
import { PlanningRecommendation } from '../types';

interface PlanningCardProps {
  recommendations: PlanningRecommendation[];
}

export default function PlanningCard({ recommendations }: PlanningCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothing':
        return <Shirt className="w-5 h-5" id="rec-icon-clothing" />;
      case 'protection':
        return <Shield className="w-5 h-5" id="rec-icon-protection" />;
      case 'activity':
        return <Sparkles className="w-5 h-5" id="rec-icon-activity" />;
      case 'alert':
      default:
        return <AlertTriangle className="w-5 h-5" id="rec-icon-alert" />;
    }
  };

  const getTypeClasses = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50/70 border-red-200 text-red-950',
          badge: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-600',
          marker: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/70 border-amber-200 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600',
          marker: 'bg-amber-500'
        };
      case 'success':
        return {
          bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          iconColor: 'text-emerald-600',
          marker: 'bg-emerald-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-50/70 border-sky-200 text-sky-950',
          badge: 'bg-sky-100 text-sky-800 border-sky-200',
          iconColor: 'text-sky-600',
          marker: 'bg-sky-500'
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100" id="planning-card-container">
      <div className="flex items-center gap-3 mb-6" id="planning-card-header">
        <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-sm" id="planning-header-icon-container">
          <FlameKindling className="w-6 h-6" id="planning-header-icon" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight font-display text-slate-950" id="planning-title">
            Smart Recommendations
          </h2>
          <p className="text-xs text-slate-500 font-sans" id="planning-subtitle">
            Intelligent attire and outdoor scheduling advice based on metrics
          </p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200" id="no-recommendations">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" id="no-rec-icon" />
          <p className="text-sm font-medium text-slate-600 font-sans">No special warnings</p>
          <p className="text-xs text-slate-400 mt-1">Weather conditions are balanced and ordinary.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="recommendations-grid">
          {recommendations.map((rec) => {
            const styles = getTypeClasses(rec.type);
            return (
              <div
                key={rec.id}
                id={`recommendation-item-${rec.id}`}
                className={`flex flex-col p-5 rounded-2xl border ${styles.bg} hover:shadow-md transition-all duration-300 relative overflow-hidden`}
              >
                {/* Decorative side accent bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${styles.marker}`} id={`rec-accent-${rec.id}`} />

                <div className="flex items-center justify-between gap-3 mb-2 ml-1.5" id={`rec-header-${rec.id}`}>
                  <div className="flex items-center gap-2">
                    <span className={`${styles.iconColor}`} id={`rec-cat-icon-${rec.id}`}>
                      {getCategoryIcon(rec.category)}
                    </span>
                    <span className="font-semibold text-sm tracking-tight text-slate-900 font-sans" id={`rec-title-${rec.id}`}>
                      {rec.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge} font-mono`} id={`rec-badge-${rec.id}`}>
                    {rec.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed ml-1.5 font-sans" id={`rec-text-${rec.id}`}>
                  {rec.text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
