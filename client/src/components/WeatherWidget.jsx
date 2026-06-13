import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudRain,
  faSun,
  faSnowflake,
  faWind,
  faTint,
  faEye,
  faGauge,
  faCloud,
  faSmog,
  faMoon,
  faLocationDot,
  faCalendarDays,
  faSuitcaseRolling,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { weatherAPI } from "../services/weatherAPI";
import { useWeather } from "../context/WeatherContext";
import { toast } from "../utils/toast";
import Loading from "./Loading";

const WeatherWidget = ({ latitude, longitude, checkInDate, checkOutDate, city }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tempUnit, convertTemperature, getWeatherUnit } = useWeather();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Always fetch in metric (Celsius), we'll convert in UI
        const unit = "metric";
        
        // Fetch current weather
        const currentWeather = await weatherAPI.getByCoords(
          latitude,
          longitude,
          unit
        );
        setWeather(currentWeather);

        // Fetch forecast
        const forecastData = await weatherAPI.getForecast(
          latitude,
          longitude,
          unit
        );
        setForecast(forecastData);
      } catch (error) {
        toast.error("Could not load weather information");
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  const getWeatherIcon = (iconCode, size = "lg") => {
    const iconMap = {
      "01d": faSun,      // Clear sky - day
      "01n": faMoon,     // Clear sky - night
      "02d": faCloud,    // Few clouds - day
      "02n": faCloud,    // Few clouds - night
      "03d": faCloud,    // Scattered clouds - day
      "03n": faCloud,    // Scattered clouds - night
      "04d": faCloud,    // Broken clouds - day
      "04n": faCloud,    // Broken clouds - night
      "09d": faCloudRain, // Shower rain - day
      "09n": faCloudRain, // Shower rain - night
      "10d": faCloudRain, // Rain - day
      "10n": faCloudRain, // Rain - night
      "11d": faCloudRain, // Thunderstorm - day
      "11n": faCloudRain, // Thunderstorm - night
      "13d": faSnowflake, // Snow - day
      "13n": faSnowflake, // Snow - night
      "50d": faSmog,      // Mist - day
      "50n": faSmog,      // Mist - night
    };

    const sizeMap = {
      sm: "text-xl",
      lg: "text-3xl",
      xl: "text-5xl",
    };

    return (
      <FontAwesomeIcon
        icon={iconMap[iconCode] || faSun}
        className={`${sizeMap[size]} text-accent`}
      />
    );
  };

  if (loading) {
    return (
      <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
        <Loading size="small" text="Loading weather..." />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-blue-50 rounded-2xl p-6 shadow-lg text-center">
        <p className="text-gray-600">Weather data unavailable</p>
      </div>
    );
  }

  const currentTemp = convertTemperature(weather.main.temp, tempUnit);
  const feelsLike = convertTemperature(weather.main.feels_like, tempUnit);
  const minTemp = convertTemperature(weather.main.temp_min, tempUnit);
  const maxTemp = convertTemperature(weather.main.temp_max, tempUnit);

  // Get trip weather if dates provided
  let tripWeather = null;
  if (checkInDate && checkOutDate && forecast) {
    const getAverageWeather = () => {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const startTime = Math.floor(start.getTime() / 1000);
      const endTime = Math.floor(end.getTime() / 1000);

      const relevantData = forecast.list.filter(
        (entry) => entry.dt >= startTime && entry.dt <= endTime
      );

      if (relevantData.length === 0) return null;

      const avgTemp =
        relevantData.reduce((sum, entry) => sum + entry.main.temp, 0) /
        relevantData.length;

      return {
        temp: Math.round(avgTemp),
        minTemp: Math.min(...relevantData.map((e) => e.main.temp_min)),
        maxTemp: Math.max(...relevantData.map((e) => e.main.temp_max)),
        icon: relevantData[0].weather[0].icon,
        description: relevantData[0].weather[0].description,
      };
    };

    tripWeather = getAverageWeather();
  }

  return (
    <div className="space-y-4">
      {/* Current Weather */}
      <div className="bg-blue-50 rounded-2xl p-6 shadow-lg card-hover">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faLocationDot} className="text-blue-500" />
          Weather in {city || weather.name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Weather Display */}
          <div className="flex items-center justify-between md:border-r border-blue-200 pr-0 md:pr-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                {weather.weather[0].main}
              </p>
              <p className="text-5xl font-bold text-primary mb-2">
                {currentTemp}°{tempUnit}
              </p>
              <p className="text-gray-600 text-sm">
                Feels like {feelsLike}°{tempUnit}
              </p>
            </div>
            <div>{getWeatherIcon(weather.weather[0].icon, "xl")}</div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <FontAwesomeIcon icon={faGauge} /> Humidity
              </p>
              <p className="text-lg font-bold text-primary">
                {weather.main.humidity}%
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <FontAwesomeIcon icon={faWind} /> Wind Speed
              </p>
              <p className="text-lg font-bold text-primary">
                {Math.round(weather.wind.speed * 10) / 10} m/s
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <FontAwesomeIcon icon={faEye} /> Visibility
              </p>
              <p className="text-lg font-bold text-primary">
                {(weather.visibility / 1000).toFixed(1)} km
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <FontAwesomeIcon icon={faTint} /> Pressure
              </p>
              <p className="text-lg font-bold text-primary">
                {weather.main.pressure} hPa
              </p>
            </div>
          </div>
        </div>

        {/* Temp Range */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Temperature Range</p>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-600">Min</p>
              <p className="text-2xl font-bold text-primary">{minTemp}°</p>
            </div>
            <div className="flex-1 mx-4 h-2 bg-blue-200 rounded-full relative">
              <div
                className="absolute h-full bg-blue-50 rounded-full"
                style={{
                  width: `${((currentTemp - minTemp) / (maxTemp - minTemp)) * 100}%`,
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Max</p>
              <p className="text-2xl font-bold text-primary">{maxTemp}°</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Weather Forecast */}
      {tripWeather && checkInDate && checkOutDate && (
        <div className="bg-amber-50 rounded-2xl p-6 shadow-lg card-hover">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarDays} className="text-amber-500" />
            Weather During Your Stay
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 capitalize">
                {tripWeather.description}
              </p>
              <p className="text-4xl font-bold text-primary mb-2">
                {convertTemperature(tripWeather.temp, tempUnit)}°{tempUnit}
              </p>
              <p className="text-sm text-gray-600">
                {convertTemperature(tripWeather.minTemp, tempUnit)}° -{" "}
                {convertTemperature(tripWeather.maxTemp, tempUnit)}°
              </p>
            </div>
            <div>{getWeatherIcon(tripWeather.icon, "xl")}</div>
          </div>

          <div className="mt-4 pt-4 border-t border-orange-200">
            <p className="text-xs text-gray-600 text-center">
              <FontAwesomeIcon icon={faSuitcaseRolling} className="mr-1 text-orange-500" /> Pack accordingly for your trip!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

WeatherWidget.propTypes = {
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  checkInDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  checkOutDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  city: PropTypes.string,
};

export default WeatherWidget;
