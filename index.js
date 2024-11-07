import mongoose from "mongoose";
import cron from "node-cron";
import express from "express";
import { fetchWeatherData, getAllData, updateData } from "./controllers/weather.controller.js";
import "dotenv/config";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Подключено к MongoDB"))
  .catch((err) => console.error("Ошибка подключения к MongoDB:", err));

cron.schedule("*/10 * * * *", () => fetchWeatherData());

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/weather", getAllData);
app.post("/update", updateData);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
