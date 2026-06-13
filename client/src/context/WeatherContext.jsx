import { useState, useEffect, useContext, createContext } from "react";

const WeatherContext = createContext();

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within WeatherProvider");
  }
  return context;
};

export const WeatherProvider = ({ children }) => {
  const [tempUnit, setTempUnit] = useState(() => {
    return localStorage.getItem("tempUnit") || "C";
  });

  useEffect(() => {
    localStorage.setItem("tempUnit", tempUnit);
  }, [tempUnit]);

  const toggleTempUnit = () => {
    setTempUnit((prev) => (prev === "C" ? "F" : "C"));
  };

  const convertTemperature = (celsius, unit = tempUnit) => {
    // If unit is metric (Celsius), return as is
    // If unit is imperial, convert from Celsius to Fahrenheit
    if (unit === "C") return Math.round(celsius);
    return Math.round((celsius * 9) / 5 + 32);
  };

  const getWeatherUnit = () => {
    return tempUnit === "C" ? "metric" : "imperial";
  };

  return (
    <WeatherContext.Provider
      value={{
        tempUnit,
        toggleTempUnit,
        convertTemperature,
        getWeatherUnit,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};
