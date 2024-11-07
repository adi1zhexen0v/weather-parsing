import axios from "axios";
import mongoose from "mongoose";
import cron from "node-cron";
import express from "express";
import "dotenv/config";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Подключено к MongoDB"))
  .catch((err) =>
    console.error("Ошибка подключения к MongoDB:", err)
  );

const weatherSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  temperature: Number,
  humidity: Number,
  cloudiness: Number,
  weatherCondition: String,
  windSpeed: Number,
  pressure: Number
});

const Weather = mongoose.model("Weather", weatherSchema);

const fetchWeatherData = async () => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: "Astana",
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric"
        }
      }
    );

    const { main, clouds, weather, wind } = response.data;
    const weatherData = {
      temperature: main.temp,
      humidity: main.humidity,
      cloudiness: clouds.all,
      weatherCondition: weather[0].main,
      windSpeed: wind.speed,
      pressure: main.pressure
    };

    const weatherEntry = new Weather(weatherData);
    await weatherEntry.save();

    console.log(
      "Данные погоды успешно сохранены:",
      weatherData
    );
  } catch (error) {
    console.error(
      "Ошибка при получении данных с OpenWeatherAPI:",
      error
    );
  }
};

cron.schedule("0,10,20,30,40,50 * * * *", () =>
  fetchWeatherData()
);

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/weather", async (req, res) => {
  try {
    const weatherData = await Weather.find();
    res.json(weatherData);
  } catch (error) {
    console.error(
      "Ошибка при получении данных из MongoDB:",
      error
    );
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
