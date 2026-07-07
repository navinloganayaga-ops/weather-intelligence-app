/**
 * Weather Recommendation Engine
 */

import { PlanningRecommendation } from '../types';

export function generateRecommendations(
  weatherCode: number,
  temp: number,
  tempMax: number,
  tempMin: number,
  windSpeed: number
): PlanningRecommendation[] {
  const recommendations: PlanningRecommendation[] = [];

  // 1. Storm warning
  const isStorm = [95, 96, 99].includes(weatherCode);
  if (isStorm) {
    recommendations.push({
      id: 'storm-alert',
      category: 'alert',
      title: 'Thunderstorm Safety',
      text: 'Severe weather alert. Keep windows shut, move activities indoors, and postpone unnecessary commutes to avoid lightning and structural risk.',
      type: 'danger'
    });
  }

  // 2. Rain / Wet weather protection
  const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
  if (isRain && !isStorm) {
    recommendations.push({
      id: 'umbrella-needed',
      category: 'protection',
      title: 'Waterproof Gear Essential',
      text: 'Precipitation is actively occurring or highly likely. Make sure to pack a sturdy umbrella, rain boot coordinates, or a heavy-duty waterproof rain shell.',
      type: 'warning'
    });
  }

  // 3. Fog and visibility
  const isFog = [45, 48].includes(weatherCode);
  if (isFog) {
    recommendations.push({
      id: 'fog-alert',
      category: 'alert',
      title: 'Low Road Visibility',
      text: 'Thick fog is reducing visual ranges. Avoid high-speed travel, use low-beam fog lights, and maintain double the ordinary braking distance on highways.',
      type: 'warning'
    });
  }

  // 4. Heavy Snow & Freezing conditions
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  if (isSnow) {
    recommendations.push({
      id: 'snow-apparel',
      category: 'clothing',
      title: 'Sub-Freezing Winter Wear',
      text: 'Active snowfall or ice accumulation. Layer extensively with thermal wool undergarments, insulated down parkas, fleece neck-warmers, and anti-slip winter shoes.',
      type: 'info'
    });
  }

  // 5. Extreme heat alerts
  if (temp > 30) {
    recommendations.push({
      id: 'extreme-heat',
      category: 'alert',
      title: 'Heat Stress Advisory',
      text: `Ambient temperatures exceed 30°C (now ${temp.toFixed(1)}°C). Seek air-conditioned buildings, avoid prolonged direct heat exposure, and consume extra mineral electrolytes.`,
      type: 'danger'
    });
  } else if (temp > 24 && [0, 1].includes(weatherCode)) {
    // 6. Sunshine protection
    recommendations.push({
      id: 'sun-protection',
      category: 'protection',
      title: 'UV Shield Recommended',
      text: 'Clear skies with prominent direct sunlight. Wear UV-blocking sunglasses, apply SPF 30+ broad-spectrum sunscreen liberally, and sport a lightweight breathable sun-hat.',
      type: 'success'
    });
  }

  // 7. Chilly clothing recommendation
  if (temp < 10 && !isSnow) {
    recommendations.push({
      id: 'chilly-clothing',
      category: 'clothing',
      title: 'Insulated Layering Required',
      text: `Chilly climate (currently ${temp.toFixed(1)}°C). A windbreaker alone won't suffice; bundle up in a heavy knit sweater, a warm scarf, and a fleece-lined jacket.`,
      type: 'info'
    });
  } else if (temp >= 18 && temp <= 25 && [0, 1, 2].includes(weatherCode)) {
    // 8. Perfect light clothing
    recommendations.push({
      id: 'ideal-clothing',
      category: 'clothing',
      title: 'Lightweight Breathable Apparel',
      text: 'Beautifully comfortable temperatures. A light cotton t-shirt, linen wear, or denim layers will provide optimum cooling and cozy temperature moderation.',
      type: 'success'
    });
  }

  // 9. High Wind Speed Advice
  if (windSpeed > 22) {
    recommendations.push({
      id: 'high-wind',
      category: 'alert',
      title: 'Stiff Gale Advisory',
      text: `Gusty wind conditions detected at ${windSpeed.toFixed(1)} km/h. Secure loose deck items or patio umbrellas, and consider wearing a windbreaker or a secured jacket.`,
      type: 'warning'
    });
  }

  // 10. Best Activities
  if ([0, 1, 2].includes(weatherCode) && temp >= 15 && temp <= 27 && windSpeed < 18) {
    recommendations.push({
      id: 'activity-outdoor',
      category: 'activity',
      title: 'Pristine Outdoor Conditions',
      text: 'The weather is optimal for outdoor fitness or leisure! Perfect window for high-stamina cycling, hiking trails, a park picnic, or photography.',
      type: 'success'
    });
  } else if (isRain || isStorm || temp < 5 || temp > 33) {
    recommendations.push({
      id: 'activity-indoor',
      category: 'activity',
      title: 'Ideal Cozy Indoor Pursuits',
      text: 'Atmospheric conditions aren\'t favorable for outdoor stay. Rechannel energy towards reading, baking, hot coffee indulgence, writing, or inside strength workouts.',
      type: 'info'
    });
  }

  return recommendations;
}
