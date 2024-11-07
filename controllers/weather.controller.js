import axios from "axios";
import { Weather } from "../models/Weather.js";
import { generateLightLevelAndPWM } from "../utils/utils.js";
import "dotenv/config";

export const fetchWeatherData = async () => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: "Astana",
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric"
      }
    });

    const { main, clouds, weather, wind } = response.data;
    const weatherData = {
      timestamp: new Date(Date.now() + 5 * 60 * 60 * 1000),
      temperature: main.temp,
      humidity: main.humidity,
      cloudiness: clouds.all,
      weatherCondition: weather[0].main,
      windSpeed: wind.speed,
      pressure: main.pressure
    };

    const existingEntry = await Weather.findOne({ timestamp: weatherData.timestamp });
    if (!existingEntry) {
      const weatherEntry = new Weather(weatherData);
      await weatherEntry.save();
    }

    console.log("Данные погоды успешно сохранены:", weatherData);
  } catch (error) {
    console.error("Ошибка при получении данных с OpenWeatherAPI:", error);
  }
};

export const getAllData = async (req, res) => {
  try {
    const weatherData = await Weather.find();
    res.json(weatherData);
  } catch (error) {
    console.error("Ошибка при получении данных из MongoDB:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const updateData = async (req, res) => {
  const { auth } = req.query;

  if (auth !== process.env.AUTH_PASSWORD) {
    return res.status(403).json({ message: "Неверный пароль" });
  }

  try {
    const documents = await Weather.find({ lightLevel: { $exists: false } });

    const updates = documents.map(async (doc) => {
      const { lightLevel, pwm } = generateLightLevelAndPWM(doc);
      doc.lightLevel = lightLevel;
      doc.pwm = pwm;
      await doc.save();
      return doc;
    });

    const updatedDocuments = await Promise.all(updates);
    res.json({
      message: "Поле lightLevel и pwm успешно добавлены",
      updatedDocuments
    });
  } catch (error) {
    console.error("Ошибка при добавлении lightLevel и pwm:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
