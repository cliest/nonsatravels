import axios from "axios";

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
if (!WEATHER_API_KEY) {
  console.warn('VITE_OPENWEATHER_API_KEY is not configured');
}
const WEATHER_API_BASE = "https://api.openweathermap.org/data/2.5";

export const weatherAPI = {
  // Get weather by coordinates
  getByCoords: async (lat, lon, units = "metric") => {
    try {
      const response = await axios.get(`${WEATHER_API_BASE}/weather`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get 5-day forecast by coordinates
  getForecast: async (lat, lon, units = "metric") => {
    try {
      const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units,
          cnt: 40, // 5 days with 3-hour intervals
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get weather by city name
  getByCity: async (city, units = "metric") => {
    try {
      const response = await axios.get(`${WEATHER_API_BASE}/weather`, {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get weather for specific date
  getWeatherForDate: async (forecast, targetDate) => {
    try {
      const target = new Date(targetDate);
      target.setHours(12, 0, 0, 0); // Noon
      const targetTime = Math.floor(target.getTime() / 1000);

      let closestEntry = forecast.list[0];
      let closestDiff = Math.abs(closestEntry.dt - targetTime);

      forecast.list.forEach((entry) => {
        const diff = Math.abs(entry.dt - targetTime);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestEntry = entry;
        }
      });

      return closestEntry;
    } catch (error) {
      throw error;
    }
  },

  // Get average weather for a date range
  getAverageWeatherForRange: async (forecast, startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startTime = Math.floor(start.getTime() / 1000);
      const endTime = Math.floor(end.getTime() / 1000);

      const relevantData = forecast.list.filter(
        (entry) => entry.dt >= startTime && entry.dt <= endTime
      );

      if (relevantData.length === 0) return null;

      const avgTemp =
        relevantData.reduce((sum, entry) => sum + entry.main.temp, 0) /
        relevantData.length;
      const avgHumidity =
        relevantData.reduce((sum, entry) => sum + entry.main.humidity, 0) /
        relevantData.length;
      const avgWindSpeed =
        relevantData.reduce((sum, entry) => sum + entry.wind.speed, 0) /
        relevantData.length;

      // Get most common weather condition
      const conditions = relevantData.map((entry) => entry.weather[0].main);
      const condition = conditions.sort(
        (a, b) =>
          conditions.filter((v) => v === a).length -
          conditions.filter((v) => v === b).length
      )[conditions.length - 1];

      return {
        temp: Math.round(avgTemp),
        humidity: Math.round(avgHumidity),
        windSpeed: Math.round(avgWindSpeed * 10) / 10,
        condition: condition,
        icon: relevantData[0].weather[0].icon,
      };
    } catch (error) {
      throw error;
    }
  },
};
