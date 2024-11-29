import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApp.css';

const WeatherApp = () => {
  const [city, setCity] = useState('Toronto'); // Default city
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]); // 5-day forecast
  const [error, setError] = useState(null);

  const apiKey = '3bf5f074d5a1ee17d5593c5615c49e68'; 

  const fetchWeather = async () => {
    const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
      // Fetch current weather
      const weatherResponse = await axios.get(weatherUrl);
      setWeatherData(weatherResponse.data);
      setError(null);

      // Fetch 5-day forecast
      const forecastResponse = await axios.get(forecastUrl);
      processForecastData(forecastResponse.data.list);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      if (err.response && err.response.status === 404) {
        setError('City not found. Please check the spelling and try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
      setWeatherData(null);
      setForecastData([]);
    }
  };

  const processForecastData = (data) => {
    const dailyForecast = {};

    // Group data by day
    data.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          temp: [],
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        };
      }
      dailyForecast[date].temp.push(item.main.temp);
    });

    // Calculate average temperature for each day
    const processedData = Object.keys(dailyForecast).map((date) => ({
      date,
      avgTemp:
        dailyForecast[date].temp.reduce((sum, t) => sum + t, 0) /
        dailyForecast[date].temp.length,
      description: dailyForecast[date].description,
      icon: dailyForecast[date].icon,
    }));

    setForecastData(processedData.slice(0, 5)); // Take only the first 5 days
  };

  useEffect(() => {
    fetchWeather(); // Fetch weather data on component load
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('Please enter a city name.');
      setWeatherData(null);
      setForecastData([]);
      return;
    }
    fetchWeather();
  };

  return (
    <div className="container">
      <h1 className="title">Weather App</h1>
      <p className="student-info">Created by: Bhavya Vaghela | Student ID: 101427560</p>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
        />
        <button type="submit">Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      {weatherData && (
        <div className="weather-info">
          <h2>{weatherData.name}</h2>
          <img
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
          />
          <p>{weatherData.weather[0].description}</p>
          <p>Temperature: {weatherData.main.temp}°C</p>
          <p>Humidity: {weatherData.main.humidity}%</p>
          <p>Wind Speed: {weatherData.wind.speed} m/s</p>
        </div>
      )}
      {forecastData.length > 0 && (
        <div className="forecast">
          {forecastData.map((day, index) => (
            <div className="forecast-item" key={index}>
              <h4>{day.date}</h4>
              <img
                src={`http://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt={day.description}
              />
              <p>{day.avgTemp.toFixed(1)}°C</p>
              <p>{day.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
